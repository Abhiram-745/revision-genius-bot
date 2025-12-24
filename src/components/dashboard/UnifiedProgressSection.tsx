import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Target, Calendar, Clock, BookOpen, TrendingUp } from "lucide-react";
import { format, startOfWeek, isToday, isTomorrow, parseISO } from "date-fns";
import { motion } from "framer-motion";

interface UnifiedProgressSectionProps {
  userId: string;
}

interface ProgressData {
  weeklyGoal: { target: number; current: number };
  streak: { current: number; longest: number };
  todayHours: number;
  upcomingDeadlines: Array<{ title: string; date: string; type: 'homework' | 'test' }>;
}

export function UnifiedProgressSection({ userId }: UnifiedProgressSectionProps) {
  const [data, setData] = useState<ProgressData>({
    weeklyGoal: { target: 10, current: 0 },
    streak: { current: 0, longest: 0 },
    todayHours: 0,
    upcomingDeadlines: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

  const fetchData = async () => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const [goalRes, streakRes, sessionsRes, homeworkRes, testsRes] = await Promise.all([
      supabase.from("weekly_goals").select("*").eq("user_id", userId).gte("week_start", weekStart).order("week_start", { ascending: false }).limit(1),
      supabase.from("study_streaks").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(30),
      supabase.from("study_sessions").select("*").eq("user_id", userId).eq("status", "completed").gte("planned_start", today),
      supabase.from("homeworks").select("*").eq("user_id", userId).eq("completed", false).gte("due_date", today).lte("due_date", futureDate).order("due_date").limit(3),
      supabase.from("test_dates").select("*, subjects(name)").gte("test_date", today).lte("test_date", futureDate).order("test_date").limit(3)
    ]);

    // Calculate weekly goal progress
    let weeklyGoal = { target: 10, current: 0 };
    if (goalRes.data && goalRes.data.length > 0) {
      weeklyGoal = { target: goalRes.data[0].target_hours, current: goalRes.data[0].current_hours };
    }

    // Calculate streak
    let currentStreak = 0;
    let longestStreak = 0;
    if (streakRes.data && streakRes.data.length > 0) {
      const sortedDates = streakRes.data.map(s => s.date).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      const todayStr = today;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (sortedDates[0] === todayStr || sortedDates[0] === yesterday) {
        currentStreak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const curr = new Date(sortedDates[i - 1]);
          const prev = new Date(sortedDates[i]);
          const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
          if (diff === 1) currentStreak++;
          else break;
        }
      }

      // Calculate longest streak
      let tempStreak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const curr = new Date(sortedDates[i - 1]);
        const prev = new Date(sortedDates[i]);
        const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, currentStreak);
    }

    // Calculate today's hours
    let todayHours = 0;
    if (sessionsRes.data) {
      const todaySessions = sessionsRes.data.filter(s => s.planned_start.split('T')[0] === today);
      todayHours = todaySessions.reduce((sum, s) => sum + (s.actual_duration_minutes || s.planned_duration_minutes || 0), 0) / 60;
    }

    // Combine deadlines
    const deadlines: ProgressData['upcomingDeadlines'] = [];
    if (homeworkRes.data) {
      homeworkRes.data.forEach(h => deadlines.push({ title: h.title, date: h.due_date, type: 'homework' }));
    }
    if (testsRes.data) {
      testsRes.data.forEach(t => deadlines.push({ 
        title: `${(t.subjects as any)?.name || 'Test'} - ${t.test_type || 'Exam'}`, 
        date: t.test_date, 
        type: 'test' 
      }));
    }
    deadlines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setData({
      weeklyGoal,
      streak: { current: currentStreak, longest: longestStreak },
      todayHours: Math.round(todayHours * 10) / 10,
      upcomingDeadlines: deadlines.slice(0, 4)
    });
    setLoading(false);
  };

  const formatDeadlineDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEE, MMM d");
  };

  const goalProgress = Math.min((data.weeklyGoal.current / data.weeklyGoal.target) * 100, 100);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-card via-card to-muted/30 border-border/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-24 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-card via-card to-primary/5 border-border/50 shadow-lg">
      <CardContent className="p-0">
        {/* Top Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border/50">
          {/* Weekly Goal */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 text-center bg-gradient-to-b from-transparent to-primary/5"
          >
            <div className="flex justify-center mb-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{Math.round(goalProgress)}%</p>
            <p className="text-xs text-muted-foreground">Weekly Goal</p>
          </motion.div>

          {/* Current Streak */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-5 text-center bg-gradient-to-b from-transparent to-secondary/5"
          >
            <div className="flex justify-center mb-2">
              <div className="p-2 rounded-full bg-secondary/10">
                <Flame className="h-5 w-5 text-secondary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{data.streak.current}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </motion.div>

          {/* Today's Hours */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 text-center bg-gradient-to-b from-transparent to-accent/5"
          >
            <div className="flex justify-center mb-2">
              <div className="p-2 rounded-full bg-accent/10">
                <Clock className="h-5 w-5 text-accent" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{data.todayHours}h</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </motion.div>

          {/* Best Streak */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-5 text-center bg-gradient-to-b from-transparent to-muted/30"
          >
            <div className="flex justify-center mb-2">
              <div className="p-2 rounded-full bg-muted">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{data.streak.longest}</p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="px-5 py-4 border-t border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Weekly Progress</span>
            <span className="font-medium">{data.weeklyGoal.current}h / {data.weeklyGoal.target}h</span>
          </div>
          <Progress value={goalProgress} className="h-2" />
        </div>

        {/* Upcoming Deadlines */}
        {data.upcomingDeadlines.length > 0 && (
          <div className="px-5 py-4 border-t border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Upcoming</span>
            </div>
            <div className="space-y-2">
              {data.upcomingDeadlines.map((deadline, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${deadline.type === 'test' ? 'bg-secondary' : 'bg-primary'}`} />
                    <span className="text-foreground truncate max-w-[180px]">{deadline.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDeadlineDate(deadline.date)}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
