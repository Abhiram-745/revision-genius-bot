import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, Target, Lightbulb, Clock, BarChart3, Sparkles, Zap, Star,
  Trophy, GraduationCap, BookOpen, Pencil, Award, Calendar, CheckCircle,
  Calculator, Notebook, Medal, Ruler, FileText, type LucideIcon
} from "lucide-react";
import { GlowingParticle } from "./3DObjects";

const tunnelContent = [
  { title: "AI-Powered Schedules", subtitle: "Let AI plan your perfect study sessions", icon: Brain, color: "from-pink-500 to-rose-400" },
  { title: "Adapt to Your Life", subtitle: "Around football, family & fun", icon: Zap, color: "from-yellow-500 to-orange-400" },
  { title: "Track Your Progress", subtitle: "Watch your confidence grow daily", icon: BarChart3, color: "from-green-500 to-emerald-400" },
  { title: "Achieve Your Goals", subtitle: "Ace your exams with confidence", icon: Target, color: "from-blue-500 to-cyan-400" },
];

// Study-themed floating icons with 3D effects
const floatingStudyIcons: { Icon: LucideIcon; x: number; y: number; size: number; orbitRadius: number; orbitSpeed: number; delay: number; color: string }[] = [
  { Icon: BookOpen, x: 15, y: 20, size: 40, orbitRadius: 200, orbitSpeed: 0.5, delay: 0, color: "text-blue-500" },
  { Icon: Trophy, x: 85, y: 25, size: 36, orbitRadius: 180, orbitSpeed: 0.7, delay: 0.2, color: "text-yellow-500" },
  { Icon: GraduationCap, x: 10, y: 75, size: 38, orbitRadius: 220, orbitSpeed: 0.4, delay: 0.4, color: "text-purple-500" },
  { Icon: Star, x: 88, y: 70, size: 32, orbitRadius: 190, orbitSpeed: 0.6, delay: 0.6, color: "text-amber-500" },
  { Icon: Pencil, x: 25, y: 45, size: 44, orbitRadius: 240, orbitSpeed: 0.3, delay: 0.3, color: "text-green-500" },
  { Icon: Target, x: 78, y: 50, size: 36, orbitRadius: 210, orbitSpeed: 0.55, delay: 0.5, color: "text-red-500" },
  { Icon: Award, x: 50, y: 15, size: 34, orbitRadius: 260, orbitSpeed: 0.45, delay: 0.15, color: "text-pink-500" },
  { Icon: Clock, x: 50, y: 85, size: 38, orbitRadius: 230, orbitSpeed: 0.65, delay: 0.35, color: "text-cyan-500" },
  { Icon: Brain, x: 35, y: 65, size: 42, orbitRadius: 250, orbitSpeed: 0.35, delay: 0.45, color: "text-violet-500" },
  { Icon: Lightbulb, x: 65, y: 35, size: 30, orbitRadius: 170, orbitSpeed: 0.75, delay: 0.55, color: "text-orange-500" },
];

// More floating study icons with 3D rotation
const floatingIcons: { Icon: LucideIcon; x: number; y: number; delay: number; size: number; rotateSpeed: number; color: string }[] = [
  { Icon: Notebook, x: 12, y: 18, delay: 0, size: 32, rotateSpeed: 3, color: "text-blue-400" },
  { Icon: Lightbulb, x: 88, y: 22, delay: 0.2, size: 28, rotateSpeed: 4, color: "text-yellow-400" },
  { Icon: Clock, x: 8, y: 78, delay: 0.4, size: 24, rotateSpeed: 5, color: "text-cyan-400" },
  { Icon: Sparkles, x: 92, y: 72, delay: 0.6, size: 30, rotateSpeed: 3.5, color: "text-purple-400" },
  { Icon: Star, x: 20, y: 40, delay: 0.3, size: 26, rotateSpeed: 4.5, color: "text-amber-400" },
  { Icon: Medal, x: 80, y: 55, delay: 0.5, size: 28, rotateSpeed: 3.2, color: "text-orange-400" },
  { Icon: Trophy, x: 15, y: 60, delay: 0.1, size: 30, rotateSpeed: 4.2, color: "text-yellow-500" },
  { Icon: GraduationCap, x: 85, y: 40, delay: 0.25, size: 32, rotateSpeed: 3.8, color: "text-indigo-400" },
  { Icon: BookOpen, x: 30, y: 25, delay: 0.35, size: 26, rotateSpeed: 5.2, color: "text-emerald-400" },
  { Icon: Pencil, x: 70, y: 75, delay: 0.45, size: 24, rotateSpeed: 4.8, color: "text-green-400" },
  { Icon: Calculator, x: 45, y: 12, delay: 0.15, size: 28, rotateSpeed: 3.6, color: "text-slate-400" },
  { Icon: Calendar, x: 55, y: 88, delay: 0.55, size: 30, rotateSpeed: 4.4, color: "text-rose-400" },
  { Icon: Ruler, x: 25, y: 85, delay: 0.65, size: 26, rotateSpeed: 5.5, color: "text-teal-400" },
  { Icon: FileText, x: 75, y: 15, delay: 0.75, size: 32, rotateSpeed: 3.4, color: "text-blue-300" },
];

// Study-themed orbiting icon rings
const orbitingRings: { radius: number; icons: LucideIcon[]; speed: number; reverse: boolean }[] = [
  { radius: 150, icons: [BookOpen, Trophy, Target], speed: 0.3, reverse: false },
  { radius: 220, icons: [GraduationCap, Star, Award, Medal], speed: 0.2, reverse: true },
  { radius: 300, icons: [Brain, Lightbulb, Clock, Calendar, Pencil], speed: 0.15, reverse: false },
];

export const ZoomTunnelSection = () => {
  const [zoomProgress, setZoomProgress] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const hasExited = useRef(false);
  const lastScrollTime = useRef(0);
  const accumulatedDelta = useRef(0);

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
    
    // Smooth scroll to exit the section
    window.scrollBy({ 
      top: direction === 'down' ? 400 : -400, 
      behavior: 'smooth' 
    });
    
    // Cooldown before re-locking
    setTimeout(() => {
      hasExited.current = false;
    }, 800);
  }, []);

  // Handle wheel events for smooth continuous zoom
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

    // Lock when section is in view
    if (!isLocked && !hasExited.current) {
      lockScroll();
    }

    e.preventDefault();

    // Slower sensitivity - takes more time to complete the journey
    const sensitivity = 0.0008;
    const delta = e.deltaY * sensitivity;
    
    setZoomProgress((prev) => {
      const next = Math.max(0, Math.min(1, prev + delta));
      
      // Unlock at boundaries
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

          {/* 3D Floating Study Icons */}
          {floatingStudyIcons.map((iconData, index) => {
            const orbitAngle = (zoomProgress * 360 * iconData.orbitSpeed) + (index * 60);
            const radians = (orbitAngle * Math.PI) / 180;
            const x = Math.cos(radians) * iconData.orbitRadius * (1 - zoomProgress * 0.5);
            const y = Math.sin(radians) * iconData.orbitRadius * (1 - zoomProgress * 0.5);
            const z = Math.sin(radians * 2) * 100;
            const opacity = Math.max(0, 0.7 - zoomProgress * 0.9);
            const selfRotation = zoomProgress * 360 * (index % 2 === 0 ? 1 : -1);
            const IconComponent = iconData.Icon;
            
            return (
              <motion.div
                key={`study-icon-${index}`}
                className="absolute left-1/2 top-1/2 pointer-events-none"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `
                    translate(-50%, -50%)
                    translate3d(${x}px, ${y}px, ${z}px)
                    rotateX(${selfRotation * 0.3}deg)
                    rotateY(${selfRotation * 0.5}deg)
                  `,
                  opacity,
                }}
              >
                <div 
                  className={`${iconData.color} p-3 rounded-xl bg-background/20 backdrop-blur-sm border border-current/20`}
                  style={{
                    boxShadow: '0 0 30px currentColor',
                  }}
                >
                  <IconComponent size={iconData.size} strokeWidth={1.5} />
                </div>
              </motion.div>
            );
          })}

          {/* Orbiting Icon Rings */}
          {orbitingRings.map((ring, ringIndex) => {
            const ringRotation = zoomProgress * 360 * ring.speed * (ring.reverse ? -1 : 1);
            const ringOpacity = Math.max(0, 0.8 - zoomProgress * 0.9);
            
            return (
              <div
                key={`orbit-ring-${ringIndex}`}
                className="absolute left-1/2 top-1/2 pointer-events-none"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `
                    translate(-50%, -50%)
                    rotateX(${60 + ringIndex * 15}deg)
                    rotateZ(${ringRotation}deg)
                  `,
                  opacity: ringOpacity,
                }}
              >
                {ring.icons.map((Icon, iconIndex) => {
                  const angle = (iconIndex / ring.icons.length) * 360;
                  const rad = (angle * Math.PI) / 180;
                  const iconX = Math.cos(rad) * ring.radius;
                  const iconY = Math.sin(rad) * ring.radius;
                  const iconSelfRotate = zoomProgress * 720 * (iconIndex % 2 === 0 ? 1 : -1);
                  
                  return (
                    <motion.div
                      key={`orbit-icon-${ringIndex}-${iconIndex}`}
                      className="absolute"
                      style={{
                        transform: `
                          translate(${iconX}px, ${iconY}px)
                          rotateX(-${60 + ringIndex * 15}deg)
                          rotateZ(${iconSelfRotate}deg)
                        `,
                      }}
                    >
                      <Icon 
                        className="text-primary/60" 
                        size={20 + ringIndex * 4} 
                        style={{
                          filter: `drop-shadow(0 0 10px hsl(var(--primary) / 0.5))`,
                        }}
                      />
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Icons that zoom past - Enhanced with 3D rotation */}
      {floatingIcons.map(({ Icon, x, y, delay, size, rotateSpeed }, index) => {
        const iconScale = 1 + zoomProgress * 5;
        const iconOpacity = Math.max(0, 0.6 - zoomProgress);
        const iconBlur = zoomProgress * 4;
        const iconRotate = zoomProgress * 360 * rotateSpeed;
        
        return (
          <motion.div
            key={index}
            className="absolute pointer-events-none"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: `translate(-50%, -50%) scale(${iconScale}) rotateY(${iconRotate}deg) rotateX(${iconRotate * 0.3}deg)`,
              opacity: iconOpacity,
              filter: `blur(${iconBlur}px)`,
              transformStyle: 'preserve-3d',
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: iconOpacity,
              scale: iconScale,
            }}
            transition={{ duration: 0.1 }}
          >
            <Icon 
              size={size} 
              className="text-primary/50" 
              style={{
                filter: `drop-shadow(0 0 ${8 + size/4}px hsl(var(--primary) / 0.4))`,
              }}
            />
          </motion.div>
        );
      })}

      {/* Glowing particles */}
      {Array.from({ length: 20 }).map((_, i) => {
        const particleProgress = (zoomProgress + i * 0.05) % 1;
        const particleOpacity = Math.max(0, 0.5 - zoomProgress * 0.6);
        const particleX = 20 + (i * 3) % 60;
        const particleY = 15 + (i * 7) % 70;
        const particleScale = 0.5 + particleProgress * 2;
        
        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-2 h-2 rounded-full bg-primary/60 pointer-events-none"
            style={{
              left: `${particleX}%`,
              top: `${particleY}%`,
              transform: `scale(${particleScale})`,
              opacity: particleOpacity,
              boxShadow: '0 0 10px hsl(var(--primary) / 0.8)',
            }}
          />
        );
      })}

      {/* Study-themed 3D Icons around the edges */}
      <div className="absolute inset-0 pointer-events-none" style={{ perspective: '1000px' }}>
        {/* Top left - BookOpen */}
        <motion.div 
          className="absolute text-blue-500"
          style={{ 
            left: '10%', 
            top: '15%',
            opacity: Math.max(0, 0.8 - zoomProgress * 0.9),
            transform: `scale(${1 - zoomProgress * 0.5})`
          }}
          animate={{ rotateY: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          <div className="p-4 rounded-xl bg-background/20 backdrop-blur-sm border border-blue-500/30" style={{ boxShadow: '0 0 30px hsl(217 91% 60% / 0.4)' }}>
            <BookOpen size={50} strokeWidth={1.5} />
          </div>
        </motion.div>
        
        {/* Top right - Trophy */}
        <motion.div 
          className="absolute text-yellow-500"
          style={{ 
            right: '12%', 
            top: '20%',
            opacity: Math.max(0, 0.8 - zoomProgress * 0.9),
            transform: `scale(${1 - zoomProgress * 0.5})`
          }}
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="p-4 rounded-xl bg-background/20 backdrop-blur-sm border border-yellow-500/30" style={{ boxShadow: '0 0 30px hsl(48 96% 53% / 0.4)' }}>
            <Trophy size={45} strokeWidth={1.5} />
          </div>
        </motion.div>
        
        {/* Left - GraduationCap */}
        <motion.div 
          className="absolute text-purple-500"
          style={{ 
            left: '8%', 
            top: '50%',
            opacity: Math.max(0, 0.8 - zoomProgress * 0.9),
            transform: `translateY(-50%) scale(${1 - zoomProgress * 0.5})`
          }}
          animate={{ rotateZ: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="p-4 rounded-xl bg-background/20 backdrop-blur-sm border border-purple-500/30" style={{ boxShadow: '0 0 30px hsl(271 91% 65% / 0.4)' }}>
            <GraduationCap size={40} strokeWidth={1.5} />
          </div>
        </motion.div>
        
        {/* Right - Target */}
        <motion.div 
          className="absolute text-red-500"
          style={{ 
            right: '10%', 
            top: '55%',
            opacity: Math.max(0, 0.8 - zoomProgress * 0.9),
            transform: `scale(${1 - zoomProgress * 0.5})`
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="p-4 rounded-xl bg-background/20 backdrop-blur-sm border border-red-500/30" style={{ boxShadow: '0 0 30px hsl(0 84% 60% / 0.4)' }}>
            <Target size={48} strokeWidth={1.5} />
          </div>
        </motion.div>
        
        {/* Bottom left - Brain */}
        <motion.div 
          className="absolute text-pink-500"
          style={{ 
            left: '15%', 
            bottom: '20%',
            opacity: Math.max(0, 0.8 - zoomProgress * 0.9),
            transform: `scale(${1 - zoomProgress * 0.5})`
          }}
          animate={{ rotateY: 360 }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        >
          <div className="p-4 rounded-xl bg-background/20 backdrop-blur-sm border border-pink-500/30" style={{ boxShadow: '0 0 30px hsl(330 81% 60% / 0.4)' }}>
            <Brain size={55} strokeWidth={1.5} />
          </div>
        </motion.div>
        
        {/* Bottom right - Star */}
        <motion.div 
          className="absolute text-amber-500"
          style={{ 
            right: '15%', 
            bottom: '18%',
            opacity: Math.max(0, 0.8 - zoomProgress * 0.9),
            transform: `scale(${1 - zoomProgress * 0.5})`
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
        >
          <div className="p-4 rounded-xl bg-background/20 backdrop-blur-sm border border-amber-500/30" style={{ boxShadow: '0 0 30px hsl(38 92% 50% / 0.4)' }}>
            <Star size={45} strokeWidth={1.5} />
          </div>
        </motion.div>
        
        {/* Additional floating study icons */}
        <motion.div 
          className="absolute text-emerald-500"
          style={{ 
            left: '30%', 
            top: '25%',
            opacity: Math.max(0, 0.6 - zoomProgress * 0.7),
            transform: `scale(${1 - zoomProgress * 0.5})`
          }}
          animate={{ y: [-15, 15, -15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="p-3 rounded-xl bg-background/20 backdrop-blur-sm border border-emerald-500/30" style={{ boxShadow: '0 0 25px hsl(160 84% 39% / 0.4)' }}>
            <Pencil size={35} strokeWidth={1.5} />
          </div>
        </motion.div>
        
        <motion.div 
          className="absolute text-cyan-500"
          style={{ 
            right: '28%', 
            bottom: '30%',
            opacity: Math.max(0, 0.6 - zoomProgress * 0.7),
            transform: `scale(${1 - zoomProgress * 0.5})`
          }}
          animate={{ rotateZ: [-8, 8, -8] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="p-3 rounded-xl bg-background/20 backdrop-blur-sm border border-cyan-500/30" style={{ boxShadow: '0 0 25px hsl(188 94% 43% / 0.4)' }}>
            <Clock size={38} strokeWidth={1.5} />
          </div>
        </motion.div>
      </div>

      {/* Glowing Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <GlowingParticle
            key={`glow-${i}`}
            size={4 + Math.random() * 6}
            x={5 + (i * 8) % 90}
            y={10 + (i * 12) % 80}
            color={i % 3 === 0 ? "hsl(var(--primary))" : i % 3 === 1 ? "hsl(var(--secondary))" : "hsl(var(--accent))"}
            delay={i * 0.3}
          />
        ))}
      </div>

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

      {/* Content Cards - TRUE ZOOM IN effect: starts small, grows as you scroll */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          {tunnelContent.map((content, index) => {
            const isActive = index === activeCardIndex;
            if (!isActive) return null;

            const Icon = content.icon;
            
            // Calculate zoom-in scale based on progress within this card's segment
            const cardProgress = (zoomProgress * tunnelContent.length) - index;
            const clampedProgress = Math.max(0, Math.min(1, cardProgress));
            
            // Start very small (0.2) and grow to full size (1.2) as you scroll
            const contentScale = 0.2 + clampedProgress * 1.0;
            // Fade in quickly, stay visible
            const contentOpacity = Math.min(1, clampedProgress * 3);

            return (
              <motion.div
                key={content.title}
                className="absolute flex flex-col items-center text-center px-6"
                initial={{ scale: 0.1, opacity: 0 }}
                animate={{ 
                  scale: contentScale, 
                  opacity: contentOpacity 
                }}
                exit={{ scale: 2.5, opacity: 0, filter: 'blur(10px)' }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <motion.div
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br ${content.color} flex items-center justify-center mb-6 shadow-lg`}
                  animate={{ 
                    rotate: [0, 3, -3, 0],
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatDelay: 0.5 
                  }}
                  style={{
                    boxShadow: `0 0 ${40 + clampedProgress * 30}px hsl(var(--primary) / ${0.3 + clampedProgress * 0.3})`,
                  }}
                >
                  <Icon className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </motion.div>
                <h3 
                  className={`text-3xl md:text-5xl font-bold bg-gradient-to-r ${content.color} bg-clip-text text-transparent mb-4`}
                  style={{
                    textShadow: `0 0 ${20 + clampedProgress * 20}px hsl(var(--primary) / 0.2)`,
                  }}
                >
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