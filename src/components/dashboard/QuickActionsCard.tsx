import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ClipboardList, 
  CalendarPlus, 
  TrendingUp, 
  Sparkles, 
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const QuickActionsCard = () => {
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  const primaryActions = [
    {
      label: "Add Homework",
      icon: ClipboardList,
      onClick: () => navigate("/agenda"),
      color: "text-blue-500",
    },
    {
      label: "Practice",
      icon: Sparkles,
      onClick: () => navigate("/practice"),
      color: "text-secondary",
    },
    {
      label: "Timetable",
      icon: Calendar,
      onClick: () => navigate("/timetables"),
      color: "text-primary",
    },
  ];

  const secondaryActions = [
    {
      label: "Add Event",
      icon: CalendarPlus,
      onClick: () => navigate("/agenda"),
    },
    {
      label: "Log Score",
      icon: TrendingUp,
      onClick: () => navigate("/insights"),
    },
    {
      label: "Insights",
      icon: BarChart3,
      onClick: () => navigate("/insights"),
    },
  ];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            ⚡ Quick Actions
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground"
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? (
              <>Less <ChevronUp className="h-3 w-3 ml-1" /></>
            ) : (
              <>More <ChevronDown className="h-3 w-3 ml-1" /></>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Primary actions - always visible */}
        <div className="grid grid-cols-3 gap-2">
          {primaryActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              size="sm"
              onClick={action.onClick}
              className="flex flex-col h-auto py-3 px-2 gap-1.5 hover:bg-primary/5 hover:border-primary/30 transition-all"
            >
              <action.icon className={`h-4 w-4 ${action.color}`} />
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Secondary actions - collapsible */}
        <AnimatePresence>
          {showMore && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-3 gap-2 overflow-hidden"
            >
              {secondaryActions.map((action) => (
                <Button
                  key={action.label}
                  variant="ghost"
                  size="sm"
                  onClick={action.onClick}
                  className="flex flex-col h-auto py-2 px-2 gap-1 text-muted-foreground hover:text-foreground"
                >
                  <action.icon className="h-3.5 w-3.5" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
