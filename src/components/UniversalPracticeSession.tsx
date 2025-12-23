import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ExternalLink, Square, Timer, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SaveMyExamsReflectionDialog, ReflectionData } from "./SaveMyExamsReflectionDialog";
import confetti from "canvas-confetti";

interface UniversalPracticeSessionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appId: string;
  appName: string;
  appUrl: string;
  appIcon: React.ReactNode;
  appColor: string;
  subject?: string;
  topic?: string;
  supportsIframe: boolean;
  onComplete: () => void;
  userId?: string;
}

export const UniversalPracticeSession = ({
  open,
  onOpenChange,
  appId,
  appName,
  appUrl,
  appIcon,
  appColor,
  subject,
  topic,
  supportsIframe,
  onComplete,
  userId,
}: UniversalPracticeSessionProps) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [showReflection, setShowReflection] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [pendingSessionData, setPendingSessionData] = useState<{
    sessionId: string;
    sessionEnd: Date;
    duration: number;
  } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
      setIframeError(false);
    }
  }, [open]);

  const handleStartSession = () => {
    setSessionStarted(true);
    setSessionStart(new Date());
    
    // Open in new tab if doesn't support iframe
    if (!supportsIframe) {
      window.open(appUrl, "_blank", "noopener,noreferrer");
    }
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
    const sessionId = `${appId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
        subject_name: subject || appName,
        topic_name: topic || "General Practice",
        session_start: sessionStart.toISOString(),
        session_end: pendingSessionData.sessionEnd.toISOString(),
        duration_seconds: pendingSessionData.duration,
        session_type: appId,
        confidence_level: reflectionData?.confidenceLevel || null,
        raw_data: reflectionData ? {
          activity_type: reflectionData.activityType,
          notes: reflectionData.notes,
          app_name: appName,
        } : { app_name: appName },
        score_percentage: null,
        total_keywords: null,
        keywords_remembered: [],
        keywords_missed: [],
      });

      if (error) throw error;

      // Celebrate!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      const message = reflectionData 
        ? `${appName} session logged: ${formatTime(pendingSessionData.duration)} - ${reflectionData.activityType.replace("-", " ")}`
        : `${appName} session logged: ${formatTime(pendingSessionData.duration)}`;
      
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

  const handleIframeError = () => {
    setIframeError(true);
  };

  return (
    <>
      <Dialog open={open && !showReflection} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${appColor} flex items-center justify-center`}>
                  {appIcon}
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold">
                    {subject ? `${subject}: ${topic}` : appName}
                  </DialogTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className={`text-xs ${appColor}`}>
                      {appName}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {sessionStarted && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                    <Timer className="w-4 h-4 text-primary" />
                    <span className="font-mono font-semibold text-foreground">
                      {formatTime(elapsedSeconds)}
                    </span>
                  </div>
                )}
                
                {!sessionStarted ? (
                  <Button onClick={handleStartSession} className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    <Clock className="w-4 h-4" />
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
                  size="sm"
                  onClick={() => window.open(appUrl, "_blank")}
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
                <div className={`w-20 h-20 rounded-full ${appColor} flex items-center justify-center mb-6`}>
                  {appIcon}
                </div>
                <h3 className="text-xl font-semibold mb-2">Ready to Study with {appName}?</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  {supportsIframe 
                    ? `Click "Start Session" to begin. ${appName} will load here and your study time will be tracked.`
                    : `Click "Start Session" to open ${appName} in a new tab. Your study time will be tracked here.`
                  }
                </p>
                <Button onClick={handleStartSession} size="lg" className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  <Clock className="w-5 h-5" />
                  Start Study Session
                </Button>
              </div>
            ) : supportsIframe && !iframeError ? (
              <iframe
                src={appUrl}
                className="w-full h-full border-0"
                title={appName}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
                onError={handleIframeError}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                  <Timer className="w-5 h-5 text-primary animate-pulse" />
                  <span className="font-mono text-2xl font-bold text-primary">
                    {formatTime(elapsedSeconds)}
                  </span>
                </div>
                
                <div className={`w-16 h-16 rounded-full ${appColor} flex items-center justify-center mb-4`}>
                  {appIcon}
                </div>
                
                <h3 className="text-xl font-semibold mb-2">Studying with {appName}</h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  {appName} is open in another tab. When you're done studying, come back here and click "End Session" to log your progress.
                </p>
                
                <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-lg text-amber-700 dark:text-amber-400 mb-6">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">Keep this window open to track your study time</span>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => window.open(appUrl, "_blank")}
                    className="gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Reopen {appName}
                  </Button>
                  <Button onClick={handleEndSession} variant="destructive" className="gap-2">
                    <Square className="w-4 h-4" />
                    End Session
                  </Button>
                </div>
              </div>
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
          subject={subject || appName}
          topic={topic || "Practice Session"}
          duration={pendingSessionData.duration}
          onSubmit={handleReflectionSubmit}
          onSkip={handleReflectionSkip}
        />
      )}
    </>
  );
};
