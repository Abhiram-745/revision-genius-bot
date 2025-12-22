import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Clock, Target, Brain, Sparkles, RefreshCw, Calendar } from "lucide-react";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

interface ActivityLog {
  id: string;
  subject_name: string;
  topic_name: string;
  session_start: string;
  session_end: string;
  duration_seconds: number;
  score_percentage: number | null;
  keywords_remembered: string[];
  keywords_missed: string[];
  total_keywords: number;
  session_type: string;
  ai_analysis: any;
  analyzed_at: string | null;
}

interface AIInsight {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  overallProgress: string;
}

const Activity = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState<AIInsight | null>(null);

  // Stats
  const totalSessions = activities.length;
  const totalTimeMinutes = Math.round(activities.reduce((sum, a) => sum + (a.duration_seconds || 0), 0) / 60);
  const avgScore = activities.filter(a => a.score_percentage).length > 0
    ? Math.round(activities.filter(a => a.score_percentage).reduce((sum, a) => sum + (a.score_percentage || 0), 0) / activities.filter(a => a.score_percentage).length)
    : null;

  useEffect(() => {
    fetchActivities();
  }, [user]);

  const fetchActivities = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("blurt_activity_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("session_start", { ascending: false });

      if (error) throw error;

      setActivities(data || []);

      // Check for existing insights
      const latestWithInsights = data?.find(a => a.ai_analysis);
      if (latestWithInsights?.ai_analysis) {
        setInsights(latestWithInsights.ai_analysis as unknown as AIInsight);
      }

    } catch (err) {
      console.error("Error fetching activities:", err);
      toast.error("Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    if (activities.length < 2) {
      toast.error("Need at least 2 practice sessions to generate insights");
      return;
    }

    setAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-blurt-activity", {
        body: { userId: user?.id },
      });

      if (error) throw error;

      if (data?.insights) {
        setInsights(data.insights);
        toast.success("AI insights generated!");
        fetchActivities(); // Refresh to get updated data
      }

    } catch (err) {
      console.error("Error generating insights:", err);
      toast.error("Failed to generate insights");
    } finally {
      setAnalyzing(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Header />
        
        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Back Button */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/blurt-ai")}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Practice
            </Button>
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/10 border border-primary/30 p-6 md:p-8"
          >
            <div className="absolute top-4 right-4 w-20 h-20 bg-primary/20 rounded-full blur-2xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-8 h-8 text-primary-foreground" />
              </div>
              
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Activity History</h1>
                <p className="text-muted-foreground text-sm">Track your BlurtAI practice sessions and AI insights</p>
              </div>

              <Button
                onClick={generateInsights}
                disabled={analyzing || activities.length < 2}
                className="gap-2"
              >
                {analyzing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Generate AI Insights
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalSessions}</p>
                  <p className="text-xs text-muted-foreground">Total Sessions</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{formatDuration(totalTimeMinutes * 60)}</p>
                  <p className="text-xs text-muted-foreground">Total Practice Time</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{avgScore ? `${avgScore}%` : "N/A"}</p>
                  <p className="text-xs text-muted-foreground">Average Score</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          {insights && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-secondary" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {insights.overallProgress && (
                    <p className="text-sm text-foreground">{insights.overallProgress}</p>
                  )}

                  {insights.strengths?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-green-600 mb-2">💪 Strengths</p>
                      <ul className="space-y-1">
                        {insights.strengths.map((s, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-green-500">•</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {insights.weaknesses?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-amber-600 mb-2">📚 Areas to Improve</p>
                      <ul className="space-y-1">
                        {insights.weaknesses.map((w, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-amber-500">•</span> {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {insights.recommendations?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-primary mb-2">💡 Recommendations</p>
                      <ul className="space-y-1">
                        {insights.recommendations.map((r, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Recent Activity */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No practice sessions yet</p>
                  <Button onClick={() => navigate("/blurt-ai")}>Start Practicing</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.slice(0, 20).map((activity) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-foreground">{activity.subject_name}</p>
                          <span className="text-muted-foreground">•</span>
                          <p className="text-sm text-muted-foreground">{activity.topic_name}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(activity.duration_seconds)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDistanceToNow(new Date(activity.session_start), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {activity.score_percentage !== null && (
                          <Badge 
                            variant={activity.score_percentage >= 70 ? "default" : "secondary"}
                            className={activity.score_percentage >= 70 ? "bg-green-500/20 text-green-600 border-green-500/30" : ""}
                          >
                            {activity.score_percentage}%
                          </Badge>
                        )}
                        {activity.total_keywords > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {activity.keywords_remembered?.length || 0}/{activity.total_keywords} keywords
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </PageTransition>
  );
};

export default Activity;
