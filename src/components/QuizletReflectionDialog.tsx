import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Layers, Star, Clock, CheckCircle, RotateCcw } from "lucide-react";

export interface QuizletReflectionData {
  cardsReviewed: number;
  cardsMastered: number;
  cardsToReview: number;
  confidenceLevel: number;
  notes: string;
}

interface QuizletReflectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: string;
  topic: string;
  duration: number;
  onSubmit: (data: QuizletReflectionData) => void;
  onSkip: () => void;
}

const QuizletReflectionDialog = ({
  open,
  onOpenChange,
  subject,
  topic,
  duration,
  onSubmit,
  onSkip,
}: QuizletReflectionDialogProps) => {
  const [cardsReviewed, setCardsReviewed] = useState<number>(0);
  const [cardsMastered, setCardsMastered] = useState<number>(0);
  const [cardsToReview, setCardsToReview] = useState<number>(0);
  const [confidenceLevel, setConfidenceLevel] = useState(3);
  const [notes, setNotes] = useState("");

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} minute${mins !== 1 ? "s" : ""}`;
  };

  const handleSubmit = () => {
    onSubmit({
      cardsReviewed,
      cardsMastered,
      cardsToReview,
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
    setCardsReviewed(0);
    setCardsMastered(0);
    setCardsToReview(0);
    setConfidenceLevel(3);
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle>Flashcard Session Complete!</DialogTitle>
              <DialogDescription>
                {subject} - {topic} • {formatDuration(duration)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Cards Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Reviewed
              </Label>
              <Input
                type="number"
                min="0"
                value={cardsReviewed}
                onChange={(e) => setCardsReviewed(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1 text-green-600">
                <CheckCircle className="w-3 h-3" />
                Mastered
              </Label>
              <Input
                type="number"
                min="0"
                value={cardsMastered}
                onChange={(e) => setCardsMastered(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1 text-amber-600">
                <RotateCcw className="w-3 h-3" />
                To Review
              </Label>
              <Input
                type="number"
                min="0"
                value={cardsToReview}
                onChange={(e) => setCardsToReview(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Confidence Level */}
          <div className="space-y-2">
            <Label>Confidence Level</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setConfidenceLevel(level)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${
                      level <= confidenceLevel
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Any terms you struggled with or want to review later..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="ghost" onClick={handleSkip}>
            Skip
          </Button>
          <Button onClick={handleSubmit} className="bg-indigo-500 hover:bg-indigo-600">
            Save Progress
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuizletReflectionDialog;
