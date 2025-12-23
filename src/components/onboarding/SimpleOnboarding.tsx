import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Sparkles, Calendar, Brain, Users } from "lucide-react";
import { OwlMascot } from "@/components/mascot/OwlMascot";
import VistaraLogo from "@/components/VistaraLogo";

const steps = [
  {
    owl: "waving" as const,
    title: "Welcome to Vistara!",
    description: "Your AI-powered study companion is here to help you succeed in your exams.",
    icon: Sparkles,
    highlights: [
      "Create personalized study timetables",
      "Track your progress across subjects",
      "Get AI-powered insights",
    ],
  },
  {
    owl: "folder" as const,
    title: "Organize Your Studies",
    description: "Add your subjects, topics, and exam dates. We'll handle the rest.",
    icon: Calendar,
    highlights: [
      "Add homework with due dates",
      "Track upcoming exams",
      "Manage your calendar",
    ],
  },
  {
    owl: "lightbulb" as const,
    title: "Smart Insights",
    description: "Get personalized recommendations based on your study patterns.",
    icon: Brain,
    highlights: [
      "AI-powered analysis",
      "Performance tracking",
      "Study optimization tips",
    ],
  },
  {
    owl: "thumbsup" as const,
    title: "Ready to Start!",
    description: "Create your first timetable and begin your journey to success.",
    icon: Users,
    highlights: [
      "Join study groups",
      "Compete with friends",
      "Earn achievements",
    ],
  },
];

export const SimpleOnboarding = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    checkFirstLogin();
  }, []);

  const checkFirstLogin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const welcomeShown = localStorage.getItem(`simple_onboarding_${user.id}`);
    if (!welcomeShown) {
      setTimeout(() => setOpen(true), 800);
    }
  };

  const handleComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      localStorage.setItem(`simple_onboarding_${user.id}`, "true");
    }
    setOpen(false);
    navigate("/dashboard");
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-gradient-to-br from-background via-background to-muted/20">
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-6 space-y-6">
          {/* Header with logo */}
          <div className="flex items-center justify-center gap-2">
            <VistaraLogo size="sm" />
            <span className="font-bold text-lg gradient-text">Vistara</span>
          </div>

          {/* Animated content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Owl mascot */}
              <div className="flex justify-center">
                <OwlMascot type={step.owl} size="lg" />
              </div>

              {/* Title and description */}
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold">{step.title}</h2>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>

              {/* Highlights */}
              <div className="space-y-2">
                {step.highlights.map((highlight, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-sm">{highlight}</span>
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

            {/* Step indicators */}
            <div className="flex gap-1.5">
              {steps.map((_, idx) => (
                <motion.div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentStep ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
                  }`}
                  animate={{ 
                    scale: idx === currentStep ? 1 : 0.8,
                  }}
                />
              ))}
            </div>

            <Button
              size="sm"
              onClick={handleNext}
              className="gap-1"
            >
              {currentStep < steps.length - 1 ? (
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
      </DialogContent>
    </Dialog>
  );
};

export default SimpleOnboarding;
