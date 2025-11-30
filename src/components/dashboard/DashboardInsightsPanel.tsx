import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StudyInsightsPanel } from "@/components/StudyInsightsPanel";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Brain, Activity } from "lucide-react";

interface Timetable {
  id: string;
  name: string;
}

interface DashboardInsightsPanelProps {
  userId: string;
}

export const DashboardInsightsPanel = ({ userId }: DashboardInsightsPanelProps) => {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [selectedTimetableId, setSelectedTimetableId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetables = async () => {
      const { data } = await supabase
        .from("timetables")
        .select("id, name")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setTimetables(data);
        setSelectedTimetableId(data[0].id);
      }
      setLoading(false);
    };

    if (userId) {
      fetchTimetables();
    }
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (timetables.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Create a timetable to see AI-powered study insights
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="section-header">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="section-title">✨ Study Analytics & AI Insights</h2>
          <p className="text-sm text-muted-foreground">Personalized feedback on your performance</p>
        </div>
      </div>

      {/* Timetable Selector */}
      {timetables.length > 1 && (
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Select value={selectedTimetableId || ""} onValueChange={setSelectedTimetableId}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select a timetable to analyze" />
                  </SelectTrigger>
                  <SelectContent>
                    {timetables.map((tt) => (
                      <SelectItem key={tt.id} value={tt.id}>
                        <span className="font-medium">{tt.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Study Insights Panel - Same as AI Insights page */}
      {selectedTimetableId && (
        <StudyInsightsPanel timetableId={selectedTimetableId} />
      )}
    </div>
  );
};
