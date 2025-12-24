import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { OwlMascot } from "@/components/mascot/OwlMascot";

const STUDY_TIPS = [
  { tip: "Take short breaks every 25-30 minutes to stay focused and refreshed.", owl: "lightbulb" as const },
  { tip: "Review your notes within 24 hours to boost retention by 70%.", owl: "waving" as const },
  { tip: "Teach what you've learned to someone else - it's the best way to master a topic!", owl: "thumbsup" as const },
  { tip: "Stay hydrated! Your brain works better when you're well-hydrated.", owl: "happy" as const },
  { tip: "Use active recall: test yourself instead of just re-reading notes.", owl: "magnifying" as const },
  { tip: "Study in different locations to improve memory recall.", owl: "folder" as const },
  { tip: "Get enough sleep - your brain consolidates memories while you rest.", owl: "sleeping" as const },
  { tip: "Break large tasks into smaller, manageable chunks.", owl: "checklist" as const },
  { tip: "Use the Pomodoro technique: 25 min focus, 5 min break.", owl: "chart" as const },
  { tip: "Connect new information to things you already know.", owl: "waving" as const },
];

export function StudyTipsCard() {
  const [tipIndex, setTipIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Random tip on mount
    setTipIndex(Math.floor(Math.random() * STUDY_TIPS.length));
  }, []);

  const nextTip = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setTipIndex((prev) => (prev + 1) % STUDY_TIPS.length);
      setIsAnimating(false);
    }, 200);
  };

  const currentTip = STUDY_TIPS[tipIndex];

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-yellow-500/10 via-lime-500/5 to-emerald-500/10 border-lime-500/20">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={tipIndex}
            className="flex-shrink-0"
          >
            <OwlMascot type={currentTip.owl} size="lg" />
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">Study Tip</span>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.p
                key={tipIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-foreground leading-relaxed"
              >
                {currentTip.tip}
              </motion.p>
            </AnimatePresence>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={nextTip}
              disabled={isAnimating}
              className="mt-3 gap-1 text-xs hover:bg-lime-500/10"
            >
              <RefreshCw className={`h-3 w-3 ${isAnimating ? 'animate-spin' : ''}`} />
              Another tip
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
