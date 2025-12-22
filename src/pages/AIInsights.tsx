import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import { StudyInsightsPanel } from "@/components/StudyInsightsPanel";
import { ArrowLeft, Brain, BookOpen, Sparkles, Activity, Clock, Calendar, TrendingUp, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  created_at: string;
}

interface Timetable {
  id: string;
  name: string;
}

const AIInsights = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [selectedTimetableId, setSelectedTimetableId] = useState<string | null>(null);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [selectedReflection, setSelectedReflection] = useState<Reflection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchAllData(session.user.id);
      } else {
        navigate("/");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchAllData(session.user.id);
      } else {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchAllData = async (userId: string) => {
    setLoading(true);
    try {
      // Fetch timetables
      const { data: timetablesData } = await supabase
        .from("timetables")
        .select("id, name")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (timetablesData && timetablesData.length > 0) {
        setTimetables(timetablesData);
        setSelectedTimetableId(timetablesData[0].id);
      }

      // Fetch reflections
      const { data: reflectionsData } = await supabase
        .from("topic_reflections")
        .select("*")
        .eq("user_id", userId)
        .order("session_date", { ascending: false });

      setReflections((reflectionsData as Reflection[]) || []);

      // Fetch activity logs
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

  const getCompletionColor = (status?: string) => {
    switch (status) {
      case "yes": return "bg-green-500/10 text-green-700 border-green-200 dark:text-green-400";
      case "partially": return "bg-yellow-500/10 text-yellow-700 border-yellow-200 dark:text-yellow-400";
      case "no": return "bg-red-500/10 text-red-700 border-red-200 dark:text-red-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getCompletionText = (status?: string) => {
    switch (status) {
      case "yes": return "Completed";
      case "partially": return "Partially";
      case "no": return "Not completed";
      default: return "Unknown";
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  // Calculate stats
  const totalReflections = reflections.length;
  const totalPracticeSessions = activities.length;
  const avgFocusLevel = reflections.length > 0
    ? Math.round(reflections.reduce((acc, r) => acc + (r.reflection_data.focusLevel || 0), 0) / reflections.length)
    : 0;
  const avgScore = activities.filter(a => a.score_percentage !== null).length > 0
    ? Math.round(activities.filter(a => a.score_percentage !== null).reduce((acc, a) => acc + (a.score_percentage || 0), 0) / activities.filter(a => a.score_percentage !== null).length)
    : 0;
  const totalPracticeTime = activities.reduce((acc, a) => acc + a.duration_seconds, 0);

  // Get recent combined activity
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
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 8);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Floating background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="floating-blob top-20 -left-32 w-96 h-96 bg-primary/10 animate-float"></div>
          <div className="floating-blob top-40 right-10 w-[500px] h-[500px] bg-secondary/15 animate-float-delayed"></div>
          <div className="floating-blob bottom-20 left-1/3 w-80 h-80 bg-accent/10 animate-float-slow"></div>
        </div>

        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
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
                  <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                    <Brain className="h-7 w-7 text-primary" />
                    Insights
                  </h1>
                  <p className="text-muted-foreground text-sm">Your study analytics and progress</p>
                </div>
              </div>

              {timetables.length > 0 && (
                <Select value={selectedTimetableId || ""} onValueChange={setSelectedTimetableId}>
                  <SelectTrigger className="w-[200px]">
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

            <Tabs defaultValue={new URLSearchParams(location.search).get('tab') || "overview"} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="overview" className="gap-2">
                  <TrendingUp className="h-4 w-4 hidden sm:inline" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="reflections" className="gap-2">
                  <BookOpen className="h-4 w-4 hidden sm:inline" />
                  Reflections
                </TabsTrigger>
                <TabsTrigger value="practice" className="gap-2">
                  <Activity className="h-4 w-4 hidden sm:inline" />
                  Practice
                </TabsTrigger>
                <TabsTrigger value="analysis" className="gap-2">
                  <Sparkles className="h-4 w-4 hidden sm:inline" />
                  AI Analysis
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{totalReflections}</p>
                          <p className="text-xs text-muted-foreground">Reflections</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary/10 rounded-lg">
                          <Activity className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{totalPracticeSessions}</p>
                          <p className="text-xs text-muted-foreground">Practice Sessions</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <Target className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{avgFocusLevel}%</p>
                          <p className="text-xs text-muted-foreground">Avg Focus</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                          <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{formatDuration(totalPracticeTime)}</p>
                          <p className="text-xs text-muted-foreground">Practice Time</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentActivity.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No activity yet. Start studying to see your progress!</p>
                    ) : (
                      <div className="space-y-3">
                        {recentActivity.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                            <div className={`p-2 rounded-lg ${item.type === 'reflection' ? 'bg-primary/10' : 'bg-secondary/10'}`}>
                              {item.type === 'reflection' ? (
                                <BookOpen className="h-4 w-4 text-primary" />
                              ) : (
                                <Activity className="h-4 w-4 text-secondary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.subject} – {item.topic}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.type === 'reflection' ? 'Study session' : 'Practice session'} • {format(item.date, "d MMM, h:mm a")}
                              </p>
                            </div>
                            {item.type === 'reflection' ? (
                              <Badge className={getCompletionColor((item.data as Reflection).reflection_data.completionStatus)}>
                                {(item.data as Reflection).reflection_data.focusLevel || 0}% focus
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                {(item.data as ActivityLog).score_percentage !== null ? `${(item.data as ActivityLog).score_percentage}%` : 'No score'}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reflections Tab */}
              <TabsContent value="reflections" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Study Reflections</h2>
                  <Badge variant="outline">{reflections.length} total</Badge>
                </div>

                {reflections.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No reflections yet</h3>
                      <p className="text-muted-foreground">Complete study sessions and add reflections to see them here</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reflections.map((reflection) => (
                      <Card
                        key={reflection.id}
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedReflection(reflection)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base font-semibold truncate">
                                {reflection.subject} – {reflection.topic}
                              </CardTitle>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Clock className="h-3 w-3" />
                                <span>{reflection.reflection_data.duration || 0} mins</span>
                                <span>•</span>
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(reflection.session_date), "d MMM")}</span>
                              </div>
                            </div>
                            <Badge className={getCompletionColor(reflection.reflection_data.completionStatus)}>
                              {getCompletionText(reflection.reflection_data.completionStatus)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Focus Level</span>
                              <span className="font-semibold">{reflection.reflection_data.focusLevel || 0}%</span>
                            </div>
                            <Progress value={reflection.reflection_data.focusLevel || 0} className="h-2" />
                          </div>
                          
                          {reflection.reflection_data.quickNote && (
                            <div className="text-xs text-muted-foreground italic bg-muted/50 p-2 rounded">
                              "{reflection.reflection_data.quickNote}"
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Practice Activity Tab */}
              <TabsContent value="practice" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">BlurtAI Practice Activity</h2>
                  <Badge variant="outline">{activities.length} sessions</Badge>
                </div>

                {/* Practice Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-3xl font-bold text-primary">{activities.length}</p>
                      <p className="text-sm text-muted-foreground">Total Sessions</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-3xl font-bold text-secondary">{formatDuration(totalPracticeTime)}</p>
                      <p className="text-sm text-muted-foreground">Total Practice Time</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-3xl font-bold text-green-600">{avgScore}%</p>
                      <p className="text-sm text-muted-foreground">Average Score</p>
                    </CardContent>
                  </Card>
                </div>

                {activities.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No practice sessions yet</h3>
                      <p className="text-muted-foreground mb-4">Use BlurtAI to practice and track your progress</p>
                      <Button onClick={() => navigate("/blurt-ai")}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Start Practicing
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <Card key={activity.id}>
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-secondary/10 rounded-lg">
                                <Activity className="h-5 w-5 text-secondary" />
                              </div>
                              <div>
                                <p className="font-medium">{activity.subject_name} – {activity.topic_name}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDuration(activity.duration_seconds)}</span>
                                  <span>•</span>
                                  <span>{format(new Date(activity.created_at), "d MMM, h:mm a")}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {activity.score_percentage !== null && (
                                <Badge variant={activity.score_percentage >= 70 ? "default" : "secondary"}>
                                  {activity.score_percentage}%
                                </Badge>
                              )}
                              {activity.total_keywords && (
                                <span className="text-sm text-muted-foreground">
                                  {activity.keywords_remembered?.length || 0}/{activity.total_keywords} keywords
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* AI Analysis Tab */}
              <TabsContent value="analysis">
                {selectedTimetableId ? (
                  <StudyInsightsPanel timetableId={selectedTimetableId} />
                ) : (
                  <Card>
                    <CardContent className="text-center py-16">
                      <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No timetable found. Create a timetable to view AI insights.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Reflection Detail Dialog */}
        <Dialog open={!!selectedReflection} onOpenChange={() => setSelectedReflection(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {selectedReflection?.subject} – {selectedReflection?.topic}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {selectedReflection?.reflection_data.duration || 0} mins
                <span>•</span>
                {selectedReflection?.session_date && format(new Date(selectedReflection.session_date), "PPP")}
                {selectedReflection?.reflection_data.timeOfDay && (
                  <>
                    <span>•</span>
                    {selectedReflection.reflection_data.timeOfDay}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Completion Status</p>
                  <Badge className={getCompletionColor(selectedReflection?.reflection_data.completionStatus)}>
                    {getCompletionText(selectedReflection?.reflection_data.completionStatus)}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Focus Level</p>
                  <p className="text-2xl font-bold text-primary">{selectedReflection?.reflection_data.focusLevel || 0}%</p>
                </div>
              </div>

              {selectedReflection?.reflection_data.howItWent && (
                <div>
                  <h4 className="font-semibold mb-2">How it went</h4>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    {selectedReflection.reflection_data.howItWent}
                  </p>
                </div>
              )}

              {selectedReflection?.reflection_data.whatMissed && (
                <div>
                  <h4 className="font-semibold mb-2">What was missed</h4>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    {selectedReflection.reflection_data.whatMissed}
                  </p>
                </div>
              )}

              {selectedReflection?.reflection_data.quickNote && (
                <div>
                  <h4 className="font-semibold mb-2">Quick Note</h4>
                  <p className="text-sm italic text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    "{selectedReflection.reflection_data.quickNote}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setSelectedReflection(null)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default AIInsights;
