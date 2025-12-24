import { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GripVertical, Clock, Check, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TimetableSession {
  time: string;
  duration: number;
  subject: string;
  topic: string;
  type: string;
  completed?: boolean;
}

interface ManualTimetableEditorProps {
  sessions: TimetableSession[];
  date: string;
  onSave: (updatedSessions: TimetableSession[]) => void;
  onCancel: () => void;
}

const HOUR_HEIGHT = 60; // pixels per hour
const MIN_DURATION = 15; // minimum session duration in minutes

const ManualTimetableEditor = ({ sessions, date, onSave, onCancel }: ManualTimetableEditorProps) => {
  const [editableSessions, setEditableSessions] = useState<TimetableSession[]>(() => 
    sessions.filter(s => s.type !== "break").map(s => ({ ...s }))
  );
  const [dragState, setDragState] = useState<{
    index: number;
    edge: "top" | "bottom";
    startY: number;
    originalDuration: number;
    originalTime: string;
  } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const timeToMinutes = (time: string): number => {
    const [hours, mins] = time.split(":").map(Number);
    return hours * 60 + mins;
  };

  const minutesToTime = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const getSessionColor = (subject: string, type: string): string => {
    if (type === "break") return "bg-muted/50 border-muted";
    const colors = [
      "bg-primary/10 border-primary/30",
      "bg-secondary/10 border-secondary/30",
      "bg-accent/10 border-accent/30",
      "bg-green-500/10 border-green-500/30",
      "bg-purple-500/10 border-purple-500/30",
      "bg-orange-500/10 border-orange-500/30",
    ];
    const index = subject.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Calculate the time range for the day
  const dayStart = Math.min(...editableSessions.map(s => timeToMinutes(s.time)));
  const dayEnd = Math.max(...editableSessions.map(s => timeToMinutes(s.time) + s.duration));
  const totalMinutes = dayEnd - dayStart;
  const startHour = Math.floor(dayStart / 60);
  const endHour = Math.ceil(dayEnd / 60);

  const handleMouseDown = useCallback((e: React.MouseEvent, index: number, edge: "top" | "bottom") => {
    e.preventDefault();
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
    const deltaMinutes = Math.round((deltaY / HOUR_HEIGHT) * 60 / 5) * 5; // Round to 5-minute intervals
    
    setEditableSessions(prev => {
      const updated = [...prev];
      const session = updated[dragState.index];
      
      if (dragState.edge === "bottom") {
        // Dragging bottom edge - change duration
        const newDuration = Math.max(MIN_DURATION, dragState.originalDuration + deltaMinutes);
        const maxDuration = calculateMaxDuration(dragState.index, updated);
        session.duration = Math.min(newDuration, maxDuration);
        
        // Adjust next session if exists
        if (dragState.index < updated.length - 1) {
          const nextSession = updated[dragState.index + 1];
          const currentEnd = timeToMinutes(session.time) + session.duration;
          const nextStart = timeToMinutes(nextSession.time);
          
          if (currentEnd !== nextStart) {
            // Adjust next session's start time
            nextSession.time = minutesToTime(currentEnd);
            nextSession.duration = Math.max(MIN_DURATION, timeToMinutes(dragState.originalTime) + dragState.originalDuration + nextSession.duration - currentEnd);
          }
        }
      } else {
        // Dragging top edge - change start time and duration
        const originalStart = timeToMinutes(dragState.originalTime);
        const newStart = Math.max(dayStart, originalStart + deltaMinutes);
        const newDuration = Math.max(MIN_DURATION, dragState.originalDuration - deltaMinutes);
        
        // Don't overlap with previous session
        if (dragState.index > 0) {
          const prevSession = updated[dragState.index - 1];
          const prevEnd = timeToMinutes(prevSession.time) + prevSession.duration;
          if (newStart < prevEnd) {
            // Shrink previous session
            prevSession.duration = Math.max(MIN_DURATION, newStart - timeToMinutes(prevSession.time));
          }
        }
        
        session.time = minutesToTime(newStart);
        session.duration = newDuration;
      }
      
      return updated;
    });
  }, [dragState, dayStart]);

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  const calculateMaxDuration = (index: number, sessions: TimetableSession[]): number => {
    if (index >= sessions.length - 1) return 180; // 3 hours max for last session
    const currentEnd = timeToMinutes(sessions[index].time) + sessions[index].duration;
    const nextStart = timeToMinutes(sessions[index + 1].time);
    return sessions[index].duration + (nextStart - currentEnd) + sessions[index + 1].duration - MIN_DURATION;
  };

  const handleSave = () => {
    // Recalculate breaks between sessions
    const finalSessions: TimetableSession[] = [];
    
    for (let i = 0; i < editableSessions.length; i++) {
      const session = editableSessions[i];
      finalSessions.push(session);
      
      // Add break if there's a gap before next session
      if (i < editableSessions.length - 1) {
        const currentEnd = timeToMinutes(session.time) + session.duration;
        const nextStart = timeToMinutes(editableSessions[i + 1].time);
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
    toast.success("Timetable updated!");
  };

  return (
    <Card className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Edit Schedule for {date}</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Check className="w-4 h-4 mr-1" />
            Save Changes
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Drag the edges of sessions to resize them. Changes will automatically adjust adjacent sessions.
      </p>

      <ScrollArea className="h-[500px]">
        <div 
          ref={containerRef}
          className="relative select-none"
          style={{ height: `${(endHour - startHour) * HOUR_HEIGHT}px` }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Hour markers */}
          {Array.from({ length: endHour - startHour + 1 }, (_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-dashed border-muted-foreground/20 flex items-start"
              style={{ top: `${i * HOUR_HEIGHT}px` }}
            >
              <span className="text-xs text-muted-foreground bg-background pr-2 -mt-2.5">
                {`${(startHour + i).toString().padStart(2, "0")}:00`}
              </span>
            </div>
          ))}

          {/* Sessions */}
          {editableSessions.map((session, index) => {
            const startMinutes = timeToMinutes(session.time) - dayStart;
            const top = (startMinutes / 60) * HOUR_HEIGHT;
            const height = (session.duration / 60) * HOUR_HEIGHT;

            return (
              <div
                key={index}
                className={cn(
                  "absolute left-12 right-2 rounded-lg border-2 transition-shadow",
                  getSessionColor(session.subject, session.type),
                  dragState?.index === index && "shadow-lg ring-2 ring-primary/50"
                )}
                style={{
                  top: `${top}px`,
                  height: `${Math.max(height, 30)}px`,
                }}
              >
                {/* Top resize handle */}
                <div
                  className="absolute -top-1 left-0 right-0 h-3 cursor-ns-resize flex items-center justify-center group"
                  onMouseDown={(e) => handleMouseDown(e, index, "top")}
                >
                  <div className="w-8 h-1 rounded-full bg-foreground/20 group-hover:bg-primary transition-colors" />
                </div>

                {/* Session content */}
                <div className="p-2 h-full flex flex-col justify-center overflow-hidden">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{session.subject}</p>
                      {session.topic && height > 40 && (
                        <p className="text-xs text-muted-foreground truncate">{session.topic}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{session.duration}m</span>
                    </div>
                  </div>
                </div>

                {/* Bottom resize handle */}
                <div
                  className="absolute -bottom-1 left-0 right-0 h-3 cursor-ns-resize flex items-center justify-center group"
                  onMouseDown={(e) => handleMouseDown(e, index, "bottom")}
                >
                  <div className="w-8 h-1 rounded-full bg-foreground/20 group-hover:bg-primary transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
        <p><strong>Tips:</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>Drag the top or bottom edge of a session to resize it</li>
          <li>Resizing one session will automatically adjust adjacent sessions</li>
          <li>Minimum session duration is 15 minutes</li>
          <li>Breaks will be recalculated when you save</li>
        </ul>
      </div>
    </Card>
  );
};

export default ManualTimetableEditor;
