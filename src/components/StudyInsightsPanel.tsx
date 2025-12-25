import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, TrendingUp, TrendingDown, Lightbulb, Target, Loader2, Clock, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import PaywallDialog from "@/components/PaywallDialog";
import { useQueryClient } from "@tanstack/react-query";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Green-yellow color palette matching the reference design
const INSIGHT_COLORS = {
  primary: "hsl(142, 76%, 36%)", // Forest green
  secondary: "hsl(142, 69%, 48%)", // Light green
  tertiary: "hsl(65, 70%, 45%)", // Yellow-green
  quaternary: "hsl(45, 93%, 47%)", // Golden yellow
  accent: "hsl(35, 90%, 50%)", // Warm orange
};

const ChartCard = ({ title, icon, children, className = "", description }: { 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode; 
  className?: string;
  description?: string;
}) => (
  <Card className={`border-emerald-200/50 dark:border-emerald-800/30 bg-gradient-to-br from-emerald-50/50 via-lime-50/30 to-amber-50/30 dark:from-emerald-950/20 dark:via-lime-950/10 dark:to-amber-950/10 rounded-2xl shadow-sm ${className}`}>
    <CardHeader className="pb-2">
      <CardTitle className="text-base font-semibold flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-amber-500">
          <span className="text-white">{icon}</span>
        </div>
        {title}
      </CardTitle>
      {description && (
        <CardDescription className="text-xs">{description}</CardDescription>
      )}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  ScatterChart,
  Scatter,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface StudyInsightsPanelProps {
  timetableId: string;
}

interface Insight {
  strugglingTopics: Array<{
    topic: string;
    subject: string;
    severity: string;
    reason: string;
    quotes: string[];
    avgDifficulty?: number;
    avgFocusLevel?: number;
  }>;
  strongAreas: Array<{
    topic: string;
    subject: string;
    reason: string;
    quotes: string[];
    avgDifficulty?: number;
    avgFocusLevel?: number;
  }>;
  learningPatterns: string[];
  recommendedFocus: string[];
  personalizedTips: string[];
  subjectBreakdown: {
    [key: string]: {
      confidenceScore: number;
      summary: string;
      topicsCount: number;
    };
  };
  peakStudyHours?: {
    bestTimeWindow: string;
    bestTimeRange: string;
    worstTimeWindow: string;
    worstTimeRange: string;
    completionRateByWindow: {
      morning: number;
      afternoon: number;
      evening: number;
    };
    avgDifficultyByWindow: {
      morning: number;
      afternoon: number;
      evening: number;
    };
    recommendation: string;
  };
  overallSummary: string;
}

// Helper function to normalize completion rate (handle both 0-1 and 0-100 formats)
const normalizeCompletionRate = (rate: number): number => {
  if (rate > 1) {
    // Already a percentage (0-100), just return
    return Math.min(rate, 100);
  }
  // Decimal (0-1), convert to percentage
  return rate * 100;
};

// Helper function to normalize difficulty (ensure 1-10 scale)
const normalizeDifficulty = (difficulty: number): number => {
  if (difficulty > 10) {
    // Likely on 0-100 scale, convert to 1-10
    return Math.min(difficulty / 10, 10);
  }
  return Math.min(difficulty, 10);
};

export const StudyInsightsPanel = ({ timetableId }: StudyInsightsPanelProps) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<Insight | null>(null);
  const [reflections, setReflections] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  useEffect(() => {
    fetchReflections();
    fetchExistingInsights();
  }, [timetableId]);

  const fetchReflections = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("topic_reflections")
      .select("*")
      .eq("timetable_id", timetableId)
      .eq("user_id", user.id);

    setReflections(data || []);
  };

  const fetchExistingInsights = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("study_insights")
      .select("*")
      .eq("timetable_id", timetableId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (data?.insights_data) {
      setInsights(data.insights_data as unknown as Insight);
    }
  };

  const [showPaywall, setShowPaywall] = useState(false);

  const generateInsights = async () => {
    // Check paywall limits first
    const { checkCanGenerateAIInsights, incrementUsage } = await import("@/hooks/useUserRole");
    const canGenerate = await checkCanGenerateAIInsights();
    
    if (!canGenerate) {
      setShowPaywall(true);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-insights', {
        body: { timetableId }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setInsights(data.insights);
      
      // Increment usage after successful generation
      await incrementUsage("ai_insights", queryClient);
      
      toast.success("AI Insights generated!");
    } catch (error) {
      console.error("Error generating insights:", error);
      toast.error("Failed to generate insights");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      default: return 'secondary';
    }
  };

  const selectedReflection = selectedTopic 
    ? reflections.find(r => r.topic === selectedTopic)
    : null;

  return (
    <div className="space-y-6">
      {/* Main Insights Card with green-yellow theme */}
      <Card className="border-emerald-200/50 dark:border-emerald-800/30 bg-gradient-to-br from-emerald-50/60 via-lime-50/40 to-amber-50/40 dark:from-emerald-950/30 dark:via-lime-950/20 dark:to-amber-950/20 rounded-3xl overflow-hidden">
        <CardHeader className="relative">
          {/* Decorative background elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-emerald-400/20 to-amber-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-lime-400/15 to-emerald-400/15 rounded-full blur-2xl" />
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-amber-500 shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-amber-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-amber-400">
                  AI Study Insights
                </CardTitle>
                <CardDescription className="text-sm">
                  Personalized analysis powered by your study patterns
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={generateInsights}
              disabled={loading || reflections.length === 0}
              className="gap-2 bg-gradient-to-r from-emerald-600 to-amber-500 hover:from-emerald-700 hover:to-amber-600 text-white border-0 shadow-md"
            >
              <Sparkles className="h-4 w-4" />
              {loading ? "Analyzing..." : insights ? "Refresh Insights" : "Generate Insights"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {reflections.length === 0 && (
            <div className="text-center py-8 px-4 rounded-2xl bg-gradient-to-br from-emerald-100/50 to-amber-100/30 dark:from-emerald-900/20 dark:to-amber-900/10">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm text-muted-foreground">
                Complete study sessions and add reflections to generate AI insights!
              </p>
            </div>
          )}

          {insights && (
            <div className="space-y-6">
              {/* Overall Summary with enhanced styling */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-100/80 via-lime-100/60 to-amber-100/60 dark:from-emerald-900/30 dark:via-lime-900/20 dark:to-amber-900/20 border border-emerald-200/50 dark:border-emerald-800/30">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-lime-500 flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-sm leading-relaxed">{insights.overallSummary}</p>
                </div>
              </div>

              {/* Key Metrics Summary with green-yellow gradient cards */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-amber-100/80 to-amber-200/60 dark:from-amber-900/30 dark:to-amber-800/20 border border-amber-200/50 dark:border-amber-800/30">
                  <div className="text-2xl sm:text-3xl font-display font-bold text-amber-700 dark:text-amber-400">
                    {insights.strugglingTopics.length}
                  </div>
                  <div className="text-xs text-amber-600/80 dark:text-amber-400/70 mt-1 font-medium">Topics to Focus</div>
                </div>
                <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-emerald-100/80 to-emerald-200/60 dark:from-emerald-900/30 dark:to-emerald-800/20 border border-emerald-200/50 dark:border-emerald-800/30">
                  <div className="text-2xl sm:text-3xl font-display font-bold text-emerald-700 dark:text-emerald-400">
                    {insights.strongAreas.length}
                  </div>
                  <div className="text-xs text-emerald-600/80 dark:text-emerald-400/70 mt-1 font-medium">Strong Areas</div>
                </div>
                <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-lime-100/80 to-lime-200/60 dark:from-lime-900/30 dark:to-lime-800/20 border border-lime-200/50 dark:border-lime-800/30">
                  <div className="text-2xl sm:text-3xl font-display font-bold text-lime-700 dark:text-lime-400">
                    {Object.keys(insights.subjectBreakdown).length}
                  </div>
                  <div className="text-xs text-lime-600/80 dark:text-lime-400/70 mt-1 font-medium">Subjects</div>
                </div>
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-emerald-100/50 to-amber-100/50 dark:from-emerald-900/20 dark:to-amber-900/20 p-1 rounded-xl">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 rounded-lg">Overview</TabsTrigger>
                  <TabsTrigger value="performance" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 rounded-lg">Performance</TabsTrigger>
                  <TabsTrigger value="insights" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 rounded-lg">Insights</TabsTrigger>
                  <TabsTrigger value="peak-hours" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 rounded-lg">Peak Hours</TabsTrigger>
                </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                      {/* Topic Confidence Scatter Chart - Enhanced with green-yellow theme */}
                      <ChartCard 
                        title="Topic Mastery Map" 
                        icon={<Target className="h-4 w-4" />}
                        description="Visual overview of your confidence across all topics"
                      >
                        {(() => {
                          // Build scatter chart data with reasons
                          const heatmapChartData: Array<{
                            index: number;
                            topic: string;
                            subject: string;
                            confidence: number;
                            reason: string;
                            type: string;
                          }> = [];

                          // Add struggling topics with reasons
                          insights.strugglingTopics.forEach((t, idx) => {
                            const confidence = t.avgFocusLevel 
                              ? Math.max(1, Math.min(10, t.avgFocusLevel / 10))
                              : Math.max(1, Math.min(10, 11 - (t.avgDifficulty || 7)));
                            
                            heatmapChartData.push({
                              index: idx,
                              topic: t.topic,
                              subject: t.subject,
                              confidence,
                              reason: t.reason || "Needs more practice",
                              type: 'struggling'
                            });
                          });

                          // Add strong areas with reasons
                          insights.strongAreas.forEach((t, idx) => {
                            const confidence = t.avgFocusLevel 
                              ? Math.max(1, Math.min(10, t.avgFocusLevel / 10))
                              : Math.max(1, Math.min(10, 11 - (t.avgDifficulty || 3)));
                            
                            heatmapChartData.push({
                              index: insights.strugglingTopics.length + idx,
                              topic: t.topic,
                              subject: t.subject,
                              confidence,
                              reason: t.reason || "Strong understanding",
                              type: 'strong'
                            });
                          });

                          return heatmapChartData.length > 0 ? (
                            <div className="space-y-4">
                              <ResponsiveContainer width="100%" height={300}>
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 40 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                  <XAxis 
                                    dataKey="index" 
                                    name="Topic" 
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                                    label={{ value: 'Topics', position: 'insideBottom', offset: -10, style: { fill: 'hsl(var(--muted-foreground))' } }}
                                  />
                                  <YAxis 
                                    dataKey="confidence" 
                                    name="Confidence" 
                                    domain={[0, 10]}
                                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                    label={{ value: 'Confidence Level', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
                                  />
                                  <RechartsTooltip
                                    content={({ payload }) => {
                                      if (!payload || !payload.length) return null;
                                      const data = payload[0].payload;
                                      return (
                                        <div className="bg-card border rounded-lg p-3 shadow-lg max-w-xs">
                                          <p className="font-semibold text-sm">{data.topic}</p>
                                          <p className="text-xs text-muted-foreground mb-2">{data.subject}</p>
                                          <div className="flex items-center gap-2 mb-2">
                                            <div 
                                              className={`w-3 h-3 rounded-full ${
                                                data.confidence >= 7 ? 'bg-emerald-500' : 
                                                data.confidence >= 4 ? 'bg-yellow-400' : 'bg-red-500'
                                              }`} 
                                            />
                                            <span className="text-sm">Confidence: {data.confidence.toFixed(1)}/10</span>
                                          </div>
                                          {data.reason && (
                                            <p className="text-xs text-muted-foreground border-t pt-2 mt-2">
                                              <span className="font-medium">
                                                {data.type === 'struggling' ? 'Why it\'s hard: ' : 'Why you excel: '}
                                              </span>
                                              {data.reason}
                                            </p>
                                          )}
                                        </div>
                                      );
                                    }}
                                  />
                                    <Scatter 
                                    name="Topics" 
                                    data={heatmapChartData}
                                    shape={(props: any) => {
                                      const { cx, cy, payload } = props;
                                      // Use green-yellow color scheme
                                      const color = payload.confidence >= 7 ? INSIGHT_COLORS.primary : 
                                                   payload.confidence >= 4 ? INSIGHT_COLORS.quaternary : '#ef4444';
                                      return (
                                        <circle 
                                          cx={cx} 
                                          cy={cy} 
                                          r={12} 
                                          fill={color}
                                          stroke="white"
                                          strokeWidth={2}
                                          style={{ cursor: 'pointer', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                                        />
                                      );
                                    }}
                                  />
                                </ScatterChart>
                              </ResponsiveContainer>

                              {/* Enhanced Legend with green-yellow colors */}
                              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs border-t border-emerald-200/50 dark:border-emerald-800/30 pt-4 mt-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-900/30">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: INSIGHT_COLORS.primary }} />
                                  <span className="font-medium text-emerald-700 dark:text-emerald-400">Mastered (7-10)</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/80 dark:bg-amber-900/30">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: INSIGHT_COLORS.quaternary }} />
                                  <span className="font-medium text-amber-700 dark:text-amber-400">Learning (4-6)</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100/80 dark:bg-red-900/30">
                                  <div className="w-3 h-3 rounded-full bg-red-500" />
                                  <span className="font-medium text-red-700 dark:text-red-400">Needs Work (1-3)</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">
                              No topic confidence data available yet
                            </p>
                          );
                        })()}
                      </ChartCard>

                      {/* Topics Performance Table */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Topics Performance
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Topics Needing Focus */}
                            {insights.strugglingTopics.length > 0 && (
                              <div>
                                <h4 className="text-xs sm:text-sm font-semibold mb-3 flex items-center gap-2">
                                  <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                                  Needs Focus ({insights.strugglingTopics.length})
                                </h4>
                                <div className="border rounded-lg overflow-x-auto">
                                  <table className="w-full min-w-[600px]">
                                    <thead className="bg-muted/50">
                                      <tr>
                                        <th className="text-left p-2 sm:p-3 text-xs font-medium">Topic</th>
                                        <th className="text-left p-2 sm:p-3 text-xs font-medium hidden sm:table-cell">Subject</th>
                                        <th className="text-left p-2 sm:p-3 text-xs font-medium">Priority</th>
                                        <th className="text-left p-2 sm:p-3 text-xs font-medium">Issue</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                      {insights.strugglingTopics.map((topic, idx) => (
                                        <tr 
                                          key={idx}
                                          className="hover:bg-muted/30 cursor-pointer transition-colors"
                                          onClick={() => setSelectedTopic(topic.topic)}
                                        >
                                          <td className="p-2 sm:p-3 text-xs sm:text-sm font-medium">{topic.topic}</td>
                                          <td className="p-2 sm:p-3 text-xs sm:text-sm text-muted-foreground hidden sm:table-cell">{topic.subject}</td>
                                          <td className="p-2 sm:p-3">
                                            <Badge variant={getSeverityColor(topic.severity) as any} className="text-[10px] sm:text-xs">
                                              {topic.severity}
                                            </Badge>
                                          </td>
                                          <td className="p-2 sm:p-3 text-xs sm:text-sm text-muted-foreground max-w-[200px] sm:max-w-md truncate">
                                            {topic.reason}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Strong Topics */}
                            {insights.strongAreas.length > 0 && (
                              <div>
                                <h4 className="text-xs sm:text-sm font-semibold mb-3 flex items-center gap-2">
                                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                                  Strengths ({insights.strongAreas.length})
                                </h4>
                                <div className="border rounded-lg overflow-x-auto">
                                  <table className="w-full min-w-[500px]">
                                    <thead className="bg-green-50 dark:bg-green-950/20">
                                      <tr>
                                        <th className="text-left p-2 sm:p-3 text-xs font-medium">Topic</th>
                                        <th className="text-left p-2 sm:p-3 text-xs font-medium hidden sm:table-cell">Subject</th>
                                        <th className="text-left p-2 sm:p-3 text-xs font-medium">Why You Excel</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                      {insights.strongAreas.map((area, idx) => (
                                        <tr 
                                          key={idx}
                                          className="hover:bg-muted/30 cursor-pointer transition-colors"
                                          onClick={() => setSelectedTopic(area.topic)}
                                        >
                                          <td className="p-2 sm:p-3 text-xs sm:text-sm font-medium">{area.topic}</td>
                                          <td className="p-2 sm:p-3 text-xs sm:text-sm text-muted-foreground hidden sm:table-cell">{area.subject}</td>
                                          <td className="p-2 sm:p-3 text-xs sm:text-sm text-muted-foreground max-w-[200px] sm:max-w-md truncate">
                                            {area.reason}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {insights.strugglingTopics.length === 0 && insights.strongAreas.length === 0 && (
                              <p className="text-sm text-muted-foreground text-center py-8">
                                No topic performance data available yet
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="performance" className="space-y-6">
                      {/* Subject Performance Bar Chart - Enhanced with green-yellow gradient */}
                      <ChartCard 
                        title="Subject Performance" 
                        icon={<BarChart3 className="h-4 w-4" />}
                        description="Confidence scores across your subjects"
                      >
                        <ChartContainer
                          config={Object.entries(insights.subjectBreakdown).reduce((acc, [subject], idx) => ({
                            ...acc,
                            [subject]: {
                              label: subject,
                              color: Object.values(INSIGHT_COLORS)[idx % 5],
                            }
                          }), {})}
                          className="h-[300px]"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={Object.entries(insights.subjectBreakdown).map(([subject, data], idx) => ({
                              subject,
                              score: data.confidenceScore,
                              topics: data.topicsCount,
                              fill: Object.values(INSIGHT_COLORS)[idx % 5],
                            }))}>
                              <defs>
                                <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={INSIGHT_COLORS.primary} />
                                  <stop offset="100%" stopColor={INSIGHT_COLORS.secondary} />
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                              <YAxis domain={[0, 10]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                              <RechartsTooltip 
                                contentStyle={{ 
                                  backgroundColor: 'hsl(var(--card))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '12px',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                                formatter={(value: any) => [`${value}/10`, 'Confidence']}
                              />
                              <Bar dataKey="score" name="Confidence Score" fill="url(#performanceGradient)" radius={[8, 8, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                          
                          {/* Subject breakdown cards */}
                          <div className="mt-6 grid gap-3">
                            {Object.entries(insights.subjectBreakdown).map(([subject, data], idx) => (
                              <div 
                                key={subject} 
                                className="p-3 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-950/20"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-sm">{subject}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">{data.topicsCount} topics</span>
                                    <span 
                                      className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                                      style={{ backgroundColor: Object.values(INSIGHT_COLORS)[idx % 5] }}
                                    >
                                      {data.confidenceScore}/10
                                    </span>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground">{data.summary}</p>
                              </div>
                            ))}
                          </div>
                      </ChartCard>

                      {/* Struggling vs Strong Topics */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                              <TrendingDown className="h-4 w-4 text-destructive" />
                              Topics Needing Focus
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {insights.strugglingTopics.map((topic, idx) => (
                                <div
                                  key={idx}
                                  className="p-2 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                  onClick={() => setSelectedTopic(topic.topic)}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">{topic.topic}</span>
                                    <Badge variant={getSeverityColor(topic.severity) as any} className="text-xs">
                                      {topic.severity}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{topic.subject}</p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              Your Strengths
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {insights.strongAreas.map((area, idx) => (
                                <div
                                  key={idx}
                                  className="p-2 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors bg-green-50 dark:bg-green-950/20"
                                  onClick={() => setSelectedTopic(area.topic)}
                                >
                                  <div className="font-medium text-sm">{area.topic}</div>
                                  <p className="text-xs text-muted-foreground">{area.subject}</p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="insights" className="space-y-5">
                      {/* Personalized Tips - Enhanced with green-yellow theme */}
                      <ChartCard 
                        title="Personalized Study Tips" 
                        icon={<Lightbulb className="h-4 w-4" />}
                        description="AI-generated recommendations just for you"
                      >
                        <div className="space-y-2">
                          {insights.personalizedTips.map((tip, idx) => (
                            <div 
                              key={idx} 
                              className="flex gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-100/60 to-amber-50/30 dark:from-amber-900/20 dark:to-amber-950/10 border border-amber-200/40 dark:border-amber-800/20"
                            >
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold">
                                {idx + 1}
                              </div>
                              <span className="text-sm">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </ChartCard>

                      {/* Learning Patterns - Enhanced */}
                      <ChartCard 
                        title="Learning Patterns Detected" 
                        icon={<Brain className="h-4 w-4" />}
                        description="How you learn best based on your study data"
                      >
                        <div className="space-y-2">
                          {insights.learningPatterns.map((pattern, idx) => (
                            <div 
                              key={idx} 
                              className="flex gap-3 p-3 rounded-xl bg-gradient-to-r from-lime-100/60 to-lime-50/30 dark:from-lime-900/20 dark:to-lime-950/10 border border-lime-200/40 dark:border-lime-800/20"
                            >
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-lime-500 to-lime-600 flex items-center justify-center">
                                <Sparkles className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-sm">{pattern}</span>
                            </div>
                          ))}
                        </div>
                      </ChartCard>

                      {/* Recommended Focus - Enhanced */}
                      <ChartCard 
                        title="Recommended Focus Areas" 
                        icon={<Target className="h-4 w-4" />}
                        description="Priority areas for your next study sessions"
                      >
                        <div className="space-y-2">
                          {insights.recommendedFocus.map((focus, idx) => (
                            <div 
                              key={idx} 
                              className="flex gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-100/60 to-emerald-50/30 dark:from-emerald-900/20 dark:to-emerald-950/10 border border-emerald-200/40 dark:border-emerald-800/20"
                            >
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                                <Target className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-sm">{focus}</span>
                            </div>
                          ))}
                        </div>
                      </ChartCard>

                    </TabsContent>

                    <TabsContent value="peak-hours" className="space-y-4">
                      {insights.peakStudyHours ? (
                        <>
                          {/* Peak hours cards with enhanced green-yellow theme */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Card className="bg-gradient-to-br from-emerald-100/80 to-lime-100/60 dark:from-emerald-900/30 dark:to-lime-900/20 border-emerald-200/50 dark:border-emerald-800/30 rounded-2xl">
                              <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-lime-500">
                                    <TrendingUp className="h-4 w-4 text-white" />
                                  </div>
                                  <h4 className="font-semibold text-sm">Peak Performance Time</h4>
                                </div>
                                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 capitalize">
                                  {insights.peakStudyHours.bestTimeWindow}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {insights.peakStudyHours.bestTimeRange}
                                </p>
                                 <div className="mt-4 space-y-2 text-xs">
                                   <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-200/50 dark:bg-emerald-800/30">
                                     <span className="font-medium">Completion Rate</span>
                                     <span className="font-bold text-emerald-700 dark:text-emerald-400">
                                       {normalizeCompletionRate(insights.peakStudyHours.completionRateByWindow[insights.peakStudyHours.bestTimeWindow as keyof typeof insights.peakStudyHours.completionRateByWindow]).toFixed(0)}%
                                     </span>
                                   </div>
                                   <div className="flex items-center justify-between p-2 rounded-lg bg-lime-200/50 dark:bg-lime-800/30">
                                     <span className="font-medium">Avg Difficulty</span>
                                     <span className="font-bold text-lime-700 dark:text-lime-400">
                                       {normalizeDifficulty(insights.peakStudyHours.avgDifficultyByWindow[insights.peakStudyHours.bestTimeWindow as keyof typeof insights.peakStudyHours.avgDifficultyByWindow] || 0).toFixed(1)}/10
                                     </span>
                                   </div>
                                 </div>
                              </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-amber-100/80 to-orange-100/60 dark:from-amber-900/30 dark:to-orange-900/20 border-amber-200/50 dark:border-amber-800/30 rounded-2xl">
                              <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                                    <TrendingDown className="h-4 w-4 text-white" />
                                  </div>
                                  <h4 className="font-semibold text-sm">Challenging Time</h4>
                                </div>
                                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 capitalize">
                                  {insights.peakStudyHours.worstTimeWindow}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {insights.peakStudyHours.worstTimeRange}
                                </p>
                                 <div className="mt-4 space-y-2 text-xs">
                                   <div className="flex items-center justify-between p-2 rounded-lg bg-amber-200/50 dark:bg-amber-800/30">
                                     <span className="font-medium">Completion Rate</span>
                                     <span className="font-bold text-amber-700 dark:text-amber-400">
                                       {normalizeCompletionRate(insights.peakStudyHours.completionRateByWindow[insights.peakStudyHours.worstTimeWindow as keyof typeof insights.peakStudyHours.completionRateByWindow]).toFixed(0)}%
                                     </span>
                                   </div>
                                   <div className="flex items-center justify-between p-2 rounded-lg bg-orange-200/50 dark:bg-orange-800/30">
                                     <span className="font-medium">Avg Difficulty</span>
                                     <span className="font-bold text-orange-700 dark:text-orange-400">
                                       {normalizeDifficulty(insights.peakStudyHours.avgDifficultyByWindow[insights.peakStudyHours.worstTimeWindow as keyof typeof insights.peakStudyHours.avgDifficultyByWindow] || 0).toFixed(1)}/10
                                     </span>
                                   </div>
                                 </div>
                              </CardContent>
                            </Card>
                          </div>

                          <ChartCard 
                            title="Performance by Time of Day" 
                            icon={<Clock className="h-4 w-4" />}
                            description="Your productivity patterns throughout the day"
                          >
                            <div className="h-[250px] sm:h-[300px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                   data={[
                                     {
                                       window: "Morning",
                                       completion: parseFloat(normalizeCompletionRate(insights.peakStudyHours.completionRateByWindow.morning).toFixed(0)),
                                       difficulty: normalizeDifficulty(insights.peakStudyHours.avgDifficultyByWindow.morning || 0),
                                     },
                                     {
                                       window: "Afternoon",
                                       completion: parseFloat(normalizeCompletionRate(insights.peakStudyHours.completionRateByWindow.afternoon).toFixed(0)),
                                       difficulty: normalizeDifficulty(insights.peakStudyHours.avgDifficultyByWindow.afternoon || 0),
                                     },
                                     {
                                       window: "Evening",
                                       completion: parseFloat(normalizeCompletionRate(insights.peakStudyHours.completionRateByWindow.evening).toFixed(0)),
                                       difficulty: normalizeDifficulty(insights.peakStudyHours.avgDifficultyByWindow.evening || 0),
                                     },
                                   ]}
                                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                >
                                  <XAxis 
                                    dataKey="window" 
                                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                                  />
                                   <YAxis 
                                     tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                                   />
                                   <RechartsTooltip
                                     contentStyle={{
                                       backgroundColor: 'hsl(var(--card))',
                                       border: '1px solid hsl(var(--border))',
                                       borderRadius: '8px',
                                       fontSize: 12
                                     }}
                                   />
                                  <defs>
                                    <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor={INSIGHT_COLORS.primary} />
                                      <stop offset="100%" stopColor={INSIGHT_COLORS.secondary} />
                                    </linearGradient>
                                    <linearGradient id="difficultyGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor={INSIGHT_COLORS.quaternary} />
                                      <stop offset="100%" stopColor={INSIGHT_COLORS.accent} />
                                    </linearGradient>
                                  </defs>
                                  <Bar 
                                    dataKey="completion" 
                                    name="Completion Rate %" 
                                    fill="url(#completionGradient)" 
                                    radius={[8, 8, 0, 0]} 
                                  />
                                  <Bar 
                                    dataKey="difficulty" 
                                    name="Avg Difficulty (1-10)" 
                                    fill="url(#difficultyGradient)" 
                                    radius={[8, 8, 0, 0]} 
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                            {/* Legend */}
                            <div className="flex items-center justify-center gap-6 text-xs mt-4">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: INSIGHT_COLORS.primary }} />
                                <span>Completion Rate</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: INSIGHT_COLORS.quaternary }} />
                                <span>Avg Difficulty</span>
                              </div>
                            </div>
                          </ChartCard>

                          {/* Smart Recommendation Card */}
                          <Card className="bg-gradient-to-br from-lime-100/80 to-emerald-100/60 dark:from-lime-900/30 dark:to-emerald-900/20 border-lime-200/50 dark:border-lime-800/30 rounded-2xl">
                            <CardContent className="p-5">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-lime-500 to-emerald-500 flex-shrink-0">
                                  <Lightbulb className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm mb-1 text-lime-800 dark:text-lime-300">Smart Scheduling Tip</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {insights.peakStudyHours.recommendation}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      ) : (
                        <Card className="border-emerald-200/50 dark:border-emerald-800/30 bg-gradient-to-br from-emerald-50/30 to-amber-50/20 dark:from-emerald-950/10 dark:to-amber-950/5 rounded-2xl">
                          <CardContent className="py-10">
                            <div className="text-center">
                              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-400/30 to-amber-400/30 flex items-center justify-center">
                                <Clock className="h-8 w-8 text-emerald-600/60 dark:text-emerald-400/60" />
                              </div>
                              <p className="text-sm font-medium mb-1">Peak Hours Data Coming Soon</p>
                              <p className="text-xs text-muted-foreground max-w-xs mx-auto">Complete more study sessions with difficulty ratings to discover your optimal study times</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Topic Detail */}
      {selectedTopic && selectedReflection && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Notes: {selectedTopic}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedReflection.reflection_data.easyAspects?.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Easy Aspects:</h4>
                <div className="space-y-2">
                  {selectedReflection.reflection_data.easyAspects.map((item: any, idx: number) => (
                    <div key={idx}>
                      {item.type === "text" ? (
                        <p className="text-sm bg-muted p-2 rounded">{item.content}</p>
                      ) : (
                        <img src={item.content} alt="Note" className="rounded max-h-32" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedReflection.reflection_data.hardAspects?.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Challenging Aspects:</h4>
                <div className="space-y-2">
                  {selectedReflection.reflection_data.hardAspects.map((item: any, idx: number) => (
                    <div key={idx}>
                      {item.type === "text" ? (
                        <p className="text-sm bg-muted p-2 rounded">{item.content}</p>
                      ) : (
                        <img src={item.content} alt="Note" className="rounded max-h-32" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedReflection.reflection_data.generalNotes?.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">General Notes:</h4>
                <div className="space-y-2">
                  {selectedReflection.reflection_data.generalNotes.map((item: any, idx: number) => (
                    <div key={idx}>
                      {item.type === "text" ? (
                        <p className="text-sm bg-muted p-2 rounded">{item.content}</p>
                      ) : (
                        <img src={item.content} alt="Note" className="rounded max-h-32" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedReflection.reflection_data.overallFeeling && (
              <div>
                <h4 className="font-medium text-sm mb-2">Overall Feeling:</h4>
                <p className="text-sm bg-muted p-2 rounded">
                  {selectedReflection.reflection_data.overallFeeling}
                </p>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTopic(null)}
              className="w-full"
            >
              Close
            </Button>
          </CardContent>
        </Card>
      )}
      
      <PaywallDialog
        open={showPaywall}
        onOpenChange={setShowPaywall}
        limitType="ai_insights"
      />
    </div>
  );
};
