import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current time in UTC
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    console.log(`Checking for study reminders at ${currentTime} on ${currentDate}`);

    // Get all active timetables
    const { data: timetables, error: timetablesError } = await supabase
      .from('timetables')
      .select('id, user_id, schedule, name')
      .order('created_at', { ascending: false });

    if (timetablesError) {
      console.error('Error fetching timetables:', timetablesError);
      throw timetablesError;
    }

    if (!timetables || timetables.length === 0) {
      console.log('No timetables found');
      return new Response(
        JSON.stringify({ message: 'No timetables to check', reminders_sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let remindersSent = 0;
    const usersSeen = new Set<string>();

    // Process each timetable
    for (const timetable of timetables) {
      // Skip if we already sent a reminder to this user
      if (usersSeen.has(timetable.user_id)) {
        continue;
      }

      const schedule = timetable.schedule as Record<string, any[]>;
      const todaysSessions = schedule[currentDate] || [];

      // Find sessions starting in the next 15 minutes
      for (const session of todaysSessions) {
        if (session.type === 'break') continue;

        const sessionTime = session.time;
        const [sessionHour, sessionMinute] = sessionTime.split(':').map(Number);
        
        // Calculate time difference in minutes
        const sessionMinutes = sessionHour * 60 + sessionMinute;
        const currentMinutes = currentHour * 60 + currentMinute;
        const diff = sessionMinutes - currentMinutes;

        // Send reminder if session starts in 10-15 minutes
        if (diff >= 10 && diff <= 15) {
          const subject = session.subject || session.topic || 'Study session';
          const topic = session.topic || session.subject || '';

          try {
            // Send push notification
            await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`
              },
              body: JSON.stringify({
                user_id: timetable.user_id,
                title: `Time to study ${subject}! 📚`,
                body: topic ? `Get ready for: ${topic}` : `Your study session starts in ${diff} minutes`,
                tag: 'study-reminder',
                data: { 
                  url: '/timetables',
                  subject,
                  topic,
                  time: sessionTime
                }
              })
            });

            console.log(`Sent reminder to user ${timetable.user_id} for ${subject} at ${sessionTime}`);
            remindersSent++;
            usersSeen.add(timetable.user_id);
            
            // Only send one reminder per user per run
            break;
          } catch (pushError) {
            console.error('Error sending push notification:', pushError);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Study reminders processed', 
        reminders_sent: remindersSent,
        checked_at: currentTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-study-reminders:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
