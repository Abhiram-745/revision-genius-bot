import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

// Import archetype images
import archetypeNightOwl from "@/assets/archetype-night-owl.png";
import archetypeEarlyBird from "@/assets/archetype-early-bird.png";
import archetypePlanner from "@/assets/archetype-planner.png";
import archetypePerfectionist from "@/assets/archetype-perfectionist.png";

interface StudyArchetypeCardProps {
  userId: string;
}

type ArchetypeType = "night-owl" | "early-bird" | "planner" | "perfectionist";

interface ArchetypeData {
  type: ArchetypeType;
  title: string;
  image: string;
  glowColor: string;
}

const archetypes: Record<ArchetypeType, ArchetypeData> = {
  "night-owl": {
    type: "night-owl",
    title: "The Night Owl",
    image: archetypeNightOwl,
    glowColor: "rgba(99, 102, 241, 0.6)",
  },
  "early-bird": {
    type: "early-bird",
    title: "The Early Bird",
    image: archetypeEarlyBird,
    glowColor: "rgba(251, 191, 36, 0.6)",
  },
  "planner": {
    type: "planner",
    title: "The Planner",
    image: archetypePlanner,
    glowColor: "rgba(34, 197, 94, 0.6)",
  },
  "perfectionist": {
    type: "perfectionist",
    title: "The Perfectionist",
    image: archetypePerfectionist,
    glowColor: "rgba(244, 63, 94, 0.6)",
  },
};

export const StudyArchetypeCard = ({ userId }: StudyArchetypeCardProps) => {
  const [archetype, setArchetype] = useState<ArchetypeData | null>(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse position for 3D effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smoother spring animation for premium feel
  const springConfig = { stiffness: 100, damping: 15, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [25, -25]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-25, 25]), springConfig);

  // Shine position with faster response
  const shineSpringConfig = { stiffness: 200, damping: 25 };
  const shineX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), shineSpringConfig);
  const shineY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), shineSpringConfig);

  // Glow intensity based on hover
  const glowIntensity = useSpring(0, { stiffness: 300, damping: 30 });

  // Create all transforms at top level (not inside JSX)
  const shineBackground = useTransform(
    [shineX, shineY],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 20%, transparent 60%)`
  );

  const holoBackground = useTransform(
    [shineX, shineY],
    ([x, y]) =>
      `linear-gradient(${Number(x) * 3.6}deg, 
        rgba(255,0,150,0.15) 0%, 
        rgba(0,255,255,0.15) 25%, 
        rgba(255,255,0,0.15) 50%, 
        rgba(0,255,150,0.15) 75%, 
        rgba(255,0,150,0.15) 100%)`
  );

  const sparkleBackground = useTransform(
    [shineX, shineY],
    ([x, y]) =>
      `conic-gradient(from ${Number(x) * 3.6}deg at ${x}% ${y}%, 
        rgba(255,255,255,0.8) 0deg, 
        transparent 60deg, 
        rgba(255,255,255,0.4) 120deg, 
        transparent 180deg,
        rgba(255,255,255,0.6) 240deg,
        transparent 300deg,
        rgba(255,255,255,0.8) 360deg)`
  );

  const glowOpacity = useTransform(glowIntensity, [0, 1], [0.3, 0.7]);

  useEffect(() => {
    determineArchetype();
  }, [userId]);

  const determineArchetype = async () => {
    try {
      // Fetch study sessions to analyze patterns
      const { data: sessions } = await supabase
        .from("study_sessions")
        .select("planned_start, actual_duration_minutes, focus_score, status")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!sessions || sessions.length < 3) {
        // Default to planner for new users
        setArchetype(archetypes["planner"]);
        setLoading(false);
        return;
      }

      // Analyze patterns
      let morningCount = 0;
      let eveningCount = 0;
      let completedCount = 0;
      let totalFocusScore = 0;
      let focusCount = 0;

      sessions.forEach((session) => {
        if (session.planned_start) {
          const hour = new Date(session.planned_start).getHours();
          if (hour < 10) morningCount++;
          if (hour >= 18) eveningCount++;
        }
        if (session.status === "completed") completedCount++;
        if (session.focus_score) {
          totalFocusScore += session.focus_score;
          focusCount++;
        }
      });

      const completionRate = completedCount / sessions.length;
      const avgFocus = focusCount > 0 ? totalFocusScore / focusCount : 0;
      const morningRatio = morningCount / sessions.length;
      const eveningRatio = eveningCount / sessions.length;

      // Determine archetype based on patterns
      let determinedType: ArchetypeType = "planner";

      if (eveningRatio > 0.4) {
        determinedType = "night-owl";
      } else if (morningRatio > 0.3) {
        determinedType = "early-bird";
      } else if (avgFocus >= 4 || completionRate > 0.85) {
        determinedType = "perfectionist";
      } else if (completionRate > 0.6) {
        determinedType = "planner";
      }

      setArchetype(archetypes[determinedType]);
    } catch (error) {
      console.error("Error determining archetype:", error);
      setArchetype(archetypes["planner"]);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
    glowIntensity.set(1);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    glowIntensity.set(0);
  };

  // Get current glow color (use default if archetype not loaded yet)
  const currentGlowColor = archetype?.glowColor || "rgba(34, 197, 94, 0.6)";

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="w-[220px] h-[320px] flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 rounded-[20px] border border-primary/10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!archetype) return null;

  return (
    <div className="flex justify-center py-4">
      <div className="perspective-1000" style={{ perspective: "1200px" }}>
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          className="relative cursor-pointer group"
          whileHover={{ scale: 1.05, z: 50 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          {/* Outer glow effect */}
          <motion.div
            className="absolute -inset-4 rounded-[28px] blur-xl transition-opacity duration-300"
            style={{
              background: currentGlowColor,
              opacity: glowOpacity,
            }}
          />

          {/* Card container */}
          <div
            className="relative w-[220px] h-[320px] rounded-[20px] overflow-hidden"
            style={{
              boxShadow: `
                0 25px 50px -12px rgba(0, 0, 0, 0.4),
                0 0 30px ${currentGlowColor}
              `,
            }}
          >
            {/* Card border gradient */}
            <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-white/40 via-white/10 to-white/30 p-[3px]">
              <div className="absolute inset-[3px] rounded-[17px] bg-card overflow-hidden">
                {/* The archetype image as the card background */}
                <img
                  src={archetype.image}
                  alt={archetype.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transform: "translateZ(0)" }}
                />
              </div>
            </div>

            {/* Holographic rainbow overlay */}
            <motion.div
              className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 pointer-events-none mix-blend-overlay transition-opacity duration-200"
              style={{
                background: holoBackground,
              }}
            />

            {/* Primary shine effect - more prominent */}
            <motion.div
              className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200"
              style={{
                background: shineBackground,
              }}
            />

            {/* Secondary sparkle effect */}
            <motion.div
              className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-60 pointer-events-none transition-opacity duration-200 mix-blend-soft-light"
              style={{
                background: sparkleBackground,
              }}
            />

            {/* Edge highlight for 3D effect */}
            <div className="absolute inset-0 rounded-[20px] pointer-events-none border border-white/20" />

            {/* Inner shadow for depth */}
            <div
              className="absolute inset-0 rounded-[20px] pointer-events-none"
              style={{
                boxShadow: "inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.2)",
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
