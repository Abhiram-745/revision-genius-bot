import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Rocket, Target, Lightbulb, Clock, BarChart3, Sparkles, Zap } from "lucide-react";

const tunnelContent = [
  { title: "AI-Powered Schedules", subtitle: "Let AI plan your perfect study sessions", icon: Brain, color: "from-pink-500 to-rose-400" },
  { title: "Adapt to Your Life", subtitle: "Around football, family & fun", icon: Zap, color: "from-yellow-500 to-orange-400" },
  { title: "Track Your Progress", subtitle: "Watch your confidence grow daily", icon: BarChart3, color: "from-green-500 to-emerald-400" },
  { title: "Achieve Your Goals", subtitle: "Ace your exams with confidence", icon: Target, color: "from-blue-500 to-cyan-400" },
];

// Floating icons positioned around the spiral
const floatingIcons = [
  { Icon: Rocket, x: 15, y: 20, delay: 0, size: 32 },
  { Icon: Lightbulb, x: 85, y: 25, delay: 0.2, size: 28 },
  { Icon: Clock, x: 10, y: 75, delay: 0.4, size: 24 },
  { Icon: Sparkles, x: 88, y: 70, delay: 0.6, size: 30 },
  { Icon: Target, x: 25, y: 45, delay: 0.3, size: 26 },
  { Icon: BarChart3, x: 78, y: 50, delay: 0.5, size: 28 },
];

export const ZoomTunnelSection = () => {
  const [zoomProgress, setZoomProgress] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [hasExited, setHasExited] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const savedScrollY = useRef(0);
  const lastScrollTime = useRef(0);
  const exitDirection = useRef<'up' | 'down' | null>(null);

  const activeCardIndex = Math.min(
    Math.floor(zoomProgress * tunnelContent.length),
    tunnelContent.length - 1
  );

  const lockScroll = useCallback(() => {
    if (isLocked) return;
    savedScrollY.current = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY.current}px`;
    document.body.style.width = '100%';
    setIsLocked(true);
  }, [isLocked]);

  const unlockScroll = useCallback((direction: 'up' | 'down') => {
    if (!isLocked) return;
    
    exitDirection.current = direction;
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    
    const section = sectionRef.current;
    if (section) {
      const rect = section.getBoundingClientRect();
      const sectionTop = savedScrollY.current + rect.top;
      const sectionBottom = sectionTop + rect.height;
      
      if (direction === 'down') {
        window.scrollTo({ top: sectionBottom + 50, behavior: 'instant' });
      } else {
        window.scrollTo({ top: Math.max(0, sectionTop - 100), behavior: 'instant' });
      }
    }
    
    setIsLocked(false);
    setHasExited(true);
  }, [isLocked]);

  // IntersectionObserver to detect section visibility
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5 && !hasExited) {
            const rect = section.getBoundingClientRect();
            const sectionTop = window.scrollY + rect.top;
            window.scrollTo({ top: sectionTop, behavior: 'instant' });
            lockScroll();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [lockScroll, hasExited]);

  // Reset hasExited when section leaves viewport
  useEffect(() => {
    const handleScroll = () => {
      if (!hasExited) return;
      const section = sectionRef.current;
      if (!section) return;
      
      const rect = section.getBoundingClientRect();
      if (rect.bottom < -100 || rect.top > window.innerHeight + 100) {
        setHasExited(false);
        if (exitDirection.current === 'up') {
          setZoomProgress(1);
        } else {
          setZoomProgress(0);
        }
        exitDirection.current = null;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasExited]);

  // Handle wheel events
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!isLocked) return;
    e.preventDefault();
    
    const now = Date.now();
    if (now - lastScrollTime.current < 300) return;
    lastScrollTime.current = now;

    const delta = e.deltaY > 0 ? 1 : -1;
    const step = 0.25;

    setZoomProgress((prev) => {
      const next = prev + delta * step;
      
      if (next >= 1 && delta > 0) {
        setTimeout(() => unlockScroll('down'), 50);
        return 1;
      }
      if (next <= 0 && delta < 0) {
        setTimeout(() => unlockScroll('up'), 50);
        return 0;
      }
      return Math.max(0, Math.min(1, next));
    });
  }, [isLocked, unlockScroll]);

  // Touch handling
  const touchStartY = useRef(0);
  
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isLocked) return;
    touchStartY.current = e.touches[0].clientY;
  }, [isLocked]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!isLocked) return;
    e.preventDefault();
    
    const now = Date.now();
    if (now - lastScrollTime.current < 300) return;
    lastScrollTime.current = now;

    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(deltaY) < 30) return;

    const delta = deltaY > 0 ? 1 : -1;
    const step = 0.25;

    setZoomProgress((prev) => {
      const next = prev + delta * step;
      
      if (next >= 1 && delta > 0) {
        setTimeout(() => unlockScroll('down'), 50);
        return 1;
      }
      if (next <= 0 && delta < 0) {
        setTimeout(() => unlockScroll('up'), 50);
        return 0;
      }
      return Math.max(0, Math.min(1, next));
    });
  }, [isLocked, unlockScroll]);

  // Keyboard handling
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isLocked) return;
    
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const now = Date.now();
      if (now - lastScrollTime.current < 300) return;
      lastScrollTime.current = now;

      setZoomProgress((prev) => {
        const next = prev + 0.25;
        if (next >= 1) {
          setTimeout(() => unlockScroll('down'), 50);
          return 1;
        }
        return next;
      });
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const now = Date.now();
      if (now - lastScrollTime.current < 300) return;
      lastScrollTime.current = now;

      setZoomProgress((prev) => {
        const next = prev - 0.25;
        if (next <= 0) {
          setTimeout(() => unlockScroll('up'), 50);
          return 0;
        }
        return next;
      });
    } else if (e.key === 'Escape') {
      unlockScroll('down');
    }
  }, [isLocked, unlockScroll]);

  // Add event listeners
  useEffect(() => {
    if (isLocked) {
      window.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('touchstart', handleTouchStart, { passive: true });
      window.addEventListener('touchend', handleTouchEnd, { passive: false });
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLocked, handleWheel, handleTouchStart, handleTouchEnd, handleKeyDown]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, []);

  // Generate 3D spiral points
  const spiralPoints = Array.from({ length: 60 }).map((_, i) => {
    const t = i / 60;
    const angle = t * Math.PI * 6; // 3 full rotations
    const radius = 50 + t * 400; // Expanding radius
    const x = 500 + Math.cos(angle) * radius;
    const y = 500 + Math.sin(angle) * radius;
    return { x, y, angle, t };
  });

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden"
      style={{
        background: `linear-gradient(135deg, 
          hsl(var(--background)) 0%, 
          hsl(var(--muted) / 0.1) 50%, 
          hsl(var(--background)) 100%)`
      }}
    >
      {/* 3D Spiral Lines */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          className="absolute w-full h-full"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Radiating spiral lines from center */}
          {Array.from({ length: 48 }).map((_, i) => {
            const angle = (i / 48) * 360;
            const radians = (angle * Math.PI) / 180;
            const spiralOffset = zoomProgress * 30; // Spiral rotation with zoom
            const adjustedAngle = radians + spiralOffset;
            const length = 600;
            const x2 = 500 + Math.cos(adjustedAngle) * length;
            const y2 = 500 + Math.sin(adjustedAngle) * length;
            const scale = 1 + zoomProgress * 2;
            const opacity = 0.1 + (i % 4 === 0 ? 0.15 : 0);
            
            return (
              <motion.line
                key={i}
                x1="500"
                y1="500"
                x2={x2}
                y2={y2}
                stroke="hsl(var(--primary))"
                strokeWidth={i % 6 === 0 ? "1.5" : "0.5"}
                strokeOpacity={opacity}
                style={{
                  transformOrigin: '500px 500px',
                  transform: `scale(${scale}) rotate(${zoomProgress * 20}deg)`,
                }}
              />
            );
          })}

          {/* Concentric 3D spiral rectangles */}
          {Array.from({ length: 8 }).map((_, i) => {
            const baseScale = 0.1 + (i / 8) * 0.6;
            const zoomScale = baseScale + zoomProgress * (1.5 - baseScale) * 3;
            const rotateAmount = i * 8 + zoomProgress * 45;
            const opacity = Math.max(0, 0.6 - zoomProgress * 0.15 * (8 - i));
            
            return (
              <motion.rect
                key={i}
                x="250"
                y="300"
                width="500"
                height="400"
                rx="20"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="1"
                strokeOpacity={opacity}
                style={{
                  transformOrigin: '500px 500px',
                  transform: `scale(${zoomScale}) rotate(${rotateAmount}deg)`,
                }}
              />
            );
          })}
        </svg>
      </div>

      {/* Floating Icons around the spiral */}
      {floatingIcons.map(({ Icon, x, y, delay, size }, index) => {
        const iconScale = 1 + zoomProgress * 3;
        const iconOpacity = Math.max(0, 0.6 - zoomProgress * 0.8);
        
        return (
          <motion.div
            key={index}
            className="absolute pointer-events-none"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: `scale(${iconScale}) translate(-50%, -50%)`,
              opacity: iconOpacity,
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: iconOpacity,
              scale: iconScale,
              rotate: zoomProgress * 30,
            }}
            transition={{ 
              duration: 0.5, 
              delay,
              ease: "easeOut" 
            }}
          >
            <Icon 
              size={size} 
              className="text-primary/40"
              style={{
                filter: `blur(${zoomProgress * 2}px)`,
              }}
            />
          </motion.div>
        );
      })}

      {/* Center Glow that expands with zoom */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: 0.2 + zoomProgress * 0.4,
        }}
      >
        <div 
          className="rounded-full bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 blur-3xl"
          style={{
            width: `${8 + zoomProgress * 60}rem`,
            height: `${8 + zoomProgress * 60}rem`,
            transform: `scale(${1 + zoomProgress * 2})`,
          }}
        />
      </motion.div>

      {/* Content Cards - zoom in/out based on scroll direction */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {tunnelContent.map((content, index) => {
            const isActive = index === activeCardIndex;
            const isPast = index < activeCardIndex;
            
            if (!isActive && !isPast) return null;

            const Icon = content.icon;

            return (
              <motion.div
                key={content.title}
                className="absolute flex flex-col items-center text-center px-6"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{
                  scale: isActive ? 1 : isPast ? 2.5 : 0.3,
                  opacity: isActive ? 1 : 0,
                  y: isActive ? 0 : isPast ? -100 : 100,
                }}
                exit={{ scale: 2.5, opacity: 0, y: -100 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              >
                <motion.div
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br ${content.color} flex items-center justify-center mb-6 shadow-lg`}
                  animate={{ 
                    scale: isActive ? [1, 1.05, 1] : 1,
                    rotate: isActive ? [0, 3, -3, 0] : 0,
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: isActive ? Infinity : 0,
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
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
        
        {isLocked && (
          <motion.p
            className="text-sm text-muted-foreground flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ↓
            </motion.span>
            Scroll to explore
          </motion.p>
        )}
      </div>
    </section>
  );
};

export default ZoomTunnelSection;
