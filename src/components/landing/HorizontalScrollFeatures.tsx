import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Calendar, Clock, BarChart3, MessageSquare, Sparkles, TrendingUp, Zap, ChevronDown } from "lucide-react";

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
        { time: "16:00", subject: "Biology", topic: "Photosynthesis", duration: "45 min", color: "bg-green-500/20 border-green-500/30" },
        { time: "16:50", subject: "Break", duration: "10 min", color: "bg-muted/50 border-muted", isBreak: true },
        { time: "17:00", subject: "Chemistry", topic: "Organic Reactions", duration: "40 min", color: "bg-purple-500/20 border-purple-500/30" },
        { time: "17:45", subject: "Break", duration: "15 min", color: "bg-muted/50 border-muted", isBreak: true },
        { time: "18:00", subject: "Maths", topic: "Integration", duration: "45 min", color: "bg-blue-500/20 border-blue-500/30" },
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
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const lastScrollTime = useRef(0);
  const touchStartY = useRef(0);
  const scrollCooldown = 500;

  const handleFeatureChange = useCallback((direction: "up" | "down") => {
    const now = Date.now();
    if (now - lastScrollTime.current < scrollCooldown) return;
    lastScrollTime.current = now;

    if (direction === "down") {
      if (activeIndex < features.length - 1) {
        setActiveIndex(prev => prev + 1);
      } else {
        // Last feature, scroll down - release lock
        setIsLocked(false);
        document.body.style.overflow = "";
        // Scroll past the section
        setTimeout(() => {
          if (sectionRef.current) {
            const rect = sectionRef.current.getBoundingClientRect();
            window.scrollBy({ top: rect.height - window.innerHeight + 100, behavior: "smooth" });
          }
        }, 50);
      }
    } else {
      if (activeIndex > 0) {
        setActiveIndex(prev => prev - 1);
      } else {
        // First feature, scroll up - release lock
        setIsLocked(false);
        document.body.style.overflow = "";
        // Scroll to top of section
        setTimeout(() => {
          if (sectionRef.current) {
            const rect = sectionRef.current.getBoundingClientRect();
            window.scrollBy({ top: rect.top - 100, behavior: "smooth" });
          }
        }, 50);
      }
    }
  }, [activeIndex]);

  // Intersection observer to detect when section is in view
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const rect = section.getBoundingClientRect();
            // Only lock if section is centered in viewport
            if (rect.top <= 50 && rect.top >= -50) {
              setIsLocked(true);
            }
          }
        });
      },
      { threshold: [0.6] }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Handle scroll locking
  useEffect(() => {
    if (!isLocked) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const direction = e.deltaY > 0 ? "down" : "up";
      handleFeatureChange(direction);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        handleFeatureChange("down");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        handleFeatureChange("up");
      } else if (e.key === "Escape") {
        setIsLocked(false);
        document.body.style.overflow = "";
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY.current - touchEndY;
      
      if (Math.abs(diff) > 50) {
        const direction = diff > 0 ? "down" : "up";
        handleFeatureChange(direction);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isLocked, handleFeatureChange]);

  // Re-lock when scrolling back to section
  useEffect(() => {
    const handleScroll = () => {
      if (isLocked) return;
      
      const section = sectionRef.current;
      if (!section) return;
      
      const rect = section.getBoundingClientRect();
      // Lock when section is centered
      if (rect.top <= 50 && rect.top >= -50 && rect.bottom > window.innerHeight) {
        setIsLocked(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLocked]);

  const currentFeature = features[activeIndex];

  return (
    <section
      ref={sectionRef}
      className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background relative"
    >
      <div className="h-screen flex flex-col items-center justify-center px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
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

        {/* Progress Bar */}
        <div className="w-full max-w-xs mb-6">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-secondary"
              animate={{ width: `${((activeIndex + 1) / features.length) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{activeIndex + 1} of {features.length}</span>
            <span className={isLocked ? "text-primary" : ""}>
              {isLocked ? "Scroll to navigate" : "Entering feature view..."}
            </span>
          </div>
        </div>

        {/* Feature Content */}
        <div className="w-full max-w-6xl flex-1 flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full grid md:grid-cols-2 gap-8 md:gap-16 items-center"
            >
              {/* Text Content */}
              <div className="space-y-6 order-2 md:order-1">
                <motion.div 
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentFeature.color} flex items-center justify-center shadow-lg`}
                >
                  <currentFeature.icon className="w-8 h-8 text-white" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-2xl md:text-4xl font-bold"
                >
                  {currentFeature.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg text-muted-foreground leading-relaxed"
                >
                  {currentFeature.description}
                </motion.p>
              </div>

              {/* UI Preview */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotateY: -5 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="order-1 md:order-2"
                style={{ perspective: 1000 }}
              >
                <Card className="bg-card/90 backdrop-blur-sm border-2 shadow-2xl overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${currentFeature.color}`} />
                  <CardContent className="p-6 min-h-[320px]">
                    <FeatureUI feature={currentFeature} isActive={true} />
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Feature Dots */}
        <div className="flex gap-2 mt-4 mb-2">
          {features.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex 
                  ? "w-8 bg-primary" 
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>

        {/* Scroll Hint */}
        <motion.div
          animate={{ y: [0, 8, 0], opacity: 1 }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-muted-foreground pb-4"
        >
          <span className="text-sm">
            {activeIndex === features.length - 1 ? "Scroll down to continue" : "Scroll to explore"}
          </span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </div>
    </section>
  );
};

export default HorizontalScrollFeatures;
