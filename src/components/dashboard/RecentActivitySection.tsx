import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, CheckCircle, Zap } from "lucide-react";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { motion } from "framer-motion";
import { OwlMascot } from "@/components/mascot/OwlMascot";

interface RecentActivitySectionProps {
  userId: string;
}

interface StudySession {
  id: string;
  subject: string;
  topic: string | null;
  planned_start: string;
  actual_duration_minutes: number | null;
  planned_duration_minutes: number;
  status: string;
}

export function RecentActivitySection({ userId }: RecentActivitySectionProps) {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) fetchSessions();
  }, [userId]);

  const fetchSessions = async () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", userId)
      .gte("planned_start", threeDaysAgo)
      .order("planned_start", { ascending: false })
      .limit(6);

    if (!error && data) {
      setSessions(data);
    }
    setLoading(false);
  };

  const formatSessionDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return `Today, ${format(date, "h:mm a")}`;
    if (isYesterday(date)) return `Yesterday, ${format(date, "h:mm a")}`;
    return format(date, "EEE, MMM d");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'in_progress': return <Zap className="h-4 w-4 text-secondary animate-pulse" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-6 text-center">
            <OwlMascot type="waving" size="lg" animate={false} />
            <p className="text-muted-foreground mt-3">No recent study sessions</p>
            <p className="text-xs text-muted-foreground">Start a session to see your activity!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sessions.map((session, i) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex-shrink-0">
              {getStatusIcon(session.status)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{session.subject}</p>
              <p className="text-xs text-muted-foreground truncate">
                {session.topic || "General study"}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-medium">
                {session.actual_duration_minutes || session.planned_duration_minutes}m
              </p>
              <p className="text-xs text-muted-foreground">
                {formatSessionDate(session.planned_start)}
              </p>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
