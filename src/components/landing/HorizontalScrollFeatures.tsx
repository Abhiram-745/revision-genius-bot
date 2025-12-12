import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Calendar, Clock, BarChart3, MessageSquare, Sparkles, TrendingUp, Zap, ChevronDown } from "lucide-react";

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
            animate={{ opacity: 1, x: 0 }}
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
              animate={{ strokeDashoffset: 352 * (1 - ui.progress / 100) }}
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
                  animate={{ scale: 1 }}
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
            animate={{ opacity: 1, x: 0 }}
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

const HorizontalScrollFeatures = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Track scroll progress through the section using CSS sticky
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  // Calculate active index based on scroll progress
  const activeIndexValue = useTransform(
    scrollYProgress,
    [0, 0.12, 0.28, 0.44, 0.60, 0.76, 0.92, 1],
    [0, 0, 1, 2, 3, 4, 5, 5]
  );

  useMotionValueEvent(activeIndexValue, "change", (latest) => {
    setActiveIndex(Math.round(latest));
  });

  const currentFeature = features[activeIndex];
  const Icon = currentFeature?.icon || Brain;

  return (
    <section
      ref={sectionRef}
      className="relative bg-gradient-to-b from-background via-muted/10 to-background"
      style={{ height: `${(features.length + 1) * 100}vh` }}
    >
      {/* Sticky container that stays pinned while scrolling */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center px-4 py-8 overflow-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 relative z-20"
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

        {/* Card Container */}
        <div className="relative flex-1 w-full max-w-4xl flex items-center justify-center">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.4 
            }}
            className="w-full"
          >
            <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Left side - Text content */}
                  <div className="p-6 md:p-8 flex flex-col justify-center space-y-4">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring" }}
                      className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg"
                    >
                      <Icon className="w-7 h-7 text-primary-foreground" />
                    </motion.div>
                    
                    <div>
                      <motion.h3 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-xl md:text-2xl font-display font-bold mb-2"
                      >
                        {currentFeature?.title}
                      </motion.h3>
                      <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground text-sm md:text-base leading-relaxed"
                      >
                        {currentFeature?.description}
                      </motion.p>
                    </div>
                  </div>
                  
                  {/* Right side - UI Preview */}
                  <div className="bg-muted/20 p-6 md:p-8 border-l border-border/30 flex items-center justify-center min-h-[280px]">
                    <div className="w-full max-w-xs">
                      {currentFeature && <FeatureUI feature={currentFeature} />}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Feature counter */}
          <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10">
            <span className="text-sm font-mono text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border border-border/50">
              {String(activeIndex + 1).padStart(2, "0")} / {String(features.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {features.map((_, i) => (
            <motion.div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-8 bg-primary"
                  : i < activeIndex
                  ? "w-2 bg-primary/50"
                  : "w-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Scroll hint */}
        <motion.div
          className="flex flex-col items-center mt-4 text-muted-foreground"
          animate={{ opacity: activeIndex === features.length - 1 ? 0.3 : 1 }}
        >
          <span className="text-sm mb-1">
            {activeIndex === features.length - 1 ? "Keep scrolling to continue" : "Scroll to explore features"}
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HorizontalScrollFeatures;
