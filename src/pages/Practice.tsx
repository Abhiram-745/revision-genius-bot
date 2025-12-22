import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, Sparkles, Target, Clock, TrendingUp, BookOpen, GraduationCap, Layers, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import SaveMyExamsLogo from "@/components/SaveMyExamsLogo";

interface PracticeApp {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  route: string;
  badge?: string;
  badgeColor?: string;
  recommended?: string;
}

const Practice = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("blurt_activity_logs")
          .select("duration_seconds, session_type")
          .eq("user_id", user.id);

        if (error) throw error;

        const sessions = data?.length || 0;
        const time = (data || []).reduce((acc, log) => acc + (log.duration_seconds || 0), 0);

        setTotalSessions(sessions);
        setTotalTime(Math.round(time / 60));
      } catch (err) {
        console.error("Error fetching practice stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const practiceApps: PracticeApp[] = [
    {
      id: "blurt-ai",
      name: "BlurtAI",
      description: "Active recall practice with AI-powered feedback. Test yourself on topics and get instant analysis.",
      icon: <Brain className="w-8 h-8 text-secondary" />,
      gradient: "from-secondary/20 via-secondary/10 to-primary/10",
      route: "/blurt-ai",
      badge: "AI-Powered",
      badgeColor: "bg-secondary/20 text-secondary border-secondary/30",
    },
    {
      id: "savemyexams",
      name: "SaveMyExams",
      description: "Access revision notes, past papers, and practice questions from SaveMyExams.",
      icon: <SaveMyExamsLogo className="w-8 h-8" />,
      gradient: "from-emerald-500/20 via-emerald-500/10 to-teal-500/10",
      route: "/savemyexams",
      badge: "External",
      badgeColor: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
    },
    {
      id: "pmt",
      name: "Physics & Maths Tutor",
      description: "Comprehensive revision resources including notes, worksheets, and past papers for GCSE and A-Level.",
      icon: <GraduationCap className="w-8 h-8 text-blue-500" />,
      gradient: "from-blue-500/20 via-blue-500/10 to-indigo-500/10",
      route: "/pmt",
      badge: "External",
      badgeColor: "bg-blue-500/20 text-blue-600 border-blue-500/30",
    },
    {
      id: "quizlet",
      name: "Quizlet",
      description: "Flashcard-based learning for vocabulary and key terms. Perfect for language learning and memorization.",
      icon: <Layers className="w-8 h-8 text-indigo-500" />,
      gradient: "from-indigo-500/20 via-indigo-500/10 to-purple-500/10",
      route: "/quizlet",
      badge: "Flashcards",
      badgeColor: "bg-indigo-500/20 text-indigo-600 border-indigo-500/30",
      recommended: "Recommended for vocabulary practice",
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
        <Header />

        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Back Button */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/ai-insights?tab=overview")}
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              View Activity
            </Button>
          </div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/10 border border-primary/30 p-6 md:p-8"
          >
            <div className="absolute top-4 right-4 w-20 h-20 bg-primary/20 rounded-full blur-2xl" />
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-secondary/20 rounded-full blur-xl" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                  <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">Practice Hub</h1>
                  <Badge variant="secondary" className="bg-primary/30 text-primary-foreground border-primary/50">
                    <Sparkles className="w-3 h-3 mr-1" />
                    All-in-One
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
                  Access all your revision tools in one place. Track your practice sessions across different platforms.
                </p>
              </div>
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
                  <p className="text-2xl font-bold text-foreground">{totalTime} min</p>
                  <p className="text-xs text-muted-foreground">Total Practice Time</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{practiceApps.length}</p>
                  <p className="text-xs text-muted-foreground">Practice Apps</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Practice Apps Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Choose a Practice App</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {practiceApps.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30 bg-gradient-to-r ${app.gradient}`}
                    onClick={() => navigate(app.route)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center shadow-sm">
                            {app.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {app.name}
                              {app.badge && (
                                <Badge className={app.badgeColor} variant="outline">
                                  {app.badge}
                                </Badge>
                              )}
                            </CardTitle>
                            {app.recommended && (
                              <p className="text-xs text-muted-foreground mt-1">{app.recommended}</p>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="shrink-0">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {app.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Info Note */}
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <ExternalLink className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Note:</span> External platforms (SaveMyExams, PMT, Quizlet) 
                  require signing in on their respective websites. Use the "Open in New Tab" option if you need to log in.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </PageTransition>
  );
};

export default Practice;
