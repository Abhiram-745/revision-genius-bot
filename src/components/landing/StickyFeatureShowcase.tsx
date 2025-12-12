import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Calendar, Brain, BarChart3, Clock, Sparkles, Target } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    id: 1,
    title: "Add Your Subjects & Tests",
    description: "Tell us what you're studying, when your exams are, and how much time you have. We'll handle the rest.",
    icon: Calendar,
    highlight: "subjects",
  },
  {
    id: 2,
    title: "AI Creates Your Perfect Plan",
    description: "Our AI analyzes your workload, available time, and learning patterns to create a balanced study schedule.",
    icon: Brain,
    highlight: "ai-generation",
  },
  {
    id: 3,
    title: "Track Your Sessions",
    description: "Use the built-in timer to track your study sessions. Mark topics complete and see your progress grow.",
    icon: Clock,
    highlight: "timer",
  },
  {
    id: 4,
    title: "Reflect & Improve",
    description: "Rate your focus and understanding after each session. The AI learns from your feedback to optimize future schedules.",
    icon: Target,
    highlight: "reflection",
  },
  {
    id: 5,
    title: "View Your Analytics",
    description: "See detailed insights about your study habits, track your streak, and identify areas for improvement.",
    icon: BarChart3,
    highlight: "analytics",
  },
  {
    id: 6,
    title: "Get AI Insights",
    description: "Receive personalized recommendations and tips based on your unique study patterns and progress.",
    icon: Sparkles,
    highlight: "insights",
  },
];

// Animated cursor that loops through UI interactions
const AnimatedCursorDemo = () => {
  return (
    <div className="relative w-full h-full min-h-[400px] bg-gradient-to-br from-card to-muted/30 rounded-2xl border border-border/50 overflow-hidden">
      {/* Mock UI Elements */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary" />
            <span className="font-display font-bold text-sm">Today's Schedule</span>
          </div>
          <div className="text-xs text-muted-foreground">Mon, 15 Jan</div>
        </div>

        {/* Sessions */}
        <div className="space-y-2">
          {[
            { time: "16:00", subject: "Biology", topic: "Photosynthesis", color: "bg-green-500/20 border-green-500/30" },
            { time: "16:50", subject: "Break", color: "bg-muted/50 border-muted", isBreak: true },
            { time: "17:00", subject: "Chemistry", topic: "Organic", color: "bg-purple-500/20 border-purple-500/30" },
            { time: "17:45", subject: "Physics", topic: "Mechanics", color: "bg-blue-500/20 border-blue-500/30" },
          ].map((session, i) => (
            <motion.div
              key={i}
              className={`flex items-center gap-3 p-2.5 rounded-lg border ${session.color} cursor-demo-target`}
              data-index={i}
            >
              <span className="text-[10px] font-mono text-muted-foreground w-10">{session.time}</span>
              <div className="flex-1">
                <p className="font-medium text-xs">{session.subject}</p>
                {session.topic && <p className="text-[10px] text-muted-foreground">{session.topic}</p>}
              </div>
              {!session.isBreak && (
                <motion.div
                  className="w-4 h-4 rounded border-2 border-primary/40"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Timer Preview */}
        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium">Session Timer</p>
              <p className="text-lg font-mono font-bold text-primary">23:45</p>
            </div>
            <motion.button
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Start
            </motion.button>
          </div>
        </div>
      </div>

      {/* Animated Cursor */}
      <motion.div
        className="absolute w-5 h-5 pointer-events-none z-20"
        initial={{ x: 50, y: 50, opacity: 0 }}
        animate={{
          x: [50, 180, 180, 100, 100, 250, 250, 50],
          y: [50, 80, 140, 200, 260, 320, 380, 50],
          opacity: [0, 1, 1, 1, 1, 1, 1, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1],
          ease: "easeInOut",
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 drop-shadow-lg">
          <path
            d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z"
            fill="hsl(var(--primary))"
            stroke="hsl(var(--primary-foreground))"
            strokeWidth="1.5"
          />
        </svg>
      </motion.div>

      {/* Click ripples */}
      <motion.div
        className="absolute w-8 h-8 rounded-full border-2 border-primary/50 pointer-events-none"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          x: [172, 172, 92, 92, 242, 242],
          y: [72, 132, 192, 252, 312, 372],
          scale: [0, 1.5, 0, 1.5, 0, 1.5],
          opacity: [0, 0.5, 0, 0.5, 0, 0.5],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          times: [0.15, 0.2, 0.45, 0.5, 0.75, 0.8],
          ease: "easeOut",
        }}
      />
    </div>
  );
};

const StickyFeatureShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <section
      ref={containerRef}
      className="relative bg-gradient-to-b from-background via-muted/5 to-background"
      style={{ height: `${features.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content that changes */}
          <div className="relative h-[400px]">
            {features.map((feature, index) => {
              const start = index / features.length;
              const end = (index + 1) / features.length;
              const mid = start + (end - start) / 2;
              
              return (
                <motion.div
                  key={feature.id}
                  className="absolute inset-0 flex flex-col justify-center"
                  style={{
                    opacity: useTransform(
                      scrollYProgress,
                      [start, mid - 0.05, mid, mid + 0.05, end],
                      [0, 1, 1, 1, 0]
                    ),
                    y: useTransform(
                      scrollYProgress,
                      [start, mid, end],
                      [50, 0, -50]
                    ),
                  }}
                >
                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6 shadow-xl"
                  >
                    <feature.icon className="w-8 h-8 text-primary-foreground" />
                  </motion.div>
                  
                  <span className="text-sm font-medium text-primary mb-2">
                    Step {index + 1} of {features.length}
                  </span>
                  
                  <h3 className="text-3xl md:text-4xl font-display font-bold mb-4">
                    {feature.title}
                  </h3>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
            
            {/* Progress indicator */}
            <div className="absolute bottom-0 left-0 flex gap-2">
              {features.map((_, index) => {
                const start = index / features.length;
                const end = (index + 1) / features.length;
                
                return (
                  <motion.div
                    key={index}
                    className="w-8 h-1 rounded-full overflow-hidden bg-muted"
                  >
                    <motion.div
                      className="h-full bg-primary"
                      style={{
                        scaleX: useTransform(
                          scrollYProgress,
                          [start, end],
                          [0, 1]
                        ),
                        transformOrigin: "left",
                      }}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right side - Sticky UI with animated cursor */}
          <div className="relative">
            <Card className="overflow-hidden shadow-2xl border-border/50">
              <AnimatedCursorDemo />
            </Card>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default StickyFeatureShowcase;
