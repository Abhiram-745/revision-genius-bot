import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Play, ChevronRight, Users, Target, Zap, Calendar, BookOpen, Clock, Flame, TrendingUp, Award } from "lucide-react";
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
      const [subjectsResult, timetablesResult, profileResult, streakResult, premiumResult, sessionsResult, activityResult, achievementsResult] = await Promise.all([
        supabase.from("subjects").select("id").eq("user_id", userId).limit(1),
        supabase.from("timetables").select("id, schedule").eq("user_id", userId).order("created_at", { ascending: false }).limit(1),
        supabase.from("profiles").select("full_name").eq("id", userId).single(),
        supabase.from("study_streaks").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(7),
        supabase.from("premium_grants").select("id, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(1),
        supabase.from("study_sessions").select("*").eq("user_id", userId).gte("planned_start", new Date().toISOString().split('T')[0]).order("planned_start", { ascending: true }).limit(5),
        supabase.from("study_sessions").select("*").eq("user_id", userId).eq("status", "completed").order("actual_end", { ascending: false }).limit(5),
        supabase.from("user_achievements").select("*, achievements(*)").eq("user_id", userId).order("unlocked_at", { ascending: false }).limit(3)
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
      }

      setRecentActivity(activityResult.data || []);
      setAchievements(achievementsResult.data || []);
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
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <SimpleOnboarding />
        <Header onNewTimetable={() => setShowOnboarding(true)} />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {!hasData && !showOnboarding ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 space-y-8"
            >
              <OwlMascot type="waving" size="2xl" glow />
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
            <div className="space-y-6">
              {/* Hero Section - Floating Greeting Card */}
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
                        <OwlMascot type="happy" size="lg" glow />
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

              {/* Your Focus - Today Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                      Today's Focus
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sessionsToday.length > 0 ? (
                      <div className="space-y-3">
                        {sessionsToday.map((session, i) => (
                          <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <BookOpen className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{session.subject}</p>
                              {session.topic && <p className="text-sm text-muted-foreground truncate">{session.topic}</p>}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{session.duration}m</span>
                            </div>
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          className="w-full gap-2" 
                          onClick={() => navigate("/timetables")}
                        >
                          View Full Schedule
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-8 gap-4">
                        <OwlMascot type="folder" size="md" animate={false} />
                        <div className="text-center">
                          <p className="font-medium">No sessions today</p>
                          <p className="text-sm text-muted-foreground">Create a timetable to get started</p>
                        </div>
                        <Button onClick={() => setShowOnboarding(true)} className="gap-2">
                          <Plus className="h-4 w-4" />
                          Create Timetable
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Progress Overview - Simplified */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              >
                {[
                  { label: "This Week", value: `${weeklyHours}h`, icon: Clock, color: "text-blue-500" },
                  { label: "Streak", value: streak || 0, icon: Flame, color: "text-orange-500" },
                  { label: "Sessions", value: recentActivity.length, icon: Target, color: "text-emerald-500" },
                  { label: "Achievements", value: achievements.length, icon: Award, color: "text-violet-500" },
                ].map((stat, i) => (
                  <Card key={i} className="p-4 border shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                        <stat.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </motion.div>

              {/* Quick Navigation */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              >
                {[
                  { icon: Target, label: "Practice", path: "/practice", desc: "Test your knowledge" },
                  { icon: TrendingUp, label: "Insights", path: "/insights", desc: "View analytics" },
                  { icon: Calendar, label: "Calendar", path: "/calendar", desc: "Manage events" },
                  { icon: Users, label: "Social", path: "/social", desc: "Study together" },
                ].map((item, i) => (
                  <Card 
                    key={item.label}
                    className="p-4 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
                    onClick={() => navigate(item.path)}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="p-2 rounded-lg bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </motion.div>

              {/* Two Column - AI Insights & Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <AIInsightsCard userId={user?.id || ""} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="border shadow-sm h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Zap className="h-5 w-5 text-primary" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentActivity.length > 0 ? (
                        <div className="space-y-3">
                          {recentActivity.slice(0, 4).map((activity, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{activity.subject}</p>
                                <p className="text-xs text-muted-foreground">
                                  {activity.actual_duration_minutes || activity.planned_duration_minutes}m completed
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center py-6 gap-3">
                          <OwlMascot type="checklist" size="sm" animate={false} />
                          <p className="text-sm text-muted-foreground text-center">
                            Complete sessions to see your activity here
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Bottom CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                <Card className="overflow-hidden bg-gradient-to-r from-primary/5 via-background to-accent/5 border shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <OwlMascot type="thumbsup" size="sm" animate={false} />
                      <div className="flex-1">
                        <p className="font-medium">Keep up the momentum!</p>
                        <p className="text-sm text-muted-foreground">
                          View detailed insights and track your progress over time.
                        </p>
                      </div>
                      <Button variant="outline" className="gap-1 shrink-0" onClick={() => navigate("/insights")}>
                        View Insights
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
