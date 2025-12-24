import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Sparkles, Calendar, Brain, Users, Home, BarChart3, BookOpen, UserPlus } from "lucide-react";
import { OwlMascot } from "@/components/mascot/OwlMascot";
import VistaraLogo from "@/components/VistaraLogo";

// Comprehensive tour covering all pages
const tourSteps = [
  {
    owl: "waving" as const,
    title: "Welcome to Vistara!",
    description: "Let me show you around your new AI-powered study companion.",
    icon: Sparkles,
    page: "/dashboard",
    highlights: [
      "AI-generated study timetables",
      "Smart progress tracking",
      "Personalized insights",
    ],
  },
  {
    owl: "happy" as const,
    title: "Your Dashboard",
    description: "This is your home base - see your progress, upcoming sessions, and quick actions.",
    icon: Home,
    page: "/dashboard",
    highlights: [
      "View your study streak",
      "Quick access to all features",
      "Daily tips & motivation",
    ],
  },
  {
    owl: "folder" as const,
    title: "Timetables",
    description: "Create AI-powered study schedules tailored to your subjects and exam dates.",
    icon: Calendar,
    page: "/timetables",
    highlights: [
      "Add your subjects & topics",
      "Set your exam dates",
      "AI generates optimal schedule",
    ],
  },
  {
    owl: "lightbulb" as const,
    title: "Practice Hub",
    description: "Test yourself with various practice methods to reinforce your learning.",
    icon: BookOpen,
    page: "/practice",
    highlights: [
      "SaveMyExams integration",
      "Physics & Maths Tutor",
      "Blurt AI practice",
    ],
  },
  {
    owl: "chart" as const,
    title: "Insights & Analytics",
    description: "Track your performance and get AI-powered recommendations.",
    icon: BarChart3,
    page: "/insights",
    highlights: [
      "Performance analytics",
      "Subject mastery tracking",
      "Study pattern analysis",
    ],
  },
  {
    owl: "checklist" as const,
    title: "Calendar & Events",
    description: "Keep track of all your commitments, exams, and homework deadlines.",
    icon: Calendar,
    page: "/calendar",
    highlights: [
      "Visual calendar view",
      "Add events & homework",
      "Never miss a deadline",
    ],
  },
  {
    owl: "magnifying" as const,
    title: "Social & Groups",
    description: "Connect with friends and study together in groups.",
    icon: Users,
    page: "/social",
    highlights: [
      "Join study groups",
      "Compete on leaderboards",
      "Share timetables",
    ],
  },
  {
    owl: "thumbsup" as const,
    title: "You're All Set!",
    description: "Create your first timetable and start your journey to exam success!",
    icon: UserPlus,
    page: "/dashboard",
    highlights: [
      "2 months free premium",
      "Unlimited timetables",
      "Full AI features",
    ],
  },
];

export const SimpleOnboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    checkFirstLogin();
  }, []);

  const checkFirstLogin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const welcomeShown = localStorage.getItem(`app_tour_complete_${user.id}`);
    if (!welcomeShown) {
      setTimeout(() => setOpen(true), 800);
    }
  };

  const handleComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      localStorage.setItem(`app_tour_complete_${user.id}`, "true");
    }
    setOpen(false);
    navigate("/dashboard");
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      // Navigate to the page for next step
      if (tourSteps[nextStep].page !== location.pathname) {
        navigate(tourSteps[nextStep].page);
      }
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      if (tourSteps[prevStep].page !== location.pathname) {
        navigate(tourSteps[prevStep].page);
      }
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const step = tourSteps[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border-none bg-transparent shadow-2xl">
        {/* Main card with gradient border effect */}
        <div className="relative rounded-2xl overflow-hidden">
          {/* Animated gradient border */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-lime-400 to-emerald-400 rounded-2xl"
            animate={{
              background: [
                "linear-gradient(135deg, #facc15, #a3e635, #34d399)",
                "linear-gradient(225deg, #34d399, #a3e635, #facc15)",
                "linear-gradient(315deg, #facc15, #a3e635, #34d399)",
              ]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          
          {/* Inner content */}
          <div className="relative m-[3px] rounded-2xl bg-background overflow-hidden">
            {/* Progress bar with gradient */}
            <div className="h-1.5 bg-muted">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-400 via-lime-400 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>

            {/* Skip button */}
            <div className="absolute top-4 right-4 z-10">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                Skip tour
              </Button>
            </div>

            <div className="p-8 space-y-6">
              {/* Header with logo */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2"
              >
                <VistaraLogo size="sm" />
                <span className="font-bold text-lg bg-gradient-to-r from-yellow-500 via-lime-500 to-emerald-500 bg-clip-text text-transparent">
                  Vistara
                </span>
              </motion.div>

              {/* Animated content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="space-y-6"
                >
                  {/* Large Owl mascot with glow effect */}
                  <div className="flex justify-center relative">
                    {/* Gradient glow behind owl */}
                    <motion.div 
                      className="absolute inset-0 flex items-center justify-center"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.4, 0.6, 0.4] 
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <div className="w-40 h-40 bg-gradient-to-br from-yellow-400/30 via-lime-400/30 to-emerald-400/30 rounded-full blur-2xl" />
                    </motion.div>
                    <OwlMascot type={step.owl} size="xl" glow />
                  </div>

                  {/* Icon badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="flex justify-center"
                  >
                    <div className="p-2 rounded-full bg-gradient-to-br from-yellow-400/20 via-lime-400/20 to-emerald-400/20 border border-lime-400/30">
                      <Icon className="h-5 w-5 text-lime-600 dark:text-lime-400" />
                    </div>
                  </motion.div>

                  {/* Title and description */}
                  <div className="text-center space-y-2">
                    <motion.h2 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-2xl font-bold bg-gradient-to-r from-yellow-600 via-lime-600 to-emerald-600 dark:from-yellow-400 dark:via-lime-400 dark:to-emerald-400 bg-clip-text text-transparent"
                    >
                      {step.title}
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      className="text-sm text-muted-foreground max-w-xs mx-auto"
                    >
                      {step.description}
                    </motion.p>
                  </div>

                  {/* Highlights with gradient accents */}
                  <div className="space-y-2">
                    {step.highlights.map((highlight, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + idx * 0.08 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-yellow-500/10 via-lime-500/5 to-emerald-500/10 border border-lime-500/20"
                      >
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-yellow-400 to-lime-400 flex-shrink-0" />
                        <span className="text-sm font-medium">{highlight}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>

                {/* Step indicators with gradient */}
                <div className="flex gap-2">
                  {tourSteps.map((_, idx) => (
                    <motion.div
                      key={idx}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentStep 
                          ? "w-6 bg-gradient-to-r from-yellow-400 via-lime-400 to-emerald-400" 
                          : idx < currentStep
                          ? "w-2 bg-lime-400/60"
                          : "w-2 bg-muted-foreground/20"
                      }`}
                      animate={{ 
                        scale: idx === currentStep ? 1 : 0.85,
                      }}
                    />
                  ))}
                </div>

                <Button
                  size="sm"
                  onClick={handleNext}
                  className="gap-1 bg-gradient-to-r from-yellow-500 via-lime-500 to-emerald-500 hover:from-yellow-600 hover:via-lime-600 hover:to-emerald-600 text-white shadow-lg shadow-lime-500/25"
                >
                  {currentStep < tourSteps.length - 1 ? (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Get Started
                      <Sparkles className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleOnboarding;
