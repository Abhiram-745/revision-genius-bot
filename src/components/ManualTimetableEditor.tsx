import { useState, useRef, useCallback, useMemo, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GripVertical, Clock, Check, X, Pencil } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { OwlMascot } from "@/components/mascot/OwlMascot";

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
};

const getSessionColor = (subject: string, type: string): string => {
  if (type === "break") return subjectColors.break;
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
  onMouseDownTop, 
  onMouseDownBottom 
}: {
  session: TimetableSession;
  index: number;
  top: number;
  height: number;
  isDragging: boolean;
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
      isDragging && "shadow-xl ring-2 ring-primary/50 z-50"
    )}
    style={{
      top: `${top}px`,
      height: `${Math.max(height, 35)}px`,
    }}
  >
    {/* Top resize handle */}
    <div
      className="absolute -top-1.5 left-0 right-0 h-4 cursor-ns-resize flex items-center justify-center group z-10"
      onMouseDown={onMouseDownTop}
    >
      <div className="w-10 h-1 rounded-full bg-foreground/10 group-hover:bg-primary group-hover:scale-110 transition-all" />
    </div>

    {/* Session content */}
    <div className="p-3 h-full flex flex-col justify-center overflow-hidden">
      <div className="flex items-center gap-2">
        <div className="p-1 rounded bg-background/50">
          <GripVertical className="w-3 h-3 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate">{session.subject}</p>
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

    {/* Bottom resize handle */}
    <div
      className="absolute -bottom-1.5 left-0 right-0 h-4 cursor-ns-resize flex items-center justify-center group z-10"
      onMouseDown={onMouseDownBottom}
    >
      <div className="w-10 h-1 rounded-full bg-foreground/10 group-hover:bg-primary group-hover:scale-110 transition-all" />
    </div>
  </motion.div>
));

SessionBlock.displayName = "SessionBlock";

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

  const { dayStart, dayEnd, startHour, endHour } = useMemo(() => {
    if (editableSessions.length === 0) {
      return { dayStart: 540, dayEnd: 1080, startHour: 9, endHour: 18 };
    }
    const dStart = Math.min(...editableSessions.map(s => timeToMinutes(s.time)));
    const dEnd = Math.max(...editableSessions.map(s => timeToMinutes(s.time) + s.duration));
    return {
      dayStart: Math.floor(dStart / 60) * 60,
      dayEnd: Math.ceil(dEnd / 60) * 60,
      startHour: Math.floor(dStart / 60),
      endHour: Math.ceil(dEnd / 60)
    };
  }, [editableSessions]);

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
      
      if (dragState.edge === "bottom") {
        const newDuration = Math.max(MIN_DURATION, dragState.originalDuration + deltaMinutes);
        session.duration = Math.min(newDuration, 180);
      } else {
        const originalStart = timeToMinutes(dragState.originalTime);
        const newStart = Math.max(dayStart, originalStart + deltaMinutes);
        const newDuration = Math.max(MIN_DURATION, dragState.originalDuration - deltaMinutes);
        session.time = minutesToTime(newStart);
        session.duration = newDuration;
      }
      
      return updated;
    });
  }, [dragState, dayStart]);

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
            Drag the top or bottom edge of sessions to resize them
          </p>
        </div>

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

            {editableSessions.map((session, index) => {
              const startMinutes = timeToMinutes(session.time) - dayStart;
              const top = (startMinutes / 60) * HOUR_HEIGHT;
              const height = (session.duration / 60) * HOUR_HEIGHT;

              return (
                <SessionBlock
                  key={`${index}-${session.time}`}
                  session={session}
                  index={index}
                  top={top}
                  height={height}
                  isDragging={dragState?.index === index}
                  onMouseDownTop={(e) => handleMouseDown(e, index, "top")}
                  onMouseDownBottom={(e) => handleMouseDown(e, index, "bottom")}
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
