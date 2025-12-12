import { motion } from "framer-motion";
import { BookOpen, Brain, Calendar, Clock, Target, Sparkles, GraduationCap, PenTool, Lightbulb, Trophy } from "lucide-react";

const floatingIcons = [
  { Icon: BookOpen, x: "10%", y: "15%", size: 32, delay: 0, duration: 8, color: "primary" },
  { Icon: Brain, x: "85%", y: "20%", size: 40, delay: 1, duration: 9, color: "secondary" },
  { Icon: Calendar, x: "75%", y: "70%", size: 36, delay: 2, duration: 7, color: "accent" },
  { Icon: Clock, x: "15%", y: "75%", size: 28, delay: 0.5, duration: 10, color: "primary" },
  { Icon: Target, x: "90%", y: "45%", size: 34, delay: 1.5, duration: 8, color: "secondary" },
  { Icon: Sparkles, x: "5%", y: "45%", size: 30, delay: 2.5, duration: 9, color: "accent" },
  { Icon: GraduationCap, x: "50%", y: "10%", size: 38, delay: 0.8, duration: 11, color: "primary" },
  { Icon: PenTool, x: "30%", y: "85%", size: 26, delay: 1.2, duration: 7, color: "secondary" },
  { Icon: Lightbulb, x: "70%", y: "5%", size: 32, delay: 1.8, duration: 8, color: "accent" },
  { Icon: Trophy, x: "25%", y: "25%", size: 28, delay: 2.2, duration: 9, color: "primary" },
];

const ParticleBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {floatingIcons.map((item, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{ left: item.x, top: item.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0.15, 0.3, 0.15],
            scale: [1, 1.1, 1],
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className={`relative`}>
            {/* Glow effect */}
            <div 
              className={`absolute inset-0 blur-xl opacity-40 rounded-full bg-${item.color}`}
              style={{ transform: "scale(2)" }}
            />
            <item.Icon 
              className={`w-${Math.round(item.size / 4)} h-${Math.round(item.size / 4)} text-${item.color}`}
              style={{ width: item.size, height: item.size }}
              strokeWidth={1.5}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ParticleBackground;
