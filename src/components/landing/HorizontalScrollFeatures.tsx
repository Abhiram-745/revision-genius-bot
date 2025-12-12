import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Calendar, Target, BarChart3, MessageSquare, Sparkles, Clock, TrendingUp, Zap } from "lucide-react";

const features = [
  {
    id: 1,
    title: "AI-Powered Timetables",
    description: "Smart algorithms analyze your subjects, test dates, and available time to create the perfect study plan. The AI considers cognitive load, spaced repetition, and your energy patterns.",
    icon: Brain,
    color: "from-blue-500 to-cyan-500",
    ui: {
      type: "timetable",
      sessions: [
        { time: "16:00", subject: "Biology", topic: "Photosynthesis", duration: "45 min", color: "bg-green-500/20" },
        { time: "16:50", subject: "Break", duration: "10 min", color: "bg-muted", isBreak: true },
        { time: "17:00", subject: "Chemistry", topic: "Organic Reactions", duration: "40 min", color: "bg-purple-500/20" },
        { time: "17:45", subject: "Break", duration: "15 min", color: "bg-muted", isBreak: true },
        { time: "18:00", subject: "Maths", topic: "Integration", duration: "45 min", color: "bg-blue-500/20" },
      ]
    }
  },
  {
    id: 2,
    title: "Adaptive Rescheduling",
    description: "Life happens. Missed a session? The AI automatically adjusts your plan, ensuring you still cover everything before your tests. No manual replanning needed.",
    icon: Calendar,
    color: "from-purple-500 to-pink-500",
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
    description: "Pomodoro-style focus sessions with ambient sounds keep you in the zone. Track your actual study time and see exactly how productive each session was.",
    icon: Clock,
    color: "from-orange-500 to-red-500",
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
    description: "Visual dashboards show your growth over time. Track study streaks, confidence levels, and mastery across all subjects. Celebrate your wins!",
    icon: BarChart3,
    color: "from-green-500 to-emerald-500",
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
    description: "After each session, rate your focus and understanding. The AI learns from your feedback and adapts future scheduling to optimize your learning.",
    icon: MessageSquare,
    color: "from-indigo-500 to-violet-500",
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
    description: "Get personalized insights about your study patterns. Discover your most productive times, subjects that need attention, and tips to improve.",
    icon: Sparkles,
    color: "from-pink-500 to-rose-500",
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

const FeatureUI = ({ feature, isActive }: { feature: typeof features[0]; isActive: boolean }) => {
  const { ui } = feature;
  
  if (ui.type === "timetable") {
    return (
      <div className="space-y-2">
        {ui.sessions.map((session, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: isActive ? 1 : 0.5, x: isActive ? 0 : 20 }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-center gap-3 p-3 rounded-lg ${session.color}`}
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
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
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
              animate={{ strokeDashoffset: isActive ? 352 * (1 - ui.progress / 100) : 352 }}
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
                  animate={{ scale: isActive ? 1 : 0.8 }}
                  transition={{ delay: i * 0.1 + star * 0.05 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    star <= rating.value ? "bg-primary text-white" : "bg-muted"
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
            animate={{ opacity: isActive ? 1 : 0.5, x: isActive ? 0 : -20 }}
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Map scroll progress to feature index
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const newIndex = Math.min(
      Math.floor(latest * features.length),
      features.length - 1
    );
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  });

  // Calculate x translation based on active index
  const x = useTransform(
    scrollYProgress, 
    [0, 1], 
    ["0%", `-${(features.length - 1) * 100}%`]
  );

  return (
    <section 
      ref={containerRef} 
      className="relative bg-gradient-to-b from-background via-muted/20 to-background"
      style={{ height: `${(features.length + 1) * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col">
        {/* Header */}
        <div className="pt-16 pb-8 px-6 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display font-bold mb-4"
          >
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Succeed
            </span>
          </motion.h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A complete study ecosystem designed around how your brain actually works
          </p>
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center gap-2 pb-8">
          {features.map((_, index) => (
            <motion.div
              key={index}
              className="h-1.5 rounded-full transition-all duration-500"
              animate={{
                width: index === activeIndex ? 32 : 8,
                backgroundColor: index === activeIndex 
                  ? "hsl(var(--primary))" 
                  : "hsl(var(--muted-foreground) / 0.3)"
              }}
            />
          ))}
        </div>

        {/* Horizontal scroll container */}
        <div className="flex-1 flex items-center overflow-hidden">
          <motion.div 
            className="flex h-full"
            style={{ x }}
          >
            {features.map((feature, index) => {
              const isActive = index === activeIndex;
              
              return (
                <div
                  key={feature.id}
                  className="min-w-full h-full px-6 md:px-12 flex items-center"
                >
                  <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center max-w-6xl mx-auto w-full">
                    {/* Text content */}
                    <motion.div
                      animate={{ 
                        opacity: isActive ? 1 : 0.3,
                        x: isActive ? 0 : -30,
                        scale: isActive ? 1 : 0.95
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="space-y-6"
                    >
                      <motion.div 
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}
                        animate={{ rotate: isActive ? 0 : -10 }}
                        transition={{ duration: 0.5 }}
                      >
                        <feature.icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-3xl md:text-4xl font-bold">{feature.title}</h3>
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="text-sm text-muted-foreground">
                        {index + 1} of {features.length}
                      </div>
                    </motion.div>

                    {/* UI Preview */}
                    <motion.div
                      animate={{ 
                        opacity: isActive ? 1 : 0.3,
                        x: isActive ? 0 : 30,
                        scale: isActive ? 1 : 0.9,
                        rotateY: isActive ? 0 : -5
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      style={{ perspective: 1000 }}
                    >
                      <Card className="bg-card/90 backdrop-blur-sm border-2 shadow-2xl overflow-hidden">
                        <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
                        <CardContent className="p-6 min-h-[320px]">
                          <FeatureUI feature={feature} isActive={isActive} />
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          animate={{ opacity: activeIndex === features.length - 1 ? 0 : 1 }}
          className="pb-8 text-center"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-muted-foreground text-sm flex flex-col items-center gap-2"
          >
            <span>Scroll to explore features</span>
            <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-primary"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HorizontalScrollFeatures;
