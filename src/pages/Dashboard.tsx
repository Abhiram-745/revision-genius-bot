import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Target, Trophy, Calendar, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import OnboardingWizard from "@/components/OnboardingWizard";
import TimetableList from "@/components/TimetableList";
import { HomeworkList } from "@/components/HomeworkList";
import { WeeklyGoalsWidget } from "@/components/WeeklyGoalsWidget";
import { UpcomingDeadlines } from "@/components/UpcomingDeadlines";
import { ProgressSection } from "@/components/dashboard/ProgressSection";
import { RecentActivityWidget } from "@/components/dashboard/RecentActivityWidget";
import { EventsWidget } from "@/components/EventsWidget";
import { DashboardInsightsPanel } from "@/components/dashboard/DashboardInsightsPanel";
import { DashboardGrid, WidgetConfig } from "@/components/dashboard/DashboardGrid";
import { DEFAULT_SECTIONS, DashboardSection } from "@/components/DashboardCustomizer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useUserRole } from "@/hooks/useUserRole";
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
  const [dashboardSections, setDashboardSections] = useState<DashboardSection[]>(DEFAULT_SECTIONS);
  const [containerWidth, setContainerWidth] = useState(1200);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: userRole } = useUserRole();

  // Track container width for grid layout
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Load dashboard preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("dashboard_preferences")
          .eq("id", currentUser.id)
          .single();

        if (profileData?.dashboard_preferences) {
          try {
            const prefs = profileData.dashboard_preferences as unknown as DashboardSection[];
            if (Array.isArray(prefs) && prefs.length > 0 && prefs[0].id) {
              // Ensure all required properties exist (migration from old format)
              const migratedPrefs = prefs.map((p, index) => ({
                ...DEFAULT_SECTIONS.find(d => d.id === p.id) || DEFAULT_SECTIONS[index],
                ...p,
              }));
              setDashboardSections(migratedPrefs);
              return;
            }
          } catch (e) {
            console.error("Error parsing dashboard preferences", e);
          }
        }
      }
      
      // Fallback to localStorage
      const saved = localStorage.getItem("dashboardSections");
      if (saved) {
        try {
          const savedSections = JSON.parse(saved) as DashboardSection[];
          // Ensure all required properties exist
          const migratedPrefs = savedSections.map((p, index) => ({
            ...DEFAULT_SECTIONS.find(d => d.id === p.id) || DEFAULT_SECTIONS[index],
            ...p,
          }));
          setDashboardSections(migratedPrefs);
        } catch {
          setDashboardSections(DEFAULT_SECTIONS);
        }
      }
    };

    fetchPreferences();
  }, []);

  // Save dashboard preferences
  const savePreferences = useCallback(async (updated: DashboardSection[]) => {
    localStorage.setItem("dashboardSections", JSON.stringify(updated));
    
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      await supabase
        .from("profiles")
        .update({ dashboard_preferences: updated as any })
        .eq("id", currentUser.id);
    }
  }, []);

  const handleLayoutChange = useCallback((widgets: WidgetConfig[]) => {
    const updated = dashboardSections.map(section => {
      const widget = widgets.find(w => w.id === section.id);
      if (widget) {
        return {
          ...section,
          x: widget.x,
          y: widget.y,
          w: widget.w,
          h: widget.h,
          enabled: widget.enabled,
        };
      }
      return section;
    });
    setDashboardSections(updated);
    savePreferences(updated);
  }, [dashboardSections, savePreferences]);

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

  // Render widget content based on ID
  const renderWidget = useCallback((widgetId: string) => {
    switch (widgetId) {
      case "progress":
        return (
          <div className="space-y-4 h-full overflow-auto">
            <ProgressSection userId={user?.id || ""} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <WeeklyGoalsWidget userId={user?.id || ""} />
              <RecentActivityWidget userId={user?.id || ""} />
            </div>
            <UpcomingDeadlines userId={user?.id || ""} />
          </div>
        );
      case "events":
        return <EventsWidget />;
      case "analytics":
        return <DashboardInsightsPanel userId={user?.id || ""} />;
      case "timetables":
        return (
          <div className="space-y-4 h-full">
            <div className="flex items-center justify-end">
              <Button
                onClick={() => setShowOnboarding(true)}
                className="gap-2 rounded-full shadow-md hover:-translate-y-0.5 transition-all"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                New Timetable
              </Button>
            </div>
            <TimetableList userId={user?.id || ""} />
          </div>
        );
      case "homework":
        return <HomeworkList userId={user?.id || ""} />;
      default:
        return null;
    }
  }, [user?.id]);

  // Convert sections to widget configs with icons
  const widgetConfigs: WidgetConfig[] = dashboardSections.map(section => ({
    ...section,
    icon: section.id === "progress" ? <Sparkles className="h-4 w-4 text-white" /> :
          section.id === "events" ? <Calendar className="h-4 w-4 text-white" /> :
          section.id === "analytics" ? <Target className="h-4 w-4 text-white" /> :
          section.id === "timetables" ? <Calendar className="h-4 w-4 text-white" /> :
          section.id === "homework" ? <CheckCircle2 className="h-4 w-4 text-white" /> :
          undefined,
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <WelcomeModal />
        <GuidedOnboarding />
        
        {/* Floating background elements - hidden on mobile */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none hidden md:block">
          <div className="floating-blob top-20 -left-32 w-64 md:w-96 h-64 md:h-96 bg-primary/10 animate-float"></div>
          <div className="floating-blob top-40 right-10 w-72 md:w-[500px] h-72 md:h-[500px] bg-secondary/15 animate-float-delayed"></div>
          <div className="floating-blob bottom-20 left-1/3 w-48 md:w-80 h-48 md:h-80 bg-accent/10 animate-float-slow"></div>
        </div>

        <Header onNewTimetable={() => setShowOnboarding(true)} />

        <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8 relative z-10" ref={containerRef}>
          {!hasData && !showOnboarding ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-8 animate-fade-in">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary/20 border border-secondary/30 shadow-sm">
                  <Sparkles className="h-4 w-4 text-secondary" />
                  <span className="text-sm font-medium text-secondary-foreground">Welcome to Study Planner</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold gradient-text">
                  Let's Get Started!
                </h2>
                <p className="text-muted-foreground max-w-lg text-lg leading-relaxed">
                  Create your personalized study timetable. We'll ask about your GCSE subjects,
                  topics, and test dates to generate the perfect revision schedule.
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => setShowOnboarding(true)}
                className="gap-2 text-base md:text-lg px-6 py-5 md:px-10 md:py-7 rounded-full"
              >
                <Plus className="h-5 w-5" />
                Get Started
              </Button>
            </div>
          ) : showOnboarding ? (
            <OnboardingWizard
              onComplete={() => {
                setShowOnboarding(false);
                setHasData(true);
                toast.success("Setup complete! You can now generate timetables.");
              }}
              onCancel={() => setShowOnboarding(false)}
            />
          ) : (
            <div className="space-y-8 animate-fade-in">
              {/* Welcome Section */}
              <div className="dashboard-greeting relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-warm border border-primary/20 p-4 sm:p-6 md:p-8 lg:p-10 shadow-lg">
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                    <div className="space-y-2 sm:space-y-3 md:space-y-4 flex-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-primary/10 border border-primary/20">
                        <span className="text-xs font-medium text-primary">🔥 You're crushing it!</span>
                      </div>
                      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold">
                        {getGreeting()}, {getFirstName()}!
                      </h1>
                      <p className="text-foreground/70 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl">
                        Ready to make today count? Let's tackle your study goals together 💪
                      </p>
                    </div>
                    <div className="hidden lg:flex items-center gap-3">
                      <div className="flex flex-col items-center p-5 bg-card/80 backdrop-blur-sm rounded-xl border border-border/60 shadow-sm hover:-translate-y-1 transition-all duration-300">
                        <Target className="h-7 w-7 text-primary mb-2" />
                        <span className="text-xs text-muted-foreground font-medium">Goals</span>
                      </div>
                      <div className="flex flex-col items-center p-5 bg-card/80 backdrop-blur-sm rounded-xl border border-border/60 shadow-sm hover:-translate-y-1 transition-all duration-300">
                        <Trophy className="h-7 w-7 text-accent mb-2" />
                        <span className="text-xs text-muted-foreground font-medium">Achievements</span>
                      </div>
                      <div className="flex flex-col items-center p-5 bg-card/80 backdrop-blur-sm rounded-xl border border-border/60 shadow-sm hover:-translate-y-1 transition-all duration-300">
                        <Calendar className="h-7 w-7 text-secondary mb-2" />
                        <span className="text-xs text-muted-foreground font-medium">Schedule</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Decorative gradient blobs - hidden on mobile */}
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/15 rounded-full blur-3xl hidden md:block"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/15 rounded-full blur-3xl hidden md:block"></div>
              </div>

              {/* Canvas-based Dashboard Grid */}
              <DashboardGrid
                widgets={widgetConfigs}
                onLayoutChange={handleLayoutChange}
                renderWidget={renderWidget}
                containerWidth={containerWidth}
              />

              {/* Pricing Cards Section */}
              <div className="py-16 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
                </div>

                <div className="relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center space-y-4 mb-12"
                  >
                    <h2 className="text-3xl sm:text-4xl font-display font-bold gradient-text">
                      {userRole === "paid" ? "Your Current Plan" : "Upgrade Your Experience"}
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                      {userRole === "paid" 
                        ? "You're on the Premium plan with unlimited access to all features"
                        : "Unlock unlimited AI-powered study planning"}
                    </p>
                  </motion.div>

                  <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Free Plan Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 50, rotateX: 10 }}
                      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      whileHover={{ y: -10, transition: { duration: 0.3 } }}
                      className="relative"
                      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                    >
                      {userRole === "free" && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                          <div className="bg-muted text-muted-foreground px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                            Current Plan
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-muted/10 rounded-3xl blur-xl opacity-50" />
                      <Card className={`relative border-2 ${userRole === "free" ? "border-primary" : ""} bg-card/95 backdrop-blur-sm shadow-xl transition-all duration-500 h-full`}>
                        <CardHeader className="space-y-6 pb-6">
                          <div className="inline-flex items-center gap-2 text-muted-foreground">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                              <Sparkles className="w-6 h-6" />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <CardTitle className="text-2xl font-display">Free</CardTitle>
                            <div className="flex items-baseline gap-2">
                              <span className="text-5xl font-bold">£0</span>
                              <span className="text-lg text-muted-foreground">/month</span>
                            </div>
                            <CardDescription className="text-base">
                              Try out AI-powered study planning
                            </CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                <CheckCircle2 className="h-3 w-3 text-primary" />
                              </div>
                              <span className="text-sm">1 AI timetable creation</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                <CheckCircle2 className="h-3 w-3 text-primary" />
                              </div>
                              <span className="text-sm">1 AI insights generation</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                <CheckCircle2 className="h-3 w-3 text-primary" />
                              </div>
                              <span className="text-sm">Basic study tracking</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                <CheckCircle2 className="h-3 w-3 text-primary" />
                              </div>
                              <span className="text-sm">Community features</span>
                            </li>
                          </ul>
                          {userRole === "free" && (
                            <Button variant="outline" className="w-full" disabled>
                              Current Plan
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Premium Plan Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 50, rotateX: 10 }}
                      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      whileHover={{ y: -10, transition: { duration: 0.3 } }}
                      className="relative"
                      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                    >
                      {userRole === "paid" && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                          <div className="bg-gradient-primary text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                            Current Plan
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/20 rounded-3xl blur-xl opacity-70" />
                      <Card className={`relative border-2 ${userRole === "paid" ? "border-primary" : "border-primary/50"} bg-card/95 backdrop-blur-sm shadow-xl transition-all duration-500 h-full`}>
                        <CardHeader className="space-y-6 pb-6">
                          <div className="inline-flex items-center gap-2">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center">
                              <Trophy className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-2xl font-display">Premium</CardTitle>
                              <span className="px-2 py-1 text-xs font-semibold bg-gradient-primary text-white rounded-full">
                                POPULAR
                              </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-5xl font-bold gradient-text">£4.99</span>
                              <span className="text-lg text-muted-foreground">/month</span>
                            </div>
                            <CardDescription className="text-base">
                              Unlimited access to all features
                            </CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                <CheckCircle2 className="h-3 w-3 text-primary" />
                              </div>
                              <span className="text-sm font-medium">Unlimited AI timetables</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                <CheckCircle2 className="h-3 w-3 text-primary" />
                              </div>
                              <span className="text-sm font-medium">Unlimited AI insights</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                <CheckCircle2 className="h-3 w-3 text-primary" />
                              </div>
                              <span className="text-sm font-medium">AI-powered test analysis</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                <CheckCircle2 className="h-3 w-3 text-primary" />
                              </div>
                              <span className="text-sm font-medium">Priority support</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                <CheckCircle2 className="h-3 w-3 text-primary" />
                              </div>
                              <span className="text-sm font-medium">Early access to new features</span>
                            </li>
                          </ul>
                          {userRole === "paid" ? (
                            <Button variant="outline" className="w-full" disabled>
                              Current Plan
                            </Button>
                          ) : (
                            <Button className="w-full bg-gradient-primary hover:opacity-90 transition-opacity">
                              Upgrade Now
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
