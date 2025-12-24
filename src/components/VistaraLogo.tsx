import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import vistaraMascot from "@/assets/vistara-mascot-logo.png";

interface VistaraLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  animate?: boolean;
}

const VistaraLogo = ({ className, size = "md", showText = false, animate = true }: VistaraLogoProps) => {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
    xl: "w-28 h-28",
  };

  const textSizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <motion.div 
        className={cn("relative", sizeClasses[size])}
        initial={animate ? { scale: 0.8, opacity: 0 } : false}
        animate={animate ? { scale: 1, opacity: 1 } : false}
        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
      >
        {/* Animated glow effect */}
        <motion.div 
          className="absolute inset-0 rounded-xl opacity-0 blur-xl -z-10"
          animate={{ 
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary) / 0.6), hsl(var(--secondary) / 0.5))"
          }}
        />

        {/* Floating animation wrapper */}
        <motion.div
          animate={animate ? {
            y: [0, -3, 0],
          } : {}}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-full h-full"
        >
          <img
            src={vistaraMascot}
            alt="Vistara Logo"
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </motion.div>
      </motion.div>

      {showText && (
        <motion.span 
          className={cn(
            "font-display font-bold gradient-text",
            textSizeClasses[size]
          )}
          initial={animate ? { opacity: 0, x: -10 } : false}
          animate={animate ? { opacity: 1, x: 0 } : false}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          Vistara
        </motion.span>
      )}
    </div>
  );
};

export default VistaraLogo;
