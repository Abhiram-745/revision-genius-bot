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
  description: string;
  traits: string[];
  image: string;
  glowColor: string;
  gradient: string;
}

const archetypes: Record<ArchetypeType, ArchetypeData> = {
  "night-owl": {
    type: "night-owl",
    title: "The Night Owl",
    description: "You thrive in the quiet hours when the world sleeps. Your best focus comes after sunset.",
    traits: ["Night Focus", "Deep Thinker", "Creative"],
    image: archetypeNightOwl,
    glowColor: "rgba(99, 102, 241, 0.6)",
    gradient: "from-indigo-500 via-purple-500 to-violet-600",
  },
  "early-bird": {
    type: "early-bird",
    title: "The Early Bird",
    description: "You seize the day at dawn. Morning hours fuel your sharpest thinking and productivity.",
    traits: ["Morning Person", "Energetic", "Productive"],
    image: archetypeEarlyBird,
    glowColor: "rgba(251, 191, 36, 0.6)",
    gradient: "from-amber-400 via-orange-400 to-yellow-500",
  },
  "planner": {
    type: "planner",
    title: "The Planner",
    description: "Structure is your superpower. You excel with schedules and hit every milestone.",
    traits: ["Organized", "Consistent", "Reliable"],
    image: archetypePlanner,
    glowColor: "rgba(34, 197, 94, 0.6)",
    gradient: "from-emerald-400 via-teal-400 to-cyan-500",
  },
  "perfectionist": {
    type: "perfectionist",
    title: "The Perfectionist",
    description: "Quality over quantity defines you. Your deep focus leads to mastery.",
    traits: ["Detail-Oriented", "High Focus", "Mastery"],
    image: archetypePerfectionist,
    glowColor: "rgba(244, 63, 94, 0.6)",
    gradient: "from-rose-400 via-pink-500 to-fuchsia-500",
  },
};

export const StudyArchetypeCard = ({ userId }: StudyArchetypeCardProps) => {
  const [archetype, setArchetype] = useState<ArchetypeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
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
      // Fetch study sessions AND study preferences for comprehensive analysis
      const [sessionsResult, preferencesResult] = await Promise.all([
        supabase
          .from("study_sessions")
          .select("planned_start, actual_duration_minutes, focus_score, status, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("study_preferences")
          .select("*")
          .eq("user_id", userId)
          .single(),
      ]);

      const sessions = sessionsResult.data || [];
      const preferences = preferencesResult.data;

      // Scoring system for each archetype
      let scores = {
        "night-owl": 0,
        "early-bird": 0,
        "planner": 0,
        "perfectionist": 0,
      };

      // 1. Check study preferences for before-school study preference
      if (preferences?.study_before_school) {
        scores["early-bird"] += 30;
      }

      // 2. Analyze session timing patterns
      let morningCount = 0; // Before 10am
      let eveningCount = 0; // After 6pm
      let lateNightCount = 0; // After 10pm
      let earlyMorningCount = 0; // Before 8am
      let completedCount = 0;
      let skippedCount = 0;
      let totalFocusScore = 0;
      let focusCount = 0;
      let totalDuration = 0;
      let sessionCount = 0;

      sessions.forEach((session) => {
        if (session.planned_start) {
          const hour = new Date(session.planned_start).getHours();
          
          // Early morning sessions (before 8am)
          if (hour < 8) {
            earlyMorningCount++;
            scores["early-bird"] += 3;
          }
          // Morning sessions (8am-10am)
          if (hour >= 8 && hour < 10) {
            morningCount++;
            scores["early-bird"] += 2;
          }
          // Evening sessions (6pm-10pm)
          if (hour >= 18 && hour < 22) {
            eveningCount++;
            scores["night-owl"] += 2;
          }
          // Late night sessions (after 10pm)
          if (hour >= 22 || hour < 5) {
            lateNightCount++;
            scores["night-owl"] += 4;
          }
        }

        // Track completion rate for Planner
        if (session.status === "completed") {
          completedCount++;
          sessionCount++;
          if (session.actual_duration_minutes) {
            totalDuration += session.actual_duration_minutes;
          }
        } else if (session.status === "skipped" || session.status === "missed") {
          skippedCount++;
        }

        // Track focus scores for Perfectionist
        if (session.focus_score && session.focus_score > 0) {
          totalFocusScore += session.focus_score;
          focusCount++;
        }
      });

      // 3. Calculate metrics
      const totalTracked = completedCount + skippedCount;
      const completionRate = totalTracked > 0 ? completedCount / totalTracked : 0;
      const avgFocus = focusCount > 0 ? totalFocusScore / focusCount : 0;
      const avgDuration = sessionCount > 0 ? totalDuration / sessionCount : 0;

      // 4. Score based on completion rate (Planner)
      if (completionRate >= 0.9) {
        scores["planner"] += 40;
      } else if (completionRate >= 0.75) {
        scores["planner"] += 25;
      } else if (completionRate >= 0.6) {
        scores["planner"] += 15;
      }

      // Low missed sessions = Planner trait
      const missedRate = totalTracked > 0 ? skippedCount / totalTracked : 0;
      if (missedRate < 0.1) {
        scores["planner"] += 20;
      } else if (missedRate < 0.2) {
        scores["planner"] += 10;
      }

      // 5. Score based on focus and quality (Perfectionist)
      if (avgFocus >= 4.5) {
        scores["perfectionist"] += 35;
      } else if (avgFocus >= 4) {
        scores["perfectionist"] += 25;
      } else if (avgFocus >= 3.5) {
        scores["perfectionist"] += 15;
      }

      // Longer focused sessions = Perfectionist
      if (avgDuration >= 45) {
        scores["perfectionist"] += 15;
      } else if (avgDuration >= 30) {
        scores["perfectionist"] += 8;
      }

      // 6. Time-based preferences from study_preferences
      if (preferences) {
        const preferredStart = preferences.preferred_start_time;
        if (preferredStart) {
          const startHour = parseInt(preferredStart.split(':')[0]);
          if (startHour < 8) {
            scores["early-bird"] += 20;
          } else if (startHour >= 20) {
            scores["night-owl"] += 20;
          }
        }
      }

      // 7. Determine winning archetype
      let determinedType: ArchetypeType = "planner";
      let maxScore = 0;

      (Object.entries(scores) as [ArchetypeType, number][]).forEach(([type, score]) => {
        if (score > maxScore) {
          maxScore = score;
          determinedType = type;
        }
      });

      // Default to planner if no clear signals (new users)
      if (maxScore === 0 || sessions.length < 3) {
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
    if (!cardRef.current || isFlipped) return;
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

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  // Get current glow color (use default if archetype not loaded yet)
  const currentGlowColor = archetype?.glowColor || "rgba(34, 197, 94, 0.6)";

  if (loading) {
    return (
      <div className="flex flex-col items-center py-4">
        <p className="text-sm font-medium text-muted-foreground mb-3">Your Study Archetype</p>
        <div className="w-[220px] h-[320px] flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 rounded-[20px] border border-primary/10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!archetype) return null;

  return (
    <div className="flex flex-col items-center py-4">
      <p className="text-sm font-medium text-muted-foreground mb-3">Your Study Archetype</p>
      <p className="text-xs text-muted-foreground/70 mb-4">Click to flip</p>
      
      <div className="perspective-1000" style={{ perspective: "1200px" }}>
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          style={{
            rotateX: isFlipped ? 0 : rotateX,
            rotateY: isFlipped ? 180 : rotateY,
            transformStyle: "preserve-3d",
          }}
          className="relative cursor-pointer group"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          whileHover={!isFlipped ? { scale: 1.05, z: 50 } : {}}
        >
          {/* Outer glow effect */}
          <motion.div
            className="absolute -inset-4 rounded-[28px] blur-xl transition-opacity duration-300"
            style={{
              background: currentGlowColor,
              opacity: glowOpacity,
            }}
          />

          {/* FRONT CARD - The Image */}
          <div
            className="relative w-[220px] h-[320px] rounded-[20px] overflow-hidden backface-hidden"
            style={{
              boxShadow: `
                0 25px 50px -12px rgba(0, 0, 0, 0.4),
                0 0 30px ${currentGlowColor}
              `,
              backfaceVisibility: "hidden",
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

          {/* BACK CARD - The Details */}
          <div
            className="absolute inset-0 w-[220px] h-[320px] rounded-[20px] overflow-hidden backface-hidden"
            style={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              boxShadow: `
                0 25px 50px -12px rgba(0, 0, 0, 0.4),
                0 0 30px ${currentGlowColor}
              `,
            }}
          >
            <div className={`absolute inset-0 rounded-[20px] bg-gradient-to-br ${archetype.gradient} p-[3px]`}>
              <div className="absolute inset-[3px] rounded-[17px] bg-card/95 backdrop-blur-sm flex flex-col items-center justify-center p-5 text-center">
                {/* Title */}
                <h3 className={`text-xl font-bold bg-gradient-to-r ${archetype.gradient} bg-clip-text text-transparent mb-3`}>
                  {archetype.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {archetype.description}
                </p>

                {/* Traits */}
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {archetype.traits.map((trait, i) => (
                    <span
                      key={i}
                      className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${archetype.gradient} text-white`}
                    >
                      {trait}
                    </span>
                  ))}
                </div>

                {/* Flip back hint */}
                <p className="text-xs text-muted-foreground/60 mt-auto">
                  Click to flip back
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
