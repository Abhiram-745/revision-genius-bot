import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Layers, Timer, Play, Square, ExternalLink, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";
import QuizletReflectionDialog, { QuizletReflectionData } from "./QuizletReflectionDialog";

interface QuizletPracticeSessionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: string;
  topic: string;
  onComplete: () => void;
  userId: string;
}

const QuizletPracticeSession = ({
  open,
  onOpenChange,
  subject,
  topic,
  onComplete,
  userId,
}: QuizletPracticeSessionProps) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [showReflection, setShowReflection] = useState(false);
  const [pendingSessionData, setPendingSessionData] = useState<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const buildSearchUrl = () => {
    const query = encodeURIComponent(`${subject} ${topic}`);
    return `https://quizlet.com/search?query=${query}&type=sets`;
  };

  useEffect(() => {
    if (sessionStarted) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionStarted]);

  useEffect(() => {
    if (!open) {
      setElapsedSeconds(0);
      setSessionStarted(false);
      setSessionStart(null);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [open]);

  const handleStartSession = () => {
    setSessionStarted(true);
    setSessionStart(new Date());
    // Open Quizlet in a new tab since iframe embedding is restricted
    window.open(buildSearchUrl(), "_blank");
  };

  const handleEndSession = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const sessionId = `quizlet-${Date.now()}`;
    const sessionData = {
      sessionId,
      elapsedSeconds,
      sessionStart,
      sessionEnd: new Date(),
    };

    setPendingSessionData(sessionData);
    setShowReflection(true);
  };

  const saveSession = async (reflectionData?: QuizletReflectionData) => {
    if (!pendingSessionData) return;

    try {
      const { error } = await supabase.from("blurt_activity_logs").insert({
        user_id: userId,
        session_id: pendingSessionData.sessionId,
        subject_name: subject,
        topic_name: topic,
        session_start: pendingSessionData.sessionStart.toISOString(),
        session_end: pendingSessionData.sessionEnd.toISOString(),
        duration_seconds: pendingSessionData.elapsedSeconds,
        session_type: "quizlet",
        confidence_level: reflectionData?.confidenceLevel,
        total_keywords: reflectionData?.cardsReviewed,
        raw_data: reflectionData ? {
          cardsReviewed: reflectionData.cardsReviewed,
          cardsMastered: reflectionData.cardsMastered,
          cardsToReview: reflectionData.cardsToReview,
          notes: reflectionData.notes,
        } : {},
      });

      if (error) throw error;

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      toast.success("Session saved! Great flashcard practice!");
    } catch (error) {
      console.error("Error saving session:", error);
      toast.error("Failed to save session");
    }
  };

  const handleReflectionSubmit = async (data: QuizletReflectionData) => {
    await saveSession(data);
    finishSession();
  };

  const handleReflectionSkip = async () => {
    await saveSession();
    finishSession();
  };

  const finishSession = () => {
    setShowReflection(false);
    setPendingSessionData(null);
    setElapsedSeconds(0);
    setSessionStarted(false);
    setSessionStart(null);
    onOpenChange(false);
    onComplete();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <Dialog open={open && !showReflection} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg">Quizlet Flashcards</DialogTitle>
                <DialogDescription>
                  {subject} - {topic}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Timer Display */}
            <div className="flex items-center justify-center p-6 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Timer className="w-6 h-6 text-indigo-500" />
                <span className="text-4xl font-mono font-bold">{formatTime(elapsedSeconds)}</span>
              </div>
            </div>

            {/* Info Notice */}
            <div className="flex items-start gap-2 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">How it works:</span> Quizlet will open in a new tab. 
                Practice your flashcards there, then return here to end your session and log your progress.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {!sessionStarted ? (
                <Button onClick={handleStartSession} className="w-full gap-2 bg-indigo-500 hover:bg-indigo-600">
                  <ExternalLink className="w-4 h-4" />
                  Open Quizlet & Start Session
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => window.open(buildSearchUrl(), "_blank")}
                    className="w-full gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Quizlet Again
                  </Button>
                  <Button onClick={handleEndSession} variant="destructive" className="w-full gap-2">
                    <Square className="w-4 h-4" />
                    End Session & Save Progress
                  </Button>
                </>
              )}
            </div>

            {sessionStarted && (
              <p className="text-center text-sm text-muted-foreground">
                Session in progress... Practice your flashcards on Quizlet, then come back here to end your session.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <QuizletReflectionDialog
        open={showReflection}
        onOpenChange={setShowReflection}
        subject={subject}
        topic={topic}
        duration={pendingSessionData?.elapsedSeconds || 0}
        onSubmit={handleReflectionSubmit}
        onSkip={handleReflectionSkip}
      />
    </>
  );
};

export default QuizletPracticeSession;
