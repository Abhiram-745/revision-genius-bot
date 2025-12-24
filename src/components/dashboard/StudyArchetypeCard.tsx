import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Moon, Sun, ClipboardList, Star } from "lucide-react";

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
  image: string;
  icon: typeof Moon;
  gradient: string;
  borderColor: string;
}

const archetypes: Record<ArchetypeType, ArchetypeData> = {
  "night-owl": {
    type: "night-owl",
    title: "The Night Owl",
    description: "You thrive in the quiet hours when the world sleeps. Your best focus comes after sunset.",
    image: archetypeNightOwl,
    icon: Moon,
    gradient: "from-indigo-600 via-purple-600 to-violet-700",
    borderColor: "border-indigo-500/30",
  },
  "early-bird": {
    type: "early-bird",
    title: "The Early Bird",
    description: "You seize the day at dawn. Morning hours fuel your sharpest thinking and productivity.",
    image: archetypeEarlyBird,
    icon: Sun,
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    borderColor: "border-amber-500/30",
  },
  "planner": {
    type: "planner",
    title: "The Planner",
    description: "Structure is your superpower. You excel with schedules and hit every milestone.",
    image: archetypePlanner,
    icon: ClipboardList,
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    borderColor: "border-emerald-500/30",
  },
  "perfectionist": {
    type: "perfectionist",
    title: "The Perfectionist",
    description: "Quality over quantity defines you. Your deep focus leads to mastery.",
    image: archetypePerfectionist,
    icon: Star,
    gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
    borderColor: "border-rose-500/30",
  },
};

export const StudyArchetypeCard = ({ userId }: StudyArchetypeCardProps) => {
  const [archetype, setArchetype] = useState<ArchetypeData | null>(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse position for 3D effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animation
  const springConfig = { stiffness: 150, damping: 20 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig);

  // Shine position
  const shineX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), springConfig);
  const shineY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), springConfig);

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
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl border border-primary/10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Analyzing your study patterns...</span>
      </div>
    );
  }

  if (!archetype) return null;

  const Icon = archetype.icon;

  return (
    <div className="perspective-1000" style={{ perspective: "1000px" }}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className={`relative overflow-hidden rounded-3xl ${archetype.borderColor} border-2 bg-gradient-to-br ${archetype.gradient} p-1 cursor-pointer group`}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Shine overlay */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none z-20"
          style={{
            background: useTransform(
              [shineX, shineY],
              ([x, y]) =>
                `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 25%, transparent 50%)`
            ),
          }}
        />

        {/* Inner card */}
        <div className="relative bg-card/95 backdrop-blur-sm rounded-[22px] p-6 sm:p-8 overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {[...Array(10)].map((_, i) => (
                <circle
                  key={i}
                  cx={Math.random() * 100}
                  cy={Math.random() * 100}
                  r={Math.random() * 20 + 5}
                  fill="currentColor"
                />
              ))}
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
            {/* Archetype Image */}
            <motion.div
              className="relative flex-shrink-0"
              style={{ transform: "translateZ(50px)" }}
              whileHover={{ scale: 1.05 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${archetype.gradient} rounded-full blur-xl opacity-30`} />
              <img
                src={archetype.image}
                alt={archetype.title}
                className="w-40 h-40 sm:w-48 sm:h-48 object-contain relative z-10 drop-shadow-2xl"
              />
            </motion.div>

            {/* Text Content */}
            <div className="text-center sm:text-left flex-1" style={{ transform: "translateZ(30px)" }}>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${archetype.gradient}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Your Study Archetype
                </span>
              </div>
              
              <h2 className={`text-3xl sm:text-4xl font-bold bg-gradient-to-r ${archetype.gradient} bg-clip-text text-transparent mb-3`}>
                {archetype.title}
              </h2>
              
              <p className="text-muted-foreground text-lg max-w-md">
                {archetype.description}
              </p>

              {/* Trait badges */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
                {["Focused", "Dedicated", "Growing"].map((trait, i) => (
                  <motion.span
                    key={trait}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * i }}
                    className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${archetype.gradient} text-white`}
                  >
                    {trait}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
