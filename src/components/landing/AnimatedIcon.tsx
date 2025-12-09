import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface AnimatedIconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

const AnimatedIcon = ({ 
  icon: Icon, 
  size = 48, 
  className = "",
  strokeWidth = 1.5 
}: AnimatedIconProps) => {
  return (
    <motion.div
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className={className}
    >
      <Icon 
        size={size} 
        strokeWidth={strokeWidth}
        className="[stroke-dasharray:1000] [stroke-dashoffset:1000] animate-[draw_2s_ease-in-out_forwards]"
      />
    </motion.div>
  );
};

export default AnimatedIcon;
