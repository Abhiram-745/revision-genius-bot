import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, Play, ChevronRight } from "lucide-react";
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface UpcomingSessionsCardProps {
  userId: string;
}

interface Session {
  id: string;
  subject: string;
  topic: string | null;
  planned_start: string;
  planned_duration_minutes: number;
  timetable_id: string | null;
}

export function UpcomingSessionsCard({ userId }: UpcomingSessionsCardProps) {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) fetchSessions();
  }, [userId]);

  const fetchSessions = async () => {
    const now = new Date().toISOString();
    const tomorrow = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const { data } = await supabase
      .from("study_sessions")
      .select("id, subject, topic, planned_start, planned_duration_minutes, timetable_id")
      .eq("user_id", userId)
      .eq("status", "pending")
      .gte("planned_start", now)
      .lte("planned_start", tomorrow)
      .order("planned_start", { ascending: true })
      .limit(4);

    if (data) setSessions(data);
    setLoading(false);
  };

  const formatTime = (dateStr: string) => {
    const date = parseISO(dateStr);
    const dayLabel = isToday(date) ? "Today" : isTomorrow(date) ? "Tomorrow" : format(date, "EEE");
    return `${dayLabel}, ${format(date, "h:mm a")}`;
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-card to-secondary/5 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-secondary" />
            Upcoming Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2].map(i => <div key={i} className="h-16 bg-muted rounded-lg" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card to-secondary/5 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-secondary" />
          Upcoming Sessions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No sessions scheduled for today or tomorrow
          </p>
        ) : (
          sessions.map((session, i) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{session.subject}</p>
                <p className="text-xs text-muted-foreground">{formatTime(session.planned_start)}</p>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="gap-1"
                onClick={() => session.timetable_id && navigate(`/timetable/${session.timetable_id}`)}
              >
                <Play className="h-3 w-3" />
              </Button>
            </motion.div>
          ))
        )}
        <Button 
          variant="ghost" 
          className="w-full mt-2 text-sm gap-1"
          onClick={() => navigate("/timetables")}
        >
          View All <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
