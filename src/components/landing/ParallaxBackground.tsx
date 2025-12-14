import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { 
  BookOpen, Brain, Calendar, Lightbulb, Target, Sparkles, 
  GraduationCap, Clock
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const ParallaxBackground = () => {
  const isMobile = useIsMobile();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  // Different parallax speeds for depth effect
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.15]);

  // Hide entirely on mobile for performance
  if (isMobile) {
    return null;
  }

  return (
    <div ref={ref} className="fixed inset-0 overflow-hidden pointer-events-none z-0 hidden md:block">
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
          className="absolute -top-20 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-primary/15 via-primary/8 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            y: [0, 40, 0], 
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 -right-20 w-[600px] h-[600px] bg-gradient-to-bl from-secondary/12 via-secondary/6 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            y: [0, -25, 0],
            x: [0, 30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-accent/10 via-accent/5 to-transparent rounded-full blur-3xl"
        />
      </motion.div>

      {/* Middle Layer - Reduced icons for better performance */}
      <motion.div
        style={{ y: y2 }}
        className="absolute inset-0"
      >
        {/* BookOpen - Top Left */}
        <motion.div
          animate={{ 
            y: [0, -30, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-[10%]"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150" />
            <BookOpen 
              className="w-32 h-32 text-primary drop-shadow-[0_0_30px_hsl(var(--primary)/0.4)]" 
              strokeWidth={0.8} 
              style={{ opacity: 0.15 }}
            />
          </div>
        </motion.div>

        {/* Brain - Top Right */}
        <motion.div
          animate={{ 
            y: [0, 25, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-32 right-[8%]"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-secondary/20 blur-2xl rounded-full scale-150" />
            <Brain 
              className="w-36 h-36 text-secondary drop-shadow-[0_0_30px_hsl(var(--secondary)/0.4)]" 
              strokeWidth={0.8} 
              style={{ opacity: 0.15 }}
            />
          </div>
        </motion.div>

        {/* Calendar - Middle Left */}
        <motion.div
          animate={{ 
            y: [0, -20, 0], 
            rotate: [0, 8, -8, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 left-[5%]"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-accent/15 blur-2xl rounded-full scale-150" />
            <Calendar 
              className="w-28 h-28 text-accent drop-shadow-[0_0_25px_hsl(var(--accent)/0.4)]" 
              strokeWidth={0.8} 
              style={{ opacity: 0.15 }}
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
            <div className="absolute inset-0 bg-primary/15 blur-2xl rounded-full scale-150" />
            <GraduationCap 
              className="w-28 h-28 text-primary drop-shadow-[0_0_25px_hsl(var(--primary)/0.3)]" 
              strokeWidth={0.8} 
              style={{ opacity: 0.12 }}
            />
          </div>
        </motion.div>

        {/* Geometric rotating circles */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/3 right-[18%] w-48 h-48 border border-primary/10 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="absolute top-[55%] left-[8%] w-36 h-36 border border-secondary/10 rounded-full"
        />
      </motion.div>
    </div>
  );
};

export default ParallaxBackground;