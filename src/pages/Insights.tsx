import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import { StudyInsightsPanel } from "@/components/StudyInsightsPanel";
import { TestScoreEntry } from "@/components/TestScoreEntry";
import { TestScoresList } from "@/components/TestScoresList";
import { ArrowLeft, Brain, BookOpen, Sparkles, Activity, Clock, TrendingUp, Target, Trophy, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { motion } from "framer-motion";
import owlChart from "@/assets/owl-chart.png";
import lightbulbIcon from "@/assets/lightbulb-icon.png";
import magnifyingGlassIcon from "@/assets/magnifying-glass-icon.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Reflection {
  id: string;
  subject: string;
  topic: string;
  session_date: string;
  reflection_data: {
    howItWent?: string;
    focusLevel?: number;
    completionStatus?: "yes" | "partially" | "no";
    whatMissed?: string;
    quickNote?: string;
    timeOfDay?: string;
    duration?: number;
  };
  created_at: string;
}

interface ActivityLog {
  id: string;
  subject_name: string;
  topic_name: string;
  session_start: string;
  session_end: string;
  duration_seconds: number;
  score_percentage: number | null;
  keywords_remembered: string[] | null;
  keywords_missed: string[] | null;
  total_keywords: number | null;
  session_type: string | null;
  ai_analysis: any;
  confidence_level: number | null;
  raw_data: {
    activity_type?: string;
    notes?: string;
    app_name?: string;
  } | null;
  created_at: string;
}

interface Timetable {
  id: string;
  name: string;
}

const Insights = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [selectedTimetableId, setSelectedTimetableId] = useState<string | null>(null);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoresRefresh, setScoresRefresh] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setUserId(session.user.id);
        fetchAllData(session.user.id);
      } else {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setUserId(session.user.id);
        fetchAllData(session.user.id);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchAllData = async (userId: string) => {
    setLoading(true);
    try {
      const { data: timetablesData } = await supabase
        .from("timetables")
        .select("id, name")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (timetablesData && timetablesData.length > 0) {
        setTimetables(timetablesData);
        setSelectedTimetableId(timetablesData[0].id);
      }

      const { data: reflectionsData } = await supabase
        .from("topic_reflections")
        .select("*")
        .eq("user_id", userId)
        .order("session_date", { ascending: false });

      setReflections((reflectionsData as Reflection[]) || []);

      const { data: activitiesData } = await supabase
        .from("blurt_activity_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      setActivities((activitiesData as ActivityLog[]) || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  const totalReflections = reflections.length;
  const totalPracticeSessions = activities.length;
  const avgFocusLevel = reflections.length > 0
    ? Math.round(reflections.reduce((acc, r) => acc + (r.reflection_data.focusLevel || 0), 0) / reflections.length)
    : 0;
  // Filter out general practice sessions (null scores) and 0 scores from the average calculation
  const scoredActivities = activities.filter(a => a.score_percentage !== null && a.score_percentage > 0);
  const avgScore = scoredActivities.length > 0
    ? Math.round(scoredActivities.reduce((acc, a) => acc + (a.score_percentage || 0), 0) / scoredActivities.length)
    : 0;
  const totalPracticeTime = activities.reduce((acc, a) => acc + a.duration_seconds, 0);

  const recentActivity = [
    ...reflections.slice(0, 5).map(r => ({
      type: 'reflection' as const,
      date: new Date(r.session_date),
      subject: r.subject,
      topic: r.topic,
      data: r
    })),
    ...activities.slice(0, 5).map(a => ({
      type: 'practice' as const,
      date: new Date(a.created_at),
      subject: a.subject_name,
      topic: a.topic_name,
      data: a
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 6);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Floating background elements - hidden on mobile */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none hidden md:block">
          <div className="floating-blob top-20 -left-32 w-96 h-96 bg-primary/10 animate-float"></div>
          <div className="floating-blob top-40 right-10 w-[500px] h-[500px] bg-secondary/15 animate-float-delayed"></div>
          
          {/* Floating mascots */}
          <motion.img 
            src={owlChart}
            alt=""
            className="absolute top-32 right-16 w-24 h-24 opacity-30"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.img 
            src={lightbulbIcon}
            alt=""
            className="absolute bottom-32 left-12 w-16 h-16 opacity-25"
            animate={{ y: [0, 8, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.img 
            src={magnifyingGlassIcon}
            alt=""
            className="absolute top-1/2 right-8 w-14 h-14 opacity-20"
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>

        <Header />

        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 relative z-10">
          <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
                    <Brain className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                    Insights & Scores
                  </h1>
                  <p className="text-muted-foreground text-xs sm:text-sm">Track progress, analyze performance, and improve</p>
                </div>
              </div>

              {timetables.length > 0 && (
                <Select value={selectedTimetableId || ""} onValueChange={setSelectedTimetableId}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select timetable" />
                  </SelectTrigger>
                  <SelectContent>
                    {timetables.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <Tabs defaultValue="analysis" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-4 sm:mb-6 h-auto p-1">
                <TabsTrigger value="analysis" className="gap-1.5 text-xs sm:text-sm py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-amber-500/20">
                  <Sparkles className="h-3.5 w-3.5 hidden sm:inline" />
                  AI Insights
                </TabsTrigger>
                <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm py-2">
                  <BarChart3 className="h-3.5 w-3.5 hidden sm:inline" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="scores" className="gap-1.5 text-xs sm:text-sm py-2">
                  <Trophy className="h-3.5 w-3.5 hidden sm:inline" />
                  Scores
                </TabsTrigger>
                <TabsTrigger value="reflections" className="gap-1.5 text-xs sm:text-sm py-2">
                  <BookOpen className="h-3.5 w-3.5 hidden sm:inline" />
                  Reflections
                </TabsTrigger>
                <TabsTrigger value="practice" className="gap-1.5 text-xs sm:text-sm py-2">
                  <Activity className="h-3.5 w-3.5 hidden sm:inline" />
                  Practice
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4 sm:space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 sm:p-2.5 bg-primary/20 rounded-xl">
                          <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xl sm:text-2xl font-bold">{totalReflections}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Study Sessions</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 sm:p-2.5 bg-secondary/20 rounded-xl">
                          <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                        </div>
                        <div>
                          <p className="text-xl sm:text-2xl font-bold">{totalPracticeSessions}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Practice Sessions</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 sm:p-2.5 bg-green-500/20 rounded-xl">
                          <Target className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xl sm:text-2xl font-bold">{avgFocusLevel}%</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Focus</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 sm:p-2.5 bg-amber-500/20 rounded-xl">
                          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xl sm:text-2xl font-bold">{formatDuration(totalPracticeTime)}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Total Time</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentActivity.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8 text-sm">No activity yet. Start studying!</p>
                    ) : (
                      <div className="space-y-2 sm:space-y-3">
                        {recentActivity.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2.5 sm:p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className={`p-1.5 sm:p-2 rounded-lg ${item.type === 'reflection' ? 'bg-primary/10' : 'bg-secondary/10'}`}>
                              {item.type === 'reflection' ? (
                                <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                              ) : (
                                <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-secondary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.subject} – {item.topic}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(item.date, "d MMM, h:mm a")}
                              </p>
                            </div>
                            {item.type === 'reflection' ? (
                              <Badge variant="secondary" className="text-xs">
                                {(item.data as Reflection).reflection_data.focusLevel || 0}%
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                {(item.data as ActivityLog).score_percentage !== null ? `${(item.data as ActivityLog).score_percentage}%` : '—'}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Test Scores Tab */}
              <TabsContent value="scores" className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Test Scores & Analysis
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">Track results and get AI insights</p>
                  </div>
                  {userId && <TestScoreEntry userId={userId} onScoreAdded={() => setScoresRefresh(r => r + 1)} />}
                </div>
                {userId && <TestScoresList userId={userId} refresh={scoresRefresh} />}
              </TabsContent>

              {/* Reflections Tab */}
              <TabsContent value="reflections" className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold">Study Reflections</h2>
                  <Badge variant="outline">{reflections.length} total</Badge>
                </div>

                {reflections.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                      <h3 className="text-base font-semibold mb-2">No reflections yet</h3>
                      <p className="text-sm text-muted-foreground">Complete study sessions to see reflections</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {reflections.slice(0, 12).map((reflection) => (
                      <Card key={reflection.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-sm font-semibold truncate">
                                {reflection.subject}
                              </CardTitle>
                              <CardDescription className="text-xs truncate">
                                {reflection.topic}
                              </CardDescription>
                            </div>
                            <Badge 
                              variant="secondary" 
                              className={`text-[10px] ${
                                reflection.reflection_data.completionStatus === 'yes' 
                                  ? 'bg-green-500/10 text-green-700 border-green-200' 
                                  : reflection.reflection_data.completionStatus === 'partially'
                                  ? 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
                                  : 'bg-muted'
                              }`}
                            >
                              {reflection.reflection_data.completionStatus === 'yes' ? '✓' : 
                               reflection.reflection_data.completionStatus === 'partially' ? '~' : '✗'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Focus</span>
                            <span className="font-semibold">{reflection.reflection_data.focusLevel || 0}%</span>
                          </div>
                          <Progress value={reflection.reflection_data.focusLevel || 0} className="h-1.5" />
                          <p className="text-[10px] text-muted-foreground">
                            {format(new Date(reflection.session_date), "d MMM yyyy")}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Practice Tab */}
              <TabsContent value="practice" className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold">Practice Sessions</h2>
                  <Badge variant="outline">{activities.length} sessions</Badge>
                </div>

                {/* Practice Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <Card>
                    <CardContent className="pt-4 sm:pt-6 text-center">
                      <p className="text-2xl sm:text-3xl font-bold text-primary">{activities.length}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Sessions</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 sm:pt-6 text-center">
                      <p className="text-2xl sm:text-3xl font-bold text-secondary">{formatDuration(totalPracticeTime)}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Total Time</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 sm:pt-6 text-center">
                      <p className="text-2xl sm:text-3xl font-bold text-green-600">{avgScore}%</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Score</p>
                    </CardContent>
                  </Card>
                </div>

                {activities.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Activity className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                      <h3 className="text-base font-semibold mb-2">No practice sessions yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">Start practicing to track progress</p>
                      <Button onClick={() => navigate("/practice")} size="sm">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Start Practicing
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {activities.slice(0, 10).map((activity) => (
                      <Card key={activity.id} className="hover:bg-muted/30 transition-colors">
                        <CardContent className="py-3 sm:py-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-secondary/10 rounded-lg">
                                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{activity.subject_name} – {activity.topic_name}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDuration(activity.duration_seconds)}</span>
                                  <span>•</span>
                                  <span>{format(new Date(activity.created_at), "d MMM")}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {activity.score_percentage !== null && (
                                <Badge variant={activity.score_percentage >= 70 ? "default" : "secondary"}>
                                  {activity.score_percentage}%
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* AI Insights Tab - Now the primary tab */}
              <TabsContent value="analysis" className="space-y-6">
                {selectedTimetableId ? (
                  <StudyInsightsPanel timetableId={selectedTimetableId} />
                ) : (
                  <Card className="border-emerald-200/50 dark:border-emerald-800/30 bg-gradient-to-br from-emerald-50/50 to-amber-50/30 dark:from-emerald-950/20 dark:to-amber-950/10">
                    <CardContent className="text-center py-16">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center">
                        <Brain className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">AI Insights Awaiting</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto">
                        Create a timetable to unlock personalized AI study insights and performance analysis.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Insights;
