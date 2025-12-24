import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plus, Play, ChevronRight, Users, Target, Zap, Calendar, BookOpen, Clock, Flame, TrendingUp, Award, CheckCircle, Search, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import OnboardingWizard from "@/components/OnboardingWizard";
import { AIInsightsCard } from "@/components/dashboard/AIInsightsCard";
import SimpleOnboarding from "@/components/onboarding/SimpleOnboarding";
import PageTransition from "@/components/PageTransition";
import { OwlMascot } from "@/components/mascot/OwlMascot";
import { motion } from "framer-motion";
import PremiumGrantNotification from "@/components/PremiumGrantNotification";
import { format, isToday, parseISO } from "date-fns";

// Import the new mascot/icon images
import timerIcon from "@/assets/timer-icon.png";
import checklistIcon from "@/assets/checklist-icon.png";
import lightbulbIcon from "@/assets/lightbulb-icon.png";
import magnifyingGlassIcon from "@/assets/magnifying-glass-icon.png";
import notebookIcon from "@/assets/notebook-icon.png";
import owlStudying from "@/assets/owl-studying.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ full_name?: string } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [showPremiumNotification, setShowPremiumNotification] = useState(false);
  const [weeklyHours, setWeeklyHours] = useState(0);
  const [sessionsToday, setSessionsToday] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [subjectProgress, setSubjectProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadDashboardData(session.user.id);
      } else {
        navigate("/");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadDashboardData(session.user.id);
      } else {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadDashboardData = async (userId: string) => {
    try {
      const [subjectsResult, timetablesResult, profileResult, streakResult, premiumResult, sessionsResult, activityResult, achievementsResult, homeworksResult, eventsResult] = await Promise.all([
        supabase.from("subjects").select("id, name").eq("user_id", userId),
        supabase.from("timetables").select("id, schedule, topics").eq("user_id", userId).order("created_at", { ascending: false }).limit(1),
        supabase.from("profiles").select("full_name").eq("id", userId).single(),
        supabase.from("study_streaks").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(7),
        supabase.from("premium_grants").select("id, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(1),
        supabase.from("study_sessions").select("*").eq("user_id", userId).gte("planned_start", new Date().toISOString().split('T')[0]).order("planned_start", { ascending: true }).limit(5),
        supabase.from("study_sessions").select("*").eq("user_id", userId).eq("status", "completed").order("actual_end", { ascending: false }).limit(5),
        supabase.from("user_achievements").select("*, achievements(*)").eq("user_id", userId).order("unlocked_at", { ascending: false }).limit(3),
        supabase.from("homeworks").select("*").eq("user_id", userId).eq("completed", false).order("due_date", { ascending: true }).limit(5),
        supabase.from("events").select("*").eq("user_id", userId).gte("start_time", new Date().toISOString()).order("start_time", { ascending: true }).limit(5),
      ]);
      
      const hasSubjects = subjectsResult.data && subjectsResult.data.length > 0;
      const hasTimetables = timetablesResult.data && timetablesResult.data.length > 0;
      
      // Check for premium notification
      if (premiumResult.data && premiumResult.data.length > 0) {
        const grantTime = new Date(premiumResult.data[0].created_at).getTime();
        const now = Date.now();
        if (now - grantTime < 30000) {
          const shownKey = `premium_shown_${premiumResult.data[0].id}`;
          if (!localStorage.getItem(shownKey)) {
            localStorage.setItem(shownKey, 'true');
            setShowPremiumNotification(true);
          }
        }
      }
      
      // Calculate streak
      if (streakResult.data && streakResult.data.length > 0) {
        let currentStreak = 0;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        for (const s of streakResult.data) {
          if (s.date === today || s.date === yesterday || currentStreak > 0) {
            currentStreak++;
          } else {
            break;
          }
        }
        setStreak(currentStreak);
        
        // Calculate weekly hours
        const weekHours = streakResult.data.reduce((acc, s) => acc + (s.minutes_studied || 0), 0) / 60;
        setWeeklyHours(Math.round(weekHours * 10) / 10);
      }

      // Get today's sessions from timetable
      if (timetablesResult.data && timetablesResult.data.length > 0) {
        const schedule = timetablesResult.data[0].schedule as any;
        const todayStr = new Date().toISOString().split('T')[0];
        const todaySessions = schedule?.[todayStr] || [];
        setSessionsToday(todaySessions.filter((s: any) => s.type !== 'break').slice(0, 3));

        // Calculate subject progress based on completed topics
        const topics = timetablesResult.data[0].topics as any[] || [];
        const subjectTopicCount: Record<string, { total: number; reviewed: number }> = {};
        topics.forEach((topic: any) => {
          const subjectName = subjectsResult.data?.find(s => s.id === topic.subject_id)?.name || "Unknown";
          if (!subjectTopicCount[subjectName]) {
            subjectTopicCount[subjectName] = { total: 0, reviewed: 0 };
          }
          subjectTopicCount[subjectName].total++;
        });
        
        // Count reviewed topics from activity
        const subjectProgressCalc: Record<string, number> = {};
        Object.entries(subjectTopicCount).forEach(([subject, counts]) => {
          subjectProgressCalc[subject] = counts.total > 0 
            ? Math.round((activityResult.data?.filter(a => a.subject === subject).length || 0) / counts.total * 100) 
            : 0;
        });
        setSubjectProgress(subjectProgressCalc);
      }

      setRecentActivity(activityResult.data || []);
      setAchievements(achievementsResult.data || []);
      setHomeworks(homeworksResult.data || []);
      setEvents(eventsResult.data || []);
      setHasData(hasSubjects || hasTimetables);
      setProfile(profileResult.data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getFirstName = () => {
    if (!profile?.full_name) return "there";
    return profile.full_name.split(" ")[0];
  };

  const getContextualMessage = () => {
    if (sessionsToday.length === 0) {
      return "No sessions scheduled today. Ready to create one?";
    }
    return `You have ${sessionsToday.length} session${sessionsToday.length > 1 ? 's' : ''} planned today`;
  };

  // Calculate overall exam readiness
  const overallReadiness = useMemo(() => {
    const values = Object.values(subjectProgress);
    if (values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }, [subjectProgress]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <OwlMascot type="sleeping" size="xl" glow />
          <p className="text-muted-foreground animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10">
        <SimpleOnboarding />
        <Header onNewTimetable={() => setShowOnboarding(true)} />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
          {!hasData && !showOnboarding ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 space-y-8"
            >
              <img src={owlStudying} alt="Owl mascot" className="w-48 h-48 object-contain" />
              <div className="text-center space-y-3 max-w-md">
                <h2 className="text-3xl font-bold">Welcome to Vistara!</h2>
                <p className="text-muted-foreground text-lg">
                  Create your personalized study timetable to start your journey.
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => setShowOnboarding(true)}
                className="gap-2 rounded-xl px-8 py-6 text-lg bg-gradient-to-r from-primary to-accent shadow-lg"
              >
                <Plus className="h-5 w-5" />
                Get Started
              </Button>
            </motion.div>
          ) : showOnboarding ? (
            <OnboardingWizard
              onComplete={() => {
                setShowOnboarding(false);
                setHasData(true);
                toast.success("Setup complete!");
              }}
              onCancel={() => setShowOnboarding(false)}
            />
          ) : (
            <div className="space-y-8">
              {/* Hero Section - Floating Greeting Card (only floating element) */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card via-card to-primary/5">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, type: "spring" }}
                        className="flex-shrink-0"
                      >
                        <img src={owlStudying} alt="Owl mascot" className="w-24 h-24 sm:w-28 sm:h-28 object-contain" />
                      </motion.div>
                      
                      <div className="flex-1 text-center sm:text-left space-y-3">
                        <div>
                          <h1 className="text-2xl sm:text-3xl font-bold">
                            {getGreeting()}, {getFirstName()}!
                          </h1>
                          <p className="text-muted-foreground mt-1">
                            {getContextualMessage()}
                          </p>
                        </div>
                        
                        <Button
                          size="lg"
                          onClick={() => navigate("/timetables")}
                          className="gap-2 bg-gradient-to-r from-primary to-accent shadow-md hover:shadow-lg transition-all"
                        >
                          <Play className="h-4 w-4" />
                          Start Today's Session
                        </Button>
                      </div>

                      {/* Streak Badge */}
                      {streak > 0 && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring" }}
                          className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20"
                        >
                          <Flame className="h-6 w-6 text-orange-500" />
                          <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{streak}</span>
                          <span className="text-xs text-muted-foreground">day streak</span>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* FLAT SECTION: Today's Focus */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-3xl p-6 sm:p-8"
              >
                <div className="flex items-start gap-6">
                  <img src={timerIcon} alt="Timer" className="w-20 h-20 sm:w-24 sm:h-24 object-contain flex-shrink-0" />
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground">Today's Focus</h2>
                      <p className="text-muted-foreground text-sm">What should I study right now?</p>
                    </div>
                    
                    {sessionsToday.length > 0 ? (
                      <div className="space-y-3">
                        {/* Highlight first session as "Up Next" */}
                        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                          <div className="flex items-center gap-2 text-xs text-primary font-medium mb-2">
                            <Play className="h-3 w-3" />
                            UP NEXT
                          </div>
                          <p className="font-semibold text-lg">{sessionsToday[0].subject}</p>
                          {sessionsToday[0].topic && (
                            <p className="text-sm text-muted-foreground">{sessionsToday[0].topic}</p>
                          )}
                          <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{sessionsToday[0].duration} minutes</span>
                          </div>
                        </div>
                        
                        {sessionsToday.slice(1).map((session, i) => (
                          <div key={i} className="flex items-center gap-4 p-3 border-b border-border/50 last:border-0">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{session.subject}</p>
                              {session.topic && <p className="text-xs text-muted-foreground">{session.topic}</p>}
                            </div>
                            <span className="text-xs text-muted-foreground">{session.duration}m</span>
                          </div>
                        ))}
                        
                        <button 
                          onClick={() => navigate("/timetables")}
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          View full schedule <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="py-6 text-center">
                        <p className="text-muted-foreground mb-4">No sessions scheduled for today</p>
                        <Button onClick={() => setShowOnboarding(true)} variant="outline" className="gap-2">
                          <Plus className="h-4 w-4" />
                          Create Timetable
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.section>

              {/* FLAT SECTION: Exam Readiness Overview */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="relative bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 rounded-3xl p-6 sm:p-8"
              >
                <div className="flex items-start gap-6">
                  <div className="flex flex-col gap-4">
                    <img src={checklistIcon} alt="Checklist" className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
                    <img src={magnifyingGlassIcon} alt="Analysis" className="w-14 h-14 sm:w-16 sm:h-16 object-contain opacity-70" />
                  </div>
                  <div className="flex-1 space-y-5">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground">Exam Readiness</h2>
                      <p className="text-muted-foreground text-sm">How prepared are you for exams?</p>
                    </div>
                    
                    {/* Overall Readiness Ring */}
                    <div className="flex items-center gap-6">
                      <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="42"
                            stroke="hsl(var(--muted))"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="42"
                            stroke="hsl(var(--primary))"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${overallReadiness * 2.64} 264`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold">{overallReadiness}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold">Overall Readiness</p>
                        <p className="text-sm text-muted-foreground">
                          {overallReadiness < 30 ? "Just getting started" : 
                           overallReadiness < 60 ? "Making good progress" : 
                           overallReadiness < 80 ? "Almost there!" : "Excellent preparation!"}
                        </p>
                      </div>
                    </div>

                    {/* Subject Progress Bars */}
                    <div className="space-y-3">
                      {Object.entries(subjectProgress).slice(0, 4).map(([subject, progress]) => (
                        <div key={subject} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{subject}</span>
                            <span className="text-muted-foreground">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      ))}
                      {Object.keys(subjectProgress).length === 0 && (
                        <p className="text-sm text-muted-foreground">Complete study sessions to track progress</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* FLAT SECTION: Planning & Organisation */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5 rounded-3xl p-6 sm:p-8"
              >
                <div className="flex items-start gap-6">
                  <img src={notebookIcon} alt="Notebook" className="w-20 h-20 sm:w-24 sm:h-24 object-contain flex-shrink-0" />
                  <div className="flex-1 space-y-5">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground">Planning & Organisation</h2>
                      <p className="text-muted-foreground text-sm">Everything school-related, clearly organised</p>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-6">
                      {/* Homework List */}
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                          <ClipboardList className="h-4 w-4" />
                          HOMEWORK
                        </h3>
                        {homeworks.length > 0 ? (
                          <div className="space-y-2">
                            {homeworks.slice(0, 3).map((hw, i) => (
                              <div key={hw.id} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{hw.title}</p>
                                  <p className="text-xs text-muted-foreground">{hw.subject}</p>
                                </div>
                                <span className="text-xs px-2 py-1 rounded bg-muted">{format(new Date(hw.due_date), "MMM d")}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground py-4">No homework due</p>
                        )}
                      </div>

                      {/* Upcoming Events */}
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          UPCOMING
                        </h3>
                        {events.length > 0 ? (
                          <div className="space-y-2">
                            {events.slice(0, 3).map((event, i) => (
                              <div key={event.id} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{event.title}</p>
                                  <p className="text-xs text-muted-foreground">{format(new Date(event.start_time), "MMM d, h:mm a")}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground py-4">No upcoming events</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" size="sm" onClick={() => navigate("/agenda")} className="gap-2">
                        <Calendar className="h-4 w-4" />
                        Manage Calendar
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* FLAT SECTION: AI Insights */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="relative bg-gradient-to-br from-amber-500/5 via-transparent to-yellow-500/5 rounded-3xl p-6 sm:p-8"
              >
                <div className="flex items-start gap-6">
                  <img src={lightbulbIcon} alt="Insights" className="w-20 h-20 sm:w-24 sm:h-24 object-contain flex-shrink-0" />
                  <div className="flex-1">
                    <AIInsightsCard userId={user?.id || ""} />
                  </div>
                </div>
              </motion.section>

              {/* Progress Footer - Minimal Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center gap-8 py-6 border-t border-border/30"
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{weeklyHours}h</p>
                  <p className="text-xs text-muted-foreground">This Week</p>
                </div>
                <div className="w-px bg-border" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-500">{streak}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
              </motion.div>
            </div>
          )}
        </main>

        <PremiumGrantNotification 
          show={showPremiumNotification} 
          onClose={() => setShowPremiumNotification(false)} 
        />
      </div>
    </PageTransition>
  );
};

export default Dashboard;