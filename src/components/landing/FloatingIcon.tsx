import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FloatingIconProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

const FloatingIcon = ({ 
  children, 
  delay = 0, 
  duration = 3,
  className = "" 
}: FloatingIconProps) => {
  return (
    <motion.div
      animate={{
        y: [0, -15, 0],
        rotate: [0, 3, -3, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default FloatingIcon;
