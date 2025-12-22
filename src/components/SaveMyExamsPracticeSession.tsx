import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ExternalLink, Square, Timer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SaveMyExamsLogo from "./SaveMyExamsLogo";
import { SaveMyExamsReflectionDialog, ReflectionData } from "./SaveMyExamsReflectionDialog";

interface SaveMyExamsPracticeSessionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: string;
  topic: string;
  examBoard?: string;
  onComplete: () => void;
  userId?: string;
}

export const SaveMyExamsPracticeSession = ({
  open,
  onOpenChange,
  subject,
  topic,
  examBoard,
  onComplete,
  userId,
}: SaveMyExamsPracticeSessionProps) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [showReflection, setShowReflection] = useState(false);
  const [pendingSessionData, setPendingSessionData] = useState<{
    sessionId: string;
    sessionEnd: Date;
    duration: number;
  } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Build SaveMyExams search URL
  const buildSearchUrl = () => {
    const searchQuery = encodeURIComponent(`${subject} ${topic}`);
    let url = `https://www.savemyexams.com/search/?q=${searchQuery}`;
    if (examBoard) {
      url += `&exam_board=${encodeURIComponent(examBoard)}`;
    }
    return url;
  };

  // Start timer when session starts
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

  // Reset on open
  useEffect(() => {
    if (open) {
      setElapsedSeconds(0);
      setSessionStarted(false);
      setSessionStart(null);
      setShowReflection(false);
      setPendingSessionData(null);
    }
  }, [open]);

  const handleStartSession = () => {
    setSessionStarted(true);
    setSessionStart(new Date());
  };

  const handleEndSession = async () => {
    if (!sessionStart || !userId) {
      onComplete();
      return;
    }

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const sessionEnd = new Date();
    const sessionId = `savemyexams-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store pending session data and show reflection dialog
    setPendingSessionData({
      sessionId,
      sessionEnd,
      duration: elapsedSeconds,
    });
    setShowReflection(true);
  };

  const saveSession = async (reflectionData?: ReflectionData) => {
    if (!pendingSessionData || !sessionStart || !userId) {
      finishSession();
      return;
    }

    try {
      const { error } = await supabase.from("blurt_activity_logs").insert({
        user_id: userId,
        session_id: pendingSessionData.sessionId,
        subject_name: subject,
        topic_name: topic,
        session_start: sessionStart.toISOString(),
        session_end: pendingSessionData.sessionEnd.toISOString(),
        duration_seconds: pendingSessionData.duration,
        session_type: "savemyexams",
        confidence_level: reflectionData?.confidenceLevel || null,
        raw_data: reflectionData ? {
          activity_type: reflectionData.activityType,
          notes: reflectionData.notes,
        } : null,
        score_percentage: null,
        total_keywords: null,
        keywords_remembered: [],
        keywords_missed: [],
      });

      if (error) throw error;

      const message = reflectionData 
        ? `Study session logged: ${formatTime(pendingSessionData.duration)} - ${reflectionData.activityType.replace("-", " ")}`
        : `Study session logged: ${formatTime(pendingSessionData.duration)}`;
      
      toast.success(message);
    } catch (err) {
      console.error("Error logging session:", err);
      toast.error("Failed to log session");
    }

    finishSession();
  };

  const handleReflectionSubmit = (data: ReflectionData) => {
    setShowReflection(false);
    saveSession(data);
  };

  const handleReflectionSkip = () => {
    setShowReflection(false);
    saveSession();
  };

  const finishSession = () => {
    setSessionStarted(false);
    setPendingSessionData(null);
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
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <SaveMyExamsLogo className="w-6 h-6" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold">
                    {subject}: {topic}
                  </DialogTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400">
                      SaveMyExams
                    </Badge>
                    {examBoard && (
                      <Badge variant="outline" className="text-xs">
                        {examBoard}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {sessionStarted && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                    <Timer className="w-4 h-4 text-blue-600" />
                    <span className="font-mono font-semibold text-foreground">
                      {formatTime(elapsedSeconds)}
                    </span>
                  </div>
                )}
                
                {!sessionStarted ? (
                  <Button onClick={handleStartSession} className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Clock className="w-4 h-4" />
                    Start Timer
                  </Button>
                ) : (
                  <Button onClick={handleEndSession} variant="destructive" className="gap-2">
                    <Square className="w-4 h-4" />
                    End Session
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(buildSearchUrl(), "_blank")}
                  className="gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 min-h-0">
            {!sessionStarted ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-6">
                  <SaveMyExamsLogo className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Ready to Study?</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  Click "Start Timer" to begin your study session. The timer will track how long you spend studying this topic on SaveMyExams.
                </p>
                <Button onClick={handleStartSession} size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Clock className="w-5 h-5" />
                  Start Study Session
                </Button>
              </div>
            ) : (
              <iframe
                src={buildSearchUrl()}
                className="w-full h-full border-0"
                title="SaveMyExams"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reflection Dialog */}
      {showReflection && pendingSessionData && (
        <SaveMyExamsReflectionDialog
          open={showReflection}
          onOpenChange={(open) => {
            if (!open) handleReflectionSkip();
          }}
          subject={subject}
          topic={topic}
          duration={pendingSessionData.duration}
          onSubmit={handleReflectionSubmit}
          onSkip={handleReflectionSkip}
        />
      )}
    </>
  );
};
