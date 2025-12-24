import { useEffect, useState, useCallback, useRef } from "react";
import Joyride, { Step, CallBackProps, STATUS, EVENTS, ACTIONS } from "react-joyride";
import SectionSpotlightTooltip from "./SectionSpotlightTooltip";

interface SectionSpotlightProps {
  sectionKey: string | null;
  onComplete: (sectionKey: string, permanent?: boolean) => void;
  sectionSteps: Record<string, Step>;
}

const SectionSpotlight = ({ sectionKey, onComplete, sectionSteps }: SectionSpotlightProps) => {
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const dontShowAgainRef = useRef(false);

  // Force re-render on scroll to recalculate spotlight position
  const handleScroll = useCallback(() => {
    if (run) {
      setStepIndex((prev) => prev);
    }
  }, [run]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (sectionKey && sectionSteps[sectionKey]) {
      // Convert record to array of steps to enable navigation
      const allSteps = Object.values(sectionSteps).map(step => ({
        ...step,
        placement: 'auto' as const,
        disableScrolling: false,
        spotlightPadding: 8,
      }));
      
      // Find index of current sectionKey
      const keys = Object.keys(sectionSteps);
      const index = keys.indexOf(sectionKey);
      
      if (index !== -1) {
        setSteps(allSteps);
        setStepIndex(index);
        dontShowAgainRef.current = false;
        setTimeout(() => setRun(true), 200);
      }
    } else {
      setRun(false);
    }
  }, [sectionKey, sectionSteps]);

  const handleDontShowAgain = useCallback((dontShow: boolean) => {
    dontShowAgainRef.current = dontShow;
  }, []);

  const handleCallback = (data: CallBackProps) => {
    const { status, type, action, index } = data;
    
    // Update step index if changed
    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
        setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
    }

    const shouldClose = 
      type === EVENTS.TOUR_END ||
      action === ACTIONS.CLOSE ||
      action === ACTIONS.SKIP ||
      status === STATUS.FINISHED || 
      status === STATUS.SKIPPED;
    
    if (shouldClose) {
      setRun(false);
      if (sectionKey) {
        onComplete(sectionKey, dontShowAgainRef.current);
      }
    }
  };

  if (!sectionKey || steps.length === 0) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      disableOverlayClose={false}
      disableCloseOnEsc={false}
      hideCloseButton={true}
      spotlightClicks={true}
      scrollToFirstStep={true}
      scrollOffset={120}
      disableScrolling={false}
      callback={handleCallback}
      tooltipComponent={(props) => (
        <SectionSpotlightTooltip {...props} onDontShowAgain={handleDontShowAgain} />
      )}
      styles={{
        options: {
          primaryColor: "hsl(190, 70%, 50%)",
          overlayColor: "rgba(0, 0, 0, 0.85)",
          zIndex: 10000,
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.85)",
        },
        spotlight: {
          borderRadius: "16px",
          boxShadow: "0 0 0 4px hsl(190, 70%, 50%), 0 0 40px 15px hsla(190, 70%, 50%, 0.5)",
        },
      }}
      floaterProps={{
        disableAnimation: false,
        hideArrow: false,
        offset: 16,
        placement: 'auto',
        styles: {
          floater: {
            filter: "drop-shadow(0 15px 40px rgba(0, 0, 0, 0.4))",
          },
          arrow: {
            color: "hsl(222, 47%, 11%)",
          },
        },
      }}
    />
  );
};

export default SectionSpotlight;
