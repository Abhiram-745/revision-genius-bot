import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, ChevronRight, Plus } from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";

interface ProgressCardProps {
  userId: string;
}

interface WeeklyGoal {
  id: string;
  target_hours: number;
  current_hours: number;
}

interface RecentSession {
  id: string;
  subject: string;
  topic: string | null;
  actual_duration_minutes: number;
  planned_start: string;
}

export const ProgressCard = ({ userId }: ProgressCardProps) => {
  const navigate = useNavigate();
  const [weeklyGoal, setWeeklyGoal] = useState<WeeklyGoal | null>(null);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
      const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

      const [goalRes, sessionsRes, completedSessionsRes] = await Promise.all([
        // Weekly goal
        supabase
          .from("weekly_goals")
          .select("id, target_hours, current_hours")
          .eq("user_id", userId)
          .eq("week_start", weekStart)
          .maybeSingle(),
        
        // Recent completed sessions (last 2)
        supabase
          .from("study_sessions")
          .select("id, subject, topic, actual_duration_minutes, planned_start")
          .eq("user_id", userId)
          .eq("status", "completed")
          .order("planned_start", { ascending: false })
          .limit(2),
        
        // This week's sessions for calculating current hours
        supabase
          .from("study_sessions")
          .select("actual_duration_minutes")
          .eq("user_id", userId)
          .eq("status", "completed")
          .gte("planned_start", `${weekStart}T00:00:00`)
          .lte("planned_start", `${weekEnd}T23:59:59`),
      ]);

      // Calculate current hours
      const totalMinutes = completedSessionsRes.data?.reduce((sum, s) => sum + (s.actual_duration_minutes || 0), 0) || 0;
      const currentHours = Math.round((totalMinutes / 60) * 10) / 10;

      if (goalRes.data) {
        setWeeklyGoal({ ...goalRes.data, current_hours: currentHours });
      }
      
      setRecentSessions(sessionsRes.data || []);
    } catch (error) {
      console.error("Error fetching progress data:", error);
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = weeklyGoal 
    ? Math.min((weeklyGoal.current_hours / weeklyGoal.target_hours) * 100, 100) 
    : 0;

  const formatSessionTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${Math.round(diffHours)}h ago`;
    return format(date, "MMM d");
  };

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="h-32 animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-2 px-4 pt-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        {/* Weekly Goal */}
        {weeklyGoal ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Weekly Goal</span>
              <span className="font-medium">
                {weeklyGoal.current_hours} / {weeklyGoal.target_hours}h
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            {progressPercentage >= 100 && (
              <p className="text-xs text-green-600 font-medium">🎉 Goal achieved!</p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground">No weekly goal set</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => navigate("/dashboard")}
            >
              <Plus className="h-3 w-3 mr-1" />
              Set Goal
            </Button>
          </div>
        )}

        {/* Recent Activity */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            Recent Activity
          </p>
          {recentSessions.length > 0 ? (
            <div className="space-y-2">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/30">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{session.subject}</p>
                    {session.topic && (
                      <p className="text-xs text-muted-foreground truncate">{session.topic}</p>
                    )}
                  </div>
                  <div className="text-right text-xs text-muted-foreground shrink-0 ml-2">
                    <p>{Math.round(session.actual_duration_minutes)}m</p>
                    <p>{formatSessionTime(session.planned_start)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground p-2">No recent activity</p>
          )}
        </div>

        {/* View Full Progress */}
        <Button 
          variant="ghost" 
          className="w-full justify-between text-sm h-9"
          onClick={() => navigate("/ai-insights")}
        >
          View full progress
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
