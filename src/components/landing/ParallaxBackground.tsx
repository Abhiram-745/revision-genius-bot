import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { BookOpen, Brain, Calendar, Lightbulb, Target, Sparkles } from "lucide-react";

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
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 20]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -15]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

  return (
    <div ref={ref} className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Far Background Layer - Soft gradient circles */}
      <motion.div
        style={{ y: y1, scale }}
        className="absolute inset-0"
      >
        <motion.div
          animate={{ 
            y: [0, -20, 0], 
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-primary/15 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            y: [0, 30, 0], 
            scale: [1, 1.08, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-secondary/12 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            x: [0, 20, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-40 left-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl"
        />
      </motion.div>

      {/* Middle Layer - Abstract shapes */}
      <motion.div
        style={{ y: y2 }}
        className="absolute inset-0"
      >
        {/* Floating notebook icon */}
        <motion.div
          style={{ rotate: rotate1 }}
          animate={{ y: [0, -25, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-32 left-[15%] opacity-[0.08]"
        >
          <BookOpen className="w-32 h-32 text-primary" strokeWidth={0.5} />
        </motion.div>

        {/* Floating brain icon */}
        <motion.div
          style={{ rotate: rotate2 }}
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-48 right-[20%] opacity-[0.06]"
        >
          <Brain className="w-40 h-40 text-secondary" strokeWidth={0.5} />
        </motion.div>

        {/* Floating calendar icon */}
        <motion.div
          animate={{ y: [0, -18, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-60 left-[8%] opacity-[0.07]"
        >
          <Calendar className="w-28 h-28 text-accent" strokeWidth={0.5} />
        </motion.div>

        {/* Geometric shapes */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/3 right-[10%] w-48 h-48 border border-primary/10 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-[5%] w-32 h-32 border border-secondary/10 rounded-full"
        />
      </motion.div>

      {/* Closest Layer - Small floating elements */}
      <motion.div
        style={{ y: y3 }}
        className="absolute inset-0"
      >
        {/* Floating dots pattern */}
        <motion.div
          animate={{ y: [0, -30, 0], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-1/3 w-3 h-3 bg-primary rounded-full"
        />
        <motion.div
          animate={{ y: [0, 25, 0], opacity: [0.08, 0.12, 0.08] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-48 right-1/3 w-4 h-4 bg-secondary rounded-full"
        />
        <motion.div
          animate={{ y: [0, -20, 0], opacity: [0.1, 0.14, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-32 left-1/2 w-2 h-2 bg-accent rounded-full"
        />

        {/* Sparkle elements */}
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1], 
            opacity: [0.1, 0.2, 0.1],
            rotate: [0, 90, 180]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-60 left-[25%]"
        >
          <Sparkles className="w-6 h-6 text-primary" />
        </motion.div>
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.08, 0.15, 0.08],
            rotate: [180, 90, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute bottom-48 right-[30%]"
        >
          <Lightbulb className="w-5 h-5 text-accent" />
        </motion.div>
        <motion.div
          animate={{ 
            scale: [1, 1.25, 1], 
            opacity: [0.06, 0.12, 0.06],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-1/2 left-[12%]"
        >
          <Target className="w-8 h-8 text-secondary" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ParallaxBackground;
