import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
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
import lightbulbIcon from "@/assets/lightbulb-icon.png";

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

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#10b981", "#f59e0b", "#8b5cf6"];

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

  // Auto-generate insights when timetable is selected
  useEffect(() => {
    if (selectedTimetableId && !insights && !loading) {
      // Check if we already have cached insights for this timetable
      const cachedKey = `insights-${selectedTimetableId}`;
      const cached = localStorage.getItem(cachedKey);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          // Use cached data if less than 1 hour old
          if (Date.now() - timestamp < 3600000) {
            setInsights(data);
            return;
          }
        } catch (e) {
          console.error("Failed to parse cached insights:", e);
        }
      }
      // Auto-generate if no cache
      generateInsights();
    }
  }, [selectedTimetableId]);

  const fetchStudyAnalytics = async () => {
    try {
      // Fetch study sessions for analytics
      const { data: sessions } = await supabase
        .from("study_sessions")
        .select("subject, actual_duration_minutes, status, created_at")
        .eq("user_id", userId)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(50);

      if (sessions && sessions.length > 0) {
        // Subject breakdown for pie chart
        const subjectBreakdown: Record<string, number> = {};
        sessions.forEach((s) => {
          subjectBreakdown[s.subject] = (subjectBreakdown[s.subject] || 0) + (s.actual_duration_minutes || 0);
        });

        const pieData = Object.entries(subjectBreakdown).map(([name, value]) => ({
          name,
          value: Math.round(value),
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
        const patterns = [
          { subject: "Focus", value: Math.min(100, sessions.length * 10) },
          { subject: "Consistency", value: Math.min(100, Object.keys(subjectBreakdown).length * 20) },
          { subject: "Depth", value: Math.min(100, Math.round(sessions.reduce((a, s) => a + (s.actual_duration_minutes || 0), 0) / sessions.length)) },
          { subject: "Variety", value: Math.min(100, pieData.length * 25) },
          { subject: "Completion", value: 100 },
        ];
        setStudyData(patterns);
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

  const generateInsights = async () => {
    if (!selectedTimetableId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-insights", {
        body: { timetableId: selectedTimetableId },
      });

      if (error) throw error;

      // Handle the response - extract summary and tips from various possible fields
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
      
      // Cache the insights
      localStorage.setItem(`insights-${selectedTimetableId}`, JSON.stringify({
        data: insightsData,
        timestamp: Date.now()
      }));
    } catch (error: any) {
      console.error("Error generating insights:", error);
      // Show helpful fallback insights on error
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

  if (initialLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="h-32 animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (timetables.length === 0) {
    return (
      <Card className="shadow-sm border-border/60">
        <CardContent className="p-6 text-center">
          <img src={lightbulbIcon} alt="Lightbulb" className="h-16 w-16 mx-auto mb-3 opacity-60" />
          <p className="text-sm text-muted-foreground">
            Create a timetable to get AI-powered study insights
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-border/60 overflow-hidden">
      <CardHeader className="pb-2 px-4 pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <img src={lightbulbIcon} alt="AI Insights" className="h-6 w-6" />
            AI Insights
          </CardTitle>
          {timetables.length > 1 && !loading && (
            <Select value={selectedTimetableId} onValueChange={(value) => {
              setSelectedTimetableId(value);
              setInsights(null);
            }}>
              <SelectTrigger className="h-8 text-xs w-32">
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
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span className="text-sm text-muted-foreground">Analyzing your study data...</span>
          </div>
        )}

        {!loading && insights && (
          <>
            {/* Key Insight */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10"
            >
              <p className="text-sm font-medium text-foreground">{insights.summary}</p>
            </motion.div>

            {/* Charts Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Study Pattern Radar */}
              {studyData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="p-3 rounded-xl bg-muted/30 border border-border/50"
                >
                  <p className="text-xs font-medium text-muted-foreground mb-2 text-center">Study Pattern</p>
                  <ResponsiveContainer width="100%" height={100}>
                    <RadarChart data={studyData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }} />
                      <Radar
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {/* Subject Focus Pie */}
              {subjectData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                  className="p-3 rounded-xl bg-muted/30 border border-border/50"
                >
                  <p className="text-xs font-medium text-muted-foreground mb-2 text-center">Subject Focus</p>
                  <ResponsiveContainer width="100%" height={100}>
                    <PieChart>
                      <Pie
                        data={subjectData}
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={40}
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
                          fontSize: "12px",
                        }}
                        formatter={(value: any) => [`${value} min`, ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </div>

            {/* Weekly Trend */}
            {weeklyTrend.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-3 rounded-xl bg-muted/30 border border-border/50"
              >
                <p className="text-xs font-medium text-muted-foreground mb-2">Weekly Activity</p>
                <ResponsiveContainer width="100%" height={80}>
                  <AreaChart data={weeklyTrend}>
                    <defs>
                      <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: any) => [`${value} min`, "Study time"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="minutes"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorMinutes)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Tips */}
            <div className="space-y-1.5">
              {insights.tips.slice(0, 2).map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + index * 0.05 }}
                  className="flex items-start gap-2 text-xs text-muted-foreground"
                >
                  <span className="text-primary mt-0.5">•</span>
                  <span>{tip}</span>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
