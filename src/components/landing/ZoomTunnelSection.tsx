import { useRef, useMemo } from "react";
import { motion, useTransform } from "framer-motion";
import { Sparkles, Target, Map, TrendingUp, Trophy } from "lucide-react";
import { useScrollLockSection } from "@/hooks/useScrollLockSection";

const ZoomTunnelSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Lock scroll while user moves through the tunnel and
  // map scroll input to a local 0-1 progress value
  const { progress } = useScrollLockSection(sectionRef, {
    lockThreshold: 0.5,
    sensitivity: 0.0012,
  });

  // Text sections that appear sequentially as user scrolls
  const textSections = useMemo(
    () => [
      { title: "Focus", subtitle: "On what matters most", icon: Target, color: "from-primary to-primary/70" },
      { title: "Plan", subtitle: "Your path to success", icon: Map, color: "from-secondary to-secondary/70" },
      { title: "Track", subtitle: "Your progress daily", icon: TrendingUp, color: "from-accent to-accent/70" },
      { title: "Achieve", subtitle: "Your academic goals", icon: Trophy, color: "from-primary to-secondary" },
      { title: "Study Smarter", subtitle: "Not Harder", icon: Sparkles, color: "from-primary via-secondary to-accent" },
    ],
    []
  );

  // Text section transforms - each section gets its own local progress range
  const text1Opacity = useTransform(progress, [0.05, 0.12, 0.18, 0.22], [0, 1, 1, 0]);
  const text1Scale = useTransform(progress, [0.05, 0.12, 0.18, 0.22], [0.8, 1, 1, 1.1]);
  const text1Y = useTransform(progress, [0.05, 0.12, 0.18, 0.22], [30, 0, 0, -30]);

  const text2Opacity = useTransform(progress, [0.2, 0.27, 0.33, 0.37], [0, 1, 1, 0]);
  const text2Scale = useTransform(progress, [0.2, 0.27, 0.33, 0.37], [0.8, 1, 1, 1.1]);
  const text2Y = useTransform(progress, [0.2, 0.27, 0.33, 0.37], [30, 0, 0, -30]);

  const text3Opacity = useTransform(progress, [0.35, 0.42, 0.48, 0.52], [0, 1, 1, 0]);
  const text3Scale = useTransform(progress, [0.35, 0.42, 0.48, 0.52], [0.8, 1, 1, 1.1]);
  const text3Y = useTransform(progress, [0.35, 0.42, 0.48, 0.52], [30, 0, 0, -30]);

  const text4Opacity = useTransform(progress, [0.5, 0.57, 0.63, 0.67], [0, 1, 1, 0]);
  const text4Scale = useTransform(progress, [0.5, 0.57, 0.63, 0.67], [0.8, 1, 1, 1.1]);
  const text4Y = useTransform(progress, [0.5, 0.57, 0.63, 0.67], [30, 0, 0, -30]);

  const text5Opacity = useTransform(progress, [0.65, 0.75, 0.9, 0.98], [0, 1, 1, 0]);
  const text5Scale = useTransform(progress, [0.65, 0.75, 0.85], [0.8, 1, 1]);
  const text5Y = useTransform(progress, [0.65, 0.75], [30, 0]);

  const textTransforms = [
    { opacity: text1Opacity, scale: text1Scale, y: text1Y },
    { opacity: text2Opacity, scale: text2Scale, y: text2Y },
    { opacity: text3Opacity, scale: text3Scale, y: text3Y },
    { opacity: text4Opacity, scale: text4Scale, y: text4Y },
    { opacity: text5Opacity, scale: text5Scale, y: text5Y },
  ];

  // Frame transforms - 10 frames staggered across local scroll with dramatic zoom
  const frame1Scale = useTransform(progress, [0, 0.35], [0.05, 10]);
  const frame2Scale = useTransform(progress, [0.03, 0.38], [0.05, 10]);
  const frame3Scale = useTransform(progress, [0.06, 0.41], [0.05, 10]);
  const frame4Scale = useTransform(progress, [0.09, 0.44], [0.05, 10]);
  const frame5Scale = useTransform(progress, [0.12, 0.47], [0.05, 10]);
  const frame6Scale = useTransform(progress, [0.15, 0.5], [0.05, 10]);
  const frame7Scale = useTransform(progress, [0.18, 0.53], [0.05, 10]);
  const frame8Scale = useTransform(progress, [0.21, 0.56], [0.05, 10]);
  const frame9Scale = useTransform(progress, [0.24, 0.59], [0.05, 10]);
  const frame10Scale = useTransform(progress, [0.27, 0.62], [0.05, 10]);

  const frame1Opacity = useTransform(progress, [0, 0.2, 0.35], [1, 0.8, 0]);
  const frame2Opacity = useTransform(progress, [0.03, 0.23, 0.38], [1, 0.8, 0]);
  const frame3Opacity = useTransform(progress, [0.06, 0.26, 0.41], [1, 0.8, 0]);
  const frame4Opacity = useTransform(progress, [0.09, 0.29, 0.44], [1, 0.8, 0]);
  const frame5Opacity = useTransform(progress, [0.12, 0.32, 0.47], [1, 0.8, 0]);
  const frame6Opacity = useTransform(progress, [0.15, 0.35, 0.5], [1, 0.8, 0]);
  const frame7Opacity = useTransform(progress, [0.18, 0.38, 0.53], [1, 0.8, 0]);
  const frame8Opacity = useTransform(progress, [0.21, 0.41, 0.56], [1, 0.8, 0]);
  const frame9Opacity = useTransform(progress, [0.24, 0.44, 0.59], [1, 0.8, 0]);
  const frame10Opacity = useTransform(progress, [0.27, 0.47, 0.62], [1, 0.8, 0]);

  // Rotation for extra visual impact
  const frame1Rotation = useTransform(progress, [0, 0.35], [0, 20]);
  const frame2Rotation = useTransform(progress, [0.03, 0.38], [0, -15]);
  const frame3Rotation = useTransform(progress, [0.06, 0.41], [0, 25]);
  const frame4Rotation = useTransform(progress, [0.09, 0.44], [0, -20]);
  const frame5Rotation = useTransform(progress, [0.12, 0.47], [0, 15]);
  const frame6Rotation = useTransform(progress, [0.15, 0.5], [0, -25]);
  const frame7Rotation = useTransform(progress, [0.18, 0.53], [0, 20]);
  const frame8Rotation = useTransform(progress, [0.21, 0.56], [0, -15]);
  const frame9Rotation = useTransform(progress, [0.24, 0.59], [0, 25]);
  const frame10Rotation = useTransform(progress, [0.27, 0.62], [0, -20]);

  const frames = useMemo(
    () => [
      { scale: frame1Scale, opacity: frame1Opacity, rotate: frame1Rotation, color: "border-primary", glow: "shadow-[0_0_30px_hsl(var(--primary)/0.5)]" },
      { scale: frame2Scale, opacity: frame2Opacity, rotate: frame2Rotation, color: "border-secondary", glow: "shadow-[0_0_25px_hsl(var(--secondary)/0.4)]" },
      { scale: frame3Scale, opacity: frame3Opacity, rotate: frame3Rotation, color: "border-accent", glow: "shadow-[0_0_30px_hsl(var(--accent)/0.5)]" },
      { scale: frame4Scale, opacity: frame4Opacity, rotate: frame4Rotation, color: "border-primary/80", glow: "shadow-[0_0_20px_hsl(var(--primary)/0.4)]" },
      { scale: frame5Scale, opacity: frame5Opacity, rotate: frame5Rotation, color: "border-secondary/80", glow: "shadow-[0_0_25px_hsl(var(--secondary)/0.3)]" },
      { scale: frame6Scale, opacity: frame6Opacity, rotate: frame6Rotation, color: "border-accent/80", glow: "shadow-[0_0_30px_hsl(var(--accent)/0.4)]" },
      { scale: frame7Scale, opacity: frame7Opacity, rotate: frame7Rotation, color: "border-primary/60", glow: "shadow-[0_0_20px_hsl(var(--primary)/0.3)]" },
      { scale: frame8Scale, opacity: frame8Opacity, rotate: frame8Rotation, color: "border-secondary/60", glow: "shadow-[0_0_25px_hsl(var(--secondary)/0.3)]" },
      { scale: frame9Scale, opacity: frame9Opacity, rotate: frame9Rotation, color: "border-accent/60", glow: "shadow-[0_0_30px_hsl(var(--accent)/0.3)]" },
      { scale: frame10Scale, opacity: frame10Opacity, rotate: frame10Rotation, color: "border-primary/40", glow: "shadow-[0_0_20px_hsl(var(--primary)/0.2)]" },
    ], [
      frame1Scale, frame1Opacity, frame1Rotation,
      frame2Scale, frame2Opacity, frame2Rotation,
      frame3Scale, frame3Opacity, frame3Rotation,
      frame4Scale, frame4Opacity, frame4Rotation,
      frame5Scale, frame5Opacity, frame5Rotation,
      frame6Scale, frame6Opacity, frame6Rotation,
      frame7Scale, frame7Opacity, frame7Rotation,
      frame8Scale, frame8Opacity, frame8Rotation,
      frame9Scale, frame9Opacity, frame9Rotation,
      frame10Scale, frame10Opacity, frame10Rotation,
    ]
  );

  // Line opacity for radiating lines
  const lineOpacity = useTransform(progress, [0, 0.3, 0.7, 1], [0.1, 0.4, 0.4, 0.1]);

  // Generate radiating lines
  const lines = useMemo(() => Array.from({ length: 24 }, (_, i) => i * 15), []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-background"
      style={{ height: "100vh" }}
    >
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Radiating lines from center */}
        <div className="absolute inset-0 flex items-center justify-center">
          {lines.map((rotation, i) => (
            <motion.div
              key={i}
              style={{
                transform: `rotate(${rotation}deg)`,
                opacity: lineOpacity,
              }}
              className="absolute h-[200%] w-px origin-center bg-gradient-to-t from-transparent via-primary/30 to-transparent"
            />
          ))}
        </div>

        {/* Zooming rectangular frames with glow */}
        {frames.map((frame, i) => (
          <motion.div
            key={i}
            style={{
              scale: frame.scale,
              opacity: frame.opacity,
              rotate: frame.rotate,
            }}
            className={`absolute w-64 h-40 md:w-96 md:h-60 border-2 rounded-2xl ${frame.color} ${frame.glow}`}
          />
        ))}

        {/* Text sections that appear sequentially */}
        {textSections.map((section, index) => {
          const Icon = section.icon;
          const transform = textTransforms[index];
          
          return (
            <motion.div
              key={index}
              style={{
                opacity: transform.opacity,
                scale: transform.scale,
                y: transform.y,
              }}
              className="absolute z-10 text-center px-6"
            >
              <motion.div
                className={`inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${section.color} mb-4 md:mb-6 shadow-2xl`}
                animate={{ rotate: index === 4 ? 360 : 0 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Icon className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
              </motion.div>
              
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold mb-2 md:mb-4">
                <span className={`bg-gradient-to-r ${section.color} bg-clip-text text-transparent`}>
                  {section.title}
                </span>
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground font-medium">
                {section.subtitle}
              </p>
            </motion.div>
          );
        })}

        {/* Gradient overlay at edges */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-background via-transparent to-background" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-background via-transparent to-background" />
      </div>
    </section>
  );
};

export default ZoomTunnelSection;
