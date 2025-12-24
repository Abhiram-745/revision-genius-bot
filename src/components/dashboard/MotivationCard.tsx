import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, TrendingUp, Sparkles } from "lucide-react";
import { OwlMascot } from "@/components/mascot/OwlMascot";

// Collection of study motivation quotes
const studyQuotes = [
  { quote: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { quote: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "Education is the passport to the future.", author: "Malcolm X" },
  { quote: "The more you learn, the more you earn.", author: "Warren Buffett" },
  { quote: "Don't let yesterday take up too much of today.", author: "Will Rogers" },
  { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { quote: "A little progress each day adds up to big results.", author: "Satya Nani" },
  { quote: "The beautiful thing about learning is nobody can take it away from you.", author: "B.B. King" },
  { quote: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { quote: "Great things never come from comfort zones.", author: "Unknown" },
  { quote: "Dream big. Start small. Act now.", author: "Robin Sharma" },
  { quote: "Your limitation—it's only your imagination.", author: "Unknown" },
  { quote: "Sometimes later becomes never. Do it now.", author: "Unknown" },
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
];

interface MotivationCardProps {
  streak: number;
  weeklyHours: number;
  sessionsCompleted: number;
}

export const MotivationCard = ({ streak, weeklyHours, sessionsCompleted }: MotivationCardProps) => {
  const [dailyQuote, setDailyQuote] = useState({ quote: "", author: "" });

  useEffect(() => {
    // Get a consistent quote for the day based on the date
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const quoteIndex = dayOfYear % studyQuotes.length;
    setDailyQuote(studyQuotes[quoteIndex]);
  }, []);

  // Calculate momentum based on recent activity
  const calculateMomentum = () => {
    // Simple momentum calculation based on streak and sessions
    const streakBonus = Math.min(streak * 10, 50);
    const hourBonus = Math.min(weeklyHours * 5, 30);
    const sessionBonus = Math.min(sessionsCompleted * 2, 20);
    return Math.min(streakBonus + hourBonus + sessionBonus, 100);
  };

  const momentum = calculateMomentum();

  // Momentum level text
  const getMomentumLevel = () => {
    if (momentum >= 80) return { text: "On Fire!", color: "text-orange-500" };
    if (momentum >= 60) return { text: "Building Up", color: "text-emerald-500" };
    if (momentum >= 40) return { text: "Getting Started", color: "text-blue-500" };
    if (momentum >= 20) return { text: "Warming Up", color: "text-amber-500" };
    return { text: "Just Starting", color: "text-muted-foreground" };
  };

  const momentumLevel = getMomentumLevel();

  return (
    <Card className="h-full bg-gradient-to-br from-primary/5 via-card to-accent/5 border-primary/10 overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        {/* Quote Section */}
        <div className="mb-5">
          <div className="flex items-start gap-3 mb-3">
            <motion.div 
              className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent shrink-0"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Quote className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </motion.div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Quote of the Day</h3>
              <p className="text-xs text-muted-foreground">Daily motivation</p>
            </div>
          </div>
          
          <motion.div 
            className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm sm:text-base font-medium italic leading-relaxed">
              "{dailyQuote.quote}"
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">— {dailyQuote.author}</p>
          </motion.div>
        </div>

        {/* Momentum Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Study Momentum</span>
            </div>
            <span className={`text-sm font-bold ${momentumLevel.color}`}>
              {momentumLevel.text}
            </span>
          </div>
          
          {/* Momentum Bar */}
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-accent to-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${momentum}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/30 to-transparent rounded-full"
              style={{ width: `${momentum}%` }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Based on your {streak} day streak and {weeklyHours}h this week
          </p>
        </div>

        {/* Owl with encouragement */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
          <OwlMascot type="happy" size="sm" animate />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {streak > 0 
                ? `${streak} day streak! Keep it up! 🔥` 
                : "Start your streak today!"}
            </p>
            <p className="text-xs text-muted-foreground">
              {sessionsCompleted > 0 
                ? `${sessionsCompleted} sessions completed` 
                : "Complete a session to build momentum"}
            </p>
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-5 w-5 text-primary" />
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
};
