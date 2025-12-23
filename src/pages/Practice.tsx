import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Brain, Sparkles, Target, Clock, TrendingUp, BookOpen, GraduationCap, Layers, ExternalLink, MessageSquarePlus, Send, Loader2, Filter } from "lucide-react";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import SaveMyExamsLogo from "@/components/SaveMyExamsLogo";
import { OwlMascot } from "@/components/mascot/OwlMascot";
import { toast } from "sonner";

type Category = "all" | "ai" | "gcse" | "alevel" | "ap" | "flashcards";

interface PracticeApp {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  route?: string;
  externalUrl?: string;
  badge?: string;
  badgeColor?: string;
  categories: Category[];
}

const Practice = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestForm, setRequestForm] = useState({ name: "", url: "", description: "" });

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

  const handleSubmitRequest = async () => {
    if (!user) {
      toast.error("Please log in to submit a request");
      return;
    }
    if (!requestForm.name.trim() || !requestForm.url.trim()) {
      toast.error("Please fill in app name and URL");
      return;
    }

    setRequestLoading(true);
    try {
      const { error } = await supabase
        .from("app_requests")
        .insert({
          user_id: user.id,
          app_name: requestForm.name.trim(),
          app_url: requestForm.url.trim(),
          description: requestForm.description.trim() || null,
        });

      if (error) throw error;

      toast.success("Request submitted! We'll review it soon.");
      setRequestDialogOpen(false);
      setRequestForm({ name: "", url: "", description: "" });
    } catch (err) {
      console.error("Error submitting request:", err);
      toast.error("Failed to submit request");
    } finally {
      setRequestLoading(false);
    }
  };

  const categories: { id: Category; label: string }[] = [
    { id: "all", label: "All Apps" },
    { id: "ai", label: "AI Tools" },
    { id: "gcse", label: "GCSE" },
    { id: "alevel", label: "A-Level" },
    { id: "ap", label: "AP Exams" },
    { id: "flashcards", label: "Flashcards" },
  ];

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
      categories: ["all", "ai", "gcse", "alevel", "ap", "flashcards"],
    },
    {
      id: "savemyexams",
      name: "SaveMyExams",
      description: "Access revision notes, past papers, and practice questions for GCSE, A-Level and AP exams.",
      icon: <SaveMyExamsLogo className="w-8 h-8" />,
      gradient: "from-emerald-500/20 via-emerald-500/10 to-teal-500/10",
      route: "/savemyexams",
      badge: "Notes & Papers",
      badgeColor: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
      categories: ["all", "gcse", "alevel", "ap"],
    },
    {
      id: "pmt",
      name: "Physics & Maths Tutor",
      description: "Comprehensive revision resources including notes, worksheets, and past papers for GCSE and A-Level.",
      icon: <GraduationCap className="w-8 h-8 text-blue-500" />,
      gradient: "from-blue-500/20 via-blue-500/10 to-indigo-500/10",
      route: "/pmt",
      badge: "STEM Focus",
      badgeColor: "bg-blue-500/20 text-blue-600 border-blue-500/30",
      categories: ["all", "gcse", "alevel"],
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
      categories: ["all", "flashcards"],
    },
    {
      id: "studyfetch",
      name: "StudyFetch",
      description: "AI study companion that creates flashcards, quizzes, and notes from your documents automatically.",
      icon: <Sparkles className="w-8 h-8 text-pink-500" />,
      gradient: "from-pink-500/20 via-pink-500/10 to-rose-500/10",
      externalUrl: "https://studyfetch.com",
      badge: "AI-Powered",
      badgeColor: "bg-pink-500/20 text-pink-600 border-pink-500/30",
      categories: ["all", "ai"],
    },
    {
      id: "turbo-ai",
      name: "Turbo.AI",
      description: "AI tutoring platform that provides personalized homework help and step-by-step explanations.",
      icon: <Brain className="w-8 h-8 text-cyan-500" />,
      gradient: "from-cyan-500/20 via-cyan-500/10 to-teal-500/10",
      externalUrl: "https://turbo.ai",
      badge: "AI Tutor",
      badgeColor: "bg-cyan-500/20 text-cyan-600 border-cyan-500/30",
      categories: ["all", "ai"],
    },
    {
      id: "mindgrasp",
      name: "MindGrasp.AI",
      description: "Upload notes, videos, or documents and AI generates summaries, flashcards, and practice questions.",
      icon: <BookOpen className="w-8 h-8 text-violet-500" />,
      gradient: "from-violet-500/20 via-violet-500/10 to-purple-500/10",
      externalUrl: "https://mindgrasp.ai",
      badge: "AI Notes",
      badgeColor: "bg-violet-500/20 text-violet-600 border-violet-500/30",
      categories: ["all", "ai"],
    },
    {
      id: "medly",
      name: "Medly AI",
      description: "AI-powered medical and science revision platform with interactive learning tools.",
      icon: <Target className="w-8 h-8 text-red-500" />,
      gradient: "from-red-500/20 via-red-500/10 to-orange-500/10",
      externalUrl: "https://medly.ai",
      badge: "Medical",
      badgeColor: "bg-red-500/20 text-red-600 border-red-500/30",
      categories: ["all", "gcse", "alevel"],
    },
    {
      id: "anki",
      name: "Anki",
      description: "Powerful spaced repetition flashcard system. Perfect for long-term memorization.",
      icon: <Layers className="w-8 h-8 text-slate-500" />,
      gradient: "from-slate-500/20 via-slate-500/10 to-gray-500/10",
      externalUrl: "https://ankiweb.net",
      badge: "Spaced Repetition",
      badgeColor: "bg-slate-500/20 text-slate-600 border-slate-500/30",
      categories: ["all", "flashcards"],
    },
    {
      id: "kahoot",
      name: "Kahoot!",
      description: "Game-based learning platform with quizzes created by teachers and students worldwide.",
      icon: <Sparkles className="w-8 h-8 text-purple-500" />,
      gradient: "from-purple-500/20 via-purple-500/10 to-fuchsia-500/10",
      externalUrl: "https://kahoot.com",
      badge: "Interactive",
      badgeColor: "bg-purple-500/20 text-purple-600 border-purple-500/30",
      categories: ["all", "gcse", "alevel"],
    },
  ];

  const filteredApps = activeCategory === "all" 
    ? practiceApps 
    : practiceApps.filter(app => app.categories.includes(activeCategory));

  const handleAppClick = (app: PracticeApp) => {
    if (app.route) {
      navigate(app.route);
    } else if (app.externalUrl) {
      window.open(app.externalUrl, "_blank", "noopener,noreferrer");
    }
  };

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
                <OwlMascot type="lightbulb" size="lg" />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">Practice Hub</h1>
                  <Badge variant="secondary" className="bg-primary/30 text-primary-foreground border-primary/50">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {practiceApps.length} Apps
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
                  Access all your revision tools in one place. Track practice sessions across different platforms.
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

          {/* Category Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className={activeCategory === cat.id ? "bg-primary" : ""}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Practice Apps Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              {activeCategory === "all" ? "All Study Apps" : `${categories.find(c => c.id === activeCategory)?.label} Apps`}
            </h2>
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredApps.map((app, index) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <Card
                      className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30 bg-gradient-to-r ${app.gradient}`}
                      onClick={() => handleAppClick(app)}
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
            </AnimatePresence>
          </div>

          {/* Request App Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-r from-muted/50 to-muted/30 border-dashed border-2 border-border/70">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <OwlMascot type="magnifying" size="lg" />
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-lg font-semibold mb-1">Don't see your favourite study app?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Request it to be added! We review all suggestions and add the best ones.
                    </p>
                    <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <MessageSquarePlus className="h-4 w-4" />
                          Request an App
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <MessageSquarePlus className="h-5 w-5" />
                            Request a Study App
                          </DialogTitle>
                          <DialogDescription>
                            Tell us about the study app you'd like to see added to Vistara.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="app-name">App Name *</Label>
                            <Input
                              id="app-name"
                              placeholder="e.g., Khan Academy"
                              value={requestForm.name}
                              onChange={(e) => setRequestForm(p => ({ ...p, name: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="app-url">Website URL *</Label>
                            <Input
                              id="app-url"
                              placeholder="e.g., https://khanacademy.org"
                              value={requestForm.url}
                              onChange={(e) => setRequestForm(p => ({ ...p, url: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="app-description">Why do you like it? (optional)</Label>
                            <Textarea
                              id="app-description"
                              placeholder="Tell us what makes this app great for studying..."
                              value={requestForm.description}
                              onChange={(e) => setRequestForm(p => ({ ...p, description: e.target.value }))}
                              rows={3}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSubmitRequest} disabled={requestLoading} className="gap-2">
                            {requestLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                            Submit Request
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Info Note */}
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <ExternalLink className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Note:</span> External platforms require signing in on their respective websites. Use the "Open in New Tab" option if you need to log in.
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