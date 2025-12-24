import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Calendar, Clock, BarChart3, MessageSquare, Sparkles, TrendingUp, Zap, Star, Rocket, Target, Heart } from "lucide-react";
import { Cube3D, Sphere3D, Diamond3D, Hexagon3D, GlowingParticle } from "./3DObjects";
import { useIsMobile } from "@/hooks/use-mobile";

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

// Floating 3D icons for decoration
const decorativeIcons = [
  { Icon: Star, x: 5, y: 20, size: 24, delay: 0 },
  { Icon: Rocket, x: 95, y: 15, size: 28, delay: 0.1 },
  { Icon: Target, x: 8, y: 80, size: 22, delay: 0.2 },
  { Icon: Heart, x: 92, y: 75, size: 26, delay: 0.3 },
  { Icon: Zap, x: 15, y: 50, size: 20, delay: 0.4 },
  { Icon: Sparkles, x: 85, y: 45, size: 24, delay: 0.5 },
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
  const [isLocked, setIsLocked] = useState(false);
  const hasExited = useRef(false);
  const lastScrollTime = useRef(0);
  const touchStartY = useRef(0);
  const lastTouchY = useRef(0);
  const isMobile = useIsMobile();

  const lockScroll = useCallback(() => {
    if (isLocked || hasExited.current || isMobile) return;
    document.body.style.overflow = 'hidden';
    setIsLocked(true);
  }, [isLocked, isMobile]);

  const unlockScroll = useCallback((direction: 'up' | 'down') => {
    document.body.style.overflow = '';
    setIsLocked(false);
    hasExited.current = true;
    
    // Smooth scroll to exit the section
    window.scrollBy({ 
      top: direction === 'down' ? 200 : -200, 
      behavior: 'smooth' 
    });
    
    // Cooldown before re-locking
    setTimeout(() => {
      hasExited.current = false;
    }, 1000);
  }, []);

  // Handle wheel events - smooth continuous (disabled on mobile)
  const handleWheel = useCallback((e: WheelEvent) => {
    if (isMobile) return; // Skip on mobile
    
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const sectionInView = rect.top <= window.innerHeight * 0.3 && rect.bottom >= window.innerHeight * 0.7;

    if (!sectionInView || hasExited.current) {
      if (isLocked) {
        document.body.style.overflow = '';
        setIsLocked(false);
      }
      return;
    }

    if (!isLocked && !hasExited.current) {
      lockScroll();
    }

    e.preventDefault();
    
    // Increased debounce - requires more scrolling per step
    const now = Date.now();
    if (now - lastScrollTime.current < 1200) return;
    lastScrollTime.current = now;
    
    if (e.deltaY > 0) {
      // Scrolling down
      if (activeIndex < features.length - 1) {
        setActiveIndex(prev => prev + 1);
      } else {
        unlockScroll('down');
      }
    } else {
      // Scrolling up
      if (activeIndex > 0) {
        setActiveIndex(prev => prev - 1);
      } else {
        unlockScroll('up');
      }
    }
  }, [isLocked, activeIndex, lockScroll, unlockScroll, isMobile]);

  // Handle touch events (disabled on mobile for natural scrolling)
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (isMobile) return;
    touchStartY.current = e.touches[0].clientY;
    lastTouchY.current = e.touches[0].clientY;
  }, [isMobile]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (isMobile) return;
    
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const sectionInView = rect.top <= window.innerHeight * 0.3 && rect.bottom >= window.innerHeight * 0.7;

    if (!sectionInView || hasExited.current) {
      if (isLocked) {
        document.body.style.overflow = '';
        setIsLocked(false);
      }
      return;
    }

    if (!isLocked && !hasExited.current) {
      lockScroll();
    }
    
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;
    
    if (Math.abs(deltaY) < 50) return;
    
    // Debounce
    const now = Date.now();
    if (now - lastScrollTime.current < 350) return;
    lastScrollTime.current = now;
    
    if (deltaY > 0) {
      if (activeIndex < features.length - 1) {
        setActiveIndex(prev => prev + 1);
      } else {
        unlockScroll('down');
      }
    } else {
      if (activeIndex > 0) {
        setActiveIndex(prev => prev - 1);
      } else {
        unlockScroll('up');
      }
    }
  }, [isLocked, activeIndex, lockScroll, unlockScroll, isMobile]);

  // Add/remove listeners (only on desktop)
  useEffect(() => {
    if (isMobile) return; // Skip event listeners on mobile
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleWheel, handleTouchStart, handleTouchEnd, isMobile]);

  // Keyboard support (only on desktop)
  useEffect(() => {
    if (!isLocked || isMobile) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        if (activeIndex < features.length - 1) {
          setActiveIndex(prev => prev + 1);
        } else {
          unlockScroll('down');
        }
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        if (activeIndex > 0) {
          setActiveIndex(prev => prev - 1);
        } else {
          unlockScroll('up');
        }
      } else if (e.key === 'Escape') {
        unlockScroll('down');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, activeIndex, unlockScroll, isMobile]);

  // Cleanup
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const currentFeature = features[activeIndex];
  const Icon = currentFeature.icon;

  // MOBILE VERSION - Stacked cards, no scroll jacking
  if (isMobile) {
    return (
      <section className="py-16 bg-gradient-to-b from-background via-muted/10 to-background">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl font-display font-bold mb-3">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="text-muted-foreground text-sm">
              A complete study ecosystem designed around how your brain actually works
            </p>
          </motion.div>

          <div className="space-y-6">
            {features.map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden border-0 shadow-lg bg-card/80">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                          <FeatureIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // DESKTOP VERSION - Original scroll-jacking behavior
  return (
    <section
      ref={sectionRef}
      className="h-screen relative bg-gradient-to-b from-background via-muted/10 to-background overflow-hidden"
    >
      {/* Floating 3D Icons */}
      {decorativeIcons.map(({ Icon, x, y, size, delay }, index) => (
        <motion.div
          key={index}
          className="absolute pointer-events-none"
          style={{ left: `${x}%`, top: `${y}%` }}
          initial={{ opacity: 0, scale: 0, rotate: -30 }}
          animate={{ 
            opacity: 0.4, 
            scale: 1, 
            rotate: 0,
            y: [0, -10, 0],
          }}
          transition={{ 
            delay,
            y: { duration: 3 + index * 0.5, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <motion.div
            animate={{ rotateY: 360 }}
            transition={{ duration: 8 + index, repeat: Infinity, ease: "linear" }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <Icon 
              size={size} 
              className="text-primary/40"
              style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.3))' }}
            />
          </motion.div>
        </motion.div>
      ))}

      <div className="h-full flex flex-col items-center justify-center px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -60, scale: 0.9 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.4
              }}
              className="w-full"
            >
              <Card className="max-w-2xl mx-auto overflow-hidden border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Left: Text content */}
                    <div className="p-6 md:p-8 flex flex-col justify-center">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary w-fit mb-4"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-xs font-medium">Feature {activeIndex + 1}</span>
                      </motion.div>
                      
                      <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-2xl md:text-3xl font-bold mb-4"
                      >
                        {currentFeature.title}
                      </motion.h3>
                      
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground"
                      >
                        {currentFeature.description}
                      </motion.p>
                    </div>
                    
                    {/* Right: UI Preview */}
                    <div className="p-6 md:p-8 bg-muted/30 flex items-center justify-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.25 }}
                        className="w-full max-w-xs"
                      >
                        <FeatureUI feature={currentFeature} />
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Indicator */}
        <div className="flex flex-col items-center gap-4 mt-8">
          <div className="flex gap-2">
            {features.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setActiveIndex(index)}
                className="w-2.5 h-2.5 rounded-full transition-colors"
                animate={{
                  backgroundColor: index === activeIndex 
                    ? 'hsl(var(--primary))' 
                    : 'hsl(var(--muted-foreground) / 0.3)',
                  scale: index === activeIndex ? 1.3 : 1,
                }}
                transition={{ duration: 0.2 }}
              />
            ))}
          </div>
          
          {isLocked && (
            <motion.p
              className="text-sm text-muted-foreground flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.span
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ↕
              </motion.span>
              Scroll to explore
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
};

export default HorizontalScrollFeatures;