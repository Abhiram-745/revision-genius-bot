import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, Target, Lightbulb, BarChart3, Zap,
  Trophy, GraduationCap, BookOpen, type LucideIcon
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  mobilePosition: string;
  color: string;
  size: number;
  mobileSize: number;
  animation: { rotateY?: number; y?: number[]; rotateZ?: number[]; scale?: number[]; rotate?: number[] };
}

const edgeIcons: EdgeIcon[] = [
  { Icon: BookOpen, position: "left-[8%] top-[15%]", mobilePosition: "left-[5%] top-[10%]", color: "text-blue-500", size: 44, mobileSize: 28, animation: { rotateY: 360 } },
  { Icon: Trophy, position: "right-[8%] top-[18%]", mobilePosition: "right-[5%] top-[12%]", color: "text-yellow-500", size: 40, mobileSize: 26, animation: { y: [-8, 8, -8] } },
  { Icon: GraduationCap, position: "left-[5%] top-[50%] -translate-y-1/2", mobilePosition: "left-[3%] top-[45%]", color: "text-purple-500", size: 38, mobileSize: 24, animation: { rotateZ: [-5, 5, -5] } },
  { Icon: Target, position: "right-[6%] top-[55%]", mobilePosition: "right-[3%] top-[50%]", color: "text-red-500", size: 42, mobileSize: 26, animation: { scale: [1, 1.1, 1] } },
  { Icon: Brain, position: "left-[10%] bottom-[18%]", mobilePosition: "left-[5%] bottom-[15%]", color: "text-pink-500", size: 40, mobileSize: 24, animation: { rotateY: 360 } },
  { Icon: Lightbulb, position: "right-[12%] bottom-[22%]", mobilePosition: "right-[5%] bottom-[18%]", color: "text-orange-500", size: 36, mobileSize: 22, animation: { rotate: [-10, 10, -10] } },
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

// Desktop version with full 3D tunnel effect
const DesktopZoomSection = () => {
  const [zoomProgress, setZoomProgress] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const hasExited = useRef(false);

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

    const sensitivity = 0.0003;
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

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const frameCount = 4;

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-background"
      style={{ perspective: '1200px' }}
    >
      {/* 3D Grid Tunnel - Top Grid (Ceiling) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => {
          const yPosition = 5 + i * 4.5;
          const progress = i / 9;
          const perspectiveScale = 0.3 + progress * 0.7;
          const lineOpacity = Math.max(0, (0.4 - zoomProgress * 0.5) * (0.4 + progress * 0.6));
          
          return (
            <div
              key={`top-grid-${i}`}
              className="absolute left-1/2 -translate-x-1/2 h-[1px] will-change-transform"
              style={{
                top: `${yPosition}%`,
                width: `${20 + progress * 80}%`,
                background: `linear-gradient(90deg, 
                  transparent 0%,
                  hsl(var(--primary) / ${lineOpacity}) 15%,
                  hsl(var(--primary) / ${lineOpacity * 1.2}) 50%,
                  hsl(var(--primary) / ${lineOpacity}) 85%,
                  transparent 100%
                )`,
                transform: `scaleX(${perspectiveScale + zoomProgress * 0.3})`,
                transition: 'transform 0.3s ease-out',
              }}
            />
          );
        })}
        
        {/* Bottom Grid (Floor) */}
        {Array.from({ length: 10 }).map((_, i) => {
          const yPosition = 54.5 + i * 4.5;
          const progress = i / 9;
          const perspectiveScale = 0.3 + (1 - progress) * 0.7;
          const lineOpacity = Math.max(0, (0.4 - zoomProgress * 0.5) * (0.4 + (1 - progress) * 0.6));
          
          return (
            <div
              key={`bottom-grid-${i}`}
              className="absolute left-1/2 -translate-x-1/2 h-[1px] will-change-transform"
              style={{
                top: `${yPosition}%`,
                width: `${20 + (1 - progress) * 80}%`,
                background: `linear-gradient(90deg, 
                  transparent 0%,
                  hsl(var(--primary) / ${lineOpacity}) 15%,
                  hsl(var(--primary) / ${lineOpacity * 1.2}) 50%,
                  hsl(var(--primary) / ${lineOpacity}) 85%,
                  transparent 100%
                )`,
                transform: `scaleX(${perspectiveScale + zoomProgress * 0.3})`,
                transition: 'transform 0.3s ease-out',
              }}
            />
          );
        })}
      </div>

      {/* Center Rectangular Frames */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspectiveOrigin: '50% 50%' }}
      >
        <div 
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {Array.from({ length: frameCount }).map((_, i) => {
            const baseZ = -500 + i * 150;
            const zoomOffset = zoomProgress * 1000;
            const currentZ = baseZ + zoomOffset;
            const scale = Math.max(0.1, 1 + currentZ / 400);
            const opacity = currentZ > 200 ? 0 : currentZ < -500 ? 0 : 0.5 - Math.abs(currentZ) / 800;
            const baseSize = 15 + i * 10;
            
            return (
              <div
                key={`frame-${i}`}
                className="absolute border rounded-sm will-change-transform"
                style={{
                  width: `${baseSize}%`,
                  height: `${baseSize * 0.55}%`,
                  transform: `translate3d(0, 0, ${currentZ}px) scale(${scale})`,
                  borderColor: `hsl(var(--primary) / ${Math.max(0, opacity)})`,
                  boxShadow: opacity > 0.1 ? `0 0 15px hsl(var(--primary) / ${opacity * 0.15})` : 'none',
                  transition: 'transform 0.3s ease-out',
                  transformStyle: 'preserve-3d',
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
              style={{ opacity, transform: `scale(${scale})` }}
              animate={iconData.animation}
              transition={{ duration: 5 + index, repeat: Infinity, ease: "easeInOut" }}
            >
              <div 
                className="p-3 md:p-4 rounded-xl bg-background/30 backdrop-blur-sm border border-current/30"
                style={{ boxShadow: '0 0 25px currentColor' }}
              >
                <IconComponent size={iconData.size} strokeWidth={1.5} />
              </div>
            </motion.div>
          );
        })}
      </div>

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

      {/* Content Cards */}
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
              className="p-6 md:p-8 rounded-2xl bg-background/95 backdrop-blur-lg border border-primary/30 text-foreground shadow-2xl"
              style={{ boxShadow: `0 0 40px hsl(var(--primary) / 0.3)` }}
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
        <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary rounded-full"
            style={{ width: `${zoomProgress * 100}%` }}
          />
        </div>
        
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

export const ZoomTunnelSection = () => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <MobileZoomSection />;
  }
  
  return <DesktopZoomSection />;
};