import { motion } from "framer-motion";

interface GlowingHeroTextProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const GlowingHeroText = ({ children, className = "", delay = 0 }: GlowingHeroTextProps) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`relative inline-block ${className}`}
      style={{
        textShadow: `
          0 0 20px rgba(255, 107, 53, 0.5),
          0 0 40px rgba(255, 107, 53, 0.3),
          0 0 60px rgba(255, 107, 53, 0.2)
        `,
      }}
    >
      {children}
    </motion.span>
  );
};

export const HandwrittenText = ({ children, className = "", delay = 0 }: GlowingHeroTextProps) => {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9, rotateZ: -2 }}
      animate={{ opacity: 1, scale: 1, rotateZ: 0 }}
      transition={{ delay, duration: 0.6, type: "spring", stiffness: 100 }}
      className={`inline-block font-display italic ${className}`}
      style={{
        background: "linear-gradient(135deg, #ffb347 0%, #ff6b35 50%, #ff4757 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        textShadow: "none",
        filter: "drop-shadow(0 0 20px rgba(255, 107, 53, 0.4))",
      }}
    >
      {children}
    </motion.span>
  );
};

export const GhostText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <div 
      className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none ${className}`}
      style={{
        fontSize: "clamp(4rem, 20vw, 20rem)",
        fontWeight: 900,
        color: "transparent",
        WebkitTextStroke: "1px rgba(255, 255, 255, 0.05)",
        letterSpacing: "0.1em",
        opacity: 0.3,
      }}
    >
      {children}
    </div>
  );
};

export default GlowingHeroText;
