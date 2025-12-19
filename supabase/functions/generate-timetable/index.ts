import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Event buffer in minutes - sessions should end this many minutes BEFORE events start
const EVENT_BUFFER_MINUTES = 15;

// Minimum session duration for gap filling
const MIN_SESSION_DURATION = 25;

// JSON repair helper function to fix truncated or malformed JSON
function attemptJsonRepair(jsonString: string): string {
  let repaired = jsonString.trim();
  
  // Remove any trailing incomplete content before fixing brackets
  // Find the last complete session object by looking for the pattern "}," or "}]"
  const lastCompleteSessionMatch = repaired.match(/.*(\}\s*,|\}\s*\])/s);
  if (lastCompleteSessionMatch) {
    const lastGoodIndex = repaired.lastIndexOf(lastCompleteSessionMatch[1]);
    if (lastGoodIndex > 0 && lastGoodIndex < repaired.length - 10) {
      // Check if there's incomplete content after the last good session
      const afterLast = repaired.substring(lastGoodIndex + lastCompleteSessionMatch[1].length).trim();
      if (afterLast && !afterLast.startsWith('"') && !afterLast.startsWith('{') && !afterLast.startsWith('}')) {
        repaired = repaired.substring(0, lastGoodIndex + lastCompleteSessionMatch[1].length);
      }
    }
  }
  
  // Remove trailing incomplete patterns
  repaired = repaired.replace(/,\s*"[^"]*$/, ''); // trailing key without value
  repaired = repaired.replace(/,\s*"[^"]*":\s*$/, ''); // trailing key with colon
  repaired = repaired.replace(/,\s*"[^"]*":\s*"[^"]*$/, ''); // incomplete string value
  repaired = repaired.replace(/,\s*"[^"]*":\s*\{[^}]*$/, ''); // incomplete object
  repaired = repaired.replace(/,\s*\{[^}]*$/, ''); // incomplete object in array
  repaired = repaired.replace(/,\s*$/, ''); // trailing comma
  
  const openBraces = (repaired.match(/{/g) || []).length;
  const closeBraces = (repaired.match(/}/g) || []).length;
  const openBrackets = (repaired.match(/\[/g) || []).length;
  const closeBrackets = (repaired.match(/]/g) || []).length;
  
  // Close arrays first, then objects
  for (let i = 0; i < openBrackets - closeBrackets; i++) {
    repaired += ']';
  }
  for (let i = 0; i < openBraces - closeBraces; i++) {
    repaired += '}';
  }
  
  // Remove trailing commas before closing brackets/braces
  repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
  
  return repaired;
}

// Extract visible assistant text from OpenAI Responses API result
function extractOpenAIText(result: any): string | undefined {
  if (!result) return undefined;

  // Some SDKs return this convenience field
  if (typeof result.output_text === "string" && result.output_text.trim()) {
    return result.output_text;
  }

  const output = Array.isArray(result.output) ? result.output : [];
  for (const item of output) {
    if (item?.type !== "message" || item?.role !== "assistant") continue;

    // content is usually an array of parts (e.g. [{type:'output_text', text:'...'}])
    const parts = Array.isArray(item.content) ? item.content : [];
    for (const p of parts) {
      const text = p?.text ?? p?.content ?? p?.output_text;
      if (typeof text === "string" && text.trim()) return text;
    }
  }

  return undefined;
}

// Fuzzy topic matching - allows partial matches to avoid rejecting valid AI-generated topics
function isValidTopicFuzzy(sessionTopic: string, validTopicNames: Set<string>): boolean {
  const normalize = (str: string) => str.toLowerCase().trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
  
  const normalizedSession = normalize(sessionTopic);
  
  for (const validTopic of validTopicNames) {
    if (normalize(validTopic) === normalizedSession) return true;
  }
  
  const sessionWords = normalizedSession.split(' ').filter(w => w.length > 2);
  
  for (const validTopic of validTopicNames) {
    const validNormalized = normalize(validTopic);
    const validWords = validNormalized.split(' ').filter(w => w.length > 2);
    
    if (validNormalized.includes(normalizedSession) || normalizedSession.includes(validNormalized)) {
      return true;
    }
    
    const matchingWords = sessionWords.filter(w => validWords.includes(w) || validNormalized.includes(w));
    const matchRatio = sessionWords.length > 0 ? matchingWords.length / sessionWords.length : 0;
    
    if (matchRatio >= 0.6 && matchingWords.length >= 2) {
      return true;
    }
  }
  
  return false;
}

// ============================================================================
// PHASE 1: Pre-Calculate Available Time Slots
// ============================================================================

interface TimeSlot {
  start: number; // minutes from midnight
  end: number;   // minutes from midnight
}

interface FreeSlot {
  freeFrom: string; // HH:MM
  freeTo: string;   // HH:MM
  durationMins: number;
}

interface DayFreeSlots {
  date: string;
  dayName: string;
  freeSlots: FreeSlot[];
  totalFreeMinutes: number;
}

function timeToMinutes(time: string): number {
  const [hours, mins] = time.split(':').map(Number);
  return hours * 60 + mins;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function calculateFreeSlots(
  dateStr: string,
  dayTimeWindow: { startTime: string; endTime: string } | null,
  eventsOnDay: Array<{ startTime: Date; endTime: Date; title: string }>,
  breakDuration: number
): DayFreeSlots {
  const date = new Date(dateStr);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  if (!dayTimeWindow) {
    return { date: dateStr, dayName, freeSlots: [], totalFreeMinutes: 0 };
  }
  
  const windowStart = timeToMinutes(dayTimeWindow.startTime);
  const windowEnd = timeToMinutes(dayTimeWindow.endTime);
  
  // Start with the full window as free
  let freeSlots: TimeSlot[] = [{ start: windowStart, end: windowEnd }];
  
  // Sort events by start time
  const sortedEvents = [...eventsOnDay].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  
  // Remove event times from free slots (with buffer)
  for (const event of sortedEvents) {
    const eventStart = event.startTime.getHours() * 60 + event.startTime.getMinutes();
    const eventEnd = event.endTime.getHours() * 60 + event.endTime.getMinutes();
    
    // Add buffer BEFORE the event (sessions should end EVENT_BUFFER_MINUTES before event starts)
    const blockedStart = Math.max(windowStart, eventStart - EVENT_BUFFER_MINUTES);
    const blockedEnd = Math.min(windowEnd, eventEnd);
    
    const newFreeSlots: TimeSlot[] = [];
    
    for (const slot of freeSlots) {
      if (blockedEnd <= slot.start || blockedStart >= slot.end) {
        // No overlap
        newFreeSlots.push(slot);
      } else {
        // Overlap - split the slot
        if (slot.start < blockedStart) {
          newFreeSlots.push({ start: slot.start, end: blockedStart });
        }
        if (slot.end > blockedEnd) {
          newFreeSlots.push({ start: blockedEnd, end: slot.end });
        }
      }
    }
    
    freeSlots = newFreeSlots;
  }
  
  // Filter out slots too small for a session + break
  const minSlotSize = MIN_SESSION_DURATION + breakDuration;
  freeSlots = freeSlots.filter(slot => (slot.end - slot.start) >= minSlotSize);
  
  // Convert to output format
  const result: FreeSlot[] = freeSlots.map(slot => ({
    freeFrom: minutesToTime(slot.start),
    freeTo: minutesToTime(slot.end),
    durationMins: slot.end - slot.start
  }));
  
  const totalFreeMinutes = result.reduce((sum, slot) => sum + slot.durationMins, 0);
  
  return { date: dateStr, dayName, freeSlots: result, totalFreeMinutes };
}

// ============================================================================
// PHASE 4: Adaptive Session Fitting
// ============================================================================

interface AdaptiveConfig {
  sessionDuration: number;
  breakDuration: number;
  reductionFactor: number;
  isReduced: boolean;
}

function calculateAdaptiveConfig(
  totalRequiredMinutes: number,
  totalAvailableMinutes: number,
  baseSessionDuration: number,
  baseBreakDuration: number,
  durationMode: string
): AdaptiveConfig {
  // If fixed mode or enough time available, no reduction needed
  if (durationMode === "fixed" || totalRequiredMinutes <= totalAvailableMinutes) {
    return {
      sessionDuration: baseSessionDuration,
      breakDuration: baseBreakDuration,
      reductionFactor: 1,
      isReduced: false
    };
  }
  
  // Calculate reduction factor to fit all content
  const reductionFactor = Math.max(0.5, totalAvailableMinutes / totalRequiredMinutes);
  
  // Apply reduction to session duration (minimum MIN_SESSION_DURATION minutes)
  const reducedSession = Math.max(MIN_SESSION_DURATION, Math.round(baseSessionDuration * reductionFactor));
  
  // Slightly reduce breaks too (minimum 5 minutes)
  const reducedBreak = Math.max(5, Math.round(baseBreakDuration * Math.max(0.7, reductionFactor)));
  
  console.log(`⚙️ Adaptive fitting: ${totalRequiredMinutes} mins needed, ${totalAvailableMinutes} mins available`);
  console.log(`   Reduction factor: ${reductionFactor.toFixed(2)}, Sessions: ${baseSessionDuration} → ${reducedSession}, Breaks: ${baseBreakDuration} → ${reducedBreak}`);
  
  return {
    sessionDuration: reducedSession,
    breakDuration: reducedBreak,
    reductionFactor,
    isReduced: true
  };
}

// ============================================================================
// PHASE 5: Gap Filler - Fill gaps after session removal
// ============================================================================

interface SessionToAdd {
  time: string;
  duration: number;
  subject: string;
  topic: string;
  type: string;
  notes: string;
  mode: string;
}

function fillGapsWithSessions(
  schedule: Record<string, any[]>,
  dayFreeSlots: Map<string, DayFreeSlots>,
  topics: Array<{ name: string; subject_id: string }>,
  subjects: Array<{ id: string; name: string }>,
  sessionDuration: number,
  breakDuration: number,
  timetableMode: string
): Record<string, any[]> {
  console.log('🔧 Starting gap filling process...');
  
  // Track topic coverage
  const topicCoverage = new Map<string, number>();
  
  // Count existing topic sessions
  for (const [, sessions] of Object.entries(schedule)) {
    for (const session of sessions) {
      if (session.type !== 'break' && session.topic) {
        const key = session.topic.toLowerCase().trim();
        topicCoverage.set(key, (topicCoverage.get(key) || 0) + 1);
      }
    }
  }
  
  // Find under-covered topics
  const underCoveredTopics = topics.filter(t => {
    const coverage = topicCoverage.get(t.name.toLowerCase().trim()) || 0;
    return coverage < 2; // Topics with less than 2 sessions
  });
  
  if (underCoveredTopics.length === 0) {
    console.log('✓ All topics have adequate coverage');
    return schedule;
  }
  
  console.log(`📋 ${underCoveredTopics.length} topics need more coverage`);
  
  let sessionsAdded = 0;
  
  for (const [dateStr, daySlots] of dayFreeSlots.entries()) {
    if (daySlots.freeSlots.length === 0 || underCoveredTopics.length === 0) continue;
    
    const existingSessions = schedule[dateStr] || [];
    const occupiedTimes = new Set<number>();
    
    // Mark occupied times
    for (const session of existingSessions) {
      if (session.time) {
        const startMins = timeToMinutes(session.time);
        const endMins = startMins + (session.duration || 0);
        for (let m = startMins; m < endMins; m++) {
          occupiedTimes.add(m);
        }
      }
    }
    
    // Find actual free gaps
    for (const freeSlot of daySlots.freeSlots) {
      const slotStart = timeToMinutes(freeSlot.freeFrom);
      const slotEnd = timeToMinutes(freeSlot.freeTo);
      
      // Find contiguous free segments
      let gapStart = -1;
      
      for (let m = slotStart; m <= slotEnd; m++) {
        if (!occupiedTimes.has(m)) {
          if (gapStart === -1) gapStart = m;
        } else {
          if (gapStart !== -1) {
            const gapDuration = m - gapStart;
            if (gapDuration >= sessionDuration + breakDuration && underCoveredTopics.length > 0) {
              // Add a session here
              const topic = underCoveredTopics.shift()!;
              const subject = subjects.find(s => s.id === topic.subject_id);
              
              const newSession: SessionToAdd = {
                time: minutesToTime(gapStart),
                duration: Math.min(sessionDuration, gapDuration - breakDuration),
                subject: subject?.name || 'Unknown',
                topic: topic.name,
                type: 'practice',
                notes: `Gap-fill session - Practice and review`,
                mode: timetableMode || 'balanced'
              };
              
              if (!schedule[dateStr]) schedule[dateStr] = [];
              schedule[dateStr].push(newSession);
              
              // Add break after
              if (gapDuration > sessionDuration + 5) {
                schedule[dateStr].push({
                  time: minutesToTime(gapStart + newSession.duration),
                  duration: Math.min(breakDuration, gapDuration - newSession.duration),
                  type: 'break',
                  notes: 'Short break',
                  mode: timetableMode || 'balanced'
                });
              }
              
              // Mark as occupied
              for (let x = gapStart; x < gapStart + newSession.duration + breakDuration; x++) {
                occupiedTimes.add(x);
              }
              
              sessionsAdded++;
              console.log(`  ✅ Added gap-fill session: ${dateStr} ${newSession.time} - ${topic.name}`);
            }
            gapStart = -1;
          }
        }
      }
      
      // Check final gap
      if (gapStart !== -1) {
        const gapDuration = slotEnd - gapStart;
        if (gapDuration >= sessionDuration + breakDuration && underCoveredTopics.length > 0) {
          const topic = underCoveredTopics.shift()!;
          const subject = subjects.find(s => s.id === topic.subject_id);
          
          const newSession: SessionToAdd = {
            time: minutesToTime(gapStart),
            duration: Math.min(sessionDuration, gapDuration - breakDuration),
            subject: subject?.name || 'Unknown',
            topic: topic.name,
            type: 'practice',
            notes: `Gap-fill session - Practice and review`,
            mode: timetableMode || 'balanced'
          };
          
          if (!schedule[dateStr]) schedule[dateStr] = [];
          schedule[dateStr].push(newSession);
          sessionsAdded++;
          console.log(`  ✅ Added gap-fill session: ${dateStr} ${newSession.time} - ${topic.name}`);
        }
      }
    }
    
    // Sort sessions by time
    if (schedule[dateStr]) {
      schedule[dateStr].sort((a: any, b: any) => {
        const aTime = timeToMinutes(a.time || '00:00');
        const bTime = timeToMinutes(b.time || '00:00');
        return aTime - bTime;
      });
    }
  }
  
  console.log(`🔧 Gap filling complete: ${sessionsAdded} sessions added`);
  return schedule;
}

// Input validation schema
const inputSchema = z.object({
  subjects: z.array(z.object({
    id: z.string().uuid(),
    name: z.string().max(100),
    exam_board: z.string().max(50),
    mode: z.enum(["short-term-exam", "long-term-exam", "no-exam"]).optional().default("no-exam")
  })).max(20),
  topics: z.array(z.object({
    name: z.string().max(200),
    subject_id: z.string().max(100)
  })).max(500),
  testDates: z.array(z.object({
    subject_id: z.string().max(100),
    test_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    test_type: z.string().max(50)
  })).max(50),
  preferences: z.object({
    daily_study_hours: z.number().min(0).max(12),
    day_time_slots: z.array(z.object({
      day: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      enabled: z.boolean()
    })),
    session_duration: z.number().min(15).max(180),
    break_duration: z.number().min(5).max(60),
    duration_mode: z.enum(["fixed", "flexible"]),
    aiNotes: z.string().optional(),
    study_before_school: z.boolean().optional(),
    study_during_lunch: z.boolean().optional(),
    study_during_free_periods: z.boolean().optional(),
    before_school_start: z.string().optional(),
    before_school_end: z.string().optional(),
    lunch_start: z.string().optional(),
    lunch_end: z.string().optional()
  }),
  homeworks: z.array(z.object({
    id: z.string().uuid().optional(),
    title: z.string(),
    subject: z.string(),
    due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    duration: z.number().optional().nullable(),
    description: z.string().optional().nullable()
  })).optional(),
  topicAnalysis: z.object({
    priorities: z.array(z.object({
      topic_name: z.string(),
      priority_score: z.number(),
      reasoning: z.string()
    })).optional(),
    difficult_topics: z.array(z.object({
      topic_name: z.string(),
      reason: z.string(),
      study_suggestion: z.string()
    })).optional()
  }).nullable().optional(),
  aiNotes: z.string().optional(),
  events: z.array(z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string().optional().nullable(),
    start_time: z.string(),
    end_time: z.string()
  })).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timetableMode: z.enum(["short-term-exam", "long-term-exam", "no-exam"]).nullable().optional()
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate input data
    const requestBody = await req.json();
    const parsed = inputSchema.safeParse(requestBody);
    
    if (!parsed.success) {
      console.error('Validation error:', parsed.error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input data',
          details: parsed.error.errors 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { subjects, topics, testDates, preferences, startDate, endDate, homeworks = [], topicAnalysis, aiNotes, events: rawEvents = [], timetableMode } = parsed.data;

    const events = Array.from(
      new Map(rawEvents.map((evt: any) => [
        `${evt.title}-${evt.start_time}-${evt.end_time}-${evt.id}`,
        evt,
      ])).values()
    );

    // ========================================================================
    // PHASE 1: Pre-Calculate Available Time Slots
    // ========================================================================
    
    // Build day time windows map
    const dayTimeWindows = new Map<string, { startTime: string; endTime: string }>();
    preferences.day_time_slots.forEach((slot: any) => {
      if (slot.enabled) {
        dayTimeWindows.set(slot.day.toLowerCase(), {
          startTime: slot.startTime,
          endTime: slot.endTime
        });
      }
    });
    
    // Build events by date map - handle multi-day events by adding to all days they span
    const eventsByDate = new Map<string, Array<{ startTime: Date; endTime: Date; title: string }>>();
    events.forEach((event: any) => {
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);
      
      // Iterate through each day the event spans
      const currentDay = new Date(eventStart);
      currentDay.setHours(0, 0, 0, 0);
      
      const endDay = new Date(eventEnd);
      endDay.setHours(0, 0, 0, 0);
      
      while (currentDay <= endDay) {
        const dateKey = currentDay.toISOString().split('T')[0];
        
        if (!eventsByDate.has(dateKey)) {
          eventsByDate.set(dateKey, []);
        }
        
        // Calculate effective start/end times for this specific day
        const dayStart = new Date(currentDay);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(currentDay);
        dayEnd.setHours(23, 59, 59, 999);
        
        // Effective start: max of event start and day start
        const effectiveStart = eventStart > dayStart ? eventStart : dayStart;
        // Effective end: min of event end and day end
        const effectiveEnd = eventEnd < dayEnd ? eventEnd : dayEnd;
        
        eventsByDate.get(dateKey)!.push({
          startTime: new Date(effectiveStart),
          endTime: new Date(effectiveEnd),
          title: event.title,
        });
        
        // Move to next day
        currentDay.setDate(currentDay.getDate() + 1);
      }
    });
    
    // Calculate free slots for each day in the timetable range
    const allDayFreeSlots = new Map<string, DayFreeSlots>();
    const start = new Date(startDate);
    const end = new Date(endDate);
    let totalAvailableMinutes = 0;
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const timeWindow = dayTimeWindows.get(dayName) || null;
      const eventsOnDay = eventsByDate.get(dateStr) || [];
      
      const daySlots = calculateFreeSlots(dateStr, timeWindow, eventsOnDay, preferences.break_duration);
      allDayFreeSlots.set(dateStr, daySlots);
      totalAvailableMinutes += daySlots.totalFreeMinutes;
    }
    
    console.log(`📊 Total available study time: ${totalAvailableMinutes} minutes (${(totalAvailableMinutes / 60).toFixed(1)} hours)`);
    
    // ========================================================================
    // PHASE 4: Calculate Required Time & Adaptive Fitting
    // ========================================================================
    
    // Estimate required study time
    const topicSessionMinutes = topics.length * preferences.session_duration * 2; // 2 sessions per topic average
    const homeworkMinutes = homeworks.reduce((sum, hw) => sum + (hw.duration || 60), 0);
    const breakMinutes = topics.length * 2 * preferences.break_duration;
    const totalRequiredMinutes = topicSessionMinutes + homeworkMinutes + breakMinutes;
    
    console.log(`📊 Estimated required time: ${totalRequiredMinutes} mins (Topics: ${topicSessionMinutes}, HW: ${homeworkMinutes}, Breaks: ${breakMinutes})`);
    
    const adaptiveConfig = calculateAdaptiveConfig(
      totalRequiredMinutes,
      totalAvailableMinutes,
      preferences.session_duration,
      preferences.break_duration,
      preferences.duration_mode
    );
    
    // Use adaptive durations
    const effectiveSessionDuration = adaptiveConfig.sessionDuration;
    const effectiveBreakDuration = adaptiveConfig.breakDuration;

    // Fetch existing study insights for peak hours analysis
    let peakHoursContext = "";
    try {
      const { data: insightsData } = await supabaseClient
        .from('study_insights')
        .select('insights_data')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (insightsData?.insights_data?.peakStudyHours) {
        const peak = insightsData.insights_data.peakStudyHours;
        peakHoursContext = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 PEAK STUDY HOURS - PERSONALIZED SCHEDULING 🧠
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Based on this user's past performance:
✅ BEST PERFORMANCE: ${peak.bestTimeWindow.toUpperCase()} (${peak.bestTimeRange})
❌ MOST CHALLENGING: ${peak.worstTimeWindow.toUpperCase()} (${peak.worstTimeRange})

📊 SMART SCHEDULING STRATEGY:
${peak.recommendation}

Schedule DIFFICULT topics during ${peak.bestTimeWindow.toUpperCase()} hours.
Schedule EASIER topics during ${peak.worstTimeWindow.toUpperCase()} hours.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
      }
    } catch (error) {
      console.log('No existing insights found, proceeding without peak hours data');
    }

    // ========================================================================
    // PHASE 1.5: Fetch Historical Learning Data (Reflections & Progress)
    // ========================================================================
    
    let historicalStruggleContext = "";
    const struggledTopicNames: Set<string> = new Set();
    
    try {
      // Fetch ALL reflections across ALL timetables for this user
      const { data: allReflections } = await supabaseClient
        .from('topic_reflections')
        .select('subject, topic, reflection_data')
        .eq('user_id', user.id);
      
      // Fetch topic progress data
      const { data: topicProgress } = await supabaseClient
        .from('topic_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (allReflections && allReflections.length > 0) {
        console.log(`📚 Found ${allReflections.length} historical reflections`);
        
        // Analyze historical struggle points
        const topicStruggleMap = new Map<string, { 
          topic: string; 
          subject: string;
          avgFocus: number; 
          incompleteCount: number; 
          totalReflections: number;
          difficulties: string[];
        }>();
        
        for (const reflection of allReflections) {
          const topicKey = reflection.topic.toLowerCase().trim();
          const data = reflection.reflection_data as any;
          
          if (!topicStruggleMap.has(topicKey)) {
            topicStruggleMap.set(topicKey, {
              topic: reflection.topic,
              subject: reflection.subject,
              avgFocus: 0,
              incompleteCount: 0,
              totalReflections: 0,
              difficulties: []
            });
          }
          
          const entry = topicStruggleMap.get(topicKey)!;
          entry.totalReflections++;
          
          // Track focus levels (lower = more struggle)
          if (data?.focusLevel !== undefined) {
            entry.avgFocus = ((entry.avgFocus * (entry.totalReflections - 1)) + data.focusLevel) / entry.totalReflections;
          }
          
          // Track incomplete sessions
          if (data?.completed === 'partially' || data?.completed === 'no') {
            entry.incompleteCount++;
          }
          
          // Track difficulty ratings
          if (data?.difficulty && data.difficulty >= 4) {
            entry.difficulties.push(`Rated ${data.difficulty}/5 difficulty`);
          }
          
          // Track challenging aspects mentioned
          if (data?.challengingAspects && Array.isArray(data.challengingAspects)) {
            for (const aspect of data.challengingAspects) {
              if (aspect.content) {
                entry.difficulties.push(aspect.content.substring(0, 50));
              }
            }
          }
        }
        
        // Identify topics with struggles (low focus OR high incomplete rate)
        const struggleTopics: Array<{ topic: string; subject: string; severity: number; reason: string }> = [];
        
        for (const [topicKey, entry] of topicStruggleMap) {
          let severity = 0;
          const reasons: string[] = [];
          
          // Low focus (< 60%)
          if (entry.avgFocus > 0 && entry.avgFocus < 60) {
            severity += (60 - entry.avgFocus) / 10;
            reasons.push(`Avg focus: ${Math.round(entry.avgFocus)}%`);
          }
          
          // High incomplete rate (> 30%)
          const incompleteRate = entry.incompleteCount / entry.totalReflections;
          if (incompleteRate > 0.3) {
            severity += incompleteRate * 5;
            reasons.push(`${Math.round(incompleteRate * 100)}% incomplete`);
          }
          
          // Multiple difficulty mentions
          if (entry.difficulties.length >= 2) {
            severity += entry.difficulties.length;
            reasons.push(`${entry.difficulties.length} difficulty mentions`);
          }
          
          if (severity > 2) {
            struggleTopics.push({
              topic: entry.topic,
              subject: entry.subject,
              severity,
              reason: reasons.join(', ')
            });
            struggledTopicNames.add(topicKey);
          }
        }
        
        // Sort by severity (highest first)
        struggleTopics.sort((a, b) => b.severity - a.severity);
        
        if (struggleTopics.length > 0) {
          console.log(`⚠️ Identified ${struggleTopics.length} struggle topics from history`);
          
          historicalStruggleContext = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 HISTORICAL STRUGGLE ANALYSIS (AUTO-DETECTED) 📚
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Based on this user's ENTIRE study history, they struggle with these topics:

${struggleTopics.slice(0, 10).map((t, i) => `${i + 1}. "${t.topic}" (${t.subject})
   → ${t.reason}
   → Severity score: ${t.severity.toFixed(1)}/10`).join('\n\n')}

⚠️ IMPORTANT: Give these topics EXTRA study time even if NOT explicitly marked as difficult!
⚠️ Schedule these topics during PEAK PERFORMANCE hours.
⚠️ Consider shorter sessions with more repetition for these topics.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
        }
      }
      
      // Also check topic progress for low mastery
      if (topicProgress && topicProgress.length > 0) {
        for (const progress of topicProgress) {
          if (progress.mastery_level === 'struggling' || progress.progress_percentage < 30) {
            // Find matching current topic
            const topicKey = topics.find((t: any) => 
              t.subject_id === progress.subject_id
            )?.name?.toLowerCase().trim();
            
            if (topicKey) {
              struggledTopicNames.add(topicKey);
            }
          }
        }
      }
      
    } catch (error) {
      console.log('No historical reflections found, proceeding without struggle analysis');
    }

    // ========================================================================
    // Find overlapping topics between current timetable and historical struggles
    // ========================================================================
    
    const overlappingTopics: Array<{ currentTopic: string; subject: string; isStruggleTopic: boolean }> = [];
    
    for (const topic of topics) {
      const normalizedTopic = topic.name.toLowerCase().trim();
      const subject = subjects.find((s: any) => s.id === topic.subject_id);
      
      // Check if this topic matches any struggled topic (fuzzy match)
      let isStruggleTopic = struggledTopicNames.has(normalizedTopic);
      
      if (!isStruggleTopic) {
        // Fuzzy match against struggled topics
        for (const struggledTopic of struggledTopicNames) {
          if (isValidTopicFuzzy(normalizedTopic, new Set([struggledTopic])) ||
              isValidTopicFuzzy(struggledTopic, new Set([normalizedTopic]))) {
            isStruggleTopic = true;
            break;
          }
        }
      }
      
      overlappingTopics.push({
        currentTopic: topic.name,
        subject: subject?.name || 'Unknown',
        isStruggleTopic
      });
    }
    
    const matchedStruggleTopics = overlappingTopics.filter(t => t.isStruggleTopic);
    console.log(`🔗 ${matchedStruggleTopics.length} current topics match historical struggles`);

    // ========================================================================
    // Calculate FULL COVERAGE requirements
    // ========================================================================
    
    const totalTopics = topics.length;
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const avgTopicsPerDay = Math.ceil(totalTopics / totalDays);
    
    // Calculate minimum session durations to fit all topics
    const minSessionsNeeded = totalTopics; // At least 1 session per topic
    const totalSessionTime = minSessionsNeeded * effectiveSessionDuration;
    const totalBreakTime = minSessionsNeeded * effectiveBreakDuration;
    const totalRequiredForCoverage = totalSessionTime + totalBreakTime;
    
    let coverageAdjustedDuration = effectiveSessionDuration;
    let coverageAdjustedBreak = effectiveBreakDuration;
    
    if (totalRequiredForCoverage > totalAvailableMinutes && totalAvailableMinutes > 0) {
      // Need to reduce durations to fit all topics
      const reductionFactor = totalAvailableMinutes / totalRequiredForCoverage;
      coverageAdjustedDuration = Math.max(20, Math.round(effectiveSessionDuration * reductionFactor));
      coverageAdjustedBreak = Math.max(5, Math.round(effectiveBreakDuration * Math.max(0.6, reductionFactor)));
      
      console.log(`⚙️ Coverage adjustment: ${totalTopics} topics need ${totalRequiredForCoverage}min, have ${totalAvailableMinutes}min`);
      console.log(`   Sessions: ${effectiveSessionDuration} → ${coverageAdjustedDuration}min, Breaks: ${effectiveBreakDuration} → ${coverageAdjustedBreak}min`);
    }
    
    const fullCoverageContext = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 FULL TOPIC COVERAGE REQUIREMENT 🎯
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EVERY topic MUST be scheduled AT LEAST ONCE - NO EXCEPTIONS!

📊 COVERAGE STATS:
- Total topics to cover: ${totalTopics}
- Days available: ${totalDays}
- Avg topics per day needed: ${avgTopicsPerDay}
- Available study time: ${totalAvailableMinutes} minutes (${(totalAvailableMinutes / 60).toFixed(1)} hours)

📌 PRIORITY HIERARCHY (allocate time accordingly):
1. HIGH PRIORITY (${matchedStruggleTopics.length} topics) - Historical struggles + user-marked difficult
   → Schedule 2-3 sessions of ${coverageAdjustedDuration} mins each
   → Schedule during PEAK performance hours
   
2. MEDIUM PRIORITY - Topics with upcoming tests
   → Schedule 1-2 sessions of ${coverageAdjustedDuration} mins each
   
3. STANDARD PRIORITY - All other topics  
   → Schedule at least 1 session of ${coverageAdjustedDuration} mins

${matchedStruggleTopics.length > 0 ? `
🔴 AUTO-BOOSTED TOPICS (from historical data):
${matchedStruggleTopics.map(t => `  • ${t.currentTopic} (${t.subject})`).join('\n')}
` : ''}

⚠️ CRITICAL: If time is limited:
- REDUCE session duration (minimum ${coverageAdjustedDuration} mins)
- REDUCE break duration (minimum ${coverageAdjustedBreak} mins)
- NEVER SKIP a topic entirely!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    console.log("Generating timetable with:", {
      subjectsCount: subjects.length,
      topicsCount: topics.length,
      testDatesCount: testDates.length,
      homeworksCount: homeworks.length,
      eventsCount: events.length,
      hasAnalysis: !!topicAnalysis,
      hasPeakHours: !!peakHoursContext,
      dateRange: `${startDate} to ${endDate}`,
      adaptiveMode: adaptiveConfig.isReduced,
      effectiveSessionDuration,
      effectiveBreakDuration,
    });

    const subjectsContext = subjects
      .map((s: any) => {
        const modeLabel = s.mode === "short-term-exam" ? "Short-Term Exam Prep" 
          : s.mode === "long-term-exam" ? "Long-Term Exam Prep" 
          : "No Exam Focus";
        return `${s.name} (${s.exam_board}) - MODE: ${modeLabel}`;
      })
      .join("; ");
    
    // Fetch school schedule from study preferences
    let schoolHoursContext = "";
    try {
      const { data: schoolPrefs } = await supabaseClient
        .from('study_preferences')
        .select('school_start_time, school_end_time, study_before_school, study_during_lunch, study_during_free_periods, before_school_start, before_school_end, lunch_start, lunch_end')
        .eq('user_id', user.id)
        .single();
      
      if (schoolPrefs) {
        const hasSchoolHours = schoolPrefs.school_start_time && schoolPrefs.school_end_time;
        if (hasSchoolHours) {
          schoolHoursContext = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏫 SCHOOL HOURS BLOCKING - ABSOLUTE PRIORITY 🏫
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCHOOL TIMES (BLOCKED on weekdays Mon-Fri):
   Leave for school: ${schoolPrefs.school_start_time}
   Return from school: ${schoolPrefs.school_end_time}

❌ NEVER schedule study between ${schoolPrefs.school_start_time} and ${schoolPrefs.school_end_time} on weekdays.
✅ Weekends (Saturday, Sunday) are NOT affected by school hours.

${schoolPrefs.study_before_school === true ? `✅ BEFORE SCHOOL ENABLED: ${schoolPrefs.before_school_start} - ${schoolPrefs.before_school_end}` : `❌ BEFORE SCHOOL DISABLED`}
${schoolPrefs.study_during_lunch === true ? `✅ LUNCH TIME ENABLED: ${schoolPrefs.lunch_start} - ${schoolPrefs.lunch_end}` : `❌ LUNCH TIME DISABLED`}
${schoolPrefs.study_during_free_periods === true ? `✅ FREE PERIODS ENABLED` : `❌ FREE PERIODS DISABLED`}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
        }
      }
    } catch (error) {
      console.log('No school schedule found');
    }
    
    const topicsContext = topics
      .map((t: any) => {
        const subject = subjects.find((s: any) => s.id === t.subject_id);
        const relatedTests = testDates.filter((td: any) => td.subject_id === t.subject_id);
        const testInfo = relatedTests.length > 0 
          ? ` - TEST DATE: ${relatedTests[0].test_date}` 
          : '';
        return `${t.name} (${subject?.name}${testInfo})`;
      })
      .join("; ");
    
    const testsContext = testDates
      .map((td: any) => {
        const subject = subjects.find((s: any) => s.id === td.subject_id);
        return `${subject?.name} ${td.test_type} on ${td.test_date}`;
      })
      .join("; ");

    // Filter homework to only include items that can be scheduled at least 1 day before due date
    const relevantHomework = homeworks.filter((hw: any) => {
      const dueDate = new Date(hw.due_date);
      const startD = new Date(startDate);
      const endD = new Date(endDate);
      
      if (dueDate < startD || dueDate > endD) return false;
      
      const latestScheduleDate = new Date(dueDate);
      latestScheduleDate.setDate(latestScheduleDate.getDate() - 1);
      
      return latestScheduleDate >= startD;
    });

    const homeworksContext = relevantHomework.length > 0 
      ? "\n\n**HOMEWORK ASSIGNMENTS (ALL MUST BE SCHEDULED - MANDATORY):**\n" + relevantHomework
          .map((hw: any) => {
            const dueDate = new Date(hw.due_date);
            const formattedDueDate = dueDate.toISOString().split('T')[0];
            return `- "${hw.title}" (${hw.subject}) - DUE: ${formattedDueDate}, DURATION: ${hw.duration || 60} minutes - MUST BE SCHEDULED BEFORE ${formattedDueDate}`;
          })
          .join("\n") + 
          `\n\n🚨 HOMEWORK MUST BE COMPLETED BEFORE DUE DATE - NEVER ON THE DUE DATE ITSELF 🚨`
      : "\n\nNo homework assignments";

    const enabledDays = preferences.day_time_slots
      .filter((slot: any) => slot.enabled)
      .map((slot: any) => `${slot.day} (${slot.startTime}-${slot.endTime})`)
      .join(", ");

    const priorityContext = topicAnalysis?.priorities 
      ? "\n\n**FOCUS TOPICS (need MORE study time):**\n" + 
        topicAnalysis.priorities
          .sort((a: any, b: any) => b.priority_score - a.priority_score)
          .map((p: any) => `📌 ${p.topic_name}: Priority ${p.priority_score}/10 - "${p.reasoning}"`)
          .join("\n")
      : "";

    const userNotesContext = aiNotes 
      ? `\n\n**USER'S CUSTOM INSTRUCTIONS (MUST FOLLOW):**\n${aiNotes}\n`
      : "";

    // ========================================================================
    // PHASE 2: Build EXPLICIT FREE SLOTS context for AI
    // ========================================================================
    
    const freeSlotsContext = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 EXACT AVAILABLE TIME SLOTS - SCHEDULE ONLY IN THESE WINDOWS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ CRITICAL: These are the ONLY times you can schedule study sessions.
⚠️ There is a ${EVENT_BUFFER_MINUTES}-minute buffer before each event.
⚠️ Sessions MUST END before the free slot ends - calculate: start_time + duration < slot_end

${Array.from(allDayFreeSlots.entries())
  .filter(([, daySlots]) => daySlots.freeSlots.length > 0)
  .map(([dateStr, daySlots]) => {
    const eventsOnDay = eventsByDate.get(dateStr) || [];
    const eventsList = eventsOnDay.length > 0 
      ? eventsOnDay.map(e => `  ⛔ BLOCKED: ${e.startTime.toTimeString().slice(0,5)} - ${e.endTime.toTimeString().slice(0,5)} (${e.title})`).join('\n')
      : '  (No events)';
    
    const slotsList = daySlots.freeSlots
      .map(slot => `  ✅ FREE: ${slot.freeFrom} - ${slot.freeTo} (${slot.durationMins} mins available)`)
      .join('\n');
    
    return `📅 ${dateStr} (${daySlots.dayName}):
${eventsList}
${slotsList}
   Total available: ${daySlots.totalFreeMinutes} minutes`;
  })
  .join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 SCHEDULING RULES (NON-NEGOTIABLE) 🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ONLY schedule sessions during ✅ FREE time slots listed above
2. Sessions MUST END before the free slot ends
3. Calculate: session_end = start_time + duration_minutes
4. If session_end would exceed slot end, DO NOT schedule it there
5. Leave ${EVENT_BUFFER_MINUTES} minutes buffer before events
6. NEVER schedule during ⛔ BLOCKED times
7. Fill ALL available free slots with productive study sessions
8. After each study session, add a break (${effectiveBreakDuration} mins)

Example: If FREE slot is 17:30 - 19:45 (135 mins):
- Session 1: 17:30 (${effectiveSessionDuration} mins) → ends 17:30 + ${effectiveSessionDuration} = OK if within slot
- Break: ${effectiveBreakDuration} mins
- Session 2: Start after break → calculate if it fits before 19:45
- If remaining time < ${MIN_SESSION_DURATION + effectiveBreakDuration} mins, slot is full

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    // Build events context (for additional clarity)
    const eventsContext = events.length > 0
      ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 BLOCKED EVENT TIMES - DO NOT SCHEDULE HERE 🔴
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${events.map((evt: any) => {
  const startDate = new Date(evt.start_time);
  const endDate = new Date(evt.end_time);
  const dateStr = startDate.toISOString().split('T')[0];
  const startTime = startDate.toTimeString().slice(0,5);
  const endTime = endDate.toTimeString().slice(0,5);
  const bufferTime = new Date(startDate.getTime() - EVENT_BUFFER_MINUTES * 60000).toTimeString().slice(0,5);
  return `⛔ "${evt.title}" on ${dateStr}: ${startTime} - ${endTime}
   → Sessions must END by ${bufferTime} (${EVENT_BUFFER_MINUTES}min buffer)`;
}).join('\n')}

Events are USER COMMITMENTS (not study topics). DO NOT add them as sessions!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
      : "";

    // Timetable mode context
    const getModeContext = (mode: string | null | undefined) => {
      switch (mode) {
        case "short-term-exam":
          return `
📚 TIMETABLE MODE: SHORT-TERM EXAM PREP (INTENSIVE)
- Revision sessions: ${effectiveSessionDuration} mins
- Breaks: ${effectiveBreakDuration} mins
- Daily sessions: 4-6 intensive sessions
- Review topics every 2-3 days
`;
        case "long-term-exam":
          return `
📅 TIMETABLE MODE: LONG-TERM EXAM PREP (BALANCED)
- Revision sessions: ${effectiveSessionDuration} mins
- Breaks: ${effectiveBreakDuration} mins
- Daily sessions: 3-4 balanced sessions
- Review topics every 5-7 days
`;
        case "no-exam":
          return `
📝 TIMETABLE MODE: NO EXAM FOCUS
- Homework first, then general revision
- Sessions: ${effectiveSessionDuration} mins
- Breaks: ${effectiveBreakDuration} mins
`;
        default:
          return `TIMETABLE MODE: BALANCED - Sessions: ${effectiveSessionDuration} mins, Breaks: ${effectiveBreakDuration} mins`;
      }
    };

    const modeContext = getModeContext(timetableMode);

    // Adaptive config note
    const adaptiveNote = adaptiveConfig.isReduced 
      ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ ADAPTIVE FITTING ACTIVE ⚙️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Time is limited! Sessions have been shortened to fit all content:
- Original session duration: ${preferences.session_duration} mins
- Adjusted session duration: ${effectiveSessionDuration} mins
- Original break duration: ${preferences.break_duration} mins
- Adjusted break duration: ${effectiveBreakDuration} mins

USE THESE ADJUSTED DURATIONS for all sessions.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` 
      : "";

    const firstSlot = preferences.day_time_slots.find((slot: any) => slot.enabled) || { startTime: "09:00", endTime: "22:00" };

    // Use coverage-adjusted durations for final scheduling
    const finalSessionDuration = coverageAdjustedDuration;
    const finalBreakDuration = coverageAdjustedBreak;

    const prompt = `You are an expert educational planner. Create a study timetable.

${freeSlotsContext}

${eventsContext}

${adaptiveNote}

${modeContext}

${schoolHoursContext}

${peakHoursContext}

${historicalStruggleContext}

${fullCoverageContext}

SUBJECTS: ${subjectsContext}

ALL TOPICS TO COVER (schedule ALL of these): ${topicsContext}

UPCOMING TESTS: ${testsContext}

${homeworksContext}

${priorityContext}

${userNotesContext}

STUDY PREFERENCES:
- Daily study hours target: ${preferences.daily_study_hours}
- Available days: ${enabledDays}
- Session duration: ${finalSessionDuration} minutes (adjusted for full coverage)
- Break duration: ${finalBreakDuration} minutes

TIMETABLE PERIOD: ${startDate} to ${endDate}

**CRITICAL REQUIREMENTS:**
1. ONLY schedule in the ✅ FREE time slots listed above
2. ALL sessions MUST end BEFORE the free slot ends
3. Include ALL ${totalTopics} topics at least once - NO EXCEPTIONS
4. Include ALL homework BEFORE due dates
5. Add ${finalBreakDuration}-min breaks between sessions
6. NEVER schedule during ⛔ BLOCKED event times
7. Events are NOT study topics - do NOT add them as sessions
8. Aim for ~${preferences.daily_study_hours} hours/day of STUDY (exclude breaks). Don’t over-schedule once all topics + homework are covered.
9. Give EXTRA sessions to topics marked as historical struggles (2+ sessions total)
10. If time is limited, use shorter ${finalSessionDuration}-min sessions to fit ALL topics

**OUTPUT FORMAT (JSON only, no markdown):**
{
  "schedule": {
    "YYYY-MM-DD": [
      {
        "time": "HH:MM",
        "duration": ${finalSessionDuration},
        "subject": "subject name",
        "topic": "topic name",
        "type": "practice|exam_questions|homework|revision|break",
        "notes": "Resource recommendation",
        "mode": "${timetableMode || 'balanced'}"
      }
    ]
  }
}

Session types:
- "practice": Active practice (first session for a topic)
- "exam_questions": Past paper practice (second session)
- "homework": Homework assignment
- "revision": General revision
- "break": Rest period

VERIFICATION BEFORE RESPONDING:
✓ Every session starts and ends within a ✅ FREE slot
✓ No sessions overlap with ⛔ BLOCKED times
✓ ALL ${totalTopics} topics included at least once
✓ Historical struggle topics have 2+ sessions
✓ All homework scheduled before due dates
✓ Breaks added between sessions`;

    // Validate date range isn't too long (max 4 weeks)
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 28) {
      return new Response(
        JSON.stringify({ 
          error: "Date range too long. Maximum timetable length is 4 weeks." 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add timeout - 90 seconds (Gemini is much faster than GPT-5)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    // Use Lovable AI Gateway with google/gemini-2.5-flash (faster, no reasoning overhead)
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      throw new Error("AI service not configured. Please contact support.");
    }

    let aiResponse: string = "";
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        if (retryCount > 0) {
          console.log(`Retry attempt ${retryCount}/${maxRetries} - waiting ${retryCount * 2} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
        }
        
        console.log(`Calling Lovable AI Gateway (attempt ${retryCount + 1}/${maxRetries + 1})...`);

        const response = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              max_completion_tokens: 16000,
              messages: [
                {
                  role: "system",
                  content: `You are an expert educational planner. Return ONLY valid JSON - no markdown, no code fences. Start with { and end with }. Keep topic names SHORT (max 50 chars). Keep session notes BRIEF (max 30 chars). Ensure ALL braces and brackets are properly closed. NO trailing commas. CRITICAL: Complete the ENTIRE JSON response.`
                },
                {
                  role: "user",
                  content: prompt,
                },
              ],
            }),
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Lovable AI Gateway error:", response.status, errorText);

          if (response.status === 429) {
            if (retryCount < maxRetries) {
              retryCount++;
              continue;
            }
            throw new Error("Rate limit exceeded. Please wait and try again.");
          } else if (response.status === 402) {
            throw new Error("AI credits exhausted. Please add credits to continue.");
          } else if (response.status === 503 && retryCount < maxRetries) {
            retryCount++;
            continue;
          } else {
            throw new Error(`AI request failed: ${response.status}`);
          }
        }

        const result = await response.json();
        const content = result.choices?.[0]?.message?.content;

        console.log("Lovable AI response received, length:", content?.length || 0);

        if (!content || content.trim() === "") {
          if (retryCount < maxRetries) {
            retryCount++;
            continue;
          }
          throw new Error("AI did not generate a response. Please try again.");
        }

        aiResponse = content;
        break;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          clearTimeout(timeoutId);
          throw new Error("AI request timed out. Try a shorter date range.");
        }
        
        if (retryCount >= maxRetries) {
          throw err;
        }
        
        retryCount++;
      }
    }
    
    clearTimeout(timeoutId);

    console.log("AI response (first 300 chars):", aiResponse.substring(0, 300));
    console.log("AI response (last 300 chars):", aiResponse.substring(Math.max(0, aiResponse.length - 300)));

    let scheduleData;
    let jsonString = aiResponse.trim();

    const fenceMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch) {
      jsonString = fenceMatch[1].trim();
      console.log("Extracted JSON from markdown fence");
    }

    if (!jsonString || jsonString.length < 10) {
      throw new Error("AI response is too short to be valid JSON");
    }

    try {
      scheduleData = JSON.parse(jsonString);
      console.log("✓ JSON parsed successfully");
    } catch (firstParseError) {
      console.log("First parse failed, attempting JSON repair...");
      console.log("Parse error:", firstParseError);
      
      const repairedJson = attemptJsonRepair(jsonString);
      console.log("Repaired JSON (last 200 chars):", repairedJson.substring(Math.max(0, repairedJson.length - 200)));
      
      try {
        scheduleData = JSON.parse(repairedJson);
        console.log("✓ JSON repair successful!");
      } catch (repairError) {
        console.error("JSON repair failed:", repairError);
        
        // Final attempt: try to extract partial schedule
        const scheduleMatch = repairedJson.match(/"schedule"\s*:\s*\{([\s\S]*)/);
        if (scheduleMatch) {
          try {
            const partialSchedule = attemptJsonRepair('{"schedule":{' + scheduleMatch[1]);
            scheduleData = JSON.parse(partialSchedule);
            console.log("✓ Partial schedule recovery successful!");
          } catch (partialError) {
            console.error("Partial recovery failed:", partialError);
            throw new Error("AI generated incomplete response. Please try again.");
          }
        } else {
          throw new Error("AI generated incomplete response. Please try again.");
        }
      }
    }

    if (!scheduleData.schedule || typeof scheduleData.schedule !== 'object') {
      throw new Error("AI response missing valid schedule object");
    }

    // ========================================================================
    // Post-Processing: Validation and Gap Filling
    // ========================================================================
    
    try {
      // Enforce rule: no homework sessions on their due date
      if (Array.isArray(homeworks) && homeworks.length > 0) {
        const homeworkDueDates = new Set(homeworks.map((hw: any) => hw.due_date));
        for (const [date, sessions] of Object.entries(scheduleData.schedule)) {
          if (!homeworkDueDates.has(date) || !Array.isArray(sessions)) continue;
          scheduleData.schedule[date] = (sessions as any[]).filter((session: any) => {
            return session.type !== 'homework';
          });
        }
      }

      // CRITICAL: Validate and remove invalid sessions
      const validTopicNames = new Set(topics.map((t: any) => t.name.toLowerCase().trim()));
      const validHomeworkTitles = new Set(homeworks.map((hw: any) => hw.title.toLowerCase().trim()));
      const eventTitles = new Set(events.map((e: any) => e.title.toLowerCase().trim()));
      
      console.log('Valid topics:', Array.from(validTopicNames));
      console.log('Valid homework:', Array.from(validHomeworkTitles));
      console.log('Events (NOT sessions):', Array.from(eventTitles));

      // Helper: check if session overlaps with any event (with buffer)
      const overlapsWithEvent = (sessionDate: string, sessionTime: string, sessionDuration: number): boolean => {
        const eventsOnDate = eventsByDate.get(sessionDate);
        if (!eventsOnDate || eventsOnDate.length === 0) return false;

        const [hours, minutes] = sessionTime.split(':').map(Number);
        const sessionStartMs = Date.UTC(
          parseInt(sessionDate.split('-')[0]),
          parseInt(sessionDate.split('-')[1]) - 1,
          parseInt(sessionDate.split('-')[2]),
          hours,
          minutes,
          0
        );
        const sessionEndMs = sessionStartMs + (sessionDuration * 60 * 1000);

        return eventsOnDate.some((event) => {
          // Add buffer - session should end EVENT_BUFFER_MINUTES before event starts
          const bufferedEventStartMs = event.startTime.getTime() - (EVENT_BUFFER_MINUTES * 60 * 1000);
          const eventEndMs = event.endTime.getTime();
          
          const overlaps = sessionStartMs < eventEndMs && sessionEndMs > bufferedEventStartMs;
          
          if (overlaps) {
            console.log(`  ⚠️ Overlap: ${sessionDate} ${sessionTime}+${sessionDuration}min vs "${event.title}" (with ${EVENT_BUFFER_MINUTES}min buffer)`);
          }
          return overlaps;
        });
      };

      let hallucinationCount = 0;
      let overlapRemovedCount = 0;
      let timeWindowRemovedCount = 0;
      
      for (const [date, sessions] of Object.entries(scheduleData.schedule)) {
        if (!Array.isArray(sessions)) continue;
        
        scheduleData.schedule[date] = (sessions as any[]).filter((session: any) => {
          if (!session || !session.time || !session.duration) return true;
          
          // Validate topic/homework
          if (session.type !== 'break') {
            const sessionTopic = (session.topic || '').toLowerCase().trim();
            
            // Reject events as sessions
            if (eventTitles.has(sessionTopic)) {
              console.log(`🚨 REJECTED: Event "${session.topic}" as session on ${date}`);
              hallucinationCount++;
              return false;
            }
            
            // Validate topic exists
            const isValidTopic = isValidTopicFuzzy(sessionTopic, validTopicNames);
            const isValidHomework = session.type === 'homework' && validHomeworkTitles.has(sessionTopic);
            
            if (!isValidTopic && !isValidHomework) {
              console.log(`🚨 REJECTED: Invalid topic "${session.topic}" on ${date}`);
              hallucinationCount++;
              return false;
            }
          }
          
          // Remove event-type sessions
          if (session.type === 'event') {
            console.log(`🚨 REJECTED: Event-type session on ${date}`);
            hallucinationCount++;
            return false;
          }
          
          // Remove overlapping sessions
          const isOverlapping = overlapsWithEvent(date, session.time, session.duration);
          if (isOverlapping) {
            console.log(`🚫 REMOVED: Overlapping session - ${date} ${session.time} ${session.topic || ''}`);
            overlapRemovedCount++;
            return false;
          }
          
          return true;
        });
      }
      
      console.log(`🚨 Hallucinations removed: ${hallucinationCount}`);
      console.log(`🚫 Overlapping sessions removed: ${overlapRemovedCount}`);

      // Time window validation
      console.log('🕐 Starting time window validation...');
      
      for (const [dateStr, sessions] of Object.entries(scheduleData.schedule)) {
        if (!Array.isArray(sessions)) continue;
        
        const date = new Date(dateStr);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const timeWindow = dayTimeWindows.get(dayName);
        
        if (!timeWindow) {
          console.log(`⚠️ Removing ${sessions.length} sessions on disabled day: ${dateStr}`);
          timeWindowRemovedCount += sessions.length;
          scheduleData.schedule[dateStr] = [];
          continue;
        }
        
        const windowStartMins = timeToMinutes(timeWindow.startTime);
        const windowEndMins = timeToMinutes(timeWindow.endTime);
        
        scheduleData.schedule[dateStr] = (sessions as any[]).filter((session: any) => {
          if (!session.time || !session.duration) return true;
          
          const sessionStartMins = timeToMinutes(session.time);
          const sessionEndMins = sessionStartMins + (session.duration || 0);
          
          if (sessionStartMins < windowStartMins) {
            console.log(`🚫 REMOVED: Starts too early - ${dateStr} ${session.time}`);
            timeWindowRemovedCount++;
            return false;
          }
          
          if (sessionEndMins > windowEndMins) {
            console.log(`🚫 REMOVED: Ends too late - ${dateStr} ${session.time}+${session.duration}min`);
            timeWindowRemovedCount++;
            return false;
          }
          
          return true;
        });
      }
      
      console.log(`🕐 Time window validation: ${timeWindowRemovedCount} sessions removed`);

      // ========================================================================
      // PHASE 5: Gap Filling - Prioritize struggled topics
      // ========================================================================
      
      const totalRemoved = hallucinationCount + overlapRemovedCount + timeWindowRemovedCount;
      
      // Also check if any topics are missing from the schedule
      const scheduledTopics = new Set<string>();
      for (const [, sessions] of Object.entries(scheduleData.schedule)) {
        for (const session of sessions as any[]) {
          if (session.topic) {
            scheduledTopics.add(session.topic.toLowerCase().trim());
          }
        }
      }
      
      const missingTopics = topics.filter((t: any) => {
        const topicKey = t.name.toLowerCase().trim();
        return !scheduledTopics.has(topicKey) && !isValidTopicFuzzy(topicKey, scheduledTopics);
      });
      
      console.log(`📋 Missing topics check: ${missingTopics.length} topics not yet scheduled`);
      
      // Sort topics to prioritize struggled ones first
      const sortedTopicsForGapFill = [...topics].sort((a: any, b: any) => {
        const aIsStruggle = struggledTopicNames.has(a.name.toLowerCase().trim()) ? 1 : 0;
        const bIsStruggle = struggledTopicNames.has(b.name.toLowerCase().trim()) ? 1 : 0;
        return bIsStruggle - aIsStruggle; // Struggle topics first
      });
      
      if (totalRemoved > 5 || missingTopics.length > 0) {
        console.log(`🔧 ${totalRemoved} sessions were removed, ${missingTopics.length} topics missing. Starting gap filling...`);
        scheduleData.schedule = fillGapsWithSessions(
          scheduleData.schedule,
          allDayFreeSlots,
          sortedTopicsForGapFill,
          subjects,
          finalSessionDuration,
          finalBreakDuration,
          timetableMode || 'balanced'
        );
      }

      // ========================================================================
      // PHASE 6: Session Density Validation
      // ========================================================================
      
      let lowDensityDays: Array<{ date: string; count: number }> = [];
      for (const [date, sessions] of Object.entries(scheduleData.schedule)) {
        const studySessions = (sessions as any[]).filter(s => 
          s.type !== 'break' && s.type !== 'lunch' && s.type !== 'event'
        );
        
        const daySlots = allDayFreeSlots.get(date);
        const expectedMinSessions = daySlots && daySlots.totalFreeMinutes > 120 ? 3 : 1;
        
        if (studySessions.length > 0 && studySessions.length < expectedMinSessions) {
          lowDensityDays.push({ date, count: studySessions.length });
        }
      }
      
      if (lowDensityDays.length > 0) {
        console.warn('⚠️ Low density days:', lowDensityDays.map(d => `${d.date}: ${d.count}`).join(', '));
      } else {
        console.log('✓ Session density validation passed');
      }

      // Sort all sessions by time
      for (const dateStr of Object.keys(scheduleData.schedule)) {
        if (Array.isArray(scheduleData.schedule[dateStr])) {
          scheduleData.schedule[dateStr].sort((a: any, b: any) => {
            const aTime = timeToMinutes(a.time || '00:00');
            const bTime = timeToMinutes(b.time || '00:00');
            return aTime - bTime;
          });
        }
      }

    } catch (validationError) {
      console.error("Schedule validation error:", validationError);
      throw validationError;
    }

    // Send push notification for successful timetable generation
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      if (supabaseUrl) {
        await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
          },
          body: JSON.stringify({
            user_id: user.id,
            title: 'Timetable Ready! 📚',
            body: 'Your AI-powered study timetable has been generated successfully.',
            tag: 'timetable-generated',
            data: { url: '/timetables' }
          })
        });
        console.log('Push notification sent for timetable generation');
      }
    } catch (pushError) {
      console.error('Error sending push notification:', pushError);
      // Don't fail the request if push fails
    }

    return new Response(JSON.stringify(scheduleData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-timetable:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
