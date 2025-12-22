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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, BookOpen, FileQuestion, FileText, ClipboardList, Lightbulb } from "lucide-react";
import SaveMyExamsLogo from "./SaveMyExamsLogo";

interface SaveMyExamsReflectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: string;
  topic: string;
  duration: number;
  onSubmit: (data: ReflectionData) => void;
  onSkip: () => void;
}

export interface ReflectionData {
  activityType: string;
  confidenceLevel: number;
  notes: string;
}

const ACTIVITY_TYPES = [
  { id: "revision-notes", label: "Revision Notes", icon: BookOpen },
  { id: "practice-questions", label: "Practice Questions", icon: FileQuestion },
  { id: "past-papers", label: "Past Papers", icon: FileText },
  { id: "model-answers", label: "Model Answers", icon: ClipboardList },
  { id: "topic-summary", label: "Topic Summary", icon: Lightbulb },
];

export const SaveMyExamsReflectionDialog = ({
  open,
  onOpenChange,
  subject,
  topic,
  duration,
  onSubmit,
  onSkip,
}: SaveMyExamsReflectionDialogProps) => {
  const [activityType, setActivityType] = useState<string>("");
  const [confidenceLevel, setConfidenceLevel] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const handleSubmit = () => {
    onSubmit({
      activityType,
      confidenceLevel,
      notes,
    });
    resetForm();
  };

  const handleSkip = () => {
    onSkip();
    resetForm();
  };

  const resetForm = () => {
    setActivityType("");
    setConfidenceLevel(0);
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <SaveMyExamsLogo className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-lg">Session Complete!</DialogTitle>
              <DialogDescription className="text-sm">
                {subject}: {topic} • {formatDuration(duration)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {/* Activity Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">What did you study?</Label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = activityType === type.id;
                return (
                  <Badge
                    key={type.id}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer px-3 py-1.5 transition-all ${
                      isSelected
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "hover:bg-blue-500/10 hover:border-blue-500/50"
                    }`}
                    onClick={() => setActivityType(type.id)}
                  >
                    <Icon className="w-3 h-3 mr-1.5" />
                    {type.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Confidence Level */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">How confident do you feel?</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setConfidenceLevel(level)}
                  className={`p-2 rounded-lg transition-all ${
                    level <= confidenceLevel
                      ? "text-yellow-500"
                      : "text-muted-foreground/40 hover:text-muted-foreground"
                  }`}
                >
                  <Star
                    className="w-6 h-6"
                    fill={level <= confidenceLevel ? "currentColor" : "none"}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick notes (optional)</Label>
            <Textarea
              placeholder="What specific topics or concepts did you cover?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!activityType}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Save Reflection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
