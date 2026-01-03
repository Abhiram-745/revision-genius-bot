import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plus, Play, ChevronRight, Target, Calendar, BookOpen, Clock, Flame, TrendingUp, Award, Trophy, Sparkles, Zap, Brain, BarChart3, Star, GraduationCap, BookMarked } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import OnboardingWizard from "@/components/OnboardingWizard";
import { AIInsightsCard } from "@/components/dashboard/AIInsightsCard";
import { StudyArchetypeCard } from "@/components/dashboard/StudyArchetypeCard";
import { MotivationCard } from "@/components/dashboard/MotivationCard";
import SimpleOnboarding from "@/components/onboarding/SimpleOnboarding";
import PageTransition from "@/components/PageTransition";
import { OwlMascot } from "@/components/mascot/OwlMascot";
import { motion } from "framer-motion";
import PremiumGrantNotification from "@/components/PremiumGrantNotification";
import { AmbassadorApprovalNotification } from "@/components/dashboard/AmbassadorApprovalNotification";
import { PremiumUpgradeCTA } from "@/components/dashboard/PremiumUpgradeCTA";
import { format } from "date-fns";
import { DashboardSEO } from "@/components/SEO";

// Import owl mascot images only
import studyingOwl from "@/assets/studying-owl.png";
import owlThumbsup from "@/assets/owl-thumbsup.png";
import owlChart from "@/assets/owl-chart.png";
import owlChecklist from "@/assets/owl-checklist.png";
import wavingOwl from "@/assets/waving-owl.png";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

const floatAnimation = {
  y: [0, -8, 0],
  transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
};

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
  const [totalSessions, setTotalSessions] = useState(0);
  const [showAmbassadorNotification, setShowAmbassadorNotification] = useState(true);

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
      const [subjectsResult, timetablesResult, profileResult, streakResult, premiumResult, sessionsResult, activityResult, achievementsResult, homeworksResult, eventsResult, totalSessionsResult] = await Promise.all([
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
        supabase.from("study_sessions").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "completed"),
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
        
        const weekHours = streakResult.data.reduce((acc, s) => acc + (s.minutes_studied || 0), 0) / 60;
        setWeeklyHours(Math.round(weekHours * 10) / 10);
      }

      // Get today's sessions from timetable
      if (timetablesResult.data && timetablesResult.data.length > 0) {
        const schedule = timetablesResult.data[0].schedule as any;
        const todayStr = new Date().toISOString().split('T')[0];
        const todaySessions = schedule?.[todayStr] || [];
        setSessionsToday(todaySessions.filter((s: any) => s.type !== 'break').slice(0, 5));

        const topics = timetablesResult.data[0].topics as any[] || [];
        const subjectTopicCount: Record<string, { total: number; reviewed: number }> = {};
        topics.forEach((topic: any) => {
          const subjectName = subjectsResult.data?.find(s => s.id === topic.subject_id)?.name || "Unknown";
          if (!subjectTopicCount[subjectName]) {
            subjectTopicCount[subjectName] = { total: 0, reviewed: 0 };
          }
          subjectTopicCount[subjectName].total++;
        });
        
        const subjectProgressCalc: Record<string, number> = {};
        Object.entries(subjectTopicCount).forEach(([subject, counts]) => {
          subjectProgressCalc[subject] = counts.total > 0 
            ? Math.round((activityResult.data?.filter(a => a.subject === subject).length || 0) / counts.total * 100) 
            : 0;
        });
        setSubjectProgress(subjectProgressCalc);
      }

      setTotalSessions(totalSessionsResult.count || 0);
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

  const overallReadiness = useMemo(() => {
    const values = Object.values(subjectProgress);
    if (values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }, [subjectProgress]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <motion.div animate={floatAnimation}>
            <OwlMascot type="sleeping" size="xl" glow />
          </motion.div>
          <motion.p 
            className="text-muted-foreground"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading your dashboard...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <DashboardSEO />
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <SimpleOnboarding />
        <Header onNewTimetable={() => setShowOnboarding(true)} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {!hasData && !showOnboarding ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 space-y-8"
            >
              <motion.img 
                src={wavingOwl} 
                alt="Owl mascot" 
                className="w-48 h-48 object-contain"
                animate={floatAnimation}
              />
              <div className="text-center space-y-3 max-w-md">
                <h2 className="text-3xl font-bold">Welcome to Vistara!</h2>
                <p className="text-muted-foreground text-lg">
                  Create your personalized study timetable to start your journey.
                </p>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  onClick={() => setShowOnboarding(true)}
                  className="gap-2 rounded-xl px-8 py-6 text-lg bg-gradient-to-r from-primary to-accent shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                  Get Started
                </Button>
              </motion.div>
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
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-5"
            >
              {/* Row 1: Hero Card - Centered Content */}
              <motion.div variants={itemVariants}>
                <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-primary/10 via-card to-accent/10">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex flex-col items-center justify-center gap-6 text-center">
                      <motion.div
                        animate={floatAnimation}
                        className="relative"
                      >
                        <motion.div 
                          className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"
                          animate={pulseAnimation}
                        />
                        <img 
                          src={wavingOwl} 
                          alt="Owl mascot" 
                          className="w-32 h-32 sm:w-36 sm:h-36 object-contain relative z-10 drop-shadow-lg" 
                        />
                      </motion.div>
                      
                      <div className="flex flex-col items-center space-y-4">
                        <div>
                          <motion.h1 
                            className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            {getGreeting()}, {getFirstName()}!
                          </motion.h1>
                          <motion.p 
                            className="text-muted-foreground mt-2 text-lg"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            {sessionsToday.length > 0 
                              ? `You have ${sessionsToday.length} session${sessionsToday.length > 1 ? 's' : ''} planned today`
                              : "Ready to start studying?"}
                          </motion.p>
                        </div>
                        
                        <motion.div 
                          whileHover={{ scale: 1.03 }} 
                          whileTap={{ scale: 0.97 }}
                        >
                          <Button
                            size="lg"
                            onClick={() => navigate("/timetables")}
                            className="gap-2 bg-gradient-to-r from-primary to-accent shadow-lg hover:shadow-xl transition-all text-lg px-10 py-6"
                          >
                            <Play className="h-5 w-5" />
                            Start Today's Session
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Row 2: Study Archetype Card */}
              {user && (
                <motion.div variants={itemVariants}>
                  <StudyArchetypeCard userId={user.id} />
                </motion.div>
              )}

              {/* Row 3: Quick Stats - Visible on mobile */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Streak Card */}
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20 overflow-hidden">
                    <CardContent className="p-4 flex items-center gap-4">
                      <motion.div 
                        className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shrink-0"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Flame className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      </motion.div>
                      <div className="min-w-0">
                        <p className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">{streak}</p>
                        <p className="text-sm text-muted-foreground">Day Streak</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Weekly Hours */}
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shrink-0">
                        <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{weeklyHours}h</p>
                        <p className="text-sm text-muted-foreground">This Week</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Sessions Completed */}
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shrink-0">
                        <Target className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{totalSessions}</p>
                        <p className="text-sm text-muted-foreground">Sessions Done</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Row 4: Today's Focus + Exam Readiness */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Today's Focus */}
                <motion.div variants={itemVariants}>
                  <Card className="h-full bg-gradient-to-br from-primary/5 via-card to-accent/5 border-primary/10 overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-6">
                        <motion.img 
                          src={studyingOwl} 
                          alt="Studying owl" 
                          className="w-16 h-16 object-contain"
                          animate={floatAnimation}
                        />
                        <div>
                          <h2 className="text-xl font-bold">Today's Focus</h2>
                          <p className="text-sm text-muted-foreground">Your scheduled study sessions</p>
                        </div>
                      </div>
                      
                      {sessionsToday.length > 0 ? (
                        <div className="space-y-3">
                          <motion.div 
                            className="p-4 rounded-xl bg-primary/10 border border-primary/20"
                            whileHover={{ scale: 1.01 }}
                          >
                            <div className="flex items-center gap-2 text-xs text-primary font-semibold mb-2">
                              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                                <Play className="h-3 w-3" />
                              </motion.div>
                              UP NEXT
                            </div>
                            <p className="font-bold text-lg">{sessionsToday[0].subject}</p>
                            {sessionsToday[0].topic && (
                              <p className="text-sm text-muted-foreground">{sessionsToday[0].topic}</p>
                            )}
                            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{sessionsToday[0].duration} minutes</span>
                            </div>
                          </motion.div>
                          
                          {sessionsToday.slice(1, 4).map((session, i) => (
                            <motion.div 
                              key={i} 
                              className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * i }}
                            >
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{session.subject}</p>
                                {session.topic && <p className="text-xs text-muted-foreground">{session.topic}</p>}
                              </div>
                              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">{session.duration}m</span>
                            </motion.div>
                          ))}
                          
                          <Button 
                            variant="ghost" 
                            onClick={() => navigate("/timetables")}
                            className="w-full mt-2 text-primary hover:text-primary"
                          >
                            View Full Schedule <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <motion.img 
                            src={owlChecklist} 
                            alt="Owl with checklist" 
                            className="w-20 h-20 mx-auto mb-4"
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <p className="text-muted-foreground mb-4">No sessions scheduled for today</p>
                          <Button onClick={() => setShowOnboarding(true)} variant="outline" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create Timetable
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Exam Readiness */}
                <motion.div variants={itemVariants}>
                  <Card className="h-full bg-gradient-to-br from-emerald-500/5 via-card to-teal-500/5 border-emerald-500/10 overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-6">
                        <motion.img 
                          src={owlThumbsup} 
                          alt="Thumbs up owl" 
                          className="w-16 h-16 object-contain"
                          animate={floatAnimation}
                        />
                        <div>
                          <h2 className="text-xl font-bold">Exam Readiness</h2>
                          <p className="text-sm text-muted-foreground">Your preparation progress</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 mb-6">
                        <motion.div 
                          className="relative w-24 h-24 flex-shrink-0"
                          whileHover={{ scale: 1.1 }}
                        >
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="48"
                              cy="48"
                              r="42"
                              stroke="hsl(var(--muted))"
                              strokeWidth="8"
                              fill="none"
                            />
                            <motion.circle
                              cx="48"
                              cy="48"
                              r="42"
                              stroke="hsl(var(--primary))"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={264}
                              strokeDashoffset={264}
                              strokeLinecap="round"
                              animate={{ strokeDashoffset: 264 - (overallReadiness * 2.64) }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.span 
                              className="text-2xl font-bold"
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.5 }}
                            >
                              {overallReadiness}%
                            </motion.span>
                          </div>
                        </motion.div>
                        <div>
                          <p className="font-semibold text-lg">Overall Readiness</p>
                          <p className="text-sm text-muted-foreground">
                            {overallReadiness < 30 ? "Just getting started" : 
                             overallReadiness < 60 ? "Making good progress" : 
                             overallReadiness < 80 ? "Almost there!" : "Excellent preparation!"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {Object.entries(subjectProgress).slice(0, 4).map(([subject, progress], i) => (
                          <motion.div 
                            key={subject} 
                            className="space-y-1"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * i }}
                          >
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{subject}</span>
                              <span className="text-muted-foreground">{progress}%</span>
                            </div>
                            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                              <motion.div 
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, delay: 0.2 * i }}
                              />
                            </div>
                          </motion.div>
                        ))}
                        {Object.keys(subjectProgress).length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">Complete study sessions to track progress</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Row 5: Planning + Achievements + Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Homework & Events */}
                <motion.div variants={itemVariants}>
                  <Card className="h-full bg-gradient-to-br from-violet-500/5 via-card to-purple-500/5 border-violet-500/10">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <motion.img 
                          src={owlChecklist} 
                          alt="Checklist owl" 
                          className="w-12 h-12 object-contain"
                          animate={floatAnimation}
                        />
                        <div>
                          <h3 className="font-bold">Homework</h3>
                          <p className="text-xs text-muted-foreground">{homeworks.length} pending</p>
                        </div>
                      </div>
                      
                      {homeworks.length > 0 ? (
                        <div className="space-y-2">
                          {homeworks.slice(0, 3).map((hw) => (
                            <motion.div 
                              key={hw.id} 
                              className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                              whileHover={{ scale: 1.02, backgroundColor: "hsl(var(--muted) / 0.5)" }}
                            >
                              <BookMarked className="h-4 w-4 text-violet-500" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{hw.title}</p>
                                <p className="text-xs text-muted-foreground">{hw.subject}</p>
                              </div>
                              <span className="text-xs px-2 py-1 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400">
                                {format(new Date(hw.due_date), "MMM d")}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No homework due</p>
                      )}

                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate("/agenda")}
                        className="w-full mt-3"
                      >
                        View All <ChevronRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Achievements */}
                <motion.div variants={itemVariants}>
                  <Card className="h-full bg-gradient-to-br from-primary/5 via-card to-accent/5 border-primary/10">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <motion.div 
                          className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent"
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <Trophy className="h-8 w-8 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="font-bold">Achievements</h3>
                          <p className="text-xs text-muted-foreground">{achievements.length} unlocked</p>
                        </div>
                      </div>
                      
                      {achievements.length > 0 ? (
                        <div className="space-y-2">
                          {achievements.map((ach, i) => (
                            <motion.div 
                              key={ach.id}
                              className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.1 * i }}
                              whileHover={{ scale: 1.02, backgroundColor: "hsl(var(--primary) / 0.1)" }}
                            >
                              <span className="text-2xl">{ach.achievements?.icon || "🏆"}</span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{ach.achievements?.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{ach.achievements?.description}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Star className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                          <p className="text-sm text-muted-foreground">Complete sessions to earn achievements</p>
                        </div>
                      )}

                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate("/activity")}
                        className="w-full mt-3"
                      >
                        View All <ChevronRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Motivation Card - Replaced Quick Actions */}
                <motion.div variants={itemVariants}>
                  <MotivationCard 
                    streak={streak}
                    weeklyHours={weeklyHours}
                    sessionsCompleted={totalSessions}
                  />
                </motion.div>
              </div>

              {/* Row 6: AI Insights */}
              <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-br from-primary/5 via-card to-accent/5 border-primary/10 overflow-hidden">
                  <CardContent className="p-5 sm:p-6">
                    <AIInsightsCard userId={user?.id || ""} />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Row 7: Upcoming Events */}
              {events.length > 0 && (
                <motion.div variants={itemVariants}>
                  <Card className="bg-gradient-to-r from-rose-500/5 via-card to-pink-500/5 border-rose-500/10">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <motion.img 
                            src={owlChart} 
                            alt="Owl with chart" 
                            className="w-12 h-12 object-contain"
                            animate={floatAnimation}
                          />
                          <h3 className="font-bold text-lg">Upcoming Events</h3>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => navigate("/agenda")}>
                          View All <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {events.slice(0, 4).map((event, i) => (
                          <motion.div
                            key={event.id}
                            className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-rose-500/10">
                                <Calendar className="h-4 w-4 text-rose-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{event.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(event.start_time), "MMM d, h:mm a")}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Premium Upgrade CTA */}
              <PremiumUpgradeCTA />

              {/* Motivational Footer */}
              <motion.div
                variants={itemVariants}
                className="flex justify-center items-center gap-6 py-4"
              >
                <motion.div 
                  className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}>
                    <Sparkles className="h-5 w-5 text-primary" />
                  </motion.div>
                  <span className="font-medium text-sm">
                    {streak > 0 
                      ? `Keep going! ${streak} day streak 🔥` 
                      : "Start your study streak today!"}
                  </span>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </main>

        <PremiumGrantNotification 
          show={showPremiumNotification} 
          onClose={() => setShowPremiumNotification(false)} 
        />
        
        {user && showAmbassadorNotification && (
          <AmbassadorApprovalNotification 
            userId={user.id}
            onClose={() => setShowAmbassadorNotification(false)}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default Dashboard;
