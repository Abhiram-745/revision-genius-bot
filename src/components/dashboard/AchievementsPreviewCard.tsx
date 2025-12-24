import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, ChevronRight, Lock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface AchievementsPreviewCardProps {
  userId: string;
}

interface Achievement {
  id: string;
  name: string;
  icon: string;
  tier: string;
  unlocked: boolean;
}

const TIER_COLORS: Record<string, string> = {
  bronze: "from-amber-700 to-amber-500",
  silver: "from-slate-400 to-slate-300",
  gold: "from-yellow-500 to-yellow-300",
  platinum: "from-cyan-400 to-cyan-200",
};

export function AchievementsPreviewCard({ userId }: AchievementsPreviewCardProps) {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalUnlocked, setTotalUnlocked] = useState(0);
  const [totalAchievements, setTotalAchievements] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) fetchAchievements();
  }, [userId]);

  const fetchAchievements = async () => {
    const [allRes, unlockedRes] = await Promise.all([
      supabase.from("achievements").select("id, name, icon, tier").eq("is_hidden", false).limit(6),
      supabase.from("user_achievements").select("achievement_id").eq("user_id", userId)
    ]);

    const unlockedIds = new Set((unlockedRes.data || []).map(u => u.achievement_id));

    if (allRes.data) {
      const mapped = allRes.data.map(a => ({
        ...a,
        unlocked: unlockedIds.has(a.id)
      }));
      // Sort: unlocked first, then locked
      mapped.sort((a, b) => (b.unlocked ? 1 : 0) - (a.unlocked ? 1 : 0));
      setAchievements(mapped.slice(0, 4));
    }

    // Get counts
    const { count: totalCount } = await supabase.from("achievements").select("id", { count: "exact", head: true }).eq("is_hidden", false);
    setTotalUnlocked(unlockedRes.data?.length || 0);
    setTotalAchievements(totalCount || 0);
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-card to-primary/5 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse flex gap-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="w-12 h-12 bg-muted rounded-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card to-primary/5 border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievements
          </CardTitle>
          <span className="text-sm text-muted-foreground">{totalUnlocked}/{totalAchievements}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-3">
          {achievements.map((achievement, i) => (
            <motion.div
              key={achievement.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl
                  ${achievement.unlocked 
                    ? `bg-gradient-to-br ${TIER_COLORS[achievement.tier] || TIER_COLORS.bronze} shadow-lg` 
                    : 'bg-muted/50'
                  }`}
              >
                {achievement.unlocked ? (
                  achievement.icon
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              {achievement.unlocked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles className="h-3 w-3 text-yellow-400" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full text-sm gap-1"
          onClick={() => navigate("/activity")}
        >
          View All Achievements <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
