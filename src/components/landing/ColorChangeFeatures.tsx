import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Calendar, BarChart3, Sparkles, Zap, Star, Rocket, Target, Heart, BookOpen, Trophy, Flame, MousePointer2 } from "lucide-react";
import { Cube3D, Sphere3D, Diamond3D, GlowingParticle } from "./3DObjects";
import readingOwl from "@/assets/reading-owl.png";

const features = [
  {
    id: 1,
    title: "AI Creates Your Perfect Schedule",
    description: "Upload your syllabus and let our AI analyze your subjects, test dates, and learning patterns to build the optimal study plan.",
    icon: Brain,
    bgColor: "from-violet-500 via-indigo-500 to-purple-600",
    cardBg: "from-emerald-400 to-teal-500",
    ui: {
      type: "schedule",
      items: [
        { time: "16:00", subject: "Biology", topic: "Photosynthesis", color: "bg-green-500" },
        { time: "17:00", subject: "Chemistry", topic: "Organic Compounds", color: "bg-purple-500" },
        { time: "18:00", subject: "Physics", topic: "Mechanics", color: "bg-blue-500" },
      ]
    }
  },
  {
    id: 2,
    title: "Adapts When Life Happens",
    description: "Missed a session? Football practice? The AI automatically reschedules your study time to keep you on track without stress.",
    icon: Calendar,
    bgColor: "from-rose-500 via-pink-500 to-fuchsia-500",
    cardBg: "from-pink-400 to-rose-500",
    ui: {
      type: "reschedule",
      original: "16:00 - Physics",
      arrow: true,
      rescheduled: "18:30 - Physics",
      note: "Moved around football practice"
    }
  },
  {
    id: 3,
    title: "Track Your Growth",
    description: "Watch your progress with beautiful analytics. See your streaks, mastery levels, and improvement over time.",
    icon: BarChart3,
    bgColor: "from-emerald-500 via-teal-500 to-cyan-500",
    cardBg: "from-amber-400 to-orange-500",
    ui: {
      type: "stats",
      streak: 12,
      hours: "14.5h",
      improvement: "+23%"
    }
  },
  {
    id: 4,
    title: "AI-Powered Insights",
    description: "Get personalized tips based on your study patterns. Know when you focus best and which topics need more attention.",
    icon: Sparkles,
    bgColor: "from-amber-500 via-orange-500 to-rose-500",
    cardBg: "from-violet-400 to-purple-500",
    ui: {
      type: "insights",
      tips: [
        "You focus best 4-6 PM",
        "Chemistry needs more time",
        "12 day streak! 🔥"
      ]
    }
  },
];

// Animated cursor component for each feature type
const AnimatedCursor = ({ type }: { type: string }) => {
  const cursorPaths = {
    schedule: [
      { x: 120, y: 80, duration: 0.8 },
      { x: 120, y: 120, duration: 0.6 },
      { x: 120, y: 160, duration: 0.6 },
      { x: 120, y: 80, duration: 0.8 },
    ],
    reschedule: [
      { x: 100, y: 60, duration: 0.8 },
      { x: 100, y: 100, duration: 0.6 },
      { x: 100, y: 150, duration: 0.8 },
      { x: 100, y: 60, duration: 0.6 },
    ],
    stats: [
      { x: 50, y: 80, duration: 0.7 },
      { x: 120, y: 80, duration: 0.5 },
      { x: 190, y: 80, duration: 0.5 },
      { x: 50, y: 80, duration: 0.7 },
    ],
    insights: [
      { x: 100, y: 70, duration: 0.8 },
      { x: 100, y: 105, duration: 0.5 },
      { x: 100, y: 140, duration: 0.5 },
      { x: 100, y: 70, duration: 0.8 },
    ],
  };

  const path = cursorPaths[type as keyof typeof cursorPaths] || cursorPaths.schedule;
  const totalDuration = path.reduce((acc, p) => acc + p.duration, 0);

  return (
    <motion.div
      className="absolute pointer-events-none z-50"
      initial={{ x: path[0].x, y: path[0].y, opacity: 0 }}
      animate={{
        x: path.map(p => p.x),
        y: path.map(p => p.y),
        opacity: 1,
      }}
      transition={{
        duration: totalDuration,
        repeat: Infinity,
        ease: "easeInOut",
        times: path.map((_, i) => {
          const elapsed = path.slice(0, i + 1).reduce((acc, p) => acc + p.duration, 0);
          return elapsed / totalDuration;
        }),
      }}
    >
      <MousePointer2 className="w-5 h-5 text-white drop-shadow-lg" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
      {/* Click ripple effect */}
      <motion.div
        className="absolute -top-1 -left-1 w-8 h-8 rounded-full border-2 border-white/60"
        animate={{
          scale: [0.5, 1.5, 0.5],
          opacity: [0.8, 0, 0.8],
        }}
        transition={{
          duration: totalDuration / 2,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
    </motion.div>
  );
};

// Floating 3D icons per feature
const floatingIconsPerFeature = [
  [Brain, Star, Rocket, BookOpen],
  [Calendar, Zap, Heart, Target],
  [BarChart3, Trophy, Flame, Star],
  [Sparkles, Brain, Rocket, Heart],
];

const FeatureCard = ({ feature }: { feature: typeof features[0] }) => {
  const { ui } = feature;

  if (ui.type === "schedule") {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 space-y-2 relative overflow-hidden">
        <AnimatedCursor type="schedule" />
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-white text-sm font-bold">V</span>
          </div>
          <span className="text-white font-semibold">Vistara</span>
        </div>
        {ui.items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-white/90"
          >
            <div className={`w-2 h-8 rounded-full ${item.color}`} />
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">{item.subject}</p>
              <p className="text-xs text-gray-500">{item.topic}</p>
            </div>
            <span className="text-xs text-gray-400">{item.time}</span>
          </motion.div>
        ))}
      </div>
    );
  }

  if (ui.type === "reschedule") {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 relative overflow-hidden">
        <AnimatedCursor type="reschedule" />
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-white text-sm font-bold">V</span>
          </div>
          <span className="text-white font-semibold">Vistara</span>
        </div>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-red-500/20 border border-red-400/30">
            <p className="text-white/70 text-sm line-through">{ui.original}</p>
            <p className="text-red-300 text-xs">Conflict with event</p>
          </div>
          <div className="flex justify-center">
            <motion.div 
              animate={{ y: [0, 5, 0] }} 
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Zap className="w-6 h-6 text-yellow-400" />
            </motion.div>
          </div>
          <div className="p-3 rounded-lg bg-green-500/20 border border-green-400/30">
            <p className="text-white font-medium text-sm">{ui.rescheduled}</p>
            <p className="text-green-300 text-xs">{ui.note}</p>
          </div>
        </div>
      </div>
    );
  }

  if (ui.type === "stats") {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 relative overflow-hidden">
        <AnimatedCursor type="stats" />
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-white text-sm font-bold">V</span>
          </div>
          <span className="text-white font-semibold">Your Progress</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <motion.div 
            className="p-3 rounded-lg bg-white/90 text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-2xl font-bold text-orange-500">{ui.streak}</p>
            <p className="text-xs text-gray-500">Day Streak</p>
          </motion.div>
          <motion.div 
            className="p-3 rounded-lg bg-white/90 text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-2xl font-bold text-teal-500">{ui.hours}</p>
            <p className="text-xs text-gray-500">This Week</p>
          </motion.div>
          <motion.div 
            className="p-3 rounded-lg bg-white/90 text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-2xl font-bold text-green-500">{ui.improvement}</p>
            <p className="text-xs text-gray-500">Growth</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (ui.type === "insights") {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 relative overflow-hidden">
        <AnimatedCursor type="insights" />
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold">AI Insights</span>
        </div>
        <div className="space-y-2">
          {ui.tips.map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="p-3 rounded-lg bg-white/90 flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <p className="text-sm text-gray-700">{tip}</p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export const ColorChangeFeatures = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const hasExited = useRef(false);
  const lastScrollTime = useRef(0);
  const touchStartY = useRef(0);

  const lockScroll = useCallback(() => {
    if (isLocked || hasExited.current) return;
    document.body.style.overflow = 'hidden';
    setIsLocked(true);
  }, [isLocked]);

  const unlockScroll = useCallback((direction: 'up' | 'down') => {
    document.body.style.overflow = '';
    setIsLocked(false);
    hasExited.current = true;
    
    // Smooth scroll to exit the section
    window.scrollBy({ 
      top: direction === 'down' ? 200 : -200, 
      behavior: 'smooth' 
    });
    
    // Cooldown before re-locking
    setTimeout(() => {
      hasExited.current = false;
    }, 1000);
  }, []);

  // Handle wheel events
  const handleWheel = useCallback((e: WheelEvent) => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const sectionInView = rect.top <= window.innerHeight * 0.3 && rect.bottom >= window.innerHeight * 0.7;

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
    
    // Increased debounce - requires more scrolling per step
    const now = Date.now();
    if (now - lastScrollTime.current < 1200) return;
    lastScrollTime.current = now;

    if (e.deltaY > 0) {
      // Scrolling down
      if (activeIndex < features.length - 1) {
        setActiveIndex(prev => prev + 1);
      } else {
        unlockScroll('down');
      }
    } else {
      // Scrolling up
      if (activeIndex > 0) {
        setActiveIndex(prev => prev - 1);
      } else {
        unlockScroll('up');
      }
    }
  }, [isLocked, activeIndex, lockScroll, unlockScroll]);

  // Touch handling
  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const sectionInView = rect.top <= window.innerHeight * 0.3 && rect.bottom >= window.innerHeight * 0.7;

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
    
    const now = Date.now();
    if (now - lastScrollTime.current < 400) return;
    lastScrollTime.current = now;

    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(deltaY) < 30) return;

    if (deltaY > 0) {
      if (activeIndex < features.length - 1) {
        setActiveIndex(prev => prev + 1);
      } else {
        unlockScroll('down');
      }
    } else {
      if (activeIndex > 0) {
        setActiveIndex(prev => prev - 1);
      } else {
        unlockScroll('up');
      }
    }
  }, [isLocked, activeIndex, lockScroll, unlockScroll]);

  // Add event listeners
  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleWheel, handleTouchStart, handleTouchEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const currentFeature = features[activeIndex];
  const Icon = currentFeature.icon;
  const currentFloatingIcons = floatingIconsPerFeature[activeIndex];

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Animated Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          className={`absolute inset-0 bg-gradient-to-br ${currentFeature.bgColor}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      </AnimatePresence>

      {/* Floating 3D Icons */}
      <AnimatePresence mode="wait">
        {currentFloatingIcons.map((FloatingIcon, index) => {
          const positions = [
            { x: 8, y: 15 },
            { x: 92, y: 20 },
            { x: 5, y: 75 },
            { x: 90, y: 80 },
          ];
          const pos = positions[index];
          
          return (
            <motion.div
              key={`${activeIndex}-${index}`}
              className="absolute pointer-events-none z-10"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              initial={{ opacity: 0, scale: 0, rotate: -45 }}
              animate={{ 
                opacity: 0.6, 
                scale: 1, 
                rotate: 0,
                y: [0, -15, 0],
              }}
              exit={{ opacity: 0, scale: 0, rotate: 45 }}
              transition={{ 
                duration: 0.5,
                y: { duration: 3 + index * 0.5, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <motion.div
                animate={{ rotateY: 360, rotateX: [0, 15, 0, -15, 0] }}
                transition={{ 
                  rotateY: { duration: 6 + index, repeat: Infinity, ease: "linear" },
                  rotateX: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <FloatingIcon 
                  size={32 + index * 4} 
                  className="text-white/50"
                  style={{ filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.4))' }}
                />
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Glowing orbs background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10 blur-3xl"
            style={{
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              left: `${10 + (i * 15) % 80}%`,
              top: `${20 + (i * 20) % 60}%`,
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${activeIndex}`}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
              className="text-white"
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">Feature {activeIndex + 1}/{features.length}</span>
              </motion.div>
              
              <motion.h2
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {currentFeature.title}
              </motion.h2>
              
              <motion.p
                className="text-lg md:text-xl text-white/80 max-w-lg"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {currentFeature.description}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          {/* UI Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`card-${activeIndex}`}
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -50 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
              className="flex justify-center lg:justify-end"
            >
              <div 
                className={`w-full max-w-sm p-1 rounded-2xl bg-gradient-to-br ${currentFeature.cardBg} shadow-2xl`}
                style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' }}
              >
                <div className="p-4">
                  <FeatureCard feature={currentFeature} />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Reading Owl Mascot */}
      <motion.img
        src={readingOwl}
        alt="Reading owl mascot"
        className="absolute top-16 right-4 md:right-8 lg:right-12 w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-contain drop-shadow-xl z-30"
        initial={{ opacity: 0, y: -30, rotate: 10 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      />

      {/* Progress Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20">
        <div className="flex gap-3">
          {features.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setActiveIndex(index)}
              className="w-3 h-3 rounded-full transition-colors"
              animate={{
                backgroundColor: index === activeIndex 
                  ? 'rgba(255,255,255,1)' 
                  : 'rgba(255,255,255,0.3)',
                scale: index === activeIndex ? 1.3 : 1,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
        
        {isLocked && (
          <motion.p
            className="text-sm text-white/60 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ↕
            </motion.span>
            Scroll to explore features
          </motion.p>
        )}
      </div>
    </section>
  );
};

export default ColorChangeFeatures;