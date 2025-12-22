import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, isEqual, parseISO, startOfDay } from "date-fns";

interface CompactStreakCardProps {
  userId: string;
}

export const CompactStreakCard = ({ userId }: CompactStreakCardProps) => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchStreakData();
  }, [userId]);

  const fetchStreakData = async () => {
    try {
      const { data, error } = await supabase
        .from("study_streaks")
        .select("date, minutes_studied")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setCurrentStreak(0);
        setLongestStreak(0);
        setTotalDays(0);
        setLoading(false);
        return;
      }

      setTotalDays(data.length);

      // Calculate current streak
      let streak = 0;
      const today = startOfDay(new Date());
      
      for (let i = 0; i < data.length; i++) {
        const studyDate = startOfDay(parseISO(data[i].date));
        const expectedDate = subDays(today, i);
        
        if (isEqual(studyDate, startOfDay(expectedDate))) {
          streak++;
        } else {
          break;
        }
      }
      setCurrentStreak(streak);

      // Calculate longest streak
      let maxStreak = 1;
      let tempStreak = 1;
      
      const sortedDates = [...data].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = startOfDay(parseISO(sortedDates[i - 1].date));
        const currDate = startOfDay(parseISO(sortedDates[i].date));
        const dayDiff = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          tempStreak++;
          maxStreak = Math.max(maxStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }
      setLongestStreak(Math.max(maxStreak, streak));
    } catch (error) {
      console.error("Error fetching streak data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="h-20 animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const getStreakBadge = () => {
    if (currentStreak >= 30) return { label: "🔥 On Fire!", color: "bg-orange-500" };
    if (currentStreak >= 14) return { label: "⚡ Unstoppable", color: "bg-yellow-500" };
    if (currentStreak >= 7) return { label: "🌟 Great Week", color: "bg-blue-500" };
    if (currentStreak >= 3) return { label: "💪 Building", color: "bg-green-500" };
    return null;
  };

  const badge = getStreakBadge();

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Study Streak
          </span>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge.label}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-orange-500">{currentStreak}</div>
            <div className="text-xs text-muted-foreground">Current</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{longestStreak}</div>
            <div className="text-xs text-muted-foreground">Longest</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-muted-foreground">{totalDays}</div>
            <div className="text-xs text-muted-foreground">Total Days</div>
          </div>
        </div>
        {currentStreak === 0 && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            Start studying today to begin your streak!
          </p>
        )}
      </CardContent>
    </Card>
  );
};
