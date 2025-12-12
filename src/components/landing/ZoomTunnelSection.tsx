import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const tunnelContent = [
  { title: "AI-Powered Schedules", subtitle: "Let AI plan your perfect study sessions", icon: "🧠" },
  { title: "Adapt to Your Life", subtitle: "Around football, family & fun", icon: "⚡" },
  { title: "Track Your Progress", subtitle: "Watch your confidence grow daily", icon: "📈" },
  { title: "Achieve Your Goals", subtitle: "Ace your exams with confidence", icon: "✨" },
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

  const lineCount = 32;
  const rectCount = 6;

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-background via-muted/5 to-background"
    >
      {/* Tunnel Lines */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          className="absolute w-full h-full"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid slice"
        >
          {Array.from({ length: lineCount }).map((_, i) => {
            const angle = (i / lineCount) * 360;
            const radians = (angle * Math.PI) / 180;
            const length = 800;
            const x2 = 500 + Math.cos(radians) * length;
            const y2 = 500 + Math.sin(radians) * length;
            const scale = 1 + zoomProgress * 3;
            
            return (
              <motion.line
                key={i}
                x1="500"
                y1="500"
                x2={x2}
                y2={y2}
                stroke="hsl(var(--primary))"
                strokeWidth="1"
                strokeOpacity={0.15 + zoomProgress * 0.1}
                style={{
                  transformOrigin: '500px 500px',
                  transform: `scale(${scale})`,
                }}
              />
            );
          })}
        </svg>
      </div>

      {/* Nested Rectangles (Tunnel Depth) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {Array.from({ length: rectCount }).map((_, i) => {
          const baseScale = 0.15 + (i / rectCount) * 0.7;
          const zoomScale = baseScale + zoomProgress * (1 - baseScale) * 4;
          const opacity = Math.max(0, 1 - zoomProgress * 0.4 * (rectCount - i));
          
          return (
            <motion.div
              key={i}
              className="absolute border border-primary/20 rounded-lg"
              style={{
                width: '70%',
                height: '70%',
                transform: `scale(${zoomScale})`,
                opacity: opacity,
              }}
              animate={{
                scale: zoomScale,
                opacity: opacity,
              }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          );
        })}
      </div>

      {/* Center Glow */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: 0.3 + zoomProgress * 0.3,
        }}
      >
        <div 
          className="w-32 h-32 rounded-full bg-gradient-to-r from-primary/40 to-secondary/40 blur-3xl"
          style={{
            transform: `scale(${1 + zoomProgress * 5})`,
          }}
        />
      </motion.div>

      {/* Content Cards */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {tunnelContent.map((content, index) => {
            const isActive = index === activeCardIndex;
            const isPast = index < activeCardIndex;
            const isFuture = index > activeCardIndex;
            
            if (!isActive && !isPast) return null;

            return (
              <motion.div
                key={content.title}
                className="absolute flex flex-col items-center text-center px-6"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{
                  scale: isActive ? 1 : isPast ? 2.5 : 0.3,
                  opacity: isActive ? 1 : isPast ? 0 : 0,
                  y: isActive ? 0 : isPast ? -100 : 100,
                }}
                exit={{ scale: 2.5, opacity: 0, y: -100 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              >
                <motion.div
                  className="text-6xl md:text-7xl mb-6"
                  animate={{ 
                    scale: isActive ? [1, 1.1, 1] : 1,
                  }}
                  transition={{ 
                    duration: 0.6, 
                    repeat: isActive ? Infinity : 0,
                    repeatDelay: 1.5 
                  }}
                >
                  {content.icon}
                </motion.div>
                <h3 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4">
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
