import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { format, startOfDay, subDays, startOfWeek, endOfWeek } from "date-fns";

interface TodayOverviewCardProps {
  userId: string;
}

interface OverviewData {
  streak: number;
  hoursToday: number;
  hoursThisWeek: number;
  nextDeadline: { title: string; date: string; subject: string } | null;
  pendingHomework: number;
}

export const TodayOverviewCard = ({ userId }: TodayOverviewCardProps) => {
  const [data, setData] = useState<OverviewData>({
    streak: 0,
    hoursToday: 0,
    hoursThisWeek: 0,
    nextDeadline: null,
    pendingHomework: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, [userId]);

  const fetchOverviewData = async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
      const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

      // Fetch all data in parallel
      const [streaksRes, todaySessionsRes, weekSessionsRes, homeworkRes, testDatesRes] = await Promise.all([
        // Study streaks
        supabase
          .from("study_streaks")
          .select("date")
          .eq("user_id", userId)
          .order("date", { ascending: false }),
        
        // Today's completed sessions
        supabase
          .from("study_sessions")
          .select("actual_duration_minutes")
          .eq("user_id", userId)
          .eq("status", "completed")
          .gte("planned_start", `${today}T00:00:00`)
          .lte("planned_start", `${today}T23:59:59`),
        
        // This week's completed sessions
        supabase
          .from("study_sessions")
          .select("actual_duration_minutes")
          .eq("user_id", userId)
          .eq("status", "completed")
          .gte("planned_start", `${weekStart}T00:00:00`)
          .lte("planned_start", `${weekEnd}T23:59:59`),
        
        // Pending homework
        supabase
          .from("homeworks")
          .select("id, title, due_date, subject")
          .eq("user_id", userId)
          .eq("completed", false)
          .gte("due_date", today)
          .order("due_date", { ascending: true }),
        
        // Upcoming test dates
        supabase
          .from("test_dates")
          .select("id, test_date, test_type, subject_id, subjects(name)")
          .gte("test_date", today)
          .order("test_date", { ascending: true })
          .limit(1),
      ]);

      // Calculate streak
      let streak = 0;
      if (streaksRes.data && streaksRes.data.length > 0) {
        const todayStart = startOfDay(new Date());
        const yesterdayStart = startOfDay(subDays(new Date(), 1));
        const recentDates = streaksRes.data.map(d => startOfDay(new Date(d.date)).getTime());
        
        if (recentDates.includes(todayStart.getTime()) || recentDates.includes(yesterdayStart.getTime())) {
          let currentDate = recentDates.includes(todayStart.getTime()) ? todayStart : yesterdayStart;
          for (const record of streaksRes.data) {
            const recordDate = startOfDay(new Date(record.date)).getTime();
            if (recordDate === currentDate.getTime()) {
              streak++;
              currentDate = startOfDay(subDays(currentDate, 1));
            } else if (recordDate < currentDate.getTime()) {
              break;
            }
          }
        }
      }

      // Calculate hours
      const hoursToday = (todaySessionsRes.data?.reduce((sum, s) => sum + (s.actual_duration_minutes || 0), 0) || 0) / 60;
      const hoursThisWeek = (weekSessionsRes.data?.reduce((sum, s) => sum + (s.actual_duration_minutes || 0), 0) || 0) / 60;

      // Get next deadline (homework or test)
      let nextDeadline: OverviewData["nextDeadline"] = null;
      
      const nextHomework = homeworkRes.data?.[0];
      const nextTest = testDatesRes.data?.[0];

      if (nextHomework && nextTest) {
        const homeworkDate = new Date(nextHomework.due_date);
        const testDate = new Date(nextTest.test_date);
        if (homeworkDate < testDate) {
          nextDeadline = {
            title: nextHomework.title,
            date: nextHomework.due_date,
            subject: nextHomework.subject,
          };
        } else {
          nextDeadline = {
            title: nextTest.test_type || "Test",
            date: nextTest.test_date,
            subject: (nextTest.subjects as any)?.name || "Unknown",
          };
        }
      } else if (nextHomework) {
        nextDeadline = {
          title: nextHomework.title,
          date: nextHomework.due_date,
          subject: nextHomework.subject,
        };
      } else if (nextTest) {
        nextDeadline = {
          title: nextTest.test_type || "Test",
          date: nextTest.test_date,
          subject: (nextTest.subjects as any)?.name || "Unknown",
        };
      }

      setData({
        streak,
        hoursToday: Math.round(hoursToday * 10) / 10,
        hoursThisWeek: Math.round(hoursThisWeek * 10) / 10,
        nextDeadline,
        pendingHomework: homeworkRes.data?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching overview data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDeadlineDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
      return "Today";
    } else if (format(date, "yyyy-MM-dd") === format(tomorrow, "yyyy-MM-dd")) {
      return "Tomorrow";
    }
    return format(date, "MMM d");
  };

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="h-16 animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-border/60">
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Today Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Streak */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{data.streak}</p>
              <p className="text-xs text-muted-foreground">Day streak</p>
            </div>
          </div>

          {/* Hours Today */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">{data.hoursThisWeek}h</p>
              <p className="text-xs text-muted-foreground">This week</p>
            </div>
          </div>

          {/* Next Deadline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="min-w-0">
              {data.nextDeadline ? (
                <>
                  <p className="text-sm font-semibold truncate">{formatDeadlineDate(data.nextDeadline.date)}</p>
                  <p className="text-xs text-muted-foreground truncate">{data.nextDeadline.subject}</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold">None</p>
                  <p className="text-xs text-muted-foreground">No deadlines</p>
                </>
              )}
            </div>
          </div>

          {/* Homework */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{data.pendingHomework}</p>
              <p className="text-xs text-muted-foreground">Tasks due</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
