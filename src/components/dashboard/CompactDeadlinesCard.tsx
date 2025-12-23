import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, isPast, isToday, isTomorrow, differenceInDays, parseISO } from "date-fns";
import { MascotMessage } from "@/components/mascot/MascotMessage";

interface Homework {
  id: string;
  title: string;
  subject: string;
  due_date: string;
  completed: boolean;
}

interface CompactDeadlinesCardProps {
  userId: string;
}

export const CompactDeadlinesCard = ({ userId }: CompactDeadlinesCardProps) => {
  const navigate = useNavigate();
  const [deadlines, setDeadlines] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchDeadlines();
  }, [userId]);

  const fetchDeadlines = async () => {
    try {
      const { data, error } = await supabase
        .from("homeworks")
        .select("id, title, subject, due_date, completed")
        .eq("user_id", userId)
        .eq("completed", false)
        .gte("due_date", new Date().toISOString().split("T")[0])
        .order("due_date", { ascending: true })
        .limit(4);

      if (error) throw error;
      setDeadlines(data || []);
    } catch (error) {
      console.error("Error fetching deadlines:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDeadlineStatus = (dueDate: string) => {
    const date = parseISO(dueDate);
    if (isPast(date) && !isToday(date)) {
      return { label: "Overdue", variant: "destructive" as const, icon: AlertTriangle };
    }
    if (isToday(date)) {
      return { label: "Today", variant: "destructive" as const, icon: Clock };
    }
    if (isTomorrow(date)) {
      return { label: "Tomorrow", variant: "secondary" as const, icon: Clock };
    }
    const days = differenceInDays(date, new Date());
    return { label: `${days}d`, variant: "outline" as const, icon: Clock };
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
            <Clock className="h-4 w-4 text-primary" />
            Upcoming Deadlines
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => navigate("/agenda")}
          >
            View All
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {deadlines.length === 0 ? (
          <MascotMessage
            type="sleeping"
            message="No upcoming deadlines!"
            subMessage="Time to relax or get ahead."
            size="sm"
          />
        ) : (
          <div className="space-y-2">
            {deadlines.map((deadline) => {
              const status = getDeadlineStatus(deadline.due_date);
              return (
                <div
                  key={deadline.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => navigate("/agenda")}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{deadline.title}</p>
                    <p className="text-xs text-muted-foreground">{deadline.subject}</p>
                  </div>
                  <Badge variant={status.variant} className="text-xs ml-2">
                    {status.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
