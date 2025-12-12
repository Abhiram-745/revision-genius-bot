import { useState, useRef, ReactNode } from "react";
import { motion } from "framer-motion";

interface MouseFollowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  tiltAmount?: number;
}

const MouseFollowCard = ({ 
  children, 
  className = "",
  glowColor = "var(--primary)",
  tiltAmount = 10
}: MouseFollowCardProps) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = (e.clientY - centerY) / (rect.height / 2) * -tiltAmount;
    const y = (e.clientX - centerX) / (rect.width / 2) * tiltAmount;
    
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`relative ${className}`}
      style={{ 
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      {/* Glow effect */}
      <motion.div
        animate={{
          opacity: isHovered ? 0.4 : 0,
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ duration: 0.3 }}
        className="absolute -inset-2 rounded-2xl blur-xl -z-10"
        style={{ 
          background: `radial-gradient(circle, hsl(${glowColor}) 0%, transparent 70%)` 
        }}
      />
      {children}
    </motion.div>
  );
};

export default MouseFollowCard;
