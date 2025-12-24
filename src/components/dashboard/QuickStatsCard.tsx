import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, BookOpen, CheckCircle2, Star } from "lucide-react";
import { motion } from "framer-motion";

interface QuickStatsCardProps {
  userId: string;
}

interface Stats {
  totalSessions: number;
  completedSessions: number;
  totalHours: number;
  avgScore: number;
}

export function QuickStatsCard({ userId }: QuickStatsCardProps) {
  const [stats, setStats] = useState<Stats>({ totalSessions: 0, completedSessions: 0, totalHours: 0, avgScore: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    const [sessionsRes, scoresRes] = await Promise.all([
      supabase.from("study_sessions").select("status, actual_duration_minutes, planned_duration_minutes").eq("user_id", userId),
      supabase.from("test_scores").select("percentage").eq("user_id", userId)
    ]);

    let totalSessions = 0;
    let completedSessions = 0;
    let totalMinutes = 0;

    if (sessionsRes.data) {
      totalSessions = sessionsRes.data.length;
      sessionsRes.data.forEach(s => {
        if (s.status === 'completed') {
          completedSessions++;
          totalMinutes += s.actual_duration_minutes || s.planned_duration_minutes || 0;
        }
      });
    }

    // Calculate avg score, filtering out 0s
    let avgScore = 0;
    if (scoresRes.data && scoresRes.data.length > 0) {
      const validScores = scoresRes.data.filter(s => s.percentage && s.percentage > 0);
      if (validScores.length > 0) {
        avgScore = validScores.reduce((sum, s) => sum + s.percentage, 0) / validScores.length;
      }
    }

    setStats({
      totalSessions,
      completedSessions,
      totalHours: Math.round(totalMinutes / 60),
      avgScore: Math.round(avgScore)
    });
    setLoading(false);
  };

  const statItems = [
    { icon: BookOpen, label: "Sessions", value: stats.totalSessions, color: "text-primary" },
    { icon: CheckCircle2, label: "Completed", value: stats.completedSessions, color: "text-emerald-500" },
    { icon: TrendingUp, label: "Hours", value: `${stats.totalHours}h`, color: "text-secondary" },
    { icon: Star, label: "Avg Score", value: stats.avgScore > 0 ? `${stats.avgScore}%` : "—", color: "text-yellow-500" },
  ];

  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-border/50">
        <CardContent className="p-4">
          <div className="animate-pulse flex justify-around">
            {[1, 2, 3, 4].map(i => <div key={i} className="w-12 h-12 bg-muted rounded" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-border/50">
      <CardContent className="p-4">
        <div className="grid grid-cols-4 gap-2">
          {statItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="text-center"
            >
              <div className="flex justify-center mb-1">
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <p className="text-lg font-bold">{item.value}</p>
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
