import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Calendar, Clock, BarChart3, MessageSquare, Sparkles, TrendingUp, Zap } from "lucide-react";

const features = [
  {
    id: 1,
    title: "AI-Powered Timetables",
    description: "Smart algorithms analyze your subjects, test dates, and available time to create the perfect study plan.",
    icon: Brain,
    ui: {
      type: "timetable",
      sessions: [
        { time: "16:00", subject: "Biology", topic: "Photosynthesis", duration: "45 min", color: "bg-green-500/20 border-green-500/30" },
        { time: "16:50", subject: "Break", duration: "10 min", color: "bg-muted/50 border-muted", isBreak: true },
        { time: "17:00", subject: "Chemistry", topic: "Organic Reactions", duration: "40 min", color: "bg-purple-500/20 border-purple-500/30" },
      ]
    }
  },
  {
    id: 2,
    title: "Adaptive Rescheduling",
    description: "Missed a session? The AI automatically adjusts your plan, ensuring you still cover everything.",
    icon: Calendar,
    ui: {
      type: "reschedule",
      original: { time: "16:00", subject: "Physics", status: "missed" },
      rescheduled: { time: "18:00", subject: "Physics", status: "rescheduled" },
      message: "Session moved to fit your updated schedule"
    }
  },
  {
    id: 3,
    title: "Session Timer & Focus",
    description: "Pomodoro-style focus sessions keep you in the zone. Track your actual study time.",
    icon: Clock,
    ui: {
      type: "timer",
      time: "23:45",
      subject: "Chemistry",
      topic: "Organic Reactions",
      progress: 65
    }
  },
  {
    id: 4,
    title: "Progress Analytics",
    description: "Visual dashboards show your growth over time. Track streaks and mastery across subjects.",
    icon: BarChart3,
    ui: {
      type: "analytics",
      streak: 12,
      hoursThisWeek: 14.5,
      topSubject: "Biology",
      improvement: "+23%"
    }
  },
  {
    id: 5,
    title: "Session Reflections",
    description: "Rate your focus and understanding. The AI learns and adapts future scheduling.",
    icon: MessageSquare,
    ui: {
      type: "reflection",
      ratings: [
        { label: "Focus", value: 4 },
        { label: "Understanding", value: 5 },
        { label: "Difficulty", value: 3 },
      ]
    }
  },
  {
    id: 6,
    title: "AI Study Insights",
    description: "Get personalized insights about your study patterns and tips to improve.",
    icon: Sparkles,
    ui: {
      type: "insights",
      insights: [
        "You focus best between 4-6 PM",
        "Chemistry needs more attention",
        "Your streak is 12 days strong!"
      ]
    }
  },
];

const FeatureUI = ({ feature }: { feature: typeof features[0] }) => {
  const { ui } = feature;
  
  if (ui.type === "timetable") {
    return (
      <div className="space-y-2">
        {ui.sessions.map((session, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-center gap-3 p-3 rounded-lg border ${session.color}`}
          >
            <span className="text-xs font-mono text-muted-foreground w-12">{session.time}</span>
            <div className="flex-1">
              <p className="font-medium text-sm">{session.subject}</p>
              {session.topic && <p className="text-xs text-muted-foreground">{session.topic}</p>}
            </div>
            <span className="text-xs text-muted-foreground">{session.duration}</span>
          </motion.div>
        ))}
      </div>
    );
  }
  
  if (ui.type === "reschedule") {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-sm font-medium">Missed Session</span>
          </div>
          <p className="text-sm text-muted-foreground">{ui.original.time} - {ui.original.subject}</p>
        </div>
        <div className="flex justify-center">
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <Zap className="w-6 h-6 text-primary" />
          </motion.div>
        </div>
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium">Rescheduled</span>
          </div>
          <p className="text-sm text-muted-foreground">{ui.rescheduled.time} - {ui.rescheduled.subject}</p>
          <p className="text-xs text-green-600 mt-2">{ui.message}</p>
        </div>
      </div>
    );
  }
  
  if (ui.type === "timer") {
    return (
      <div className="text-center space-y-4">
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-full h-full -rotate-90">
            <circle cx="64" cy="64" r="56" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
            <motion.circle 
              cx="64" cy="64" r="56" 
              fill="none" 
              stroke="hsl(var(--primary))" 
              strokeWidth="8"
              strokeDasharray={352}
              initial={{ strokeDashoffset: 352 }}
              whileInView={{ strokeDashoffset: 352 * (1 - ui.progress / 100) }}
              transition={{ duration: 1.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold font-mono">{ui.time}</span>
          </div>
        </div>
        <div>
          <p className="font-medium">{ui.subject}</p>
          <p className="text-sm text-muted-foreground">{ui.topic}</p>
        </div>
      </div>
    );
  }
  
  if (ui.type === "analytics") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-primary/10 text-center">
            <p className="text-2xl font-bold text-primary">{ui.streak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/10 text-center">
            <p className="text-2xl font-bold text-secondary">{ui.hoursThisWeek}h</p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </div>
        </div>
        <div className="p-3 rounded-lg bg-accent/10">
          <div className="flex justify-between items-center">
            <span className="text-sm">Top Subject</span>
            <span className="font-medium">{ui.topSubject}</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 text-green-500">
          <TrendingUp className="w-4 h-4" />
          <span className="font-medium">{ui.improvement} improvement</span>
        </div>
      </div>
    );
  }
  
  if (ui.type === "reflection") {
    return (
      <div className="space-y-4">
        {ui.ratings.map((rating, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{rating.label}</span>
              <span className="text-muted-foreground">{rating.value}/5</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.div
                  key={star}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: i * 0.1 + star * 0.05 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    star <= rating.value ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {star}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (ui.type === "insights") {
    return (
      <div className="space-y-3">
        {ui.insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-primary/5"
          >
            <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm">{insight}</p>
          </motion.div>
        ))}
      </div>
    );
  }
  
  return null;
};

const FeatureCard = ({ 
  feature, 
  index, 
  progress 
}: { 
  feature: typeof features[0]; 
  index: number;
  progress: any;
}) => {
  const Icon = feature.icon;
  
  // Each card takes 1/6 of the scroll progress
  const cardStart = index / features.length;
  const cardEnd = (index + 1) / features.length;
  
  // Scale: 0.8 -> 1 -> 0.95 (grows to full then shrinks slightly as it leaves)
  const scale = useTransform(
    progress,
    [cardStart - 0.1, cardStart, cardEnd, cardEnd + 0.1],
    [0.85, 1, 1, 0.95]
  );
  
  // Y position: starts below, comes to center, moves up
  const y = useTransform(
    progress,
    [cardStart - 0.15, cardStart, cardEnd, cardEnd + 0.1],
    [100, 0, 0, -50]
  );
  
  // Opacity: fade in and out
  const opacity = useTransform(
    progress,
    [cardStart - 0.1, cardStart, cardEnd - 0.05, cardEnd + 0.05],
    [0, 1, 1, 0]
  );
  
  // Z-index based on position (active cards on top)
  const zIndex = useTransform(
    progress,
    [cardStart - 0.1, cardStart, cardEnd],
    [0, 10, 5]
  );

  return (
    <motion.div
      style={{ scale, y, opacity, zIndex }}
      className="absolute inset-0 flex items-center justify-center px-4"
    >
      <Card className="w-full max-w-4xl bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left side - Text content */}
            <div className="p-6 md:p-8 flex flex-col justify-center space-y-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <Icon className="w-7 h-7 text-primary-foreground" />
              </div>
              
              <div>
                <h3 className="text-xl md:text-2xl font-display font-bold mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>
              
              {/* Progress indicator */}
              <div className="flex items-center gap-2 pt-4">
                {features.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === index 
                        ? "w-8 bg-primary" 
                        : "w-2 bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* Right side - UI preview */}
            <div className="p-6 md:p-8 bg-muted/30 border-l border-border/50 flex items-center justify-center">
              <div className="w-full max-w-xs">
                <FeatureUI feature={feature} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const HorizontalScrollFeatures = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <section
      ref={containerRef}
      className="relative bg-gradient-to-b from-background via-muted/10 to-background"
      style={{ height: `${features.length * 100}vh` }}
    >
      {/* Sticky container that holds cards */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 px-4 relative z-20"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A complete study ecosystem designed around how your brain actually works
          </p>
        </motion.div>

        {/* Cards container */}
        <div className="relative w-full flex-1 max-h-[500px] md:max-h-[400px]">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              index={index}
              progress={scrollYProgress}
            />
          ))}
        </div>

        {/* Scroll hint */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground text-sm flex flex-col items-center gap-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span>Scroll to explore features</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-muted-foreground">
              <path d="M10 3v14m0 0l-5-5m5 5l5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HorizontalScrollFeatures;
