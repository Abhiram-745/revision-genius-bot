import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { 
  BookOpen, Brain, Calendar, Lightbulb, Target, Sparkles, 
  GraduationCap, Clock, Award, Rocket, PenTool, LineChart,
  Zap, Star, CheckCircle2
} from "lucide-react";

const ParallaxBackground = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  // Different parallax speeds for depth effect
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]); // Slowest - far background
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -300]); // Medium speed
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -450]); // Fastest - closest layer
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 25]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -20]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.15]);

  return (
    <div ref={ref} className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Far Background Layer - Large glowing gradient circles */}
      <motion.div
        style={{ y: y1, scale }}
        className="absolute inset-0"
      >
        <motion.div
          animate={{ 
            y: [0, -30, 0], 
            scale: [1, 1.08, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-32 w-[700px] h-[700px] bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            y: [0, 40, 0], 
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 -right-20 w-[800px] h-[800px] bg-gradient-to-bl from-secondary/18 via-secondary/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            y: [0, -25, 0],
            x: [0, 30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-accent/15 via-accent/8 to-transparent rounded-full blur-3xl"
        />
      </motion.div>

      {/* Middle Layer - Large prominent icons with glow */}
      <motion.div
        style={{ y: y2 }}
        className="absolute inset-0"
      >
        {/* BookOpen - Top Left - LARGE with glow */}
        <motion.div
          style={{ rotate: rotate1 }}
          animate={{ 
            y: [0, -30, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-[10%]"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full scale-150" />
            <BookOpen 
              className="w-48 h-48 text-primary drop-shadow-[0_0_40px_hsl(var(--primary)/0.5)]" 
              strokeWidth={0.8} 
              style={{ opacity: 0.2 }}
            />
          </div>
        </motion.div>

        {/* Brain - Top Right - LARGE */}
        <motion.div
          style={{ rotate: rotate2 }}
          animate={{ 
            y: [0, 25, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-32 right-[8%]"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-secondary/30 blur-2xl rounded-full scale-150" />
            <Brain 
              className="w-56 h-56 text-secondary drop-shadow-[0_0_40px_hsl(var(--secondary)/0.5)]" 
              strokeWidth={0.8} 
              style={{ opacity: 0.22 }}
            />
          </div>
        </motion.div>

        {/* Calendar - Middle Left */}
        <motion.div
          animate={{ 
            y: [0, -20, 0], 
            rotate: [0, 8, -8, 0],
            scale: [1, 1.06, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 left-[5%]"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-accent/25 blur-2xl rounded-full scale-150" />
            <Calendar 
              className="w-40 h-40 text-accent drop-shadow-[0_0_35px_hsl(var(--accent)/0.5)]" 
              strokeWidth={0.8} 
              style={{ opacity: 0.2 }}
            />
          </div>
        </motion.div>

        {/* GraduationCap - Middle Right */}
        <motion.div
          animate={{ 
            y: [0, 30, 0], 
            rotate: [0, -5, 5, 0],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute top-[40%] right-[12%]"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/25 blur-2xl rounded-full scale-150" />
            <GraduationCap 
              className="w-44 h-44 text-primary drop-shadow-[0_0_35px_hsl(var(--primary)/0.4)]" 
              strokeWidth={0.8} 
              style={{ opacity: 0.18 }}
            />
          </div>
        </motion.div>

        {/* Clock - Bottom Left */}
        <motion.div
          animate={{ 
            y: [0, -18, 0],
            rotate: [0, 10, 0],
          }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-40 left-[15%]"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-secondary/25 blur-2xl rounded-full scale-150" />
            <Clock 
              className="w-36 h-36 text-secondary drop-shadow-[0_0_30px_hsl(var(--secondary)/0.4)]" 
              strokeWidth={0.8} 
              style={{ opacity: 0.18 }}
            />
          </div>
        </motion.div>

        {/* Target - Bottom Right */}
        <motion.div
          animate={{ 
            y: [0, 22, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
          className="absolute bottom-32 right-[10%]"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-accent/25 blur-2xl rounded-full scale-150" />
            <Target 
              className="w-40 h-40 text-accent drop-shadow-[0_0_30px_hsl(var(--accent)/0.4)]" 
              strokeWidth={0.8} 
              style={{ opacity: 0.2 }}
            />
          </div>
        </motion.div>

        {/* Geometric rotating circles with glow */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/3 right-[18%] w-64 h-64 border-2 border-primary/15 rounded-full"
          style={{ boxShadow: "0 0 30px hsl(var(--primary) / 0.1)" }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="absolute top-[55%] left-[8%] w-48 h-48 border-2 border-secondary/15 rounded-full"
          style={{ boxShadow: "0 0 25px hsl(var(--secondary) / 0.1)" }}
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/3 w-56 h-56 border border-accent/10 rounded-full"
        />
      </motion.div>

      {/* Closest Layer - Pulsing elements and sparkles */}
      <motion.div
        style={{ y: y3 }}
        className="absolute inset-0"
      >
        {/* Large glowing dots */}
        <motion.div
          animate={{ 
            y: [0, -35, 0], 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.35, 0.2] 
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-24 left-1/3"
        >
          <div className="w-10 h-10 bg-primary rounded-full blur-sm" />
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 30, 0], 
            scale: [1, 1.4, 1],
            opacity: [0.18, 0.3, 0.18] 
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-52 right-1/4"
        >
          <div className="w-12 h-12 bg-secondary rounded-full blur-sm" />
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, -25, 0], 
            scale: [1, 1.25, 1],
            opacity: [0.2, 0.32, 0.2] 
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-40 left-1/2"
        >
          <div className="w-8 h-8 bg-accent rounded-full blur-sm" />
        </motion.div>

        {/* Animated sparkle icons with pulse */}
        <motion.div
          animate={{ 
            scale: [1, 1.4, 1], 
            opacity: [0.2, 0.35, 0.2],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-72 left-[20%]"
        >
          <Sparkles className="w-12 h-12 text-primary drop-shadow-[0_0_20px_hsl(var(--primary)/0.6)]" />
        </motion.div>
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1], 
            opacity: [0.18, 0.3, 0.18],
            rotate: [180, 0, -180]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute bottom-60 right-[25%]"
        >
          <Lightbulb className="w-10 h-10 text-accent drop-shadow-[0_0_18px_hsl(var(--accent)/0.6)]" />
        </motion.div>
        <motion.div
          animate={{ 
            scale: [1, 1.35, 1], 
            opacity: [0.15, 0.28, 0.15],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-[45%] left-[18%]"
        >
          <Zap className="w-14 h-14 text-secondary drop-shadow-[0_0_22px_hsl(var(--secondary)/0.6)]" />
        </motion.div>
        <motion.div
          animate={{ 
            scale: [1, 1.25, 1], 
            opacity: [0.16, 0.26, 0.16],
            rotate: [0, 15, -15, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/3 right-[15%]"
        >
          <Star className="w-12 h-12 text-accent drop-shadow-[0_0_20px_hsl(var(--accent)/0.5)]" />
        </motion.div>
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.14, 0.24, 0.14],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-1/3 left-[30%]"
        >
          <Rocket className="w-16 h-16 text-primary drop-shadow-[0_0_25px_hsl(var(--primary)/0.5)]" />
        </motion.div>
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1], 
            opacity: [0.12, 0.22, 0.12],
            y: [0, -15, 0]
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[60%] right-[20%]"
        >
          <Award className="w-14 h-14 text-secondary drop-shadow-[0_0_22px_hsl(var(--secondary)/0.5)]" />
        </motion.div>
        <motion.div
          animate={{ 
            scale: [1, 1.15, 1], 
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
          className="absolute bottom-52 right-1/3"
        >
          <LineChart className="w-12 h-12 text-accent drop-shadow-[0_0_18px_hsl(var(--accent)/0.5)]" />
        </motion.div>
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.13, 0.23, 0.13],
            rotate: [0, -10, 10, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          className="absolute top-48 right-1/3"
        >
          <PenTool className="w-10 h-10 text-primary drop-shadow-[0_0_16px_hsl(var(--primary)/0.5)]" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ParallaxBackground;
