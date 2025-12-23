import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, TrendingUp, BookOpen, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface GroupStudyOverviewProps {
  groupId: string;
}

const COLORS = ['hsl(190, 70%, 50%)', 'hsl(42, 85%, 58%)', 'hsl(160, 60%, 45%)', 'hsl(280, 60%, 55%)', 'hsl(350, 70%, 55%)', 'hsl(200, 60%, 50%)'];

const GroupStudyOverview = ({ groupId }: GroupStudyOverviewProps) => {
  const [stats, setStats] = useState({
    memberCount: 0,
    totalHours: 0,
    totalSessions: 0,
    growthRate: 0,
  });
  const [memberContributions, setMemberContributions] = useState<{ name: string; value: number }[]>([]);
  const [topicDistribution, setTopicDistribution] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (groupId) {
      loadGroupStats();
    }
  }, [groupId]);

  const loadGroupStats = async () => {
    try {
      // Get group members
      const { data: members } = await supabase
        .from("group_members")
        .select("user_id")
        .eq("group_id", groupId);

      if (!members || members.length === 0) {
        setLoading(false);
        return;
      }

      const memberIds = members.map((m) => m.user_id);
      const memberCount = memberIds.length;

      // Get profiles for member names
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", memberIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name || "Unknown"]) || []);

      // Get study streaks for all members
      const { data: streakData } = await supabase
        .from("study_streaks")
        .select("*")
        .in("user_id", memberIds)
        .order("date", { ascending: false });

      let totalMinutes = 0;
      let totalSessions = 0;
      let lastWeekMinutes = 0;
      let previousWeekMinutes = 0;
      const memberMinutes: Record<string, number> = {};

      const today = new Date();
      const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

      streakData?.forEach((streak) => {
        totalMinutes += streak.minutes_studied || 0;
        totalSessions += streak.sessions_completed || 0;
        
        const memberName = profileMap.get(streak.user_id) || "Unknown";
        memberMinutes[memberName] = (memberMinutes[memberName] || 0) + (streak.minutes_studied || 0);

        const streakDate = new Date(streak.date);
        if (streakDate >= oneWeekAgo) {
          lastWeekMinutes += streak.minutes_studied || 0;
        } else if (streakDate >= twoWeeksAgo) {
          previousWeekMinutes += streak.minutes_studied || 0;
        }
      });

      // Calculate growth rate
      const growthRate = previousWeekMinutes > 0 
        ? ((lastWeekMinutes - previousWeekMinutes) / previousWeekMinutes) * 100 
        : lastWeekMinutes > 0 ? 100 : 0;

      // Get study sessions for topic distribution
      const { data: sessionsData } = await supabase
        .from("study_sessions")
        .select("subject, actual_duration_minutes")
        .in("user_id", memberIds)
        .not("actual_duration_minutes", "is", null);

      const subjectMinutes: Record<string, number> = {};
      sessionsData?.forEach((session) => {
        const subject = session.subject || "Other";
        subjectMinutes[subject] = (subjectMinutes[subject] || 0) + (session.actual_duration_minutes || 0);
      });

      // Format data for charts
      const contributions = Object.entries(memberMinutes)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

      const distribution = Object.entries(subjectMinutes)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

      setMemberContributions(contributions);
      setTopicDistribution(distribution);
      setStats({
        memberCount,
        totalHours: Math.round((totalMinutes / 60) * 10) / 10,
        totalSessions,
        growthRate: Math.round(growthRate * 10) / 10,
      });
    } catch (error) {
      console.error("Error loading group stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-64 bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="p-2 rounded-full bg-primary/20 mb-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">{stats.memberCount}</span>
            <span className="text-xs text-muted-foreground">Members</span>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-primary/5 border-accent/20">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="p-2 rounded-full bg-accent/20 mb-2">
              <Clock className="h-5 w-5 text-accent" />
            </div>
            <span className="text-2xl font-bold text-foreground">{formatHours(stats.totalHours)}</span>
            <span className="text-xs text-muted-foreground">Total Study Time</span>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-primary/5 border-secondary/20">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="p-2 rounded-full bg-secondary/20 mb-2">
              <BookOpen className="h-5 w-5 text-secondary" />
            </div>
            <span className="text-2xl font-bold text-foreground">{stats.totalSessions}</span>
            <span className="text-xs text-muted-foreground">Total Sessions</span>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${stats.growthRate >= 0 ? 'from-emerald-500/10 to-primary/5 border-emerald-500/20' : 'from-rose-500/10 to-primary/5 border-rose-500/20'}`}>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className={`p-2 rounded-full mb-2 ${stats.growthRate >= 0 ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
              <TrendingUp className={`h-5 w-5 ${stats.growthRate >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} />
            </div>
            <span className="text-2xl font-bold text-foreground">{stats.growthRate >= 0 ? '+' : ''}{stats.growthRate}%</span>
            <span className="text-xs text-muted-foreground">Weekly Growth</span>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Member Contributions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Member Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {memberContributions.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={memberContributions}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {memberContributions.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${Math.round(value / 60 * 10) / 10}h`, 'Time']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>No contribution data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Study Topics Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-accent" />
              Study Topics Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topicDistribution.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topicDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {topicDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${Math.round(value / 60 * 10) / 10}h`, 'Time']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>No topic data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GroupStudyOverview;
