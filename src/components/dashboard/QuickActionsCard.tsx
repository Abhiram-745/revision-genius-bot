import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ClipboardList, 
  CalendarPlus, 
  TrendingUp, 
  Sparkles, 
  BarChart3,
  Calendar
} from "lucide-react";

export const QuickActionsCard = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Add Homework",
      icon: ClipboardList,
      onClick: () => navigate("/homework"),
      variant: "outline" as const,
    },
    {
      label: "Add Event",
      icon: CalendarPlus,
      onClick: () => navigate("/events"),
      variant: "outline" as const,
    },
    {
      label: "Log Score",
      icon: TrendingUp,
      onClick: () => navigate("/test-scores"),
      variant: "outline" as const,
    },
    {
      label: "Practice",
      icon: Sparkles,
      onClick: () => navigate("/blurt-ai"),
      variant: "secondary" as const,
    },
    {
      label: "Insights",
      icon: BarChart3,
      onClick: () => navigate("/ai-insights"),
      variant: "outline" as const,
    },
    {
      label: "Timetable",
      icon: Calendar,
      onClick: () => navigate("/timetables"),
      variant: "outline" as const,
    },
  ];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          ⚡ Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant}
              size="sm"
              onClick={action.onClick}
              className="flex flex-col h-auto py-3 px-2 gap-1.5"
            >
              <action.icon className="h-4 w-4" />
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
