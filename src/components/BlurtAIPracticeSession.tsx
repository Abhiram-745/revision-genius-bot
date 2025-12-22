import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, Clock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { triggerConfetti } from "@/utils/celebrations";

interface BlurtAIPracticeSessionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: string;
  topic: string;
  plannedDurationMinutes: number;
  timetableTopics?: Array<{ name: string; subject_id: string }>;
  onComplete: () => void;
  userId?: string;
}

interface BlurtActivityData {
  type: string;
  sessionId: string;
  userId?: string;
  subject: string;
  topic: string;
  timestamp: string;
  durationSeconds: number;
  scorePercentage?: number;
  keywordsRemembered?: string[];
  keywordsMissed?: string[];
  totalKeywords?: number;
  sessionType?: string;
  activityLog?: any[];
}

export const BlurtAIPracticeSession = ({
  open,
  onOpenChange,
  subject,
  topic,
  plannedDurationMinutes,
  timetableTopics,
  onComplete,
  userId,
}: BlurtAIPracticeSessionProps) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [activityReceived, setActivityReceived] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const sessionStartRef = useRef<Date | null>(null);

  const totalSeconds = plannedDurationMinutes * 60;
  const progress = Math.min((elapsedSeconds / totalSeconds) * 100, 100);
  const remainingSeconds = Math.max(totalSeconds - elapsedSeconds, 0);

  // Build iframe URL with session params for hybrid integration
  const parentOrigin = window.location.origin;
  const blurtAIUrl = `https://blurtaigcsee.vercel.app/?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic)}&vistaraSessionId=${encodeURIComponent(sessionId)}&userId=${encodeURIComponent(userId || '')}&parentOrigin=${encodeURIComponent(parentOrigin)}`;

  // Handle incoming postMessage from BlurtAI
  const handleBlurtMessage = useCallback(async (event: MessageEvent) => {
    // Validate origin
    if (!event.origin.includes('blurtaigcsee.vercel.app')) return;

    const data = event.data as BlurtActivityData;
    
    if (data?.type === 'VISTARA_BLURT_ACTIVITY') {
      console.log('Received activity data from BlurtAI:', data);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('No user found');
          return;
        }

        // Save activity to database
        const { error } = await supabase.from('blurt_activity_logs').insert([{
          user_id: user.id,
          session_id: data.sessionId || sessionId,
          subject_name: data.subject || subject,
          topic_name: data.topic || topic,
          session_start: sessionStartRef.current?.toISOString() || new Date().toISOString(),
          session_end: new Date().toISOString(),
          duration_seconds: data.durationSeconds || elapsedSeconds,
          score_percentage: data.scorePercentage || null,
          keywords_remembered: data.keywordsRemembered || [],
          keywords_missed: data.keywordsMissed || [],
          total_keywords: data.totalKeywords || 0,
          session_type: data.sessionType || 'practice',
          raw_data: data as any,
        }]);

        if (error) throw error;

        setActivityReceived(true);
        toast.success('Activity data received from BlurtAI!');
        triggerConfetti('success');

      } catch (err) {
        console.error('Error saving activity:', err);
        toast.error('Failed to save activity data');
      }
    } else if (data?.type === 'VISTARA_BLURT_READY') {
      console.log('BlurtAI is ready');
    }
  }, [sessionId, subject, topic, elapsedSeconds]);

  // Set up postMessage listener
  useEffect(() => {
    window.addEventListener('message', handleBlurtMessage);
    return () => window.removeEventListener('message', handleBlurtMessage);
  }, [handleBlurtMessage]);

  useEffect(() => {
    if (open && !isRunning) {
      startTimer();
      sessionStartRef.current = new Date();
      checkAndCacheSession();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [open]);

  useEffect(() => {
    if (elapsedSeconds >= totalSeconds && isRunning) {
      handleTimeUp();
    }
  }, [elapsedSeconds, totalSeconds, isRunning]);

  const checkAndCacheSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: existing } = await supabase
      .from('blurt_ai_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('topic_name', topic)
      .eq('subject_name', subject)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('blurt_ai_sessions')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('blurt_ai_sessions')
        .insert({
          user_id: user.id,
          topic_name: topic,
          subject_name: subject,
          blurt_content: { sessionId },
        });
    }
  };

  const startTimer = () => {
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
  };

  const handleTimeUp = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    
    if (!activityReceived) {
      // Save session even without BlurtAI data
      saveManualSession();
    }
    
    triggerConfetti('success');
    toast.success("Time's up! Great study session!");
    
    setTimeout(() => {
      onComplete();
      onOpenChange(false);
    }, 2000);
  };

  const saveManualSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      await supabase.from('blurt_activity_logs').insert({
        user_id: user.id,
        session_id: sessionId,
        subject_name: subject,
        topic_name: topic,
        session_start: sessionStartRef.current?.toISOString() || new Date().toISOString(),
        session_end: new Date().toISOString(),
        duration_seconds: elapsedSeconds,
        session_type: 'practice',
        raw_data: { manual: true },
      });
    } catch (err) {
      console.error('Error saving manual session:', err);
    }
  };

  const handleClose = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    
    if (elapsedSeconds > 60 && !activityReceived) {
      // Save session even without BlurtAI data
      await saveManualSession();
      onComplete();
    }
    
    setElapsedSeconds(0);
    setActivityReceived(false);
    onOpenChange(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 flex flex-col">
        {/* Timer header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="font-mono text-2xl font-bold text-primary">
                {formatTime(remainingSeconds)}
              </span>
              <span className="text-sm text-muted-foreground">remaining</span>
            </div>
            <div className="w-48">
              <Progress value={progress} className="h-2" />
            </div>
            {activityReceived && (
              <div className="flex items-center gap-1 text-green-500">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs">Activity synced</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-sm">{subject}</p>
              <p className="text-xs text-muted-foreground">{topic}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Blurt AI iframe */}
        <div className="flex-1 overflow-hidden">
          <iframe
            ref={iframeRef}
            src={blurtAIUrl}
            className="w-full h-full border-0"
            title="Blurt AI Practice"
            allow="microphone; camera"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
