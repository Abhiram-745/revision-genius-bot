import { motion } from "framer-motion";

interface AnimatedConnectionLineProps {
  path: string;
  color: string;
  delay?: number;
  duration?: number;
  showDot?: boolean;
}

const AnimatedConnectionLine = ({ 
  path, 
  color, 
  delay = 0, 
  duration = 1.5,
  showDot = true 
}: AnimatedConnectionLineProps) => {
  return (
    <g>
      {/* Background glow */}
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeDasharray="8 4"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.15 }}
        viewport={{ once: true }}
        transition={{ duration: duration * 1.2, delay, ease: "easeOut" }}
        filter="blur(4px)"
      />
      
      {/* Main line */}
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="8 4"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration, delay, ease: "easeOut" }}
      />
      
      {/* Animated traveling dot */}
      {showDot && (
        <motion.circle
          r="4"
          fill={color}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: delay + duration,
            repeatDelay: 1,
          }}
        >
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            begin={`${delay + duration}s`}
            path={path}
          />
        </motion.circle>
      )}
    </g>
  );
};

export default AnimatedConnectionLine;
