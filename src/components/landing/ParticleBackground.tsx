import { motion } from "framer-motion";
import { BookOpen, Brain, Calendar, Clock, Target, Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const floatingIcons = [
  { Icon: BookOpen, x: "10%", y: "15%", size: 24, delay: 0, duration: 8, color: "primary" },
  { Icon: Brain, x: "85%", y: "20%", size: 28, delay: 1, duration: 9, color: "secondary" },
  { Icon: Calendar, x: "75%", y: "70%", size: 24, delay: 2, duration: 7, color: "accent" },
  { Icon: Clock, x: "15%", y: "75%", size: 20, delay: 0.5, duration: 10, color: "primary" },
  { Icon: Target, x: "90%", y: "45%", size: 24, delay: 1.5, duration: 8, color: "secondary" },
  { Icon: Sparkles, x: "5%", y: "45%", size: 22, delay: 2.5, duration: 9, color: "accent" },
];

const ParticleBackground = () => {
  const isMobile = useIsMobile();

  // Hide on mobile for performance
  if (isMobile) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden hidden md:block">
      {floatingIcons.map((item, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{ left: item.x, top: item.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0.1, 0.2, 0.1],
            scale: [1, 1.1, 1],
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="relative">
            <div 
              className={`absolute inset-0 blur-lg opacity-30 rounded-full bg-${item.color}`}
              style={{ transform: "scale(1.5)" }}
            />
            <item.Icon 
              className={`text-${item.color}`}
              style={{ width: item.size, height: item.size, opacity: 0.4 }}
              strokeWidth={1.5}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ParticleBackground;