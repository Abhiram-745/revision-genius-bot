import { useState, useEffect, useCallback } from "react";
import Joyride, { Step, CallBackProps, STATUS, ACTIONS } from "react-joyride";
import { supabase } from "@/integrations/supabase/client";

interface ProductTourProps {
  tourKey: string;
  steps: Step[];
  onComplete?: () => void;
  run?: boolean;
}

const ProductTour = ({ tourKey, steps, onComplete, run = false }: ProductTourProps) => {
  const [runTour, setRunTour] = useState(false);
  const [filteredSteps, setFilteredSteps] = useState<Step[]>([]);

  // Check if any dialog or modal is open
  const isDialogOpen = useCallback(() => {
    return document.querySelector('[role="dialog"]') !== null || 
           document.querySelector('[data-state="open"]') !== null;
  }, []);

  // Check if target element exists and is visible
  const isTargetVisible = useCallback((target: string | HTMLElement) => {
    if (typeof target === 'string') {
      if (target === 'body') return true;
      const element = document.querySelector(target);
      if (!element) return false;
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }
    return true;
  }, []);

  useEffect(() => {
    if (run) {
      // Add delay to let DOM settle and avoid conflicts
      const timer = setTimeout(() => {
        checkTourStatus();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [run, tourKey]);

  const checkTourStatus = async () => {
    // Don't show tour if a dialog is open
    if (isDialogOpen()) {
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if user has completed this tour
    const completedTours = localStorage.getItem(`tour_completed_${user.id}`) || "{}";
    const tourStatus = JSON.parse(completedTours);

    if (!tourStatus[tourKey]) {
      // Filter steps to only include those with visible targets
      const visibleSteps = steps.filter(step => isTargetVisible(step.target as string));
      
      if (visibleSteps.length > 0) {
        setFilteredSteps(visibleSteps);
        setRunTour(true);
      }
    }
  };

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status, action } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Mark tour as completed
        const completedTours = localStorage.getItem(`tour_completed_${user.id}`) || "{}";
        const tourStatus = JSON.parse(completedTours);
        tourStatus[tourKey] = true;
        localStorage.setItem(`tour_completed_${user.id}`, JSON.stringify(tourStatus));
      }
      
      setRunTour(false);
      onComplete?.();
    }
  };

  // Don't render if no steps or dialog is open
  if (filteredSteps.length === 0 || isDialogOpen()) {
    return null;
  }

  return (
    <Joyride
      steps={filteredSteps}
      run={runTour}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      disableScrolling={false}
      spotlightClicks
      disableOverlayClose
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "hsl(var(--primary))",
          textColor: "hsl(var(--foreground))",
          backgroundColor: "hsl(var(--card))",
          overlayColor: "rgba(0, 0, 0, 0.75)",
          arrowColor: "hsl(var(--card))",
          zIndex: 10000,
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.75)",
        },
        spotlight: {
          borderRadius: "8px",
          boxShadow: "0px 0px 0px 9999px rgba(0, 0, 0, 0.75)",
        },
        tooltip: {
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.4)",
          fontSize: "15px",
        },
        tooltipContainer: {
          textAlign: "left",
        },
        tooltipTitle: {
          fontSize: "18px",
          fontWeight: 700,
          marginBottom: "8px",
        },
        tooltipContent: {
          fontSize: "14px",
          lineHeight: "1.6",
        },
        buttonNext: {
          backgroundColor: "hsl(var(--primary))",
          borderRadius: "10px",
          padding: "10px 20px",
          fontSize: "14px",
          fontWeight: 600,
          transition: "all 0.2s ease",
        },
        buttonBack: {
          color: "hsl(var(--muted-foreground))",
          marginRight: "12px",
          fontSize: "14px",
        },
        buttonSkip: {
          color: "hsl(var(--muted-foreground))",
          fontSize: "14px",
        },
      }}
      floaterProps={{
        disableAnimation: false,
        styles: {
          arrow: {
            length: 12,
            spread: 24,
          },
        },
      }}
    />
  );
};

export default ProductTour;
