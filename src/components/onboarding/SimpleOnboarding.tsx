import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Sparkles, Calendar, Brain, Users, Home, BarChart3, BookOpen, UserPlus, X, Map } from "lucide-react";
import { OwlMascot } from "@/components/mascot/OwlMascot";
import VistaraLogo from "@/components/VistaraLogo";

// Simplified tour - quick overview with option to take full guided tour
const tourSteps = [
  {
    owl: "waving" as const,
    title: "Welcome to Vistara!",
    description: "Your AI-powered study companion is ready to help you ace your exams.",
    icon: Sparkles,
    highlights: [
      "AI-generated study timetables",
      "Smart progress tracking",
      "Personalized insights",
    ],
  },
  {
    owl: "happy" as const,
    title: "Your Dashboard",
    description: "This is your home base - see progress, upcoming sessions, and quick actions all in one place.",
    icon: Home,
    highlights: [
      "View your study streak",
      "Quick access to all features",
      "Daily tips & motivation",
    ],
  },
  {
    owl: "folder" as const,
    title: "Create Timetables",
    description: "Head to Timetables to create AI-powered study schedules tailored to your subjects.",
    icon: Calendar,
    highlights: [
      "Add your subjects & topics",
      "Set your exam dates",
      "AI generates optimal schedule",
    ],
  },
  {
    owl: "lightbulb" as const,
    title: "Practice Hub",
    description: "Test yourself with SaveMyExams, PMT, and Blurt AI to reinforce learning.",
    icon: BookOpen,
    highlights: [
      "SaveMyExams integration",
      "Physics & Maths Tutor",
      "Blurt AI practice",
    ],
  },
  {
    owl: "chart" as const,
    title: "Track Your Progress",
    description: "Insights page shows your performance analytics and AI recommendations.",
    icon: BarChart3,
    highlights: [
      "Performance analytics",
      "Subject mastery tracking",
      "Study pattern analysis",
    ],
  },
  {
    owl: "checklist" as const,
    title: "Stay Organized",
    description: "Use Calendar for events, homework, and never miss a deadline.",
    icon: Calendar,
    highlights: [
      "Visual calendar view",
      "Add events & homework",
      "Never miss a deadline",
    ],
  },
  {
    owl: "magnifying" as const,
    title: "Study Together",
    description: "Connect with friends and join study groups in the Social tab.",
    icon: Users,
    highlights: [
      "Join study groups",
      "Compete on leaderboards",
      "Share timetables",
    ],
  },
  {
    owl: "thumbsup" as const,
    title: "You're All Set!",
    description: "You have 2 months of free premium! Would you like a guided tour?",
    icon: UserPlus,
    highlights: [
      "2 months free premium",
      "Unlimited timetables",
      "Full AI features",
    ],
    showTourOption: true,
  },
];

interface SimpleOnboardingProps {
  onStartFullTour?: () => void;
}

export const SimpleOnboarding = ({ onStartFullTour }: SimpleOnboardingProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [startingFullTour, setStartingFullTour] = useState(false);

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

  const handleComplete = async (skipFullTour = true) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      localStorage.setItem(`app_tour_complete_${user.id}`, "true");
      if (!skipFullTour) {
        // Mark that they want the full guided tour
        localStorage.setItem(`start_full_tour_${user.id}`, "true");
      }
    }
    setOpen(false);
    if (!skipFullTour) {
      setStartingFullTour(true);
      onStartFullTour?.();
    }
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete(true);
    }
  };

  const handleStartGuidedTour = () => {
    handleComplete(false);
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete(true);
  };

  const step = tourSteps[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;
  const isLastStep = currentStep === tourSteps.length - 1;
  const showTourOption = (step as any).showTourOption;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-none">
        {/* Main card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-lime-400 to-emerald-500 rounded-3xl" />
          
          {/* Inner content */}
          <div className="relative m-[2px] rounded-3xl bg-card overflow-hidden">
            {/* Progress bar */}
            <div className="h-1 bg-muted">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-400 via-lime-400 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Close button */}
            <button 
              onClick={handleSkip}
              className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-muted/80 hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="p-6 pt-8 space-y-5">
              {/* Logo */}
              <div className="flex items-center justify-center gap-2">
                <VistaraLogo size="sm" />
                <span className="font-bold text-lg bg-gradient-to-r from-lime-600 to-emerald-600 dark:from-lime-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  Vistara
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  {/* Owl mascot */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-lime-400/20 to-emerald-400/20 rounded-full blur-2xl scale-150" />
                      <OwlMascot type={step.owl} size="lg" glow />
                    </div>
                  </div>

                  {/* Icon badge */}
                  <div className="flex justify-center">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-lime-400/20 to-emerald-400/20 border border-lime-500/30">
                      <Icon className="h-5 w-5 text-lime-600 dark:text-lime-400" />
                    </div>
                  </div>

                  {/* Title and description */}
                  <div className="text-center space-y-1.5">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-lime-600 to-emerald-600 dark:from-lime-400 dark:to-emerald-400 bg-clip-text text-transparent">
                      {step.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-2">
                    {step.highlights.map((highlight, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-gradient-to-r from-lime-500/10 to-emerald-500/10 border border-lime-500/20"
                      >
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-lime-400 to-emerald-400 flex-shrink-0" />
                        <span className="text-sm">{highlight}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
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

                {/* Step dots */}
                <div className="flex gap-1.5">
                  {tourSteps.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentStep 
                          ? "w-4 bg-gradient-to-r from-lime-400 to-emerald-400" 
                          : idx < currentStep
                          ? "w-1.5 bg-lime-400/60"
                          : "w-1.5 bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>

                {/* Show guided tour option on last step */}
                {showTourOption ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleNext}
                      className="gap-1"
                    >
                      Skip Tour
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleStartGuidedTour}
                      className="gap-1 bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-600 hover:to-emerald-600 text-white"
                    >
                      <Map className="h-4 w-4" />
                      Take Guided Tour
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="gap-1 bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-600 hover:to-emerald-600 text-white"
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
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleOnboarding;
