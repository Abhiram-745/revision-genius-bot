import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, TrendingUp, Brain, Target, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { toast } from "sonner";

interface AIInsightsCardProps {
  userId: string;
}

interface Insight {
  summary: string;
  tips: string[];
  subjectBreakdown?: Record<string, number>;
  learningPatterns?: string[];
  peakStudyHours?: number | null;
}

const COLORS = ["hsl(142, 76%, 36%)", "hsl(142, 69%, 58%)", "hsl(45, 93%, 47%)", "hsl(24, 95%, 53%)", "hsl(262, 83%, 58%)"];

export const AIInsightsCard = ({ userId }: AIInsightsCardProps) => {
  const [timetables, setTimetables] = useState<{ id: string; name: string }[]>([]);
  const [selectedTimetableId, setSelectedTimetableId] = useState<string>("");
  const [insights, setInsights] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [studyData, setStudyData] = useState<any[]>([]);
  const [subjectData, setSubjectData] = useState<any[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);

  useEffect(() => {
    fetchTimetables();
    fetchStudyAnalytics();
  }, [userId]);

  useEffect(() => {
    if (selectedTimetableId && !insights && !loading) {
      const cachedKey = `insights-${selectedTimetableId}`;
      const cached = localStorage.getItem(cachedKey);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 3600000) {
            setInsights(data);
            return;
          }
        } catch (e) {
          console.error("Failed to parse cached insights:", e);
        }
      }
      generateInsights();
    }
  }, [selectedTimetableId]);

  const fetchStudyAnalytics = async () => {
    try {
      const { data: sessions } = await supabase
        .from("study_sessions")
        .select("subject, actual_duration_minutes, status, created_at, planned_start")
        .eq("user_id", userId)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(100);

      if (sessions && sessions.length > 0) {
        // Subject breakdown for pie chart
        const subjectBreakdown: Record<string, number> = {};
        sessions.forEach((s) => {
          subjectBreakdown[s.subject] = (subjectBreakdown[s.subject] || 0) + (s.actual_duration_minutes || 0);
        });

        const pieData = Object.entries(subjectBreakdown).map(([name, value]) => ({
          name: name.length > 10 ? name.slice(0, 10) + '...' : name,
          value: Math.round(value),
          fullName: name,
        }));
        setSubjectData(pieData.slice(0, 5));

        // Weekly trend for area chart
        const last7Days: Record<string, number> = {};
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayName = days[date.getDay()];
          last7Days[dayName] = 0;
        }

        sessions.forEach((s) => {
          const sessionDate = new Date(s.created_at);
          const dayName = days[sessionDate.getDay()];
          const now = new Date();
          const diffDays = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 6 && last7Days[dayName] !== undefined) {
            last7Days[dayName] += s.actual_duration_minutes || 0;
          }
        });

        const trendData = Object.entries(last7Days).map(([day, minutes]) => ({
          day,
          minutes: Math.round(minutes),
          hours: Math.round(minutes / 60 * 10) / 10,
        }));
        setWeeklyTrend(trendData);

        // Hourly distribution
        const hourlyBreakdown: Record<number, number> = {};
        for (let h = 6; h <= 22; h++) hourlyBreakdown[h] = 0;
        
        sessions.forEach((s) => {
          if (s.planned_start) {
            const hour = new Date(s.planned_start).getHours();
            if (hourlyBreakdown[hour] !== undefined) {
              hourlyBreakdown[hour] += s.actual_duration_minutes || 30;
            }
          }
        });
        
        const hourData = Object.entries(hourlyBreakdown).map(([hour, mins]) => ({
          hour: `${hour}:00`,
          minutes: Math.round(mins),
        }));
        setHourlyData(hourData);

        // Radar chart data for study patterns
        const totalMinutes = sessions.reduce((a, s) => a + (s.actual_duration_minutes || 0), 0);
        const avgSessionLength = totalMinutes / sessions.length;
        
        const patterns = [
          { subject: "Focus", value: Math.min(100, sessions.length * 8), fullMark: 100 },
          { subject: "Consistency", value: Math.min(100, Object.keys(subjectBreakdown).length * 20), fullMark: 100 },
          { subject: "Depth", value: Math.min(100, avgSessionLength * 2), fullMark: 100 },
          { subject: "Variety", value: Math.min(100, pieData.length * 25), fullMark: 100 },
          { subject: "Completion", value: 100, fullMark: 100 },
        ];
        setStudyData(patterns);
      } else {
        // Default data for new users
        setStudyData([
          { subject: "Focus", value: 20, fullMark: 100 },
          { subject: "Consistency", value: 15, fullMark: 100 },
          { subject: "Depth", value: 25, fullMark: 100 },
          { subject: "Variety", value: 10, fullMark: 100 },
          { subject: "Completion", value: 30, fullMark: 100 },
        ]);
        setWeeklyTrend([
          { day: "Mon", minutes: 0 },
          { day: "Tue", minutes: 0 },
          { day: "Wed", minutes: 0 },
          { day: "Thu", minutes: 0 },
          { day: "Fri", minutes: 0 },
          { day: "Sat", minutes: 0 },
          { day: "Sun", minutes: 0 },
        ]);
      }
    } catch (error) {
      console.error("Error fetching study analytics:", error);
    }
  };

  const fetchTimetables = async () => {
    try {
      const { data } = await supabase
        .from("timetables")
        .select("id, name")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setTimetables(data);
        setSelectedTimetableId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching timetables:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const generateInsights = async (forceRefresh = false) => {
    if (!selectedTimetableId) return;

    if (forceRefresh) {
      localStorage.removeItem(`insights-${selectedTimetableId}`);
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-insights", {
        body: { timetableId: selectedTimetableId },
      });

      if (error) throw error;

      const rawInsights = data?.insights;
      const insightsData = {
        summary: rawInsights?.overallSummary || rawInsights?.summary || "Based on your study patterns, you're making progress!",
        tips: rawInsights?.personalizedTips || rawInsights?.tips || rawInsights?.recommendedFocus || [
          "Try spacing out your study sessions for better retention",
          "Your peak productivity seems to be in the morning",
          "Consider adding more breaks between long sessions",
        ],
        subjectBreakdown: rawInsights?.subjectBreakdown || {},
        learningPatterns: rawInsights?.learningPatterns || [],
        peakStudyHours: rawInsights?.peakStudyHours || null,
      };
      
      setInsights(insightsData);
      await fetchStudyAnalytics(); // Refresh charts too
      
      localStorage.setItem(`insights-${selectedTimetableId}`, JSON.stringify({
        data: insightsData,
        timestamp: Date.now()
      }));

      if (forceRefresh) {
        toast.success("Insights refreshed!");
      }
    } catch (error: any) {
      console.error("Error generating insights:", error);
      const fallbackInsights = {
        summary: "Complete study sessions to unlock personalized insights!",
        tips: [
          "Add reflections after your study sessions",
          "The AI learns from your focus levels and notes",
          "More data means better recommendations",
        ],
      };
      setInsights(fallbackInsights);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    generateInsights(true);
  };

  if (initialLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 animate-pulse bg-muted rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-32 animate-pulse bg-muted rounded-xl" />
          <div className="h-32 animate-pulse bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (timetables.length === 0) {
    return (
      <div className="text-center py-6">
        <Brain className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          Create a timetable to get AI-powered study insights
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-lg">AI Insights</h3>
        </div>
        <div className="flex items-center gap-2">
          {timetables.length > 1 && !loading && (
            <Select value={selectedTimetableId} onValueChange={(value) => {
              setSelectedTimetableId(value);
              setInsights(null);
            }}>
              <SelectTrigger className="h-8 text-xs w-28">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {timetables.map((tt) => (
                  <SelectItem key={tt.id} value={tt.id} className="text-xs">
                    {tt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="h-8 gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8 bg-muted/20 rounded-xl">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-sm text-muted-foreground">Analyzing your study data...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Key Insight Summary */}
          {insights && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground flex-1">{insights.summary}</p>
              </div>
            </motion.div>
          )}

          {/* Charts Grid - 2x2 layout */}
          <div className="grid grid-cols-2 gap-3">
            {/* Study Pattern Radar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-emerald-600" />
                <p className="text-xs font-semibold text-foreground">Study Pattern</p>
              </div>
              <ResponsiveContainer width="100%" height={110}>
                <RadarChart data={studyData}>
                  <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }} />
                  <Radar
                    dataKey="value"
                    stroke="hsl(142, 76%, 36%)"
                    fill="hsl(142, 76%, 36%)"
                    fillOpacity={0.4}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Subject Focus Pie */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-amber-600" />
                <p className="text-xs font-semibold text-foreground">Subject Focus</p>
              </div>
              {subjectData.length > 0 ? (
                <ResponsiveContainer width="100%" height={110}>
                  <PieChart>
                    <Pie
                      data={subjectData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={45}
                      dataKey="value"
                      strokeWidth={2}
                      stroke="hsl(var(--background))"
                    >
                      {subjectData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                      formatter={(value: any, name: any, props: any) => [`${value} min`, props.payload.fullName || name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[110px] flex items-center justify-center text-xs text-muted-foreground">
                  Complete sessions to see data
                </div>
              )}
            </motion.div>

            {/* Weekly Trend - Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="col-span-2 p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
            >
              <p className="text-xs font-semibold text-foreground mb-2">Weekly Activity</p>
              <ResponsiveContainer width="100%" height={80}>
                <AreaChart data={weeklyTrend}>
                  <defs>
                    <linearGradient id="colorMinutesGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                    formatter={(value: any) => [`${value} min`, "Study time"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="minutes"
                    stroke="hsl(142, 76%, 36%)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorMinutesGreen)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Peak Hours Bar Chart */}
            {hourlyData.length > 0 && hourlyData.some(h => h.minutes > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="col-span-2 p-3 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20"
              >
                <p className="text-xs font-semibold text-foreground mb-2">Peak Study Hours</p>
                <ResponsiveContainer width="100%" height={60}>
                  <BarChart data={hourlyData}>
                    <XAxis dataKey="hour" tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={2} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                      formatter={(value: any) => [`${value} min`, "Study time"]}
                    />
                    <Bar dataKey="minutes" fill="hsl(262, 83%, 58%)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>

          {/* Tips */}
          {insights && insights.tips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-3 rounded-xl bg-muted/30 border border-border/50"
            >
              <p className="text-xs font-semibold text-foreground mb-2">Quick Tips</p>
              <div className="space-y-1.5">
                {insights.tips.slice(0, 3).map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-xs text-muted-foreground"
                  >
                    <span className="text-primary mt-0.5 font-bold">•</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};