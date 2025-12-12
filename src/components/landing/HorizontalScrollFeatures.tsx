import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  BarChart3, 
  Brain, 
  Target,
  Sparkles
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Timetables",
    description: "Smart scheduling that adapts to your learning style and commitments",
    gradient: "from-primary to-secondary",
  },
  {
    icon: Clock,
    title: "Session Timer",
    description: "Focus mode with built-in breaks and productivity tracking",
    gradient: "from-secondary to-accent",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description: "Visualize your study patterns and identify areas for improvement",
    gradient: "from-accent to-primary",
  },
  {
    icon: Target,
    title: "Goal Setting",
    description: "Set weekly targets and celebrate when you crush them",
    gradient: "from-secondary to-primary",
  },
  {
    icon: Brain,
    title: "Topic Mastery",
    description: "Track your understanding of each topic with smart reflections",
    gradient: "from-primary via-secondary to-accent",
  },
  {
    icon: Sparkles,
    title: "AI Insights",
    description: "Personalized recommendations to optimize your study sessions",
    gradient: "from-accent via-primary to-secondary",
  },
];

// Card positions in the tunnel (percentages from center)
const cardPositions = [
  { x: 0, y: 0 },        // Center
  { x: -22, y: -18 },    // Top-left
  { x: 22, y: -18 },     // Top-right
  { x: -28, y: 22 },     // Bottom-left
  { x: 28, y: 22 },      // Bottom-right
  { x: 0, y: 32 },       // Bottom-center
];

// Each card scales at different rates (further = faster zoom)
const scaleConfigs = [
  { start: 0.5, end: 4 },    // Center - zooms moderately
  { start: 0.35, end: 5 },   // Top-left - zooms faster
  { start: 0.35, end: 5 },   // Top-right - zooms faster
  { start: 0.25, end: 6 },   // Bottom-left - zooms even faster
  { start: 0.25, end: 6 },   // Bottom-right - zooms even faster
  { start: 0.2, end: 7 },    // Bottom-center - zooms fastest
];

interface ZoomCardProps {
  feature: typeof features[0];
  index: number;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
}

const ZoomCard = ({ feature, index, scrollYProgress }: ZoomCardProps) => {
  const position = cardPositions[index];
  const scaleConfig = scaleConfigs[index];
  
  // Scale transform based on scroll
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    [scaleConfig.start, scaleConfig.end]
  );
  
  // Opacity - fade in at start, fade out as it zooms past
  const fadeOutPoint = 0.5 - index * 0.06;
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.08, fadeOutPoint, fadeOutPoint + 0.15],
    [0, 1, 1, 0]
  );
  
  const Icon = feature.icon;
  
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 w-64 sm:w-72 md:w-80"
      style={{
        x: `calc(-50% + ${position.x}vw)`,
        y: `calc(-50% + ${position.y}vh)`,
        scale,
        opacity,
      }}
    >
      <div className="relative group">
        {/* Glow effect */}
        <div className={`absolute -inset-1 bg-gradient-to-r ${feature.gradient} rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity`} />
        
        {/* Card */}
        <div className="relative bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-5 md:p-6 shadow-2xl">
          {/* Icon */}
          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 md:mb-4 shadow-lg`}>
            <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          
          {/* Content */}
          <h3 className="text-lg md:text-xl font-bold text-foreground mb-1.5 md:mb-2">
            {feature.title}
          </h3>
          <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
            {feature.description}
          </p>
          
          {/* Decorative elements */}
          <div className="absolute top-3 right-3 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />
        </div>
      </div>
    </motion.div>
  );
};

const HorizontalScrollFeatures = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  
  // Header opacity - visible at start, fades as you scroll
  const headerOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const headerScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);
  const headerY = useTransform(scrollYProgress, [0, 0.15], [0, -30]);
  
  // Final CTA - fades in at end
  const ctaOpacity = useTransform(scrollYProgress, [0.75, 0.9], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.75, 0.9], [40, 0]);

  return (
    <div 
      ref={containerRef}
      className="relative"
      style={{ height: "300vh" }}
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-gradient-to-b from-background via-background to-muted/20">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Radial gradient center - creates depth illusion */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-[radial-gradient(circle,hsl(var(--primary)/0.15)_0%,transparent_70%)] rounded-full" />
          
          {/* Secondary glow */}
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-[radial-gradient(circle,hsl(var(--secondary)/0.1)_0%,transparent_60%)] rounded-full" />
          
          {/* Grid pattern for depth */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(hsl(var(--primary)/0.5) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--primary)/0.5) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
            }}
          />
          
          {/* Vignette effect */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background))_80%)]" />
        </div>
        
        {/* Header - fades out as you scroll */}
        <motion.div 
          className="absolute top-16 md:top-20 left-0 right-0 text-center z-20 px-4"
          style={{ opacity: headerOpacity, scale: headerScale, y: headerY }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-3 md:mb-4">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            Scroll to explore our features
          </p>
        </motion.div>
        
        {/* Zoom tunnel cards */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '1000px' }}>
          {features.map((feature, index) => (
            <ZoomCard
              key={index}
              feature={feature}
              index={index}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>
        
        {/* End CTA - fades in at the end */}
        <motion.div 
          className="absolute bottom-16 md:bottom-20 left-0 right-0 text-center z-20 px-4"
          style={{ opacity: ctaOpacity, y: ctaY }}
        >
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-4 md:mb-6">
            Ready to transform your study routine?
          </p>
          <a
            href="/auth"
            className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
            Get Started Free
          </a>
        </motion.div>
        
        {/* Scroll indicator at bottom */}
        <motion.div 
          className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
          style={{ opacity: headerOpacity }}
        >
          <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest">
            Scroll to explore
          </span>
          <motion.div
            className="w-5 h-8 md:w-6 md:h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-1.5 md:pt-2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-1 h-1 md:w-1.5 md:h-1.5 bg-primary rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HorizontalScrollFeatures;
