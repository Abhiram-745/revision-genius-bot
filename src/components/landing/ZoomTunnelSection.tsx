import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, Target, Lightbulb, BarChart3, Zap,
  Trophy, GraduationCap, BookOpen, type LucideIcon
} from "lucide-react";

const tunnelContent = [
  { title: "AI-Powered Schedules", subtitle: "Let AI plan your perfect study sessions", icon: Brain, color: "from-pink-500 to-rose-400" },
  { title: "Adapt to Your Life", subtitle: "Around football, family & fun", icon: Zap, color: "from-yellow-500 to-orange-400" },
  { title: "Track Your Progress", subtitle: "Watch your confidence grow daily", icon: BarChart3, color: "from-green-500 to-emerald-400" },
  { title: "Achieve Your Goals", subtitle: "Ace your exams with confidence", icon: Target, color: "from-blue-500 to-cyan-400" },
];

// Study icons positioned around the tunnel
interface EdgeIcon {
  Icon: LucideIcon;
  position: string;
  color: string;
  size: number;
  animation: { rotateY?: number; y?: number[]; rotateZ?: number[]; scale?: number[]; rotate?: number[] };
}

const edgeIcons: EdgeIcon[] = [
  { Icon: BookOpen, position: "left-[8%] top-[15%]", color: "text-blue-500", size: 44, animation: { rotateY: 360 } },
  { Icon: Trophy, position: "right-[8%] top-[18%]", color: "text-yellow-500", size: 40, animation: { y: [-8, 8, -8] } },
  { Icon: GraduationCap, position: "left-[5%] top-[50%] -translate-y-1/2", color: "text-purple-500", size: 38, animation: { rotateZ: [-5, 5, -5] } },
  { Icon: Target, position: "right-[6%] top-[55%]", color: "text-red-500", size: 42, animation: { scale: [1, 1.1, 1] } },
  { Icon: Brain, position: "left-[10%] bottom-[18%]", color: "text-pink-500", size: 40, animation: { rotateY: 360 } },
  { Icon: Lightbulb, position: "right-[12%] bottom-[22%]", color: "text-orange-500", size: 36, animation: { rotate: [-10, 10, -10] } },
];

export const ZoomTunnelSection = () => {
  const [zoomProgress, setZoomProgress] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const hasExited = useRef(false);

  const activeCardIndex = Math.min(
    Math.floor(zoomProgress * tunnelContent.length),
    tunnelContent.length - 1
  );

  // Lock scroll
  const lockScroll = useCallback(() => {
    if (isLocked || hasExited.current) return;
    document.body.style.overflow = 'hidden';
    setIsLocked(true);
  }, [isLocked]);

  // Unlock and exit with smooth scroll
  const unlockScroll = useCallback((direction: 'up' | 'down') => {
    document.body.style.overflow = '';
    setIsLocked(false);
    hasExited.current = true;
    
    window.scrollBy({ 
      top: direction === 'down' ? 400 : -400, 
      behavior: 'smooth' 
    });
    
    setTimeout(() => {
      hasExited.current = false;
    }, 800);
  }, []);

  // Handle wheel events
  const handleWheel = useCallback((e: WheelEvent) => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const sectionInView = rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5;

    if (!sectionInView || hasExited.current) {
      if (isLocked) {
        document.body.style.overflow = '';
        setIsLocked(false);
      }
      return;
    }

    if (!isLocked && !hasExited.current) {
      lockScroll();
    }

    e.preventDefault();

    const sensitivity = 0.0008;
    const delta = e.deltaY * sensitivity;
    
    setZoomProgress((prev) => {
      const next = Math.max(0, Math.min(1, prev + delta));
      
      if (next >= 1 && delta > 0) {
        setTimeout(() => unlockScroll('down'), 10);
        return 1;
      }
      if (next <= 0 && delta < 0) {
        setTimeout(() => unlockScroll('up'), 10);
        return 0;
      }
      
      return next;
    });
  }, [isLocked, lockScroll, unlockScroll]);

  // Touch handling
  const lastTouchY = useRef(0);
  
  const handleTouchStart = useCallback((e: TouchEvent) => {
    lastTouchY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const sectionInView = rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5;

    if (!sectionInView || hasExited.current) {
      if (isLocked) {
        document.body.style.overflow = '';
        setIsLocked(false);
      }
      return;
    }

    if (!isLocked && !hasExited.current) {
      lockScroll();
    }

    e.preventDefault();

    const currentY = e.touches[0].clientY;
    const delta = (lastTouchY.current - currentY) * 0.0016;
    lastTouchY.current = currentY;

    setZoomProgress((prev) => {
      const next = Math.max(0, Math.min(1, prev + delta));
      
      if (next >= 1 && delta > 0) {
        setTimeout(() => unlockScroll('down'), 10);
        return 1;
      }
      if (next <= 0 && delta < 0) {
        setTimeout(() => unlockScroll('up'), 10);
        return 0;
      }
      
      return next;
    });
  }, [isLocked, lockScroll, unlockScroll]);

  // Add event listeners
  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleWheel, handleTouchStart, handleTouchMove]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Number of rectangular frames
  const frameCount = 8;

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-background"
      style={{
        perspective: '1200px',
      }}
    >
      {/* Rectangular Perspective Tunnel */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          perspectiveOrigin: '50% 50%',
        }}
      >
        {/* Perspective lines from corners to center */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top-left to center */}
          <div 
            className="absolute h-[2px] origin-top-left"
            style={{
              left: '0%',
              top: '0%',
              width: '60%',
              background: 'linear-gradient(90deg, hsl(var(--primary) / 0.5), transparent)',
              transform: 'rotate(33deg)',
            }}
          />
          {/* Top-right to center */}
          <div 
            className="absolute h-[2px] origin-top-right"
            style={{
              right: '0%',
              top: '0%',
              width: '60%',
              background: 'linear-gradient(-90deg, hsl(var(--primary) / 0.5), transparent)',
              transform: 'rotate(-33deg)',
            }}
          />
          {/* Bottom-left to center */}
          <div 
            className="absolute h-[2px] origin-bottom-left"
            style={{
              left: '0%',
              bottom: '0%',
              width: '60%',
              background: 'linear-gradient(90deg, hsl(var(--primary) / 0.5), transparent)',
              transform: 'rotate(-33deg)',
            }}
          />
          {/* Bottom-right to center */}
          <div 
            className="absolute h-[2px] origin-bottom-right"
            style={{
              right: '0%',
              bottom: '0%',
              width: '60%',
              background: 'linear-gradient(-90deg, hsl(var(--primary) / 0.5), transparent)',
              transform: 'rotate(33deg)',
            }}
          />
          
          {/* Additional edge lines */}
          {/* Top edge to center */}
          <div 
            className="absolute h-[2px] left-1/2 top-0 origin-top"
            style={{
              width: '50%',
              background: 'linear-gradient(180deg, hsl(var(--primary) / 0.4), transparent)',
              transform: 'translateX(-50%) rotate(90deg)',
              transformOrigin: 'top center',
            }}
          />
          {/* Bottom edge to center */}
          <div 
            className="absolute h-[2px] left-1/2 bottom-0 origin-bottom"
            style={{
              width: '50%',
              background: 'linear-gradient(0deg, hsl(var(--primary) / 0.4), transparent)',
              transform: 'translateX(-50%) rotate(90deg)',
              transformOrigin: 'bottom center',
            }}
          />
          {/* Left edge to center */}
          <div 
            className="absolute w-[2px] left-0 top-1/2"
            style={{
              height: '50%',
              background: 'linear-gradient(90deg, hsl(var(--primary) / 0.4), transparent)',
              transform: 'translateY(-50%)',
            }}
          />
          {/* Right edge to center */}
          <div 
            className="absolute w-[2px] right-0 top-1/2"
            style={{
              height: '50%',
              background: 'linear-gradient(-90deg, hsl(var(--primary) / 0.4), transparent)',
              transform: 'translateY(-50%)',
            }}
          />
        </div>

        {/* Nested Rectangular Frames */}
        <div 
          className="relative w-full h-full flex items-center justify-center"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {Array.from({ length: frameCount }).map((_, i) => {
            // Calculate frame properties based on zoom
            const baseZ = -600 + i * 150;
            const zoomOffset = zoomProgress * 1200;
            const currentZ = baseZ + zoomOffset;
            
            // Scale based on z-position (closer = bigger)
            const scale = Math.max(0.1, 1 + currentZ / 400);
            
            // Opacity - fade out when too close or too far
            const opacity = currentZ > 200 ? 0 : currentZ < -500 ? 0 : 0.6 - Math.abs(currentZ) / 800;
            
            // Frame size increases as it gets closer
            const baseSize = 20 + i * 8;
            
            return (
              <div
                key={`frame-${i}`}
                className="absolute border-2 rounded-sm"
                style={{
                  width: `${baseSize}%`,
                  height: `${baseSize * 0.6}%`,
                  transform: `translateZ(${currentZ}px) scale(${scale})`,
                  borderColor: `hsl(var(--primary) / ${Math.max(0, opacity)})`,
                  boxShadow: opacity > 0 ? `
                    0 0 ${30 + i * 10}px hsl(var(--primary) / ${opacity * 0.3}),
                    inset 0 0 ${20 + i * 5}px hsl(var(--primary) / ${opacity * 0.1})
                  ` : 'none',
                  transition: 'transform 0.15s ease-out',
                  transformStyle: 'preserve-3d',
                }}
              />
            );
          })}
          
          {/* Horizontal grid lines inside tunnel */}
          {Array.from({ length: 5 }).map((_, i) => {
            const baseZ = -400 + i * 120;
            const zoomOffset = zoomProgress * 1000;
            const currentZ = baseZ + zoomOffset;
            const opacity = currentZ > 150 ? 0 : currentZ < -400 ? 0 : 0.3 - Math.abs(currentZ) / 600;
            
            return (
              <div
                key={`h-line-${i}`}
                className="absolute w-[80%] h-[1px]"
                style={{
                  transform: `translateZ(${currentZ}px)`,
                  background: `linear-gradient(90deg, 
                    transparent 0%, 
                    hsl(var(--primary) / ${Math.max(0, opacity)}) 30%, 
                    hsl(var(--primary) / ${Math.max(0, opacity)}) 70%, 
                    transparent 100%
                  )`,
                  transition: 'transform 0.15s ease-out',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Study Icons Around the Edges */}
      <div className="absolute inset-0 pointer-events-none">
        {edgeIcons.map((iconData, index) => {
          const IconComponent = iconData.Icon;
          const opacity = Math.max(0, 0.85 - zoomProgress * 0.9);
          const scale = 1 - zoomProgress * 0.4;
          
          return (
            <motion.div 
              key={`edge-icon-${index}`}
              className={`absolute ${iconData.position} ${iconData.color}`}
              style={{ 
                opacity,
                transform: `scale(${scale})`,
              }}
              animate={iconData.animation}
              transition={{ 
                duration: 5 + index, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <div 
                className="p-3 md:p-4 rounded-xl bg-background/30 backdrop-blur-sm border border-current/30"
                style={{ 
                  boxShadow: '0 0 25px currentColor',
                }}
              >
                <IconComponent size={iconData.size} strokeWidth={1.5} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Glowing particles */}
      {Array.from({ length: 12 }).map((_, i) => {
        const particleOpacity = Math.max(0, 0.35 - zoomProgress * 0.4);
        const particleX = 10 + (i * 7) % 80;
        const particleY = 15 + (i * 11) % 70;
        
        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1.5 h-1.5 rounded-full bg-primary/60 pointer-events-none"
            style={{
              left: `${particleX}%`,
              top: `${particleY}%`,
              opacity: particleOpacity,
              boxShadow: '0 0 8px hsl(var(--primary) / 0.5)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [particleOpacity, particleOpacity * 1.3, particleOpacity],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {/* Center Glow */}
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: `${200 + zoomProgress * 600}px`,
          height: `${200 + zoomProgress * 600}px`,
          background: `radial-gradient(circle, 
            hsl(var(--primary) / ${0.15 + zoomProgress * 0.2}) 0%,
            hsl(var(--primary) / ${0.05 + zoomProgress * 0.1}) 40%,
            transparent 70%
          )`,
          transition: 'all 0.2s ease-out',
        }}
      />

      {/* Content Cards - appear as you zoom */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCardIndex}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ 
              scale: 0.8 + zoomProgress * 0.4,
              opacity: Math.min(1, zoomProgress * 2.5),
            }}
            exit={{ scale: 1.3, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative z-10"
          >
            <div 
              className={`p-6 md:p-8 rounded-2xl bg-gradient-to-br ${tunnelContent[activeCardIndex].color} text-white shadow-2xl`}
              style={{
                boxShadow: `0 0 60px hsl(var(--primary) / 0.4)`,
              }}
            >
              <div className="flex items-center gap-4 mb-3">
                {(() => {
                  const IconComponent = tunnelContent[activeCardIndex].icon;
                  return <IconComponent size={36} strokeWidth={1.5} />;
                })()}
                <h3 className="text-xl md:text-2xl font-bold">
                  {tunnelContent[activeCardIndex].title}
                </h3>
              </div>
              <p className="text-base md:text-lg opacity-90">
                {tunnelContent[activeCardIndex].subtitle}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20">
        {/* Progress bar */}
        <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary rounded-full"
            style={{ width: `${zoomProgress * 100}%` }}
          />
        </div>
        
        {/* Dot indicators */}
        <div className="flex gap-2">
          {tunnelContent.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === activeCardIndex 
                  ? 'bg-primary scale-125' 
                  : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
        
        {/* Scroll hint */}
        <motion.p 
          className="text-xs text-muted-foreground"
          animate={{ opacity: zoomProgress < 0.1 ? 1 : 0 }}
        >
          Scroll to explore
        </motion.p>
      </div>
    </section>
  );
};
