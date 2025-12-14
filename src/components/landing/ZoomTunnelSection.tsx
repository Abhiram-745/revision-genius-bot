import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Target, BarChart3, Zap } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const tunnelContent = [
  { title: "AI-Powered Schedules", subtitle: "Let AI plan your perfect study sessions", icon: Brain },
  { title: "Adapt to Your Life", subtitle: "Around football, family & fun", icon: Zap },
  { title: "Track Your Progress", subtitle: "Watch your confidence grow daily", icon: BarChart3 },
  { title: "Achieve Your Goals", subtitle: "Ace your exams with confidence", icon: Target },
];

// Mobile simplified version - no scroll lock
const MobileZoomSection = () => {
  return (
    <section className="relative py-16 px-4 overflow-hidden bg-background">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-display font-bold mb-2">
            Your Study Journey
          </h2>
          <p className="text-sm text-muted-foreground">
            Everything you need to succeed
          </p>
        </motion.div>

        <div className="space-y-4">
          {tunnelContent.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <IconComponent size={20} strokeWidth={1.5} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Desktop version - optimized for smooth performance
const DesktopZoomSection = () => {
  const [zoomProgress, setZoomProgress] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const hasExited = useRef(false);
  const rafRef = useRef<number>(0);
  const targetProgress = useRef(0);

  const activeCardIndex = Math.min(
    Math.floor(zoomProgress * tunnelContent.length),
    tunnelContent.length - 1
  );

  const lockScroll = useCallback(() => {
    if (isLocked || hasExited.current) return;
    document.body.style.overflow = 'hidden';
    setIsLocked(true);
  }, [isLocked]);

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

  // Smooth animation loop using RAF for buttery performance
  useEffect(() => {
    const animate = () => {
      setZoomProgress(prev => {
        const diff = targetProgress.current - prev;
        if (Math.abs(diff) < 0.001) return targetProgress.current;
        return prev + diff * 0.12; // Smooth lerp
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const sectionInView = rect.top <= window.innerHeight * 0.15 && rect.bottom >= window.innerHeight * 0.85;

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

    const sensitivity = 0.0005;
    const delta = e.deltaY * sensitivity;
    
    targetProgress.current = Math.max(0, Math.min(1, targetProgress.current + delta));
    
    if (targetProgress.current >= 1 && delta > 0) {
      setTimeout(() => unlockScroll('down'), 10);
    }
    if (targetProgress.current <= 0 && delta < 0) {
      setTimeout(() => unlockScroll('up'), 10);
    }
  }, [isLocked, lockScroll, unlockScroll]);

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Simplified grid count for performance
  const gridLines = 5;

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-background"
    >
      {/* Optimized Grid Lines - minimal DOM elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Grid */}
        {Array.from({ length: gridLines }).map((_, i) => {
          const yPos = 12 + i * 8;
          const progress = i / (gridLines - 1);
          const opacity = Math.max(0, 0.25 - zoomProgress * 0.3);
          
          return (
            <div
              key={`t-${i}`}
              className="absolute left-1/2 h-px will-change-transform"
              style={{
                top: `${yPos}%`,
                width: `${25 + progress * 55}%`,
                transform: `translateX(-50%) scaleX(${0.6 + progress * 0.4 + zoomProgress * 0.15})`,
                background: `linear-gradient(90deg, transparent, hsl(var(--primary) / ${opacity}), transparent)`,
              }}
            />
          );
        })}
        
        {/* Bottom Grid */}
        {Array.from({ length: gridLines }).map((_, i) => {
          const yPos = 60 + i * 8;
          const progress = 1 - i / (gridLines - 1);
          const opacity = Math.max(0, 0.25 - zoomProgress * 0.3);
          
          return (
            <div
              key={`b-${i}`}
              className="absolute left-1/2 h-px will-change-transform"
              style={{
                top: `${yPos}%`,
                width: `${25 + progress * 55}%`,
                transform: `translateX(-50%) scaleX(${0.6 + progress * 0.4 + zoomProgress * 0.15})`,
                background: `linear-gradient(90deg, transparent, hsl(var(--primary) / ${opacity}), transparent)`,
              }}
            />
          );
        })}
      </div>

      {/* Center Glow */}
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none will-change-transform"
        style={{
          width: `${120 + zoomProgress * 450}px`,
          height: `${120 + zoomProgress * 450}px`,
          background: `radial-gradient(circle, hsl(var(--primary) / ${0.1 + zoomProgress * 0.12}) 0%, transparent 70%)`,
        }}
      />

      {/* Content Card */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCardIndex}
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ 
              scale: 0.9 + zoomProgress * 0.25,
              opacity: Math.min(1, zoomProgress * 3.5),
            }}
            exit={{ scale: 1.15, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative z-10"
          >
            <div 
              className="p-6 md:p-8 rounded-2xl bg-background/95 backdrop-blur-md border border-primary/20 text-foreground shadow-xl"
              style={{ boxShadow: `0 0 25px hsl(var(--primary) / 0.15)` }}
            >
              <div className="flex items-center gap-4 mb-3">
                {(() => {
                  const IconComponent = tunnelContent[activeCardIndex].icon;
                  return <IconComponent size={30} strokeWidth={1.5} />;
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
        <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full"
            style={{ width: `${zoomProgress * 100}%` }}
          />
        </div>
        
        <div className="flex gap-2">
          {tunnelContent.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === activeCardIndex ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
        
        {zoomProgress < 0.1 && (
          <p className="text-xs text-muted-foreground">Scroll to explore</p>
        )}
      </div>
    </section>
  );
};

export const ZoomTunnelSection = () => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <MobileZoomSection />;
  }
  
  return <DesktopZoomSection />;
};