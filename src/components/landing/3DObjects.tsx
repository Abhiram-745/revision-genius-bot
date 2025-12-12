import { motion } from "framer-motion";
import { ReactNode } from "react";

// 3D Cube with 6 faces
export const Cube3D = ({ 
  size = 60, 
  colors = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))"],
  rotationDuration = 8,
  className = ""
}: { 
  size?: number; 
  colors?: string[];
  rotationDuration?: number;
  className?: string;
}) => {
  const half = size / 2;
  
  return (
    <motion.div
      className={`relative ${className}`}
      style={{ 
        width: size, 
        height: size, 
        transformStyle: "preserve-3d",
        perspective: 1000
      }}
      animate={{ 
        rotateX: [0, 360],
        rotateY: [0, 360]
      }}
      transition={{ 
        duration: rotationDuration, 
        repeat: Infinity, 
        ease: "linear" 
      }}
    >
      {/* Front */}
      <div 
        className="absolute inset-0 border-2 rounded-lg backdrop-blur-sm"
        style={{ 
          background: `${colors[0]}20`,
          borderColor: `${colors[0]}60`,
          transform: `translateZ(${half}px)`,
          boxShadow: `0 0 20px ${colors[0]}40`
        }} 
      />
      {/* Back */}
      <div 
        className="absolute inset-0 border-2 rounded-lg backdrop-blur-sm"
        style={{ 
          background: `${colors[1]}20`,
          borderColor: `${colors[1]}60`,
          transform: `translateZ(-${half}px) rotateY(180deg)`,
          boxShadow: `0 0 20px ${colors[1]}40`
        }} 
      />
      {/* Left */}
      <div 
        className="absolute inset-0 border-2 rounded-lg backdrop-blur-sm"
        style={{ 
          background: `${colors[2]}20`,
          borderColor: `${colors[2]}60`,
          transform: `translateX(-${half}px) rotateY(-90deg)`,
          boxShadow: `0 0 20px ${colors[2]}40`
        }} 
      />
      {/* Right */}
      <div 
        className="absolute inset-0 border-2 rounded-lg backdrop-blur-sm"
        style={{ 
          background: `${colors[0]}20`,
          borderColor: `${colors[0]}60`,
          transform: `translateX(${half}px) rotateY(90deg)`,
          boxShadow: `0 0 20px ${colors[0]}40`
        }} 
      />
      {/* Top */}
      <div 
        className="absolute inset-0 border-2 rounded-lg backdrop-blur-sm"
        style={{ 
          background: `${colors[1]}20`,
          borderColor: `${colors[1]}60`,
          transform: `translateY(-${half}px) rotateX(90deg)`,
          boxShadow: `0 0 20px ${colors[1]}40`
        }} 
      />
      {/* Bottom */}
      <div 
        className="absolute inset-0 border-2 rounded-lg backdrop-blur-sm"
        style={{ 
          background: `${colors[2]}20`,
          borderColor: `${colors[2]}60`,
          transform: `translateY(${half}px) rotateX(-90deg)`,
          boxShadow: `0 0 20px ${colors[2]}40`
        }} 
      />
    </motion.div>
  );
};

// 3D Pyramid with 4 triangular faces
export const Pyramid3D = ({ 
  size = 60, 
  color = "hsl(var(--primary))",
  rotationDuration = 10,
  className = ""
}: { 
  size?: number; 
  color?: string;
  rotationDuration?: number;
  className?: string;
}) => {
  return (
    <motion.div
      className={`relative ${className}`}
      style={{ 
        width: size, 
        height: size, 
        transformStyle: "preserve-3d",
        perspective: 1000
      }}
      animate={{ 
        rotateY: [0, 360]
      }}
      transition={{ 
        duration: rotationDuration, 
        repeat: Infinity, 
        ease: "linear" 
      }}
    >
      {/* Base */}
      <div 
        className="absolute border-2 backdrop-blur-sm"
        style={{ 
          width: size,
          height: size,
          background: `${color}15`,
          borderColor: `${color}50`,
          transform: `translateY(${size/2}px) rotateX(90deg)`,
          boxShadow: `0 0 30px ${color}30`
        }} 
      />
      {/* Front face */}
      <div 
        className="absolute border-2 backdrop-blur-sm"
        style={{ 
          width: 0,
          height: 0,
          borderLeft: `${size/2}px solid transparent`,
          borderRight: `${size/2}px solid transparent`,
          borderBottom: `${size}px solid ${color}30`,
          transform: `translateZ(${size/2}px) rotateX(30deg)`,
          transformOrigin: "bottom center",
          filter: `drop-shadow(0 0 15px ${color}40)`
        }} 
      />
      {/* Back face */}
      <div 
        className="absolute border-2 backdrop-blur-sm"
        style={{ 
          width: 0,
          height: 0,
          borderLeft: `${size/2}px solid transparent`,
          borderRight: `${size/2}px solid transparent`,
          borderBottom: `${size}px solid ${color}25`,
          transform: `translateZ(-${size/2}px) rotateX(-30deg) rotateY(180deg)`,
          transformOrigin: "bottom center",
          filter: `drop-shadow(0 0 15px ${color}40)`
        }} 
      />
    </motion.div>
  );
};

// 3D Sphere with gradient
export const Sphere3D = ({ 
  size = 60, 
  colors = ["hsl(var(--primary))", "hsl(var(--secondary))"],
  floatDuration = 4,
  className = ""
}: { 
  size?: number; 
  colors?: string[];
  floatDuration?: number;
  className?: string;
}) => {
  return (
    <motion.div
      className={`rounded-full ${className}`}
      style={{ 
        width: size, 
        height: size,
        background: `radial-gradient(circle at 30% 30%, ${colors[0]}40, ${colors[1]}20, transparent)`,
        boxShadow: `
          inset -10px -10px 30px ${colors[1]}30,
          inset 10px 10px 30px ${colors[0]}20,
          0 0 40px ${colors[0]}30
        `,
        border: `2px solid ${colors[0]}30`
      }}
      animate={{ 
        y: [-10, 10, -10],
        scale: [1, 1.05, 1]
      }}
      transition={{ 
        duration: floatDuration, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    />
  );
};

// 3D Diamond / Octahedron
export const Diamond3D = ({ 
  size = 50, 
  color = "hsl(var(--accent))",
  rotationDuration = 6,
  className = ""
}: { 
  size?: number; 
  color?: string;
  rotationDuration?: number;
  className?: string;
}) => {
  return (
    <motion.div
      className={`relative ${className}`}
      style={{ 
        width: size, 
        height: size * 1.5, 
        transformStyle: "preserve-3d",
        perspective: 800
      }}
      animate={{ 
        rotateY: [0, 360],
        rotateZ: [0, 15, 0, -15, 0]
      }}
      transition={{ 
        rotateY: { duration: rotationDuration, repeat: Infinity, ease: "linear" },
        rotateZ: { duration: rotationDuration / 2, repeat: Infinity, ease: "easeInOut" }
      }}
    >
      {/* Top half */}
      <div 
        className="absolute"
        style={{ 
          width: 0,
          height: 0,
          left: 0,
          top: 0,
          borderLeft: `${size/2}px solid transparent`,
          borderRight: `${size/2}px solid transparent`,
          borderBottom: `${size * 0.75}px solid ${color}40`,
          filter: `drop-shadow(0 0 20px ${color}50)`
        }} 
      />
      {/* Bottom half */}
      <div 
        className="absolute"
        style={{ 
          width: 0,
          height: 0,
          left: 0,
          top: size * 0.75,
          borderLeft: `${size/2}px solid transparent`,
          borderRight: `${size/2}px solid transparent`,
          borderTop: `${size * 0.75}px solid ${color}30`,
          filter: `drop-shadow(0 0 20px ${color}50)`
        }} 
      />
    </motion.div>
  );
};

// 3D Hexagon Prism
export const Hexagon3D = ({ 
  size = 60, 
  color = "hsl(var(--secondary))",
  rotationDuration = 12,
  className = ""
}: { 
  size?: number; 
  color?: string;
  rotationDuration?: number;
  className?: string;
}) => {
  return (
    <motion.div
      className={`relative ${className}`}
      style={{ 
        width: size, 
        height: size, 
        transformStyle: "preserve-3d",
        perspective: 1000
      }}
      animate={{ 
        rotateY: [0, 360],
        rotateX: [0, 180, 360]
      }}
      transition={{ 
        duration: rotationDuration, 
        repeat: Infinity, 
        ease: "linear" 
      }}
    >
      <svg 
        viewBox="0 0 100 100" 
        className="absolute inset-0 w-full h-full"
        style={{
          transform: `translateZ(${size/4}px)`,
          filter: `drop-shadow(0 0 15px ${color}40)`
        }}
      >
        <polygon 
          points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" 
          fill={`${color}20`}
          stroke={color}
          strokeWidth="2"
        />
      </svg>
      <svg 
        viewBox="0 0 100 100" 
        className="absolute inset-0 w-full h-full"
        style={{
          transform: `translateZ(-${size/4}px)`,
          filter: `drop-shadow(0 0 15px ${color}40)`
        }}
      >
        <polygon 
          points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" 
          fill={`${color}15`}
          stroke={color}
          strokeWidth="2"
        />
      </svg>
    </motion.div>
  );
};

// 3D Torus / Ring
export const Torus3D = ({ 
  size = 80, 
  color = "hsl(var(--primary))",
  rotationDuration = 8,
  className = ""
}: { 
  size?: number; 
  color?: string;
  rotationDuration?: number;
  className?: string;
}) => {
  return (
    <motion.div
      className={`relative ${className}`}
      style={{ 
        width: size, 
        height: size, 
        transformStyle: "preserve-3d",
        perspective: 1000
      }}
      animate={{ 
        rotateX: [0, 360],
        rotateY: [0, 180]
      }}
      transition={{ 
        duration: rotationDuration, 
        repeat: Infinity, 
        ease: "linear" 
      }}
    >
      <div 
        className="absolute inset-0 rounded-full border-8"
        style={{
          borderColor: `${color}50`,
          boxShadow: `
            inset 0 0 20px ${color}30,
            0 0 30px ${color}20
          `,
          transform: "rotateX(70deg)"
        }}
      />
    </motion.div>
  );
};

// Floating 3D object wrapper with orbit
export const OrbitingObject = ({ 
  children, 
  orbitRadius = 100,
  orbitDuration = 10,
  startAngle = 0,
  className = ""
}: { 
  children: ReactNode;
  orbitRadius?: number;
  orbitDuration?: number;
  startAngle?: number;
  className?: string;
}) => {
  return (
    <motion.div
      className={`absolute ${className}`}
      style={{
        transformStyle: "preserve-3d"
      }}
      animate={{
        rotate: [startAngle, startAngle + 360]
      }}
      transition={{
        duration: orbitDuration,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <div style={{ transform: `translateX(${orbitRadius}px)` }}>
        {children}
      </div>
    </motion.div>
  );
};

// Glowing particle
export const GlowingParticle = ({
  size = 8,
  color = "hsl(var(--primary))",
  x = 0,
  y = 0,
  delay = 0
}: {
  size?: number;
  color?: string;
  x?: number;
  y?: number;
  delay?: number;
}) => {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        boxShadow: `0 0 ${size * 2}px ${color}`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 0],
        scale: [0.5, 1.5, 0.5]
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};
