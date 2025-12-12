import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles } from "lucide-react";

const ZoomTunnelSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Multiple frames that scale based on scroll
  const frame1Scale = useTransform(scrollYProgress, [0, 0.5], [0.1, 4]);
  const frame2Scale = useTransform(scrollYProgress, [0.05, 0.55], [0.1, 4]);
  const frame3Scale = useTransform(scrollYProgress, [0.1, 0.6], [0.1, 4]);
  const frame4Scale = useTransform(scrollYProgress, [0.15, 0.65], [0.1, 4]);
  const frame5Scale = useTransform(scrollYProgress, [0.2, 0.7], [0.1, 4]);

  // Opacity for frames - fade out as they get too big
  const frame1Opacity = useTransform(scrollYProgress, [0, 0.3, 0.5], [1, 1, 0]);
  const frame2Opacity = useTransform(scrollYProgress, [0.05, 0.35, 0.55], [1, 1, 0]);
  const frame3Opacity = useTransform(scrollYProgress, [0.1, 0.4, 0.6], [1, 1, 0]);
  const frame4Opacity = useTransform(scrollYProgress, [0.15, 0.45, 0.65], [1, 1, 0]);
  const frame5Opacity = useTransform(scrollYProgress, [0.2, 0.5, 0.7], [1, 1, 0]);

  // Center text appears mid-scroll
  const textOpacity = useTransform(scrollYProgress, [0.3, 0.5, 0.7, 0.85], [0, 1, 1, 0]);
  const textScale = useTransform(scrollYProgress, [0.3, 0.5], [0.8, 1]);

  const frames = [
    { scale: frame1Scale, opacity: frame1Opacity, color: "primary" },
    { scale: frame2Scale, opacity: frame2Opacity, color: "secondary" },
    { scale: frame3Scale, opacity: frame3Opacity, color: "accent" },
    { scale: frame4Scale, opacity: frame4Opacity, color: "primary" },
    { scale: frame5Scale, opacity: frame5Opacity, color: "secondary" },
  ];

  // Generate radiating lines
  const lines = Array.from({ length: 24 }, (_, i) => i * 15);

  return (
    <section
      ref={sectionRef}
      className="relative h-[200vh] bg-background"
    >
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Radiating lines from center */}
        <div className="absolute inset-0 flex items-center justify-center">
          {lines.map((rotation, i) => (
            <motion.div
              key={i}
              style={{
                transform: `rotate(${rotation}deg)`,
                opacity: useTransform(scrollYProgress, [0, 0.3], [0.1, 0.3]),
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
            className={`absolute w-64 h-40 md:w-96 md:h-60 border-2 rounded-2xl ${
              i % 3 === 0 ? "border-primary/40" :
              i % 3 === 1 ? "border-secondary/40" :
              "border-accent/40"
            }`}
          />
        ))}

        {/* Additional decorative frames at different angles */}
        {[15, -15, 30, -30].map((angle, i) => (
          <motion.div
            key={`angled-${i}`}
            style={{
              scale: frames[i % frames.length].scale,
              opacity: frames[i % frames.length].opacity,
              rotate: angle,
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
