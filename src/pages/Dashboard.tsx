import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Play } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import OnboardingWizard from "@/components/OnboardingWizard";
import { TodayOverviewCard } from "@/components/dashboard/TodayOverviewCard";
import { ProgressCard } from "@/components/dashboard/ProgressCard";
import { AIInsightsCard } from "@/components/dashboard/AIInsightsCard";
import WelcomeModal from "@/components/WelcomeModal";
import GuidedOnboarding from "@/components/tours/GuidedOnboarding";
import PageTransition from "@/components/PageTransition";

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
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <WelcomeModal />
        <GuidedOnboarding />
        
        <Header onNewTimetable={() => setShowOnboarding(true)} />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {!hasData && !showOnboarding ? (
            /* Empty state - no data yet */
            <div className="flex flex-col items-center justify-center py-16 space-y-6 animate-fade-in">
              <div className="text-center space-y-3">
                <h2 className="text-2xl sm:text-3xl font-display font-bold gradient-text">
                  Welcome to Vistara!
                </h2>
                <p className="text-muted-foreground max-w-md">
                  Create your personalized study timetable to get started.
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => setShowOnboarding(true)}
                className="gap-2 rounded-full px-8"
              >
                <Plus className="h-5 w-5" />
                Get Started
              </Button>
            </div>
          ) : showOnboarding ? (
            /* Onboarding wizard */
            <OnboardingWizard
              onComplete={() => {
                setShowOnboarding(false);
                setHasData(true);
                toast.success("Setup complete! You can now view your timetable.");
              }}
              onCancel={() => setShowOnboarding(false)}
            />
          ) : (
            /* Main dashboard content */
            <div className="space-y-6 animate-fade-in">
              {/* Header Section - Compact */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-display font-bold">
                    {getGreeting()}, {getFirstName()}!
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    Ready to make today count?
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/timetables")}
                    className="gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    View Timetable
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate("/timetables")}
                    className="gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Start Session
                  </Button>
                </div>
              </div>

              {/* Today Overview */}
              <TodayOverviewCard userId={user?.id || ""} />

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Progress Card */}
                <ProgressCard userId={user?.id || ""} />

                {/* AI Insights Card */}
                <AIInsightsCard userId={user?.id || ""} />
              </div>
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
