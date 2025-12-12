import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Rocket, Target, Lightbulb, Clock, BarChart3, Sparkles, Zap, Star, Heart } from "lucide-react";

const tunnelContent = [
  { title: "AI-Powered Schedules", subtitle: "Let AI plan your perfect study sessions", icon: Brain, color: "from-pink-500 to-rose-400" },
  { title: "Adapt to Your Life", subtitle: "Around football, family & fun", icon: Zap, color: "from-yellow-500 to-orange-400" },
  { title: "Track Your Progress", subtitle: "Watch your confidence grow daily", icon: BarChart3, color: "from-green-500 to-emerald-400" },
  { title: "Achieve Your Goals", subtitle: "Ace your exams with confidence", icon: Target, color: "from-blue-500 to-cyan-400" },
];

// 3D Floating shapes that orbit the spiral
const floatingShapes = [
  { type: "cube", x: 15, y: 20, size: 40, orbitRadius: 200, orbitSpeed: 0.5, delay: 0 },
  { type: "sphere", x: 85, y: 25, size: 32, orbitRadius: 180, orbitSpeed: 0.7, delay: 0.2 },
  { type: "pyramid", x: 10, y: 75, size: 36, orbitRadius: 220, orbitSpeed: 0.4, delay: 0.4 },
  { type: "cube", x: 88, y: 70, size: 28, orbitRadius: 190, orbitSpeed: 0.6, delay: 0.6 },
  { type: "sphere", x: 25, y: 45, size: 44, orbitRadius: 240, orbitSpeed: 0.3, delay: 0.3 },
  { type: "pyramid", x: 78, y: 50, size: 38, orbitRadius: 210, orbitSpeed: 0.55, delay: 0.5 },
];

const floatingIcons = [
  { Icon: Rocket, x: 12, y: 18, delay: 0, size: 32 },
  { Icon: Lightbulb, x: 88, y: 22, delay: 0.2, size: 28 },
  { Icon: Clock, x: 8, y: 78, delay: 0.4, size: 24 },
  { Icon: Sparkles, x: 92, y: 72, delay: 0.6, size: 30 },
  { Icon: Star, x: 20, y: 40, delay: 0.3, size: 26 },
  { Icon: Heart, x: 80, y: 55, delay: 0.5, size: 28 },
];

export const ZoomTunnelSection = () => {
  const [zoomProgress, setZoomProgress] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const lastScrollTime = useRef(0);
  const accumulatedDelta = useRef(0);

  const activeCardIndex = Math.min(
    Math.floor(zoomProgress * tunnelContent.length),
    tunnelContent.length - 1
  );

  // Lock scroll using only overflow hidden (no position fixed)
  const lockScroll = useCallback(() => {
    if (isLocked) return;
    document.body.style.overflow = 'hidden';
    setIsLocked(true);
  }, [isLocked]);

  const unlockScroll = useCallback(() => {
    document.body.style.overflow = '';
    setIsLocked(false);
  }, []);

  // Handle wheel events for smooth continuous zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const sectionInView = rect.top <= window.innerHeight * 0.3 && rect.bottom >= window.innerHeight * 0.7;

    if (!sectionInView) {
      if (isLocked) unlockScroll();
      return;
    }

    // Lock when section is in view
    if (!isLocked) {
      lockScroll();
    }

    e.preventDefault();

    // Smooth delta accumulation for continuous scrolling feel
    const sensitivity = 0.0015;
    const delta = e.deltaY * sensitivity;
    
    setZoomProgress((prev) => {
      const next = Math.max(0, Math.min(1, prev + delta));
      
      // Unlock at boundaries
      if (next >= 1 && delta > 0) {
        setTimeout(() => unlockScroll(), 10);
        return 1;
      }
      if (next <= 0 && delta < 0) {
        setTimeout(() => unlockScroll(), 10);
        return 0;
      }
      
      return next;
    });
  }, [isLocked, lockScroll, unlockScroll]);

  // Touch handling for smooth zoom
  const touchStartY = useRef(0);
  const lastTouchY = useRef(0);
  
  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    lastTouchY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const sectionInView = rect.top <= window.innerHeight * 0.3 && rect.bottom >= window.innerHeight * 0.7;

    if (!sectionInView) {
      if (isLocked) unlockScroll();
      return;
    }

    if (!isLocked) {
      lockScroll();
    }

    e.preventDefault();

    const currentY = e.touches[0].clientY;
    const delta = (lastTouchY.current - currentY) * 0.003;
    lastTouchY.current = currentY;

    setZoomProgress((prev) => {
      const next = Math.max(0, Math.min(1, prev + delta));
      
      if (next >= 1 && delta > 0) {
        setTimeout(() => unlockScroll(), 10);
        return 1;
      }
      if (next <= 0 && delta < 0) {
        setTimeout(() => unlockScroll(), 10);
        return 0;
      }
      
      return next;
    });
  }, [isLocked, lockScroll, unlockScroll]);

  const handleTouchEnd = useCallback(() => {
    // Let momentum continue naturally
  }, []);

  // Add event listeners
  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // 3D Spiral rotation based on zoom
  const spiralRotationZ = zoomProgress * 360;
  const spiralRotationY = zoomProgress * 45;
  const spiralScale = 1 + zoomProgress * 4;

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden"
      style={{
        perspective: '1500px',
        background: `linear-gradient(135deg, 
          hsl(var(--background)) 0%, 
          hsl(var(--muted) / 0.15) 50%, 
          hsl(var(--background)) 100%)`
      }}
    >
      {/* 3D Rotating Spiral Container */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          perspective: '1200px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        {/* Main 3D Spiral */}
        <div
          className="relative w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
            transform: `
              rotateZ(${spiralRotationZ}deg) 
              rotateY(${spiralRotationY}deg) 
              scale(${spiralScale})
            `,
            transition: 'transform 0.1s ease-out',
          }}
        >
          {/* Spiral Arms - 6 rotating arms */}
          {Array.from({ length: 6 }).map((_, armIndex) => {
            const armAngle = (armIndex / 6) * 360;
            const armDepth = 100 + armIndex * 50;
            
            return (
              <div
                key={`arm-${armIndex}`}
                className="absolute left-1/2 top-1/2 w-[600px] h-[2px]"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `
                    translate(-50%, -50%)
                    rotateZ(${armAngle}deg)
                    translateZ(${armDepth - zoomProgress * 200}px)
                  `,
                  background: `linear-gradient(90deg, 
                    transparent 0%, 
                    hsl(var(--primary) / ${0.3 - zoomProgress * 0.2}) 30%,
                    hsl(var(--primary) / ${0.6 - zoomProgress * 0.3}) 50%,
                    hsl(var(--primary) / ${0.3 - zoomProgress * 0.2}) 70%,
                    transparent 100%
                  )`,
                }}
              />
            );
          })}

          {/* Concentric 3D Rings */}
          {Array.from({ length: 12 }).map((_, i) => {
            const ringDepth = -200 + i * 100;
            const ringSize = 80 + i * 60;
            const ringOpacity = Math.max(0, 0.5 - zoomProgress * 0.4 + (i * 0.02));
            const ringRotation = zoomProgress * 30 * (i % 2 === 0 ? 1 : -1);
            
            return (
              <div
                key={`ring-${i}`}
                className="absolute left-1/2 top-1/2 rounded-full border"
                style={{
                  width: `${ringSize}px`,
                  height: `${ringSize}px`,
                  transformStyle: 'preserve-3d',
                  transform: `
                    translate(-50%, -50%)
                    translateZ(${ringDepth + zoomProgress * 600}px)
                    rotateX(${20 + ringRotation}deg)
                    rotateY(${ringRotation}deg)
                  `,
                  borderColor: `hsl(var(--primary) / ${ringOpacity})`,
                  boxShadow: `0 0 ${20 + i * 5}px hsl(var(--primary) / ${ringOpacity * 0.3})`,
                }}
              />
            );
          })}

          {/* 3D Floating Cubes and Spheres */}
          {floatingShapes.map((shape, index) => {
            const orbitAngle = (zoomProgress * 360 * shape.orbitSpeed) + (index * 60);
            const radians = (orbitAngle * Math.PI) / 180;
            const x = Math.cos(radians) * shape.orbitRadius * (1 - zoomProgress * 0.5);
            const y = Math.sin(radians) * shape.orbitRadius * (1 - zoomProgress * 0.5);
            const z = Math.sin(radians * 2) * 100;
            const opacity = Math.max(0, 0.7 - zoomProgress * 0.9);
            
            return (
              <motion.div
                key={`shape-${index}`}
                className="absolute left-1/2 top-1/2 pointer-events-none"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `
                    translate(-50%, -50%)
                    translate3d(${x}px, ${y}px, ${z}px)
                    rotateX(${zoomProgress * 180}deg)
                    rotateY(${zoomProgress * 180}deg)
                  `,
                  opacity,
                }}
              >
                {shape.type === 'cube' && (
                  <div
                    className="bg-gradient-to-br from-primary/30 to-secondary/30 border border-primary/40"
                    style={{
                      width: shape.size,
                      height: shape.size,
                      transform: 'rotateX(45deg) rotateZ(45deg)',
                    }}
                  />
                )}
                {shape.type === 'sphere' && (
                  <div
                    className="rounded-full bg-gradient-to-br from-accent/40 to-primary/30"
                    style={{
                      width: shape.size,
                      height: shape.size,
                      boxShadow: `inset -${shape.size/4}px -${shape.size/4}px ${shape.size/2}px rgba(0,0,0,0.2)`,
                    }}
                  />
                )}
                {shape.type === 'pyramid' && (
                  <div
                    className="border-l-[20px] border-r-[20px] border-b-[35px] border-l-transparent border-r-transparent border-b-secondary/40"
                    style={{
                      filter: 'drop-shadow(0 0 10px hsl(var(--secondary) / 0.3))',
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Floating Icons that zoom past */}
      {floatingIcons.map(({ Icon, x, y, delay, size }, index) => {
        const iconScale = 1 + zoomProgress * 5;
        const iconOpacity = Math.max(0, 0.6 - zoomProgress);
        const iconBlur = zoomProgress * 4;
        
        return (
          <motion.div
            key={index}
            className="absolute pointer-events-none"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: `translate(-50%, -50%) scale(${iconScale})`,
              opacity: iconOpacity,
              filter: `blur(${iconBlur}px)`,
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: iconOpacity,
              scale: iconScale,
            }}
            transition={{ duration: 0.1 }}
          >
            <Icon size={size} className="text-primary/50" />
          </motion.div>
        );
      })}

      {/* Center Glow that expands with zoom */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: 0.15 + zoomProgress * 0.5 }}
      >
        <div 
          className="rounded-full bg-gradient-to-r from-primary/40 via-secondary/40 to-accent/40 blur-3xl"
          style={{
            width: `${10 + zoomProgress * 80}rem`,
            height: `${10 + zoomProgress * 80}rem`,
          }}
        />
      </motion.div>

      {/* Content Cards - zoom in/out based on progress */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          {tunnelContent.map((content, index) => {
            const isActive = index === activeCardIndex;
            if (!isActive) return null;

            const Icon = content.icon;

            return (
              <motion.div
                key={content.title}
                className="absolute flex flex-col items-center text-center px-6"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
                <motion.div
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br ${content.color} flex items-center justify-center mb-6 shadow-lg`}
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 3, -3, 0],
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatDelay: 0.5 
                  }}
                >
                  <Icon className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </motion.div>
                <h3 className={`text-3xl md:text-5xl font-bold bg-gradient-to-r ${content.color} bg-clip-text text-transparent mb-4`}>
                  {content.title}
                </h3>
                <p className="text-lg md:text-xl text-muted-foreground max-w-md">
                  {content.subtitle}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
        {/* Progress bar */}
        <div className="w-32 h-1 bg-muted/30 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary rounded-full"
            style={{ width: `${zoomProgress * 100}%` }}
          />
        </div>
        
        <div className="flex gap-2">
          {tunnelContent.map((_, index) => (
            <motion.div
              key={index}
              className="w-2 h-2 rounded-full"
              animate={{
                backgroundColor: index <= activeCardIndex 
                  ? 'hsl(var(--primary))' 
                  : 'hsl(var(--muted-foreground) / 0.3)',
                scale: index === activeCardIndex ? 1.3 : 1,
              }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>
        
        {isLocked && (
          <motion.p
            className="text-sm text-muted-foreground flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {zoomProgress > 0.5 ? '↓' : '↑↓'}
            </motion.span>
            Scroll to zoom
          </motion.p>
        )}
      </div>
    </section>
  );
};

export default ZoomTunnelSection;
