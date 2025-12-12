import { useRef, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles } from "lucide-react";

const ZoomTunnelSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Pre-calculate all transforms outside of render
  const frame1Scale = useTransform(scrollYProgress, [0, 0.4], [0.1, 5]);
  const frame2Scale = useTransform(scrollYProgress, [0.03, 0.43], [0.1, 5]);
  const frame3Scale = useTransform(scrollYProgress, [0.06, 0.46], [0.1, 5]);
  const frame4Scale = useTransform(scrollYProgress, [0.09, 0.49], [0.1, 5]);
  const frame5Scale = useTransform(scrollYProgress, [0.12, 0.52], [0.1, 5]);
  const frame6Scale = useTransform(scrollYProgress, [0.15, 0.55], [0.1, 5]);
  const frame7Scale = useTransform(scrollYProgress, [0.18, 0.58], [0.1, 5]);
  const frame8Scale = useTransform(scrollYProgress, [0.21, 0.61], [0.1, 5]);

  const frame1Opacity = useTransform(scrollYProgress, [0, 0.25, 0.4], [1, 1, 0]);
  const frame2Opacity = useTransform(scrollYProgress, [0.03, 0.28, 0.43], [1, 1, 0]);
  const frame3Opacity = useTransform(scrollYProgress, [0.06, 0.31, 0.46], [1, 1, 0]);
  const frame4Opacity = useTransform(scrollYProgress, [0.09, 0.34, 0.49], [1, 1, 0]);
  const frame5Opacity = useTransform(scrollYProgress, [0.12, 0.37, 0.52], [1, 1, 0]);
  const frame6Opacity = useTransform(scrollYProgress, [0.15, 0.40, 0.55], [1, 1, 0]);
  const frame7Opacity = useTransform(scrollYProgress, [0.18, 0.43, 0.58], [1, 1, 0]);
  const frame8Opacity = useTransform(scrollYProgress, [0.21, 0.46, 0.61], [1, 1, 0]);

  // Center text appears mid-scroll
  const textOpacity = useTransform(scrollYProgress, [0.35, 0.5, 0.7, 0.85], [0, 1, 1, 0]);
  const textScale = useTransform(scrollYProgress, [0.35, 0.5], [0.8, 1]);
  
  // Line opacity - computed once
  const lineOpacity = useTransform(scrollYProgress, [0, 0.3], [0.1, 0.4]);

  const frames = useMemo(() => [
    { scale: frame1Scale, opacity: frame1Opacity, colorClass: "border-primary/40" },
    { scale: frame2Scale, opacity: frame2Opacity, colorClass: "border-secondary/40" },
    { scale: frame3Scale, opacity: frame3Opacity, colorClass: "border-accent/40" },
    { scale: frame4Scale, opacity: frame4Opacity, colorClass: "border-primary/30" },
    { scale: frame5Scale, opacity: frame5Opacity, colorClass: "border-secondary/30" },
    { scale: frame6Scale, opacity: frame6Opacity, colorClass: "border-accent/30" },
    { scale: frame7Scale, opacity: frame7Opacity, colorClass: "border-primary/20" },
    { scale: frame8Scale, opacity: frame8Opacity, colorClass: "border-secondary/20" },
  ], [
    frame1Scale, frame1Opacity, frame2Scale, frame2Opacity,
    frame3Scale, frame3Opacity, frame4Scale, frame4Opacity,
    frame5Scale, frame5Opacity, frame6Scale, frame6Opacity,
    frame7Scale, frame7Opacity, frame8Scale, frame8Opacity
  ]);

  // Generate radiating lines
  const lines = useMemo(() => Array.from({ length: 24 }, (_, i) => i * 15), []);

  // Angled frames with their own transforms
  const angledFrame1Scale = useTransform(scrollYProgress, [0.05, 0.45], [0.1, 4]);
  const angledFrame2Scale = useTransform(scrollYProgress, [0.08, 0.48], [0.1, 4]);
  const angledFrame3Scale = useTransform(scrollYProgress, [0.11, 0.51], [0.1, 4]);
  const angledFrame4Scale = useTransform(scrollYProgress, [0.14, 0.54], [0.1, 4]);

  const angledFrame1Opacity = useTransform(scrollYProgress, [0.05, 0.3, 0.45], [0.6, 0.6, 0]);
  const angledFrame2Opacity = useTransform(scrollYProgress, [0.08, 0.33, 0.48], [0.6, 0.6, 0]);
  const angledFrame3Opacity = useTransform(scrollYProgress, [0.11, 0.36, 0.51], [0.6, 0.6, 0]);
  const angledFrame4Opacity = useTransform(scrollYProgress, [0.14, 0.39, 0.54], [0.6, 0.6, 0]);

  const angledFrames = useMemo(() => [
    { scale: angledFrame1Scale, opacity: angledFrame1Opacity, angle: 15 },
    { scale: angledFrame2Scale, opacity: angledFrame2Opacity, angle: -15 },
    { scale: angledFrame3Scale, opacity: angledFrame3Opacity, angle: 30 },
    { scale: angledFrame4Scale, opacity: angledFrame4Opacity, angle: -30 },
  ], [
    angledFrame1Scale, angledFrame1Opacity,
    angledFrame2Scale, angledFrame2Opacity,
    angledFrame3Scale, angledFrame3Opacity,
    angledFrame4Scale, angledFrame4Opacity
  ]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-background"
      style={{ height: "300vh" }}
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
              className="absolute h-[200%] w-px origin-center bg-gradient-to-t from-transparent via-primary/20 to-transparent"
            />
          ))}
        </div>

        {/* Zooming rectangular frames */}
        {frames.map((frame, i) => (
          <motion.div
            key={i}
            style={{
              scale: frame.scale,
              opacity: frame.opacity,
            }}
            className={`absolute w-64 h-40 md:w-96 md:h-60 border-2 rounded-2xl ${frame.colorClass}`}
          />
        ))}

        {/* Additional decorative frames at different angles */}
        {angledFrames.map((frame, i) => (
          <motion.div
            key={`angled-${i}`}
            style={{
              scale: frame.scale,
              opacity: frame.opacity,
              rotate: frame.angle,
            }}
            className="absolute w-48 h-32 md:w-72 md:h-48 border border-muted-foreground/20 rounded-xl"
          />
        ))}

        {/* Center content that appears */}
        <motion.div
          style={{
            opacity: textOpacity,
            scale: textScale,
          }}
          className="relative z-10 text-center px-6"
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-6 shadow-2xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Study Smarter
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium">
            Not Harder
          </p>
        </motion.div>

        {/* Gradient overlay at edges */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-background via-transparent to-background" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-background via-transparent to-background" />
      </div>
    </section>
  );
};

export default ZoomTunnelSection;
