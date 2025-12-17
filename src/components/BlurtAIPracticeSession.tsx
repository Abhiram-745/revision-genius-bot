import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, Clock } from "lucide-react";
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
}

export const BlurtAIPracticeSession = ({
  open,
  onOpenChange,
  subject,
  topic,
  plannedDurationMinutes,
  timetableTopics,
  onComplete,
}: BlurtAIPracticeSessionProps) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const totalSeconds = plannedDurationMinutes * 60;
  const progress = Math.min((elapsedSeconds / totalSeconds) * 100, 100);
  const remainingSeconds = Math.max(totalSeconds - elapsedSeconds, 0);

  // Get all topics for this subject to pass to Blurt AI
  const subjectTopics = timetableTopics
    ?.filter(t => {
      // Find topics from the same subject - simplified matching
      return true; // Include all topics for now, BlurtAI will filter
    })
    .map(t => t.name) || [topic];

  // Build iframe URL with topic data
  const blurtAIUrl = `https://blurtaigcsee.vercel.app/?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic)}&topics=${encodeURIComponent(subjectTopics.join(','))}`;

  useEffect(() => {
    if (open && !isRunning) {
      startTimer();
      checkAndCacheSession();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [open]);

  useEffect(() => {
    // Check if time is up
    if (elapsedSeconds >= totalSeconds && isRunning) {
      handleTimeUp();
    }
  }, [elapsedSeconds, totalSeconds, isRunning]);

  const checkAndCacheSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if we already have a cached session for this topic
    const { data: existing } = await supabase
      .from('blurt_ai_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('topic_name', topic)
      .eq('subject_name', subject)
      .maybeSingle();

    if (existing) {
      // Update last_used_at
      await supabase
        .from('blurt_ai_sessions')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      // Create new cache entry
      await supabase
        .from('blurt_ai_sessions')
        .insert({
          user_id: user.id,
          topic_name: topic,
          subject_name: subject,
          blurt_content: { topics: subjectTopics },
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
    triggerConfetti('success');
    toast.success("Time's up! Great study session!");
    
    // Give user a moment to see completion, then close
    setTimeout(() => {
      onComplete();
      onOpenChange(false);
    }, 2000);
  };

  const handleClose = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setElapsedSeconds(0);
    
    if (elapsedSeconds > 60) {
      // If they studied for at least a minute, count it
      onComplete();
    }
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
