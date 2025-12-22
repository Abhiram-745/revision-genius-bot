import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, Timer, Play, Pause, Square, ExternalLink, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";
import { SaveMyExamsReflectionDialog, ReflectionData } from "./SaveMyExamsReflectionDialog";

interface PMTPracticeSessionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: string;
  topic: string;
  examBoard?: string;
  onComplete: () => void;
  userId: string;
}

const PMTPracticeSession = ({
  open,
  onOpenChange,
  subject,
  topic,
  examBoard,
  onComplete,
  userId,
}: PMTPracticeSessionProps) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [showReflection, setShowReflection] = useState(false);
  const [pendingSessionData, setPendingSessionData] = useState<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const buildSearchUrl = () => {
    const query = encodeURIComponent(`${subject} ${topic}`);
    return `https://www.physicsandmathstutor.com/search/?q=${query}`;
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
  };

  const handleEndSession = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const sessionId = `pmt-${Date.now()}`;
    const sessionData = {
      sessionId,
      elapsedSeconds,
      sessionStart,
      sessionEnd: new Date(),
    };

    setPendingSessionData(sessionData);
    setShowReflection(true);
  };

  const saveSession = async (reflectionData?: ReflectionData) => {
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
        session_type: "pmt",
        confidence_level: reflectionData?.confidenceLevel,
        raw_data: reflectionData ? {
          activityType: reflectionData.activityType,
          notes: reflectionData.notes,
          examBoard,
        } : { examBoard },
      });

      if (error) throw error;

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      toast.success("Session saved! Great study session!");
    } catch (error) {
      console.error("Error saving session:", error);
      toast.error("Failed to save session");
    }
  };

  const handleReflectionSubmit = async (data: ReflectionData) => {
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

  const pmtUrl = buildSearchUrl();

  return (
    <>
      <Dialog open={open && !showReflection} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg">Physics & Maths Tutor</DialogTitle>
                <DialogDescription>
                  {subject} - {topic}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-blue-500" />
                <span className="text-2xl font-mono font-bold">{formatTime(elapsedSeconds)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!sessionStarted ? (
                <Button onClick={handleStartSession} className="gap-2 bg-blue-500 hover:bg-blue-600">
                  <Play className="w-4 h-4" />
                  Start Session
                </Button>
              ) : (
                <Button onClick={handleEndSession} variant="destructive" className="gap-2">
                  <Square className="w-4 h-4" />
                  End Session
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => window.open(pmtUrl, "_blank")}
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open in New Tab
              </Button>
            </div>
          </div>

          {/* Login Notice */}
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Note:</span> If you need to sign in to PMT, 
              use the "Open in New Tab" button. Sign-in is not available within this embedded view.
            </p>
          </div>

          {sessionStarted && (
            <div className="flex-1 min-h-0">
              <iframe
                src={pmtUrl}
                className="w-full h-full rounded-lg border"
                title="Physics & Maths Tutor"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          )}

          {!sessionStarted && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto">
                  <GraduationCap className="w-10 h-10 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Ready to Study {topic}?</h3>
                  <p className="text-muted-foreground">
                    Click "Start Session" to begin tracking your study time on PMT.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <SaveMyExamsReflectionDialog
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

export default PMTPracticeSession;
