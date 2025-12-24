import { TooltipRenderProps } from "react-joyride";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { useState } from "react";

interface SectionSpotlightTooltipProps extends TooltipRenderProps {
  onDontShowAgain: (dontShow: boolean) => void;
}

const SectionSpotlightTooltip = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  onDontShowAgain,
  isLastStep,
}: SectionSpotlightTooltipProps) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    onDontShowAgain(dontShowAgain);
    closeProps.onClick?.(new MouseEvent('click') as any);
  };

  const handlePrimaryClick = () => {
    onDontShowAgain(dontShowAgain);
    primaryProps.onClick?.(new MouseEvent('click') as any);
  };

  return (
    <div
      {...tooltipProps}
      className="relative rounded-2xl p-6 max-w-[360px] border border-primary/30"
      style={{
        background: "linear-gradient(145deg, hsl(222, 47%, 11%), hsl(222, 47%, 8%))",
        boxShadow: "0 25px 80px -20px rgba(0, 0, 0, 0.6)",
      }}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Title */}
      {step.title && (
        <h3 className="text-lg font-semibold text-foreground mb-2 pr-6">
          {step.title}
        </h3>
      )}

      {/* Content */}
      <div className="text-[15px] leading-relaxed text-muted-foreground mb-4">
        {step.content}
      </div>

      {/* Don't show again checkbox */}
      <div className="flex items-center space-x-2 mb-4">
        <Checkbox
          id="dont-show-again"
          checked={dontShowAgain}
          onCheckedChange={(checked: boolean | "indeterminate") => setDontShowAgain(checked === true)}
          className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <label
          htmlFor="dont-show-again"
          className="text-sm text-muted-foreground cursor-pointer select-none"
        >
          Don't show this again
        </label>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {index > 0 && (
          <Button
            variant="outline"
            onClick={backProps.onClick}
            className="flex-1 border-primary/30 hover:bg-primary/10"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        )}
        
        <Button
          onClick={handlePrimaryClick}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg"
          style={{
            boxShadow: "0 6px 20px hsla(190, 70%, 50%, 0.5)",
          }}
        >
          {continuous && !isLastStep ? (
            <>Next <ChevronRight className="h-4 w-4 ml-1" /></>
          ) : (
            "Got it"
          )}
        </Button>
      </div>
    </div>
  );
};

export default SectionSpotlightTooltip;
