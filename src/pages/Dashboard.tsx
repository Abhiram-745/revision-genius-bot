import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Play, ChevronRight, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import OnboardingWizard from "@/components/OnboardingWizard";
import { TodayOverviewCard } from "@/components/dashboard/TodayOverviewCard";
import { CompactStreakCard } from "@/components/dashboard/CompactStreakCard";
import { CompactDeadlinesCard } from "@/components/dashboard/CompactDeadlinesCard";
import { WeeklyGoalCard } from "@/components/dashboard/WeeklyGoalCard";
import { AIInsightsCard } from "@/components/dashboard/AIInsightsCard";
import SimpleOnboarding from "@/components/onboarding/SimpleOnboarding";
import PageTransition from "@/components/PageTransition";
import { OwlMascot } from "@/components/mascot/OwlMascot";
import { MascotMessage } from "@/components/mascot/MascotMessage";
import { motion } from "framer-motion";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ full_name?: string } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [loading, setLoading] = useState(true);

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
    const [subjectsResult, timetablesResult, profileResult] = await Promise.all([
      supabase.from("subjects").select("id").eq("user_id", userId).limit(1),
      supabase.from("timetables").select("id").eq("user_id", userId).limit(1),
      supabase.from("profiles").select("full_name").eq("id", userId).single()
    ]);
    
    const hasSubjects = subjectsResult.data && subjectsResult.data.length > 0;
    const hasTimetables = timetablesResult.data && timetablesResult.data.length > 0;
    
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
          <OwlMascot type="sleeping" size="lg" />
          <p className="text-muted-foreground animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <SimpleOnboarding />
        <Header onNewTimetable={() => setShowOnboarding(true)} />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {!hasData && !showOnboarding ? (
            /* Empty state with owl */
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 space-y-6"
            >
              <MascotMessage
                type="waving"
                message="Welcome to Vistara!"
                subMessage="Create your personalized study timetable to get started."
                size="lg"
              />
              <Button
                size="lg"
                onClick={() => setShowOnboarding(true)}
                className="gap-2 rounded-full px-8"
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
                toast.success("Setup complete! You can now view your timetable.");
              }}
              onCancel={() => setShowOnboarding(false)}
            />
          ) : (
            /* Main dashboard - F/Z reading pattern */
            <div className="space-y-5 animate-fade-in">
              {/* Hero Section - Greeting + Primary CTA */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 border border-border/50"
              >
                <div className="flex items-center gap-4">
                  <OwlMascot type="waving" size="sm" />
                  <div>
                    <h1 className="text-xl sm:text-2xl font-display font-bold">
                      {getGreeting()}, {getFirstName()}!
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Ready to make today count?
                    </p>
                  </div>
                </div>
                
                {/* Primary CTA - Large and prominent */}
                <Button
                  size="lg"
                  onClick={() => navigate("/timetables")}
                  className="gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-lg hover:shadow-xl transition-all"
                >
                  <Play className="h-5 w-5" />
                  Start Session
                </Button>
              </motion.div>

              {/* Quick Actions - Simplified to 3 primary + overflow */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  className="flex flex-col h-auto py-4 gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all"
                  onClick={() => navigate("/agenda")}
                >
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="text-xs font-medium">Agenda</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col h-auto py-4 gap-2 hover:bg-secondary/5 hover:border-secondary/30 transition-all"
                  onClick={() => navigate("/practice")}
                >
                  <Sparkles className="h-5 w-5 text-secondary" />
                  <span className="text-xs font-medium">Practice</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col h-auto py-4 gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all"
                  onClick={() => navigate("/timetables")}
                >
                  <Plus className="h-5 w-5 text-primary" />
                  <span className="text-xs font-medium">Timetable</span>
                </Button>
              </div>

              {/* Today Overview - Full width, most important */}
              <TodayOverviewCard userId={user?.id || ""} />

              {/* Key Metrics Row - 3 columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <WeeklyGoalCard userId={user?.id || ""} />
                <CompactStreakCard userId={user?.id || ""} />
                <CompactDeadlinesCard userId={user?.id || ""} />
              </div>

              {/* AI Insights - Full width at bottom */}
              <AIInsightsCard userId={user?.id || ""} />

              {/* View All Link */}
              <Card className="border-dashed border-border/50 bg-muted/20">
                <CardContent className="p-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-muted-foreground hover:text-foreground"
                    onClick={() => navigate("/insights")}
                  >
                    <span className="flex items-center gap-2">
                      <OwlMascot type="chart" size="sm" animate={false} />
                      <span>View all insights & analytics</span>
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
