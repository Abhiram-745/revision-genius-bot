import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from "react-joyride";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, SkipForward, Home, Calendar, Brain, Users, BarChart3, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OwlMascot } from "@/components/mascot/OwlMascot";

// Page configuration with steps
interface PageConfig {
  path: string;
  name: string;
  icon: React.ElementType;
  owlType: "waving" | "happy" | "folder" | "lightbulb" | "chart" | "checklist" | "magnifying" | "thumbsup";
  steps: Step[];
}

const pageConfigs: PageConfig[] = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: Home,
    owlType: "waving",
    steps: [
      {
        target: "body",
        content: "Welcome to your Dashboard! This is your home base where you can see your progress, upcoming sessions, and quick actions.",
        placement: "center",
        disableBeacon: true,
      },
      {
        target: "[data-tour='dashboard-greeting']",
        content: "Your personalized greeting shows your current streak and motivates you to keep studying!",
        placement: "bottom",
        disableBeacon: true,
      },
      {
        target: "[data-tour='progress-section']",
        content: "Track your study streaks, XP earned, and weekly hours here. Stay motivated by watching your progress grow!",
        placement: "bottom",
        disableBeacon: true,
      },
      {
        target: "[data-tour='new-timetable']",
        content: "Click here to create a new AI-powered study timetable tailored to your subjects and exam dates.",
        placement: "bottom",
        disableBeacon: true,
      },
    ],
  },
  {
    path: "/timetables",
    name: "Timetables",
    icon: Calendar,
    owlType: "folder",
    steps: [
      {
        target: "body",
        content: "This is your Timetables page! View all your study schedules and create new ones.",
        placement: "center",
        disableBeacon: true,
      },
      {
        target: "[data-tour='timetable-list']",
        content: "All your timetables appear here. Click any timetable to view your daily schedule and start studying.",
        placement: "top",
        disableBeacon: true,
      },
      {
        target: "[data-tour='create-timetable']",
        content: "Create a new timetable by adding your subjects, topics, and exam dates. AI will generate an optimized schedule!",
        placement: "bottom",
        disableBeacon: true,
      },
    ],
  },
  {
    path: "/practice",
    name: "Practice Hub",
    icon: BookOpen,
    owlType: "lightbulb",
    steps: [
      {
        target: "body",
        content: "Welcome to the Practice Hub! Test your knowledge with integrated learning tools.",
        placement: "center",
        disableBeacon: true,
      },
      {
        target: "[data-tour='practice-platforms']",
        content: "Choose from SaveMyExams, Physics & Maths Tutor, Blurt AI, and more. All your practice in one place!",
        placement: "top",
        disableBeacon: true,
      },
    ],
  },
  {
    path: "/insights",
    name: "Insights",
    icon: BarChart3,
    owlType: "chart",
    steps: [
      {
        target: "body",
        content: "Your Insights page shows AI-powered analytics about your study patterns and performance.",
        placement: "center",
        disableBeacon: true,
      },
      {
        target: "[data-tour='ai-insights']",
        content: "Get personalized recommendations and see which topics need more attention.",
        placement: "bottom",
        disableBeacon: true,
      },
    ],
  },
  {
    path: "/groups",
    name: "Study Groups",
    icon: Users,
    owlType: "magnifying",
    steps: [
      {
        target: "body",
        content: "Join or create study groups to collaborate with friends and compete on leaderboards!",
        placement: "center",
        disableBeacon: true,
      },
      {
        target: "[data-tour='groups-list']",
        content: "See your groups, share timetables, and chat with study buddies here.",
        placement: "top",
        disableBeacon: true,
      },
    ],
  },
];

interface FullAppTourProps {
  startTour?: boolean;
  onComplete?: () => void;
}

export const FullAppTour = ({ startTour = false, onComplete }: FullAppTourProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [run, setRun] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [showTransition, setShowTransition] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current page config
  const currentPage = pageConfigs[currentPageIndex];
  const totalPages = pageConfigs.length;
  
  // Calculate overall progress
  const stepsBeforeCurrent = pageConfigs
    .slice(0, currentPageIndex)
    .reduce((acc, page) => acc + page.steps.length, 0);
  const totalSteps = pageConfigs.reduce((acc, page) => acc + page.steps.length, 0);
  const overallStep = stepsBeforeCurrent + stepIndex + 1;
  const progress = (overallStep / totalSteps) * 100;

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Check if tour was already completed
        const tourComplete = localStorage.getItem(`full_tour_complete_${user.id}`);
        if (startTour && !tourComplete) {
          setRun(true);
        }
      }
    };
    checkUser();
  }, [startTour]);

  // Navigate to current page when page index changes
  useEffect(() => {
    if (run && currentPage && location.pathname !== currentPage.path) {
      setShowTransition(true);
      setTimeout(() => {
        navigate(currentPage.path);
        setTimeout(() => {
          setShowTransition(false);
          setStepIndex(0);
        }, 500);
      }, 300);
    }
  }, [currentPageIndex, run, currentPage, navigate, location.pathname]);

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { action, index, status, type } = data;

    if (type === EVENTS.STEP_AFTER) {
      if (action === ACTIONS.NEXT) {
        // Check if we need to go to next page
        if (index >= currentPage.steps.length - 1) {
          if (currentPageIndex < totalPages - 1) {
            setCurrentPageIndex(prev => prev + 1);
          } else {
            // Tour complete
            completeTour();
          }
        } else {
          setStepIndex(prev => prev + 1);
        }
      } else if (action === ACTIONS.PREV) {
        if (index === 0 && currentPageIndex > 0) {
          // Go to previous page
          const prevPageIndex = currentPageIndex - 1;
          setCurrentPageIndex(prevPageIndex);
          setStepIndex(pageConfigs[prevPageIndex].steps.length - 1);
        } else {
          setStepIndex(prev => Math.max(0, prev - 1));
        }
      }
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      completeTour();
    }
  }, [currentPageIndex, currentPage, totalPages]);

  const completeTour = () => {
    if (userId) {
      localStorage.setItem(`full_tour_complete_${userId}`, "true");
    }
    setRun(false);
    onComplete?.();
  };

  const skipTour = () => {
    completeTour();
  };

  // Custom tooltip component
  const CustomTooltip = ({
    continuous,
    index,
    step,
    backProps,
    closeProps,
    primaryProps,
    skipProps,
    tooltipProps,
  }: any) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      {...tooltipProps}
      className="max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-secondary to-accent"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="p-5 space-y-4">
        {/* Header with owl and page info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <OwlMascot type={currentPage.owlType} size="sm" />
            <div>
              <p className="text-xs text-muted-foreground">
                {currentPage.name} • Step {index + 1} of {currentPage.steps.length}
              </p>
              <p className="text-xs text-muted-foreground">
                Overall: {overallStep} of {totalSteps}
              </p>
            </div>
          </div>
          <button
            {...skipProps}
            onClick={skipTour}
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="text-sm text-foreground">
          {step.content}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Button
              {...backProps}
              variant="ghost"
              size="sm"
              disabled={currentPageIndex === 0 && index === 0}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTour}
              className="text-muted-foreground"
            >
              <SkipForward className="w-4 h-4 mr-1" />
              Skip Tour
            </Button>
            <Button
              {...primaryProps}
              size="sm"
              className="gap-1 bg-gradient-to-r from-primary to-accent"
            >
              {currentPageIndex === totalPages - 1 && index === currentPage.steps.length - 1 ? (
                <>
                  Finish
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Page indicators */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-border">
          {pageConfigs.map((page, idx) => {
            const PageIcon = page.icon;
            return (
              <div
                key={idx}
                className={`p-1.5 rounded-lg transition-colors ${
                  idx === currentPageIndex
                    ? "bg-primary/20 text-primary"
                    : idx < currentPageIndex
                    ? "bg-muted text-muted-foreground"
                    : "text-muted-foreground/50"
                }`}
              >
                <PageIcon className="w-4 h-4" />
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );

  if (!run) return null;

  return (
    <>
      {/* Page transition overlay */}
      <AnimatePresence>
        {showTransition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10001] bg-background/80 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <OwlMascot type={currentPage.owlType} size="lg" glow />
              <div className="text-center">
                <p className="text-lg font-semibold">Heading to {currentPage.name}...</p>
                <p className="text-sm text-muted-foreground">Page {currentPageIndex + 1} of {totalPages}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Joyride
        continuous
        run={run && !showTransition}
        steps={currentPage.steps}
        stepIndex={stepIndex}
        callback={handleJoyrideCallback}
        tooltipComponent={CustomTooltip}
        disableOverlayClose
        disableCloseOnEsc={false}
        spotlightPadding={8}
        styles={{
          options: {
            zIndex: 10000,
            arrowColor: "hsl(var(--card))",
          },
          spotlight: {
            borderRadius: 12,
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
        floaterProps={{
          disableAnimation: true,
        }}
      />
    </>
  );
};

export default FullAppTour;
