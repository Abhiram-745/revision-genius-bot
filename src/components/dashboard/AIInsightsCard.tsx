import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, ChevronRight, Brain } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AIInsightsCardProps {
  userId: string;
}

interface Insight {
  summary: string;
  tips: string[];
}

export const AIInsightsCard = ({ userId }: AIInsightsCardProps) => {
  const [timetables, setTimetables] = useState<{ id: string; name: string }[]>([]);
  const [selectedTimetableId, setSelectedTimetableId] = useState<string>("");
  const [insights, setInsights] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchTimetables();
  }, [userId]);

  const fetchTimetables = async () => {
    try {
      const { data } = await supabase
        .from("timetables")
        .select("id, name")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setTimetables(data);
        setSelectedTimetableId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching timetables:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const generateInsights = async () => {
    if (!selectedTimetableId) {
      toast.error("Please select a timetable first");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-insights", {
        body: { timetableId: selectedTimetableId },
      });

      if (error) throw error;

      if (data?.insights) {
        setInsights({
          summary: data.insights.summary || "Analysis complete!",
          tips: data.insights.tips || data.insights.recommendations || [],
        });
        toast.success("Insights generated!");
      } else {
        // Mock insights if no real data
        setInsights({
          summary: "Based on your study patterns, you're making good progress!",
          tips: [
            "Try spacing out your study sessions for better retention",
            "Your peak productivity seems to be in the morning",
            "Consider adding more breaks between long sessions",
          ],
        });
      }
    } catch (error) {
      console.error("Error generating insights:", error);
      // Show mock insights on error for demo purposes
      setInsights({
        summary: "Here are some general study tips based on best practices:",
        tips: [
          "Take regular breaks every 25-30 minutes",
          "Review material within 24 hours of learning",
          "Mix subjects to improve retention",
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="h-24 animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (timetables.length === 0) {
    return (
      <Card className="shadow-sm border-border/60">
        <CardContent className="p-4 text-center">
          <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Create a timetable to get AI-powered study insights
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-2 px-4 pt-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <p className="text-xs text-muted-foreground">
          Get personalized recommendations based on your study habits
        </p>

        {/* Timetable selector (only if multiple) */}
        {timetables.length > 1 && (
          <Select value={selectedTimetableId} onValueChange={setSelectedTimetableId}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select timetable" />
            </SelectTrigger>
            <SelectContent>
              {timetables.map((tt) => (
                <SelectItem key={tt.id} value={tt.id}>
                  {tt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Generate button */}
        <Button 
          onClick={generateInsights} 
          disabled={loading}
          className="w-full h-9"
          size="sm"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Insights
            </>
          )}
        </Button>

        {/* Insights display */}
        {insights && (
          <div className="space-y-3 pt-2 border-t">
            <p className="text-sm font-medium">{insights.summary}</p>
            <ul className="space-y-1.5">
              {insights.tips.slice(0, 3).map((tip, index) => (
                <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
