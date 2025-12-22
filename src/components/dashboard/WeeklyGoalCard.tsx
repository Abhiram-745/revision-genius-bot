import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, format } from "date-fns";

interface WeeklyGoalCardProps {
  userId: string;
}

export const WeeklyGoalCard = ({ userId }: WeeklyGoalCardProps) => {
  const [targetHours, setTargetHours] = useState(10);
  const [currentHours, setCurrentHours] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchWeeklyGoal();
  }, [userId]);

  const fetchWeeklyGoal = async () => {
    try {
      const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("weekly_goals")
        .select("target_hours, current_hours")
        .eq("user_id", userId)
        .eq("week_start", weekStart)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        setTargetHours(data.target_hours);
        setCurrentHours(data.current_hours);
      }
    } catch (error) {
      console.error("Error fetching weekly goal:", error);
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = Math.min((currentHours / targetHours) * 100, 100);
  const isOnTrack = progressPercentage >= 50;

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="h-20 animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Weekly Goal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {currentHours.toFixed(1)}h of {targetHours}h
            </span>
            <span className={`text-sm font-medium ${isOnTrack ? "text-green-500" : "text-orange-500"}`}>
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            {targetHours - currentHours > 0 
              ? `${(targetHours - currentHours).toFixed(1)}h remaining this week`
              : "Goal achieved! 🎉"
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
