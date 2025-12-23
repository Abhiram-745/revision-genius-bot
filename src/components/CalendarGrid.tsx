import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, BookOpen, CheckCircle2, Coffee, FileText, AlertCircle } from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO, addMinutes } from "date-fns";
import { DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface CalendarItem {
  id: string;
  type: "session" | "event" | "homework";
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  color: string;
  data: any;
}

const HOUR_HEIGHT = 60;

const getTimePosition = (time: string, startHour: number) => {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = (hours - startHour) * 60 + minutes;
  return (totalMinutes / 60) * HOUR_HEIGHT;
};

const getSessionHeight = (startTime: string, endTime: string) => {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  const durationMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
  const calculatedHeight = (durationMinutes / 60) * HOUR_HEIGHT;
  return Math.max(calculatedHeight - 2, 24);
};

const getItemStyles = (item: CalendarItem) => {
  if (item.type === "event") {
    return { bg: "bg-destructive/90", text: "text-destructive-foreground", icon: <AlertCircle className="h-3 w-3" /> };
  }
  if (item.type === "homework") {
    return { bg: "bg-purple-500/90", text: "text-white", icon: <FileText className="h-3 w-3" /> };
  }
  
  const sessionType = item.data?.type;
  if (sessionType === "break") {
    return { bg: "bg-muted", text: "text-muted-foreground", icon: <Coffee className="h-3 w-3" /> };
  }
  if (sessionType === "homework") {
    return { bg: "bg-purple-500/90", text: "text-white", icon: <FileText className="h-3 w-3" /> };
  }
  
  return { bg: "bg-primary/90", text: "text-primary-foreground", icon: <BookOpen className="h-3 w-3" /> };
};

const DraggableSession = ({ item, startHour }: { item: CalendarItem; startHour: number }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: item,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    top: `${getTimePosition(item.startTime, startHour)}px`,
    height: `${getSessionHeight(item.startTime, item.endTime)}px`,
    opacity: isDragging ? 0.5 : 1,
  };

  const styles = getItemStyles(item);
  const height = getSessionHeight(item.startTime, item.endTime);
  const isCompact = height < 40;

  return (
    <HoverCard openDelay={300}>
      <HoverCardTrigger asChild>
        <div
          ref={setNodeRef}
          style={style}
          {...listeners}
          {...attributes}
          className={`absolute left-1 right-1 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-lg hover:z-20 hover:scale-[1.02] ${styles.bg} ${styles.text} px-2 py-1.5 overflow-hidden shadow-sm border border-white/10`}
        >
          {isCompact ? (
            <div className="flex items-center gap-1.5 h-full">
              {styles.icon}
              <p className="text-[10px] font-medium truncate flex-1">{item.title}</p>
            </div>
          ) : (
            <div className="flex flex-col h-full gap-0.5">
              <div className="flex items-center gap-1.5">
                {styles.icon}
                <p className="text-xs font-semibold truncate">{item.title}</p>
              </div>
              <p className="text-[10px] opacity-80">{item.startTime} - {item.endTime}</p>
              {item.data?.subject && height >= 55 && (
                <p className="text-[10px] opacity-70 truncate">{item.data.subject}</p>
              )}
            </div>
          )}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-64 p-3 bg-card/95 backdrop-blur-sm z-50" side="right" align="start">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${styles.bg}`}>
              {styles.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground capitalize">{item.data?.type || item.type}</p>
            </div>
          </div>
          <div className="space-y-1.5 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{item.startTime} - {item.endTime}</span>
            </div>
            {item.data?.subject && (
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{item.data.subject}</span>
              </div>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

const StaticItem = ({ item, startHour }: { item: CalendarItem; startHour: number }) => {
  const style = {
    top: `${getTimePosition(item.startTime, startHour)}px`,
    height: `${getSessionHeight(item.startTime, item.endTime)}px`,
  };

  const styles = getItemStyles(item);
  const height = getSessionHeight(item.startTime, item.endTime);
  const isCompact = height < 40;

  return (
    <HoverCard openDelay={300}>
      <HoverCardTrigger asChild>
        <div
          style={style}
          className={`absolute left-1 right-1 rounded-lg transition-all duration-200 hover:shadow-lg hover:z-20 hover:scale-[1.02] ${styles.bg} ${styles.text} px-2 py-1.5 overflow-hidden shadow-sm border border-white/10`}
        >
          {isCompact ? (
            <div className="flex items-center gap-1.5 h-full">
              {styles.icon}
              <p className="text-[10px] font-medium truncate flex-1">{item.title}</p>
            </div>
          ) : (
            <div className="flex flex-col h-full gap-0.5">
              <div className="flex items-center gap-1.5">
                {styles.icon}
                <p className="text-xs font-semibold truncate">{item.title}</p>
              </div>
              <p className="text-[10px] opacity-80">{item.startTime} - {item.endTime}</p>
            </div>
          )}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-64 p-3 bg-card/95 backdrop-blur-sm z-50" side="right" align="start">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${styles.bg}`}>
              {styles.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
            </div>
          </div>
          <div className="space-y-1.5 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{item.startTime} - {item.endTime}</span>
            </div>
            {item.data?.completed !== undefined && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className={`h-3.5 w-3.5 ${item.data.completed ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span>{item.data.completed ? 'Completed' : 'Not completed'}</span>
              </div>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

const DroppableDay = ({ 
  date, 
  items, 
  timeSlots, 
  startHour 
}: { 
  date: Date; 
  items: CalendarItem[]; 
  timeSlots: string[];
  startHour: number;
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: format(date, "yyyy-MM-dd"),
    data: { date },
  });

  const isToday = isSameDay(date, new Date());
  const dayItems = items.filter((item) => item.date === format(date, "yyyy-MM-dd"));

  return (
    <div
      ref={setNodeRef}
      className={`relative flex-1 min-w-[90px] transition-colors ${
        isOver ? "bg-primary/5" : isToday ? "bg-primary/[0.02]" : "bg-background"
      }`}
      style={{ height: `${timeSlots.length * HOUR_HEIGHT}px` }}
    >
      {timeSlots.map((_, i) => (
        <div
          key={i}
          className="absolute left-0 right-0 border-t border-border/20"
          style={{ top: `${i * HOUR_HEIGHT}px` }}
        />
      ))}
      
      {dayItems.map((item) => 
        item.type === "session" ? (
          <DraggableSession key={item.id} item={item} startHour={startHour} />
        ) : (
          <StaticItem key={item.id} item={item} startHour={startHour} />
        )
      )}
      
      {isToday && (
        <div
          className="absolute left-0 right-0 h-0.5 bg-destructive z-30 pointer-events-none"
          style={{ top: `${getTimePosition(format(new Date(), 'HH:mm'), startHour)}px` }}
        >
          <div className="absolute -left-1 -top-1 w-2.5 h-2.5 rounded-full bg-destructive" />
        </div>
      )}
    </div>
  );
};

interface CalendarGridProps {
  userId?: string;
}

export const CalendarGrid = ({ userId }: CalendarGridProps) => {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [timetables, setTimetables] = useState<any[]>([]);
  const [selectedTimetableId, setSelectedTimetableId] = useState<string>("");
  const [timeRange, setTimeRange] = useState({ startHour: 8, endHour: 20 });

  const timeSlots = useMemo(() => 
    Array.from({ length: timeRange.endHour - timeRange.startHour + 1 }, (_, i) => {
      const hour = i + timeRange.startHour;
      return `${hour.toString().padStart(2, '0')}:00`;
    }), [timeRange]
  );

  useEffect(() => {
    fetchTimetables();
  }, []);

  useEffect(() => {
    if (selectedTimetableId) {
      fetchCalendarData();
    }
  }, [currentWeek, selectedTimetableId]);

  const fetchTimetables = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("timetables")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setTimetables(data || []);
      if (data && data.length > 0) {
        setSelectedTimetableId(data[0].id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching timetables:", error);
      setLoading(false);
    }
  };

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const weekStart = format(currentWeek, "yyyy-MM-dd");
      const weekEnd = format(addDays(currentWeek, 6), "yyyy-MM-dd");

      const { data: prefsData } = await supabase
        .from("study_preferences")
        .select("day_time_slots, preferred_start_time, preferred_end_time")
        .eq("user_id", user.id)
        .single();

      if (prefsData) {
        let earliestStart = 9;
        let latestEnd = 17;

        if (prefsData.day_time_slots && Array.isArray(prefsData.day_time_slots)) {
          const slots = prefsData.day_time_slots as any[];
          const enabledSlots = slots.filter(s => s.enabled);
          
          if (enabledSlots.length > 0) {
            earliestStart = Math.min(...enabledSlots.map(s => parseInt(s.startTime?.split(':')[0] || '9')));
            latestEnd = Math.max(...enabledSlots.map(s => parseInt(s.endTime?.split(':')[0] || '17')));
          }
        } else if (prefsData.preferred_start_time && prefsData.preferred_end_time) {
          earliestStart = parseInt(prefsData.preferred_start_time.split(':')[0]);
          latestEnd = parseInt(prefsData.preferred_end_time.split(':')[0]);
        }

        setTimeRange({ 
          startHour: Math.max(5, earliestStart - 1),
          endHour: Math.min(23, latestEnd + 1)
        });
      }

      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id)
        .gte("start_time", weekStart)
        .lte("start_time", weekEnd + "T23:59:59");

      const eventItems: CalendarItem[] = (eventsData || []).map((event: any) => ({
        id: `event-${event.id}`,
        type: "event" as const,
        title: event.title,
        date: format(parseISO(event.start_time), "yyyy-MM-dd"),
        startTime: format(parseISO(event.start_time), "HH:mm"),
        endTime: format(parseISO(event.end_time), "HH:mm"),
        color: "red",
        data: event,
      }));

      const { data: homeworkData } = await supabase
        .from("homeworks")
        .select("*")
        .eq("user_id", user.id)
        .gte("due_date", weekStart)
        .lte("due_date", weekEnd);

      const homeworkItems: CalendarItem[] = (homeworkData || []).map((hw: any) => {
        const duration = hw.duration || 30;
        return {
          id: `homework-${hw.id}`,
          type: "homework" as const,
          title: hw.title,
          date: hw.due_date,
          startTime: "09:00",
          endTime: format(addMinutes(parseISO(`${hw.due_date}T09:00`), duration), "HH:mm"),
          color: "purple",
          data: { ...hw, type: "homework" },
        };
      });

      const { data: timetableData } = await supabase
        .from("timetables")
        .select("schedule")
        .eq("id", selectedTimetableId)
        .single();

      const sessionItems: CalendarItem[] = [];
      if (timetableData?.schedule) {
        const schedule = timetableData.schedule as Record<string, any[]>;
        
        Object.entries(schedule).forEach(([date, sessions]) => {
          const sessionDate = parseISO(date);
          if (sessionDate >= currentWeek && sessionDate <= addDays(currentWeek, 6)) {
            sessions.forEach((session: any, index: number) => {
              const startParts = session.time.split(":");
              const startTime = new Date(sessionDate);
              startTime.setHours(parseInt(startParts[0]), parseInt(startParts[1]));
              const endTime = addMinutes(startTime, session.duration);

              sessionItems.push({
                id: `session-${date}-${index}`,
                type: "session" as const,
                title: session.topic || session.subject,
                date: format(sessionDate, "yyyy-MM-dd"),
                startTime: format(startTime, "HH:mm"),
                endTime: format(endTime, "HH:mm"),
                color: "blue",
                data: { ...session, sessionIndex: index, originalDate: date },
              });
            });
          }
        });
      }

      setCalendarItems([...eventItems, ...homeworkItems, ...sessionItems]);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const draggedItem = calendarItems.find((item) => item.id === active.id);
    if (!draggedItem || draggedItem.type !== "session") return;

    const newDate = over.id as string;

    try {
      const { data: timetableData } = await supabase
        .from("timetables")
        .select("schedule")
        .eq("id", selectedTimetableId)
        .single();

      if (timetableData && timetableData.schedule) {
        const schedule: Record<string, any[]> = JSON.parse(JSON.stringify(timetableData.schedule));
        const oldDate = draggedItem.data.originalDate;
        const sessionIndex = draggedItem.data.sessionIndex;

        if (schedule[oldDate]) {
          schedule[oldDate] = schedule[oldDate].filter((_: any, i: number) => i !== sessionIndex);
          if (schedule[oldDate].length === 0) delete schedule[oldDate];
        }

        if (!schedule[newDate]) schedule[newDate] = [];
        schedule[newDate].push({
          time: draggedItem.startTime,
          subject: draggedItem.data.subject || "",
          topic: draggedItem.data.topic || "",
          duration: draggedItem.data.duration || 60,
          type: draggedItem.data.type || "revision",
          notes: draggedItem.data.notes || "",
        });

        await supabase
          .from("timetables")
          .update({ schedule })
          .eq("id", selectedTimetableId);

        toast.success("Session rescheduled");
        fetchCalendarData();
      }
    } catch (error) {
      console.error("Error rescheduling:", error);
      toast.error("Failed to reschedule");
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
  const activeItem = activeId ? calendarItems.find((item) => item.id === activeId) : null;

  if (loading && timetables.length === 0) {
    return (
      <Card className="overflow-hidden">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </Card>
    );
  }

  if (timetables.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Clock className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground mb-2">No timetables found</p>
          <p className="text-sm text-muted-foreground/70">Create a timetable to view your calendar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            className="min-w-[140px] text-sm font-medium"
          >
            {format(currentWeek, "MMM d")} - {format(addDays(currentWeek, 6), "MMM d")}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {timetables.length > 0 && (
            <Select value={selectedTimetableId} onValueChange={setSelectedTimetableId}>
              <SelectTrigger className="w-[160px] h-8 text-sm">
                <SelectValue placeholder="Select timetable" />
              </SelectTrigger>
              <SelectContent>
                {timetables.map((tt) => (
                  <SelectItem key={tt.id} value={tt.id}>{tt.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 px-3 py-2 border-b bg-muted/10 text-xs">
        <Badge className="bg-primary/90 hover:bg-primary gap-1 px-2 py-0.5">
          <BookOpen className="h-2.5 w-2.5" /> Study
        </Badge>
        <Badge className="bg-purple-500/90 hover:bg-purple-500 gap-1 px-2 py-0.5">
          <FileText className="h-2.5 w-2.5" /> Homework
        </Badge>
        <Badge className="bg-destructive/90 hover:bg-destructive gap-1 px-2 py-0.5">
          <AlertCircle className="h-2.5 w-2.5" /> Events
        </Badge>
        <Badge variant="secondary" className="gap-1 px-2 py-0.5">
          <Coffee className="h-2.5 w-2.5" /> Break
        </Badge>
      </div>

      {/* Day Headers */}
      <div className="flex border-b bg-muted/20 sticky top-0 z-20">
        <div className="w-12 flex-shrink-0 border-r border-border/30 p-2 flex items-center justify-center">
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex flex-1">
          {weekDays.map((day) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={format(day, "yyyy-MM-dd")}
                className={`flex-1 min-w-[90px] text-center py-2 px-1 ${isToday ? "bg-primary/5" : ""}`}
              >
                <p className={`text-[10px] font-semibold uppercase tracking-wider ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                  {format(day, "EEE")}
                </p>
                <p className={`text-sm font-bold mt-0.5 ${
                  isToday 
                    ? "bg-primary text-primary-foreground rounded-full w-6 h-6 mx-auto flex items-center justify-center text-xs" 
                    : ""
                }`}>
                  {format(day, "d")}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Grid */}
      <ScrollArea className="h-[450px]">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex">
            <div className="w-12 flex-shrink-0 border-r border-border/30 bg-muted/5">
              {timeSlots.map((time) => (
                <div
                  key={time}
                  className="text-[10px] font-medium text-muted-foreground text-right pr-2 relative"
                  style={{ height: `${HOUR_HEIGHT}px` }}
                >
                  <span className="absolute -top-2 right-2">
                    {format(parseISO(`2024-01-01T${time}`), "ha")}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-1">
              {weekDays.map((day) => (
                <DroppableDay
                  key={format(day, "yyyy-MM-dd")}
                  date={day}
                  items={calendarItems}
                  timeSlots={timeSlots}
                  startHour={timeRange.startHour}
                />
              ))}
            </div>
          </div>
          
          <DragOverlay>
            {activeItem && activeItem.type === "session" ? (
              <DraggableSession item={activeItem} startHour={timeRange.startHour} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </ScrollArea>
    </Card>
  );
};

export default CalendarGrid;
