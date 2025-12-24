import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, TrendingUp, Brain, Target, Sparkles, Lightbulb, Clock, BookOpen } from "lucide-react";
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
} from "recharts";
import { toast } from "sonner";
import owlChart from "@/assets/owl-chart.png";

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

// Green-to-yellow gradient colors
const COLORS = ["hsl(142, 76%, 36%)", "hsl(142, 69%, 48%)", "hsl(65, 70%, 45%)", "hsl(45, 93%, 47%)", "hsl(35, 90%, 50%)"];

export const AIInsightsCard = ({ userId }: AIInsightsCardProps) => {
  const [timetables, setTimetables] = useState<{ id: string; name: string }[]>([]);
  const [selectedTimetableId, setSelectedTimetableId] = useState<string>("");
  const [insights, setInsights] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [studyData, setStudyData] = useState<any[]>([]);
  const [subjectData, setSubjectData] = useState<any[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<any[]>([]);

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
        // Subject breakdown for donut chart
        const subjectBreakdown: Record<string, number> = {};
        sessions.forEach((s) => {
          subjectBreakdown[s.subject] = (subjectBreakdown[s.subject] || 0) + (s.actual_duration_minutes || 0);
        });

        const pieData = Object.entries(subjectBreakdown).map(([name, value]) => ({
          name: name.length > 8 ? name.slice(0, 8) + '…' : name,
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
        // Default varied data for new users
        setStudyData([
          { subject: "Focus", value: 35, fullMark: 100 },
          { subject: "Consistency", value: 25, fullMark: 100 },
          { subject: "Depth", value: 40, fullMark: 100 },
          { subject: "Variety", value: 30, fullMark: 100 },
          { subject: "Completion", value: 20, fullMark: 100 },
        ]);
        setWeeklyTrend([
          { day: "Mon", minutes: 15, hours: 0.3 },
          { day: "Tue", minutes: 25, hours: 0.4 },
          { day: "Wed", minutes: 10, hours: 0.2 },
          { day: "Thu", minutes: 35, hours: 0.6 },
          { day: "Fri", minutes: 20, hours: 0.3 },
          { day: "Sat", minutes: 5, hours: 0.1 },
          { day: "Sun", minutes: 0, hours: 0 },
        ]);
        setSubjectData([
          { name: "Maths", value: 45, fullName: "Mathematics" },
          { name: "Science", value: 35, fullName: "Science" },
          { name: "English", value: 25, fullName: "English" },
          { name: "History", value: 15, fullName: "History" },
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
      await fetchStudyAnalytics();
      
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
        <div className="h-24 animate-pulse bg-muted/30 rounded-3xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-40 animate-pulse bg-muted/30 rounded-3xl" />
          <div className="h-40 animate-pulse bg-muted/30 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (timetables.length === 0) {
    return (
      <div className="text-center py-8">
        <Brain className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          Create a timetable to get AI-powered study insights
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with organic design */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Sparkles className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <h3 className="font-bold text-xl">AI Study Insights</h3>
            <p className="text-sm text-muted-foreground">Powered by your study patterns</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {timetables.length > 1 && !loading && (
            <Select value={selectedTimetableId} onValueChange={(value) => {
              setSelectedTimetableId(value);
              setInsights(null);
            }}>
              <SelectTrigger className="h-9 text-xs w-32 rounded-xl">
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
            className="h-9 gap-2 rounded-xl border-primary/20 hover:bg-primary/10"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <motion.div 
          className="flex items-center justify-center py-12 rounded-3xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
          <span className="text-muted-foreground font-medium">Analyzing your study data...</span>
        </motion.div>
      )}

      {!loading && (
        <>
          {/* Key Insight Card with mascot */}
          {insights && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative p-6 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border border-primary/20 overflow-hidden"
            >
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
              
              <div className="relative flex items-start gap-4">
                <motion.img
                  src={owlChart}
                  alt="Owl mascot"
                  className="w-20 h-20 object-contain flex-shrink-0"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <span className="text-sm font-semibold text-primary">AI Analysis</span>
                  </div>
                  <p className="text-foreground font-medium leading-relaxed">{insights.summary}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Charts in organic containers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Study Pattern - Radar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="p-5 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-accent/5 border border-primary/15 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-primary/20">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <p className="font-semibold">Study Pattern</p>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <RadarChart data={studyData}>
                  <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} 
                  />
                  <Radar
                    dataKey="value"
                    stroke="hsl(142, 76%, 36%)"
                    fill="url(#radarGradient)"
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="hsl(142, 76%, 36%)" />
                      <stop offset="100%" stopColor="hsl(45, 93%, 47%)" />
                    </linearGradient>
                  </defs>
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Subject Focus - Donut */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="p-5 rounded-3xl bg-gradient-to-br from-accent/10 via-transparent to-primary/5 border border-accent/15 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-accent/20">
                  <BookOpen className="h-4 w-4 text-accent-foreground" />
                </div>
                <p className="font-semibold">Subject Focus</p>
              </div>
              {subjectData.length > 0 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={subjectData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      dataKey="value"
                      strokeWidth={3}
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
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                      formatter={(value: any, name: any, props: any) => [`${value} min`, props.payload.fullName || name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[160px] flex items-center justify-center text-sm text-muted-foreground">
                  Complete sessions to see data
                </div>
              )}
            </motion.div>
          </div>

          {/* Weekly Activity - Full Width Flowing Area */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-5 rounded-3xl bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border border-primary/15 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <p className="font-semibold">Weekly Activity</p>
              <span className="ml-auto text-xs text-muted-foreground">Last 7 days</span>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <AreaChart data={weeklyTrend}>
                <defs>
                  <linearGradient id="colorMinutesFlow" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="hsl(45, 93%, 47%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="strokeFlow" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(142, 76%, 36%)" />
                    <stop offset="50%" stopColor="hsl(45, 93%, 47%)" />
                    <stop offset="100%" stopColor="hsl(142, 76%, 36%)" />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(value: any) => [`${value} min`, "Study time"]}
                />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke="url(#strokeFlow)"
                  strokeWidth={3}
                  fill="url(#colorMinutesFlow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Tips Section */}
          {insights && insights.tips && insights.tips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              {insights.tips.slice(0, 3).map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="p-4 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 hover:border-primary/20 transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-primary/10 mt-0.5">
                      <Lightbulb className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">{tip}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};
