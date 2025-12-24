import { useState, useRef, useCallback, useMemo, memo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GripVertical, Clock, Check, X, Pencil, Calendar, BookOpen, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { OwlMascot } from "@/components/mascot/OwlMascot";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface TimetableSession {
  time: string;
  duration: number;
  subject: string;
  topic: string;
  type: string;
  completed?: boolean;
}

interface Event {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
}

interface Homework {
  id: string;
  title: string;
  subject: string;
  due_date: string;
  duration?: number;
}

interface ManualTimetableEditorProps {
  sessions: TimetableSession[];
  date: string;
  onSave: (updatedSessions: TimetableSession[]) => void;
  onCancel: () => void;
}

const HOUR_HEIGHT = 70;
const MIN_DURATION = 15;

const timeToMinutes = (time: string): number => {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
};

const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

const subjectColors: Record<string, string> = {
  break: "bg-muted/50 border-muted text-muted-foreground",
  event: "bg-blue-500/15 border-blue-500/40 text-blue-700 dark:text-blue-300",
  homework: "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300",
};

const getSessionColor = (subject: string, type: string): string => {
  if (type === "break") return subjectColors.break;
  if (type === "event") return subjectColors.event;
  if (type === "homework") return subjectColors.homework;
  const colors = [
    "bg-gradient-to-br from-primary/15 to-primary/5 border-primary/40 hover:border-primary/60",
    "bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border-emerald-500/40 hover:border-emerald-500/60",
    "bg-gradient-to-br from-violet-500/15 to-violet-500/5 border-violet-500/40 hover:border-violet-500/60",
    "bg-gradient-to-br from-amber-500/15 to-amber-500/5 border-amber-500/40 hover:border-amber-500/60",
    "bg-gradient-to-br from-rose-500/15 to-rose-500/5 border-rose-500/40 hover:border-rose-500/60",
    "bg-gradient-to-br from-cyan-500/15 to-cyan-500/5 border-cyan-500/40 hover:border-cyan-500/60",
  ];
  const index = subject.charCodeAt(0) % colors.length;
  return colors[index];
};

const SessionBlock = memo(({ 
  session, 
  index, 
  top, 
  height, 
  isDragging, 
  isResizable,
  onMouseDownTop, 
  onMouseDownBottom 
}: {
  session: TimetableSession;
  index: number;
  top: number;
  height: number;
  isDragging: boolean;
  isResizable: boolean;
  onMouseDownTop: (e: React.MouseEvent) => void;
  onMouseDownBottom: (e: React.MouseEvent) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.03 }}
    className={cn(
      "absolute left-14 right-3 rounded-xl border-2 transition-all duration-200 shadow-sm",
      getSessionColor(session.subject, session.type),
      isDragging && "shadow-xl ring-2 ring-primary/50 z-50",
      !isResizable && "opacity-75"
    )}
    style={{
      top: `${top}px`,
      height: `${Math.max(height, 35)}px`,
    }}
  >
    {/* Top resize handle - only for editable sessions */}
    {isResizable && (
      <div
        className="absolute -top-1.5 left-0 right-0 h-4 cursor-ns-resize flex items-center justify-center group z-10"
        onMouseDown={onMouseDownTop}
      >
        <div className="w-10 h-1 rounded-full bg-foreground/10 group-hover:bg-primary group-hover:scale-110 transition-all" />
      </div>
    )}

    {/* Session content */}
    <div className="p-3 h-full flex flex-col justify-center overflow-hidden">
      <div className="flex items-center gap-2">
        {isResizable ? (
          <div className="p-1 rounded bg-background/50">
            <GripVertical className="w-3 h-3 text-muted-foreground" />
          </div>
        ) : (
          <div className="p-1 rounded bg-background/50">
            {session.type === "event" ? (
              <Calendar className="w-3 h-3 text-blue-500" />
            ) : session.type === "homework" ? (
              <BookOpen className="w-3 h-3 text-amber-500" />
            ) : (
              <AlertCircle className="w-3 h-3 text-muted-foreground" />
            )}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm truncate">{session.subject}</p>
            {session.type === "event" && (
              <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/30">
                Event
              </Badge>
            )}
            {session.type === "homework" && (
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30">
                Homework
              </Badge>
            )}
          </div>
          {session.topic && height > 50 && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{session.topic}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/60 text-xs font-medium shrink-0">
          <Clock className="w-3 h-3" />
          <span>{session.duration}m</span>
        </div>
      </div>
    </div>

    {/* Bottom resize handle - only for editable sessions */}
    {isResizable && (
      <div
        className="absolute -bottom-1.5 left-0 right-0 h-4 cursor-ns-resize flex items-center justify-center group z-10"
        onMouseDown={onMouseDownBottom}
      >
        <div className="w-10 h-1 rounded-full bg-foreground/10 group-hover:bg-primary group-hover:scale-110 transition-all" />
      </div>
    )}
  </motion.div>
));

SessionBlock.displayName = "SessionBlock";

const ManualTimetableEditor = ({ sessions, date, onSave, onCancel }: ManualTimetableEditorProps) => {
  // State for editable sessions (study sessions only, no breaks)
  const [editableSessions, setEditableSessions] = useState<TimetableSession[]>(() => 
    sessions.filter(s => s.type !== "break" && s.type !== "event" && s.type !== "homework").map(s => ({ ...s }))
  );
  
  // State for events and homework (non-editable, displayed for reference)
  const [events, setEvents] = useState<Event[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  
  const [dragState, setDragState] = useState<{
    index: number;
    edge: "top" | "bottom";
    startY: number;
    originalDuration: number;
    originalTime: string;
  } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch events and homework for this date
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch events for this date
      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id)
        .gte("start_time", `${date}T00:00:00`)
        .lte("start_time", `${date}T23:59:59`);

      if (eventsData) {
        setEvents(eventsData);
      }

      // Fetch homework due on this date
      const { data: homeworkData } = await supabase
        .from("homeworks")
        .select("*")
        .eq("user_id", user.id)
        .eq("due_date", date)
        .eq("completed", false);

      if (homeworkData) {
        setHomework(homeworkData);
      }
    };

    fetchData();
  }, [date]);

  // Convert events to session format for display
  const eventSessions: TimetableSession[] = useMemo(() => {
    return events.map(event => {
      const startTime = new Date(event.start_time);
      const endTime = new Date(event.end_time);
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      const time = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
      
      return {
        time,
        duration: durationMinutes,
        subject: event.title,
        topic: "Event",
        type: "event",
      };
    });
  }, [events]);

  // Convert homework to session format for display (shown at start of day as reminder)
  const homeworkSessions: TimetableSession[] = useMemo(() => {
    return homework.map(hw => ({
      time: "09:00", // Default time for homework reminder
      duration: hw.duration || 30,
      subject: `HW: ${hw.title}`,
      topic: hw.subject,
      type: "homework",
    }));
  }, [homework]);

  // Combine all sessions for display
  const allDisplaySessions = useMemo(() => {
    return [...editableSessions, ...eventSessions].sort((a, b) => 
      timeToMinutes(a.time) - timeToMinutes(b.time)
    );
  }, [editableSessions, eventSessions]);

  const { dayStart, dayEnd, startHour, endHour } = useMemo(() => {
    const allSessions = [...editableSessions, ...eventSessions];
    if (allSessions.length === 0) {
      return { dayStart: 540, dayEnd: 1080, startHour: 9, endHour: 18 };
    }
    const dStart = Math.min(...allSessions.map(s => timeToMinutes(s.time)));
    const dEnd = Math.max(...allSessions.map(s => timeToMinutes(s.time) + s.duration));
    return {
      dayStart: Math.floor(dStart / 60) * 60,
      dayEnd: Math.ceil(dEnd / 60) * 60,
      startHour: Math.floor(dStart / 60),
      endHour: Math.ceil(dEnd / 60)
    };
  }, [editableSessions, eventSessions]);

  // Get blocked time ranges (from events)
  const blockedRanges = useMemo(() => {
    return eventSessions.map(e => ({
      start: timeToMinutes(e.time),
      end: timeToMinutes(e.time) + e.duration
    }));
  }, [eventSessions]);

  // Check if a time range overlaps with blocked ranges
  const overlapsBlocked = useCallback((start: number, end: number) => {
    return blockedRanges.some(range => 
      start < range.end && end > range.start
    );
  }, [blockedRanges]);

  const handleMouseDown = useCallback((e: React.MouseEvent, index: number, edge: "top" | "bottom") => {
    e.preventDefault();
    e.stopPropagation();
    const session = editableSessions[index];
    setDragState({
      index,
      edge,
      startY: e.clientY,
      originalDuration: session.duration,
      originalTime: session.time,
    });
  }, [editableSessions]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState || !containerRef.current) return;

    const deltaY = e.clientY - dragState.startY;
    const deltaMinutes = Math.round((deltaY / HOUR_HEIGHT) * 60 / 5) * 5;
    
    setEditableSessions(prev => {
      const updated = prev.map(s => ({ ...s }));
      const session = updated[dragState.index];
      const originalStart = timeToMinutes(dragState.originalTime);
      
      if (dragState.edge === "bottom") {
        const newDuration = Math.max(MIN_DURATION, dragState.originalDuration + deltaMinutes);
        const newEnd = originalStart + newDuration;
        
        // Check if new end overlaps with blocked ranges
        if (!overlapsBlocked(originalStart, newEnd)) {
          session.duration = Math.min(newDuration, 180);
        }
      } else {
        const newStart = Math.max(dayStart, originalStart + deltaMinutes);
        const newDuration = Math.max(MIN_DURATION, dragState.originalDuration - deltaMinutes);
        const newEnd = newStart + newDuration;
        
        // Check if new range overlaps with blocked ranges
        if (!overlapsBlocked(newStart, newEnd)) {
          session.time = minutesToTime(newStart);
          session.duration = newDuration;
        }
      }
      
      return updated;
    });
  }, [dragState, dayStart, overlapsBlocked]);

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  const handleSave = useCallback(() => {
    const finalSessions: TimetableSession[] = [];
    const sortedSessions = [...editableSessions].sort((a, b) => 
      timeToMinutes(a.time) - timeToMinutes(b.time)
    );
    
    for (let i = 0; i < sortedSessions.length; i++) {
      const session = sortedSessions[i];
      finalSessions.push(session);
      
      if (i < sortedSessions.length - 1) {
        const currentEnd = timeToMinutes(session.time) + session.duration;
        const nextStart = timeToMinutes(sortedSessions[i + 1].time);
        const gap = nextStart - currentEnd;
        
        if (gap > 0) {
          finalSessions.push({
            time: minutesToTime(currentEnd),
            duration: gap,
            subject: "Break",
            topic: "",
            type: "break",
          });
        }
      }
    }
    
    onSave(finalSessions);
    toast.success("Schedule updated successfully!");
  }, [editableSessions, onSave]);

  const hourMarkers = useMemo(() => 
    Array.from({ length: endHour - startHour + 1 }, (_, i) => (
      <div
        key={i}
        className="absolute left-0 right-0 flex items-start"
        style={{ top: `${i * HOUR_HEIGHT}px` }}
      >
        <div className="absolute left-0 right-0 border-t border-dashed border-border/50" />
        <span className="text-xs font-medium text-muted-foreground bg-card px-1.5 py-0.5 rounded -mt-2.5 ml-1">
          {`${(startHour + i).toString().padStart(2, "0")}:00`}
        </span>
      </div>
    )), [startHour, endHour]);

  return (
    <Card className="max-w-2xl mx-auto border-2 shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-background to-accent/10 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <OwlMascot type="lightbulb" size="xs" animate={false} />
            <div>
              <CardTitle className="text-lg">Edit Schedule</CardTitle>
              <p className="text-sm text-muted-foreground">{date}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onCancel} className="gap-1.5">
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} className="gap-1.5 bg-gradient-to-r from-primary to-accent">
              <Check className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-muted/50 border border-border/50">
          <Pencil className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drag the top or bottom edge of sessions to resize them. Events and homework are shown but not editable.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-primary/30 border border-primary/50" />
            <span className="text-muted-foreground">Study Session</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500/50" />
            <span className="text-muted-foreground">Event (blocked)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500/50" />
            <span className="text-muted-foreground">Homework Due</span>
          </div>
        </div>

        {/* Homework reminders */}
        {homework.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Homework Due Today
            </p>
            <ul className="space-y-1">
              {homework.map(hw => (
                <li key={hw.id} className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="font-medium">{hw.title}</span>
                  <span className="text-muted-foreground/70">({hw.subject})</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <ScrollArea className="h-[450px] rounded-lg border bg-card/50">
          <div 
            ref={containerRef}
            className="relative select-none p-2"
            style={{ height: `${(endHour - startHour) * HOUR_HEIGHT + 40}px` }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {hourMarkers}

            {/* Render all sessions (editable + events) */}
            {allDisplaySessions.map((session, displayIndex) => {
              const startMinutes = timeToMinutes(session.time) - dayStart;
              const top = (startMinutes / 60) * HOUR_HEIGHT;
              const height = (session.duration / 60) * HOUR_HEIGHT;
              
              // Find if this is an editable session
              const editableIndex = editableSessions.findIndex(
                s => s.time === session.time && s.subject === session.subject
              );
              const isEditable = editableIndex !== -1 && session.type !== "event" && session.type !== "homework";

              return (
                <SessionBlock
                  key={`${displayIndex}-${session.time}-${session.subject}`}
                  session={session}
                  index={displayIndex}
                  top={top}
                  height={height}
                  isDragging={isEditable && dragState?.index === editableIndex}
                  isResizable={isEditable}
                  onMouseDownTop={(e) => isEditable && handleMouseDown(e, editableIndex, "top")}
                  onMouseDownBottom={(e) => isEditable && handleMouseDown(e, editableIndex, "bottom")}
                />
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ManualTimetableEditor;
