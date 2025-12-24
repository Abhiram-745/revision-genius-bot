import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Play, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import OnboardingWizard from "@/components/OnboardingWizard";
import { AIInsightsCard } from "@/components/dashboard/AIInsightsCard";
import { UnifiedProgressSection } from "@/components/dashboard/UnifiedProgressSection";
import { RecentActivitySection } from "@/components/dashboard/RecentActivitySection";
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
    
    // Check if premium was just granted (within last 30 seconds)
    if (premiumResult.data && premiumResult.data.length > 0) {
      const grantTime = new Date(premiumResult.data[0].created_at).getTime();
      const now = Date.now();
      const timeDiff = now - grantTime;
      // Show notification if premium was granted within 30 seconds
      if (timeDiff < 30000) {
        const shownKey = `premium_shown_${premiumResult.data[0].id}`;
        if (!localStorage.getItem(shownKey)) {
          localStorage.setItem(shownKey, 'true');
          setShowPremiumNotification(true);
        }
      }
    }
    
    // Calculate current streak
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
    setLoading(false);
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
        {/* Floating background elements */}
        <DashboardFloatingElements />
        
        {/* Gradient background overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        
        <SimpleOnboarding />
        <Header onNewTimetable={() => setShowOnboarding(true)} />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 relative z-10">
          {!hasData && !showOnboarding ? (
            /* Empty state with large owl */
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
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
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
            /* Main dashboard with enhanced visuals */
            <div className="space-y-6 animate-fade-in">
              {/* Hero Section with Large Mascot */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-accent/10 border border-border/50 shadow-xl"
              >
                {/* Decorative gradient orbs */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
                
                <div className="relative p-6 sm:p-8">
                  {/* Motivational Badge */}
                  <div className="flex justify-center mb-4">
                    <MotivationalBadge streak={streak} />
                  </div>
                  
                  <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                    {/* Large Owl Mascot */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, type: "spring", bounce: 0.4 }}
                      className="flex-shrink-0"
                    >
                      <OwlMascot type="happy" size="xl" glow />
                    </motion.div>
                    
                    {/* Greeting & CTA */}
                    <div className="flex-1 text-center lg:text-left space-y-4">
                      <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
                          {getGreeting()}, {getFirstName()}! 👋
                        </h1>
                        <p className="text-muted-foreground text-lg mt-2">
                          Ready to make today count? Let's crush some goals!
                        </p>
                      </div>
                      
                      {/* Primary CTA */}
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="inline-block"
                      >
                        <Button
                          size="lg"
                          onClick={() => navigate("/timetables")}
                          className="gap-3 px-8 py-6 text-lg bg-gradient-to-r from-primary to-accent shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all rounded-2xl"
                        >
                          <Play className="h-6 w-6" />
                          Start Study Session
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Unified Progress Section - Flowing layout */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <UnifiedProgressSection userId={user?.id || ""} />
              </motion.div>

              {/* Two Column Layout - Activity & AI Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <RecentActivitySection userId={user?.id || ""} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <AIInsightsCard userId={user?.id || ""} />
                </motion.div>
              </div>

              {/* View All Link with Owl */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-dashed border-border/50 bg-gradient-to-r from-muted/30 to-muted/10 hover:from-muted/40 hover:to-muted/20 transition-all">
                  <CardContent className="p-4">
                    <Button
                      variant="ghost"
                      className="w-full justify-between text-muted-foreground hover:text-foreground group"
                      onClick={() => navigate("/insights")}
                    >
                      <span className="flex items-center gap-3">
                        <OwlMascot type="chart" size="sm" animate={false} />
                        <span>View all insights & analytics</span>
                      </span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}
        </main>

        {/* Premium Grant Notification */}
        <PremiumGrantNotification 
          show={showPremiumNotification} 
          onClose={() => setShowPremiumNotification(false)} 
        />
      </div>
    </PageTransition>
  );
};

export default Dashboard;
