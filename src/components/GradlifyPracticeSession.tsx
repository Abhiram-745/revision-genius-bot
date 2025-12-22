import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, ExternalLink, Calculator, Pause, Play, CheckCircle, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GradlifyPracticeSessionProps {
  subject: string;
  topic: string;
  onComplete: () => void;
  onCancel: () => void;
}

const GradlifyPracticeSession = ({
  subject,
  topic,
  onComplete,
  onCancel,
}: GradlifyPracticeSessionProps) => {
  const { user } = useAuth();
  const [startTime] = useState(new Date());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [sessionId] = useState(crypto.randomUUID());

  const gradlifyUrl = `https://gradlify.com/search?q=${encodeURIComponent(topic)}+${encodeURIComponent(subject)}`;

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) {
        setElapsedSeconds((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFinishSession = () => {
    setShowReflection(true);
  };

  const handleReflectionComplete = async (reflectionData: {
    confidence: number;
    notes: string;
    activityType?: string;
  }) => {
    if (!user) return;

    try {
      const endTime = new Date();
      
      await supabase.from("blurt_activity_logs").insert({
        user_id: user.id,
        session_id: sessionId,
        session_type: "gradlify",
        subject_name: subject,
        topic_name: topic,
        session_start: startTime.toISOString(),
        session_end: endTime.toISOString(),
        duration_seconds: elapsedSeconds,
        confidence_level: reflectionData.confidence,
        raw_data: {
          notes: reflectionData.notes,
          activityType: reflectionData.activityType || "Practice Questions",
          source: "gradlify",
        },
      });

      toast.success("Practice session logged!");
      onComplete();
    } catch (error) {
      console.error("Error logging session:", error);
      toast.error("Failed to log session");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-orange-500/5">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Exit
              </Button>
              <div className="hidden sm:flex items-center gap-2">
                <Calculator className="h-4 w-4 text-orange-500" />
                <span className="font-medium">{subject}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{topic}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1 text-base px-3 py-1">
                <Clock className="h-4 w-4" />
                {formatTime(elapsedSeconds)}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
              <Button
                onClick={handleFinishSession}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Finish
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
        <Card className="border-orange-500/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-orange-500" />
                  Gradlify - {topic}
                </CardTitle>
                <CardDescription>
                  Practice maths problems with step-by-step solutions
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(gradlifyUrl, "_blank")}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="bg-muted/30 p-3 border-y">
              <p className="text-xs text-muted-foreground text-center">
                <ExternalLink className="h-3 w-3 inline mr-1" />
                If you need to sign in, use the "Open in New Tab" button above
              </p>
            </div>
            <div className="aspect-video w-full">
              <iframe
                src={gradlifyUrl}
                className="w-full h-full border-0"
                title="Gradlify"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reflection Dialog */}
      <Dialog open={showReflection} onOpenChange={setShowReflection}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Session Complete!</DialogTitle>
            <DialogDescription>
              How did your Gradlify session go? ({Math.floor(elapsedSeconds / 60)} minutes)
            </DialogDescription>
          </DialogHeader>
          <ReflectionForm 
            onComplete={handleReflectionComplete}
            onCancel={() => setShowReflection(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Inline reflection form component
const ReflectionForm = ({ 
  onComplete, 
  onCancel 
}: { 
  onComplete: (data: { confidence: number; notes: string; activityType?: string }) => void;
  onCancel: () => void;
}) => {
  const [confidence, setConfidence] = useState(3);
  const [notes, setNotes] = useState("");
  const [activityType, setActivityType] = useState("Practice Questions");

  const handleSubmit = () => {
    onComplete({ confidence, notes, activityType });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Activity Type</Label>
        <Select value={activityType} onValueChange={setActivityType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Practice Questions">Practice Questions</SelectItem>
            <SelectItem value="Step-by-Step Solutions">Step-by-Step Solutions</SelectItem>
            <SelectItem value="Topic Review">Topic Review</SelectItem>
            <SelectItem value="Problem Sets">Problem Sets</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>How confident do you feel?</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setConfidence(star)}
              className="p-1 transition-colors"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= confidence
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes (optional)</Label>
        <Textarea
          placeholder="What did you learn? Any challenges?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500">
          Save Session
        </Button>
      </div>
    </div>
  );
};

export default GradlifyPracticeSession;
