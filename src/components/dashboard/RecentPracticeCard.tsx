import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, ChevronRight, Brain, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";

interface PracticeSession {
  id: string;
  subject_name: string;
  topic_name: string;
  score_percentage: number | null;
  duration_seconds: number;
  created_at: string;
}

interface RecentPracticeCardProps {
  userId: string;
}

export const RecentPracticeCard = ({ userId }: RecentPracticeCardProps) => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchRecentSessions();
  }, [userId]);

  const fetchRecentSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("blurt_activity_logs")
        .select("id, subject_name, topic_name, score_percentage, duration_seconds, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Error fetching practice sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 1) return "<1m";
    return `${mins}m`;
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-orange-500";
  };

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="h-32 animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-secondary" />
            Recent Practice
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => navigate("/blurt-ai")}
          >
            Practice
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-4">
            <Brain className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">No practice sessions yet</p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate("/blurt-ai")}
              className="gap-1"
            >
              <Sparkles className="h-3 w-3" />
              Start Practice
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.topic_name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{session.subject_name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(session.duration_seconds)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  {session.score_percentage !== null ? (
                    <>
                      <span className={`text-lg font-bold ${getScoreColor(session.score_percentage)}`}>
                        {Math.round(session.score_percentage)}%
                      </span>
                      <Progress 
                        value={session.score_percentage} 
                        className="h-1 w-16 mt-1"
                      />
                    </>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      No score
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
