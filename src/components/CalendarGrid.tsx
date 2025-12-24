import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  BookOpen, 
  FileText, 
  AlertCircle, 
  Coffee,
  Calendar as CalendarIcon
} from "lucide-react";
import { 
  format, 
  startOfWeek, 
  addDays, 
  addWeeks, 
  subWeeks, 
  isSameDay, 
  parseISO, 
  addMinutes,
  startOfDay,
  endOfDay,
  isWithinInterval
} from "date-fns";
import { cn } from "@/lib/utils";
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

interface CalendarGridProps {
  userId?: string;
}

export const CalendarGrid = ({ userId }: CalendarGridProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"week" | "day">("week");
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Responsive check
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setView("day");
      } else {
        setView("week");
      }
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate, userId]);

  const fetchCalendarData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 6);
      
      // Fetch range depends on view, but fetching a week is safe
      const startStr = format(weekStart, "yyyy-MM-dd");
      const endStr = format(weekEnd, "yyyy-MM-dd");

      // 1. Fetch Events
      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", userId)
        .gte("start_time", startStr)
        .lte("start_time", endStr + "T23:59:59");

      const eventItems: CalendarItem[] = (eventsData || []).map((event: any) => ({
        id: `event-${event.id}`,
        type: "event",
        title: event.title,
        date: format(parseISO(event.start_time), "yyyy-MM-dd"),
        startTime: format(parseISO(event.start_time), "HH:mm"),
        endTime: format(parseISO(event.end_time), "HH:mm"),
        color: "destructive",
        data: event,
      }));

      // 2. Fetch Homework
      const { data: homeworkData } = await supabase
        .from("homeworks")
        .select("*")
        .eq("user_id", userId)
        .gte("due_date", startStr)
        .lte("due_date", endStr);

      const homeworkItems: CalendarItem[] = (homeworkData || []).map((hw: any) => {
        const duration = hw.duration || 30;
        return {
          id: `homework-${hw.id}`,
          type: "homework",
          title: hw.title,
          date: hw.due_date,
          startTime: "09:00", // Default time
          endTime: format(addMinutes(parseISO(`${hw.due_date}T09:00`), duration), "HH:mm"),
          color: "purple",
          data: hw,
        };
      });

      // 3. Fetch Timetable Sessions
      // We need to fetch the active timetable first
      const { data: timetables } = await supabase
        .from("timetables")
        .select("schedule")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      const sessionItems: CalendarItem[] = [];
      if (timetables && timetables.length > 0 && timetables[0].schedule) {
        const schedule = timetables[0].schedule as Record<string, any[]>;
        
        Object.entries(schedule).forEach(([date, sessions]) => {
          const sessionDate = parseISO(date);
          // Check if date is within current week view
          if (isWithinInterval(sessionDate, { start: weekStart, end: weekEnd })) {
            sessions.forEach((session: any, index: number) => {
              const startParts = session.time.split(":");
              const startTime = new Date(sessionDate);
              startTime.setHours(parseInt(startParts[0]), parseInt(startParts[1]));
              const endTime = addMinutes(startTime, session.duration);

              sessionItems.push({
                id: `session-${date}-${index}`,
                type: "session",
                title: session.topic || session.subject,
                date: format(sessionDate, "yyyy-MM-dd"),
                startTime: format(startTime, "HH:mm"),
                endTime: format(endTime, "HH:mm"),
                color: "primary",
                data: session,
              });
            });
          }
        });
      }

      setItems([...eventItems, ...homeworkItems, ...sessionItems]);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextPeriod = () => {
    if (view === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const prevPeriod = () => {
    if (view === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subDays(currentDate, 1));
    }
  };

  // Helper for subDays since I didn't import it
  const subDays = (date: Date, amount: number) => addDays(date, -amount);

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  const getItemsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return items
      .filter(item => item.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  if (loading) {
    return <Skeleton className="w-full h-[500px] rounded-xl" />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={prevPeriod}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-bold font-display min-w-[150px] text-center">
            {view === "week" 
              ? `${format(weekDays[0], "MMM d")} - ${format(weekDays[6], "MMM d")}`
              : format(currentDate, "MMMM d, yyyy")
            }
          </h2>
          <Button variant="ghost" size="icon" onClick={nextPeriod}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={view === "day" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setView("day")}
            className="hidden sm:flex"
          >
            Day
          </Button>
          <Button 
            variant={view === "week" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setView("week")}
            className="hidden sm:flex"
          >
            Week
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
        </div>
      </div>

      {/* Mobile/Day View */}
      <div className={cn("space-y-4", view === "week" && "hidden md:hidden")}>
        {view === "day" && (
          <div className="space-y-3">
             {getItemsForDate(currentDate).length === 0 ? (
               <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
                 <CalendarIcon className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                 <p className="text-muted-foreground">No activities scheduled for today</p>
               </div>
             ) : (
               getItemsForDate(currentDate).map((item) => (
                 <CalendarItemCard key={item.id} item={item} />
               ))
             )}
          </div>
        )}
      </div>

      {/* Desktop/Week View */}
      <div className={cn("hidden md:grid grid-cols-7 gap-2", view === "day" && "hidden")}>
        {weekDays.map((day) => {
          const isToday = isSameDay(day, new Date());
          const dayItems = getItemsForDate(day);
          
          return (
            <div key={day.toString()} className={cn(
              "min-h-[500px] bg-card rounded-xl border flex flex-col overflow-hidden transition-colors",
              isToday ? "border-primary ring-1 ring-primary/20" : "border-border/50"
            )}>
              <div className={cn(
                "p-3 text-center border-b",
                isToday ? "bg-primary/5" : "bg-muted/30"
              )}>
                <p className="text-xs font-medium text-muted-foreground uppercase">{format(day, "EEE")}</p>
                <p className={cn(
                  "text-lg font-bold mt-1 w-8 h-8 flex items-center justify-center rounded-full mx-auto",
                  isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                )}>
                  {format(day, "d")}
                </p>
              </div>
              
              <ScrollArea className="flex-1 p-2">
                <div className="space-y-2">
                  {dayItems.map((item) => (
                    <CalendarItemCard key={item.id} item={item} compact />
                  ))}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>
      
      {/* Mobile List View for Week Mode (Fallback if screen is small but view is week - though we force day view on mobile) */}
      {/* Actually, let's make the week view responsive for mobile by stacking days if forced */}
      <div className={cn("md:hidden space-y-6", view !== "week" && "hidden")}>
        {weekDays.map((day) => {
          const dayItems = getItemsForDate(day);
          const isToday = isSameDay(day, new Date());
          
          if (dayItems.length === 0 && !isToday) return null;

          return (
            <div key={day.toString()} className="space-y-2">
              <div className="flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur z-10 py-2">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold border",
                  isToday ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"
                )}>
                  {format(day, "d")}
                </div>
                <div>
                  <p className="font-medium">{format(day, "EEEE")}</p>
                  <p className="text-xs text-muted-foreground">{dayItems.length} activities</p>
                </div>
              </div>
              
              <div className="pl-4 border-l-2 border-muted ml-5 space-y-3">
                {dayItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic py-2">Nothing scheduled</p>
                ) : (
                  dayItems.map((item) => (
                    <CalendarItemCard key={item.id} item={item} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CalendarItemCard = ({ item, compact = false }: { item: CalendarItem, compact?: boolean }) => {
  const getIcon = () => {
    switch (item.type) {
      case "session": return <BookOpen className="h-3 w-3" />;
      case "homework": return <FileText className="h-3 w-3" />;
      case "event": return <AlertCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getColors = () => {
    switch (item.type) {
      case "session": 
        return "bg-primary/15 border-primary/30 text-primary-dark dark:text-primary-foreground hover:bg-primary/25 shadow-sm";
      case "homework": 
        return "bg-violet-500/15 border-violet-500/30 text-violet-700 dark:text-violet-300 hover:bg-violet-500/25 shadow-sm";
      case "event": 
        return "bg-destructive/15 border-destructive/30 text-destructive dark:text-red-300 hover:bg-destructive/25 shadow-sm";
      default: 
        return "bg-muted border-border text-muted-foreground hover:bg-muted/80";
    }
  };

  if (compact) {
    return (
      <div className={cn(
        "p-2 rounded-lg border text-xs transition-all cursor-pointer",
        getColors()
      )}>
        <div className="flex items-center gap-1.5 font-medium mb-1">
          {getIcon()}
          <span className="truncate">{item.startTime}</span>
        </div>
        <p className="font-semibold truncate leading-tight">{item.title}</p>
      </div>
    );
  }

  return (
    <Card className={cn(
      "p-3 border-l-4 transition-all hover:shadow-md cursor-pointer",
      getColors().replace("bg-", "hover:bg-").replace("text-", "")
    )}>
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-full bg-background/50 shrink-0")}>
          {getIcon()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-bold text-sm truncate">{item.title}</h4>
            <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-background/50">
              {item.startTime} - {item.endTime}
            </Badge>
          </div>
          <p className="text-xs opacity-80 capitalize">{item.type}</p>
          {item.data?.subject && (
            <p className="text-xs opacity-70 mt-1">{item.data.subject}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CalendarGrid;
