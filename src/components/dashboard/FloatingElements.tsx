import { motion } from "framer-motion";
import { BookOpen, Brain, Sparkles, Star, Target, Trophy, Zap, GraduationCap } from "lucide-react";

interface FloatingIconProps {
  icon: React.ElementType;
  x: string;
  y: string;
  size?: number;
  delay?: number;
  duration?: number;
  color?: string;
}

const FloatingIcon = ({ 
  icon: Icon, 
  x, 
  y, 
  size = 24, 
  delay = 0, 
  duration = 8,
  color = "primary"
}: FloatingIconProps) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0.15, 0.3, 0.15],
        scale: [1, 1.15, 1],
        y: [0, -20, 0],
        rotate: [0, 10, -10, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div className="relative">
        <div 
          className={`absolute inset-0 blur-xl opacity-40 rounded-full bg-${color}`}
          style={{ transform: "scale(2)" }}
        />
        <Icon 
          className={`text-${color}`}
          style={{ width: size, height: size, opacity: 0.5 }}
          strokeWidth={1.5}
        />
      </div>
    </motion.div>
  );
};

export const DashboardFloatingElements = () => {
  const icons = [
    { Icon: BookOpen, x: "5%", y: "10%", size: 28, delay: 0, duration: 9, color: "primary" },
    { Icon: Brain, x: "92%", y: "15%", size: 32, delay: 1.5, duration: 10, color: "accent" },
    { Icon: Star, x: "88%", y: "60%", size: 24, delay: 0.8, duration: 8, color: "amber-400" },
    { Icon: Target, x: "8%", y: "70%", size: 26, delay: 2, duration: 11, color: "accent" },
    { Icon: Sparkles, x: "95%", y: "35%", size: 22, delay: 1, duration: 7, color: "primary" },
    { Icon: Trophy, x: "3%", y: "40%", size: 24, delay: 2.5, duration: 9, color: "amber-400" },
    { Icon: Zap, x: "90%", y: "80%", size: 20, delay: 0.5, duration: 8, color: "accent" },
    { Icon: GraduationCap, x: "6%", y: "85%", size: 28, delay: 1.8, duration: 10, color: "primary" },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden hidden md:block">
      {icons.map((item, index) => (
        <FloatingIcon
          key={index}
          icon={item.Icon}
          x={item.x}
          y={item.y}
          size={item.size}
          delay={item.delay}
          duration={item.duration}
          color={item.color}
        />
      ))}
    </div>
  );
};

interface MotivationalBadgeProps {
  streak?: number;
  isNewUser?: boolean;
}

export const MotivationalBadge = ({ streak = 0, isNewUser = false }: MotivationalBadgeProps) => {
  const getBadgeContent = () => {
    if (isNewUser) {
      return { emoji: "✨", text: "Let's get started!" };
    }
    if (streak >= 7) {
      return { emoji: "🔥", text: "You're on fire!" };
    }
    if (streak >= 3) {
      return { emoji: "💪", text: "You're crushing it!" };
    }
    if (streak >= 1) {
      return { emoji: "⭐", text: "Keep it going!" };
    }
    return { emoji: "🚀", text: "Ready to study?" };
  };

  const { emoji, text } = getBadgeContent();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
      className="inline-flex"
    >
      <motion.div
        animate={{ 
          y: [0, -4, 0],
          scale: [1, 1.02, 1],
        }}
        transition={{ 
          duration: 2.5, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 blur-xl rounded-full" />
        <div className="relative px-4 py-2 rounded-full bg-gradient-to-r from-primary/90 to-accent/90 text-white font-medium text-sm shadow-lg shadow-primary/25 flex items-center gap-2">
          <span className="text-base">{emoji}</span>
          <span>{text}</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardFloatingElements;
