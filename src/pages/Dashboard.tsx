import { useState, useEffect } from "react";
import { format, startOfWeek, endOfWeek, subDays, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, ChevronRight, Users, Target, Zap, Calendar, BookOpen, Clock, TrendingUp, AlertCircle, CheckCircle2, Flame, BarChart3, Sparkles, Gauge, Timer, Brain, Award, TrendingDown, Activity, PieChart, Target as TargetIcon, Rocket, Lightbulb, BookMarked } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import OnboardingWizard from "@/components/OnboardingWizard";
import { AIInsightsCard } from "@/components/dashboard/AIInsightsCard";
import { UnifiedProgressSection } from "@/components/dashboard/UnifiedProgressSection";
import { RecentActivitySection } from "@/components/dashboard/RecentActivitySection";
import { UpcomingSessionsCard } from "@/components/dashboard/UpcomingSessionsCard";
import { SubjectMasteryCard } from "@/components/dashboard/SubjectMasteryCard";
import { StudyTipsCard } from "@/components/dashboard/StudyTipsCard";
import { AchievementsPreviewCard } from "@/components/dashboard/AchievementsPreviewCard";
import { QuickStatsCard } from "@/components/dashboard/QuickStatsCard";
import SimpleOnboarding from "@/components/onboarding/SimpleOnboarding";
import PageTransition from "@/components/PageTransition";
import { OwlMascot } from "@/components/mascot/OwlMascot";
import { DashboardFloatingElements, MotivationalBadge } from "@/components/dashboard/FloatingElements";
import { motion } from "framer-motion";
import PremiumGrantNotification from "@/components/PremiumGrantNotification";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ full_name?: string } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [showPremiumNotification, setShowPremiumNotification] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>({
    todayFocus: [],
    weeklyTrend: [],
    timeDistribution: [],
    efficiency: 0,
    learningVelocity: 0,
    habits: {},
    milestones: [],
    recommendations: []
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        checkSubjects(session.user.id);
      } else {
        navigate("/");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setTimeout(() => {
          checkSubjects(session.user.id);
        }, 0);
      } else {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkSubjects = async (userId: string) => {
    const [subjectsResult, timetablesResult, profileResult, streakResult, premiumResult] = await Promise.all([
      supabase.from("subjects").select("id").eq("user_id", userId).limit(1),
      supabase.from("timetables").select("id").eq("user_id", userId).limit(1),
      supabase.from("profiles").select("full_name").eq("id", userId).single(),
      supabase.from("study_streaks").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(7),
      supabase.from("premium_grants").select("id, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(1)
    ]);
    
    const hasSubjects = subjectsResult.data && subjectsResult.data.length > 0;
    const hasTimetables = timetablesResult.data && timetablesResult.data.length > 0;
    
    if (premiumResult.data && premiumResult.data.length > 0) {
      const grantTime = new Date(premiumResult.data[0].created_at).getTime();
      const now = Date.now();
      const timeDiff = now - grantTime;
      if (timeDiff < 30000) {
        const shownKey = `premium_shown_${premiumResult.data[0].id}`;
        if (!localStorage.getItem(shownKey)) {
          localStorage.setItem(shownKey, 'true');
          setShowPremiumNotification(true);
        }
      }
    }
    
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
    }
    
    setHasData(hasSubjects || hasTimetables);
    setProfile(profileResult.data);
    
    // Fetch comprehensive dashboard data
    if (hasSubjects || hasTimetables) {
      fetchDashboardData(userId);
    } else {
      setLoading(false);
    }
  };

  const fetchDashboardData = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString().split('T')[0];
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 }).toISOString().split('T')[0];
    const lastWeekStart = startOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 }).toISOString().split('T')[0];
    const lastWeekEnd = endOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 }).toISOString().split('T')[0];

    try {
      const [
        sessionsRes,
        scoresRes,
        subjectsRes,
        homeworkRes,
        testsRes,
        reflectionsRes,
        activitiesRes
      ] = await Promise.all([
        supabase.from("study_sessions").select("*").eq("user_id", userId),
        supabase.from("test_scores").select("*").eq("user_id", userId),
        supabase.from("subjects").select("id, name").eq("user_id", userId),
        supabase.from("homeworks").select("*").eq("user_id", userId).eq("completed", false).order("due_date").limit(5),
        supabase.from("test_dates").select("*, subjects(name)").gte("test_date", today).order("test_date").limit(5),
        supabase.from("topic_reflections").select("*").eq("user_id", userId).order("session_date", { ascending: false }).limit(20),
        supabase.from("blurt_activity_logs").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50)
      ]);

      // Today's Focus - Top 3 priorities
      const todayFocus = [];
      if (homeworkRes.data && homeworkRes.data.length > 0) {
        todayFocus.push({ type: "homework", title: homeworkRes.data[0].title, subject: homeworkRes.data[0].subject, priority: "high" });
      }
      if (testsRes.data && testsRes.data.length > 0) {
        const nextTest = testsRes.data[0];
        const daysUntil = Math.ceil((new Date(nextTest.test_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil <= 7) {
          todayFocus.push({ type: "test", title: nextTest.subjects?.name || "Test", date: nextTest.test_date, priority: daysUntil <= 3 ? "high" : "medium" });
        }
      }

      // Weekly Trend - Performance over last 7 days
      const weeklyTrend = [];
      if (sessionsRes.data) {
        for (let i = 6; i >= 0; i--) {
          const date = subDays(new Date(), i);
          const dateStr = date.toISOString().split('T')[0];
          const daySessions = sessionsRes.data.filter((s: any) => s.planned_start?.startsWith(dateStr) && s.status === 'completed');
          const minutes = daySessions.reduce((sum: number, s: any) => sum + (s.actual_duration_minutes || 0), 0);
          weeklyTrend.push({ date: dateStr, hours: minutes / 60, sessions: daySessions.length });
        }
      }

      // Time Distribution by Subject
      const timeDistribution: any[] = [];
      if (sessionsRes.data && subjectsRes.data) {
        const subjectMap = new Map(subjectsRes.data.map((s: any) => [s.id, s.name]));
        const subjectMinutes = new Map();
        
        sessionsRes.data.filter((s: any) => s.status === 'completed').forEach((s: any) => {
          if (s.subject_id) {
            const current = subjectMinutes.get(s.subject_id) || 0;
            subjectMinutes.set(s.subject_id, current + (s.actual_duration_minutes || 0));
          }
        });

        subjectMinutes.forEach((minutes, subjectId) => {
          timeDistribution.push({
            subject: subjectMap.get(subjectId) || "Unknown",
            hours: minutes / 60,
            percentage: 0
          });
        });

        const total = timeDistribution.reduce((sum, item) => sum + item.hours, 0);
        timeDistribution.forEach(item => {
          item.percentage = total > 0 ? Math.round((item.hours / total) * 100) : 0;
        });
        timeDistribution.sort((a, b) => b.hours - a.hours);
      }

      // Efficiency Score
      let efficiency = 0;
      if (sessionsRes.data && scoresRes.data) {
        const completed = sessionsRes.data.filter((s: any) => s.status === 'completed').length;
        const total = sessionsRes.data.length;
        const completionRate = total > 0 ? (completed / total) * 100 : 0;
        
        const validScores = scoresRes.data.filter((s: any) => s.percentage && s.percentage > 0);
        const avgScore = validScores.length > 0 
          ? validScores.reduce((sum: number, s: any) => sum + s.percentage, 0) / validScores.length 
          : 0;
        
        efficiency = Math.round((completionRate * 0.6) + (avgScore * 0.4));
      }

      // Learning Velocity (sessions per week)
      const thisWeekSessions = sessionsRes.data?.filter((s: any) => {
        const sessionDate = s.planned_start?.split('T')[0];
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      }).length || 0;
      const lastWeekSessions = sessionsRes.data?.filter((s: any) => {
        const sessionDate = s.planned_start?.split('T')[0];
        return sessionDate >= lastWeekStart && sessionDate <= lastWeekEnd;
      }).length || 0;
      const learningVelocity = lastWeekSessions > 0 
        ? Math.round(((thisWeekSessions - lastWeekSessions) / lastWeekSessions) * 100) 
        : 0;

      // Study Habits
      const habits: any = {};
      if (sessionsRes.data) {
        const hourCounts = new Map();
        sessionsRes.data.filter((s: any) => s.status === 'completed').forEach((s: any) => {
          if (s.planned_start) {
            const hour = new Date(s.planned_start).getHours();
            hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
          }
        });
        const peakHour = Array.from(hourCounts.entries()).sort((a, b) => b[1] - a[1])[0];
        habits.peakHour = peakHour ? peakHour[0] : null;
        habits.totalSessions = sessionsRes.data.length;
      }

      // Milestones
      const milestones: any[] = [];
      if (sessionsRes.data) {
        const totalSessions = sessionsRes.data.filter((s: any) => s.status === 'completed').length;
        const milestonesList = [10, 25, 50, 100, 250, 500];
        const nextMilestone = milestonesList.find(m => m > totalSessions);
        if (nextMilestone) {
          milestones.push({ target: nextMilestone, current: totalSessions, type: "sessions" });
        }
      }

      // Recommendations
      const recommendations: any[] = [];
      if (timeDistribution.length > 0) {
        const leastStudied = timeDistribution[timeDistribution.length - 1];
        if (leastStudied.percentage < 10) {
          recommendations.push({ type: "subject", message: `Focus more on ${leastStudied.subject}`, priority: "medium" });
        }
      }
      if (efficiency < 70) {
        recommendations.push({ type: "efficiency", message: "Try to complete more study sessions", priority: "high" });
      }

      setDashboardData({
        todayFocus,
        weeklyTrend,
        timeDistribution: timeDistribution.slice(0, 5),
        efficiency,
        learningVelocity,
        habits,
        milestones,
        recommendations
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <OwlMascot type="sleeping" size="xl" glow />
          <p className="text-muted-foreground animate-pulse text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <DashboardFloatingElements />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        
        <SimpleOnboarding />
        <Header onNewTimetable={() => setShowOnboarding(true)} />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 relative z-10">
          {!hasData && !showOnboarding ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12 space-y-8"
            >
              <MotivationalBadge isNewUser />
              <OwlMascot type="waving" size="2xl" glow />
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Welcome to Vistara!
                </h2>
                <p className="text-muted-foreground text-lg max-w-md">
                  Create your personalized study timetable to start your journey.
                </p>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  onClick={() => setShowOnboarding(true)}
                  className="gap-2 rounded-full px-10 py-6 text-lg bg-gradient-to-r from-primary to-accent shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all"
                >
                  <Plus className="h-6 w-6" />
                  Get Started
                </Button>
              </motion.div>
            </motion.div>
          ) : showOnboarding ? (
            <OnboardingWizard
              onComplete={() => {
                setShowOnboarding(false);
                setHasData(true);
                toast.success("Setup complete! You can now view your timetable.");
              }}
              onCancel={() => setShowOnboarding(false)}
            />
          ) : (
            <div className="space-y-4 animate-fade-in">
              {/* Welcome Banner */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <Card className="border-0 shadow-xl bg-gradient-to-r from-primary via-primary/90 to-accent overflow-hidden">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center justify-between gap-6">
                      {/* Left Side - Text Content */}
                      <div className="flex-1">
                        <p className="text-primary-foreground/70 text-sm md:text-base mb-1 font-medium">
                          Welcome back
                        </p>
                        <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                          Good to see you, {getFirstName()}!
                        </h1>
                      </div>

                      {/* Right Side - Mascot & Button */}
                      <div className="flex items-center gap-4">
                        {/* Mascot */}
                        <div className="hidden md:block">
                          <OwlMascot type="happy" size="lg" />
                        </div>
                        
                        {/* Start Studying Button */}
                        <Button
                          onClick={() => navigate("/timetables")}
                          className="gap-2 bg-white text-primary hover:bg-white/90 shadow-lg rounded-xl px-6 py-6 text-base font-semibold"
                          size="lg"
                        >
                          <Zap className="h-5 w-5" />
                          Start Studying
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Top Metrics Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Efficiency Score */}
              <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                  <Card className="border-2 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Gauge className="h-5 w-5 text-blue-500" />
                        <span className="text-xs text-muted-foreground">Efficiency</span>
                      </div>
                      <div className="text-3xl font-bold">{dashboardData.efficiency}%</div>
                      <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${dashboardData.efficiency}%` }}
                        />
                    </div>
                    </CardContent>
                  </Card>
              </motion.div>

                {/* Learning Velocity */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <Card className="border-2 bg-gradient-to-br from-green-500/10 to-green-600/5">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Rocket className="h-5 w-5 text-green-500" />
                        <span className="text-xs text-muted-foreground">Velocity</span>
                      </div>
                      <div className="text-3xl font-bold flex items-center gap-1">
                        {dashboardData.learningVelocity > 0 ? (
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        ) : dashboardData.learningVelocity < 0 ? (
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        ) : null}
                        {dashboardData.learningVelocity > 0 ? '+' : ''}{dashboardData.learningVelocity}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">vs last week</p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Peak Study Hour */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-2 bg-gradient-to-br from-purple-500/10 to-purple-600/5">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Clock className="h-5 w-5 text-purple-500" />
                        <span className="text-xs text-muted-foreground">Peak Hour</span>
                      </div>
                      <div className="text-3xl font-bold">
                        {dashboardData.habits.peakHour !== null ? `${dashboardData.habits.peakHour}:00` : '—'}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Most productive time</p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Total Sessions */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <Card className="border-2 bg-gradient-to-br from-orange-500/10 to-orange-600/5">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Activity className="h-5 w-5 text-orange-500" />
                        <span className="text-xs text-muted-foreground">Sessions</span>
                      </div>
                      <div className="text-3xl font-bold">{dashboardData.habits.totalSessions || 0}</div>
                      <p className="text-xs text-muted-foreground mt-1">All time</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                {/* Left Column */}
                <div className="lg:col-span-8 space-y-3">
                  {/* Today's Focus */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="border-2">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <TargetIcon className="h-5 w-5 text-primary" />
                          <h2 className="text-lg font-bold">Today's Focus</h2>
                        </div>
                        {dashboardData.todayFocus.length > 0 ? (
                          <div className="space-y-2">
                            {dashboardData.todayFocus.map((item: any, i: number) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  {item.type === 'homework' ? (
                                    <BookOpen className="h-4 w-4 text-blue-500" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                  )}
                                  <div>
                                    <p className="font-medium text-sm">{item.title}</p>
                                    <p className="text-xs text-muted-foreground">{item.subject || item.date}</p>
                                  </div>
                                </div>
                                <Badge variant={item.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                                  {item.priority}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No urgent tasks today. Great job!</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Weekly Performance Trend */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <Card className="border-2">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                          <h2 className="text-lg font-bold">Weekly Trend</h2>
                        </div>
                        <div className="space-y-2">
                          {dashboardData.weeklyTrend.map((day: any, i: number) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="w-16 text-xs text-muted-foreground">
                                {format(parseISO(day.date), 'EEE')}
                              </div>
                              <div className="flex-1 flex items-center gap-2">
                                <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                                    style={{ width: `${Math.min((day.hours / 4) * 100, 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium w-12 text-right">
                                  {day.hours.toFixed(1)}h
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                </motion.div>

                  {/* Time Distribution */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card className="border-2">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <PieChart className="h-5 w-5 text-purple-500" />
                          <h2 className="text-lg font-bold">Time Distribution</h2>
                        </div>
                        {dashboardData.timeDistribution.length > 0 ? (
                          <div className="space-y-3">
                            {dashboardData.timeDistribution.map((item: any, i: number) => (
                              <div key={i}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium">{item.subject}</span>
                                  <span className="text-xs text-muted-foreground">{item.hours.toFixed(1)}h ({item.percentage}%)</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                                    style={{ width: `${item.percentage}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No study data yet</p>
                        )}
                      </CardContent>
                    </Card>
                </motion.div>
              </div>

                {/* Right Column */}
                <div className="lg:col-span-4 space-y-3">
                  {/* Milestones */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="border-2 bg-gradient-to-br from-yellow-500/10 to-amber-500/5">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <Award className="h-5 w-5 text-yellow-500" />
                          <h2 className="text-lg font-bold">Milestones</h2>
                        </div>
                        {dashboardData.milestones.length > 0 ? (
                          <div className="space-y-3">
                            {dashboardData.milestones.map((milestone: any, i: number) => (
                              <div key={i}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium">{milestone.target} Sessions</span>
                                  <span className="text-xs text-muted-foreground">{milestone.current}/{milestone.target}</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full transition-all"
                                    style={{ width: `${(milestone.current / milestone.target) * 100}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Keep studying to unlock milestones!</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Recommendations */}
              <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                    <Card className="border-2 bg-gradient-to-br from-blue-500/10 to-cyan-500/5">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <Lightbulb className="h-5 w-5 text-blue-500" />
                          <h2 className="text-lg font-bold">Recommendations</h2>
                        </div>
                        {dashboardData.recommendations.length > 0 ? (
                          <div className="space-y-2">
                            {dashboardData.recommendations.map((rec: any, i: number) => (
                              <div key={i} className="p-3 bg-background rounded-lg border border-border">
                                <p className="text-sm">{rec.message}</p>
                                <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'} className="mt-2 text-xs">
                                  {rec.priority} priority
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">You're doing great! No recommendations at this time.</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Mascot Card */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card className="border-2 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 overflow-hidden">
                      <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
                        <OwlMascot type="thumbsup" size="xl" glow />
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
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
