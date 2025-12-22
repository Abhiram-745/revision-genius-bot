import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle, AlertTriangle, BookOpen, Brain, Calculator, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: string;
  topic: string;
  durationSeconds: number;
  onSubmit: (feedback: SessionFeedback) => void;
  onSkip: () => void;
}

export interface SessionFeedback {
  confidenceLevel: number;
  mistakeTypes: string[];
  conceptsMastered: string[];
  conceptsStruggling: string[];
}

const MISTAKE_TYPE_OPTIONS = [
  { id: "forgot_terms", label: "Forgot key terms", icon: BookOpen },
  { id: "mixed_concepts", label: "Mixed up concepts", icon: Brain },
  { id: "calculation_errors", label: "Calculation errors", icon: Calculator },
  { id: "misread_question", label: "Misread question", icon: MessageSquare },
  { id: "time_pressure", label: "Ran out of time", icon: AlertTriangle },
];

export const SessionFeedbackDialog = ({
  open,
  onOpenChange,
  subject,
  topic,
  durationSeconds,
  onSubmit,
  onSkip,
}: SessionFeedbackDialogProps) => {
  const [confidenceLevel, setConfidenceLevel] = useState(0);
  const [selectedMistakes, setSelectedMistakes] = useState<string[]>([]);

  const toggleMistake = (mistakeId: string) => {
    setSelectedMistakes((prev) =>
      prev.includes(mistakeId)
        ? prev.filter((m) => m !== mistakeId)
        : [...prev, mistakeId]
    );
  };

  const handleSubmit = () => {
    onSubmit({
      confidenceLevel,
      mistakeTypes: selectedMistakes,
      conceptsMastered: [],
      conceptsStruggling: [],
    });
    resetForm();
  };

  const handleSkip = () => {
    onSkip();
    resetForm();
  };

  const resetForm = () => {
    setConfidenceLevel(0);
    setSelectedMistakes([]);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} minute${mins !== 1 ? "s" : ""}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Session Complete!
          </DialogTitle>
          <DialogDescription>
            You practiced <span className="font-medium text-foreground">{topic}</span> ({subject}) for{" "}
            {formatDuration(durationSeconds)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Confidence Rating */}
          <div className="space-y-3">
            <p className="text-sm font-medium">How confident do you feel about this topic?</p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setConfidenceLevel(level)}
                  className={cn(
                    "p-2 rounded-lg transition-all hover:scale-110",
                    confidenceLevel >= level
                      ? "text-amber-400"
                      : "text-muted-foreground/30 hover:text-muted-foreground/50"
                  )}
                >
                  <Star
                    className="w-8 h-8"
                    fill={confidenceLevel >= level ? "currentColor" : "none"}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-center text-muted-foreground">
              {confidenceLevel === 0 && "Tap to rate"}
              {confidenceLevel === 1 && "Not confident at all"}
              {confidenceLevel === 2 && "Slightly confident"}
              {confidenceLevel === 3 && "Moderately confident"}
              {confidenceLevel === 4 && "Very confident"}
              {confidenceLevel === 5 && "Extremely confident"}
            </p>
          </div>

          {/* Mistake Types */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Any areas you struggled with? (optional)</p>
            <div className="flex flex-wrap gap-2">
              {MISTAKE_TYPE_OPTIONS.map((mistake) => {
                const Icon = mistake.icon;
                const isSelected = selectedMistakes.includes(mistake.id);
                return (
                  <Badge
                    key={mistake.id}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all py-2 px-3",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                    onClick={() => toggleMistake(mistake.id)}
                  >
                    <Icon className="w-3 h-3 mr-1.5" />
                    {mistake.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={handleSkip}>
            Skip
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={confidenceLevel === 0}
          >
            Save Feedback
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};