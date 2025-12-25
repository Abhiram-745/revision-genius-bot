import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import archetype images
import archetypeNightOwl from "@/assets/archetype-night-owl-card.png";
import archetypeEarlyBird from "@/assets/archetype-early-bird-card.png";
import archetypePlanner from "@/assets/archetype-planner-card.png";
import archetypePerfectionist from "@/assets/archetype-perfectionist-card.png";
import archetypeVisualLearner from "@/assets/archetype-visual-learner-card.png";
import archetypePracticeGrinder from "@/assets/archetype-practice-grinder-card.png";

interface StudyArchetypeCardProps {
  userId: string;
}

type ArchetypeType =
  | "night-owl"
  | "early-bird"
  | "planner"
  | "perfectionist"
  | "visual-learner"
  | "practice-grinder";

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
    glowColor: "hsl(var(--primary))",
    gradient: "from-indigo-500 via-purple-500 to-violet-600",
  },
  "early-bird": {
    type: "early-bird",
    title: "The Early Bird",
    description: "You seize the day at dawn. Morning hours fuel your sharpest thinking and productivity.",
    traits: ["Morning Energy", "Fresh Focus", "Productive"],
    image: archetypeEarlyBird,
    glowColor: "hsl(var(--accent))",
    gradient: "from-amber-400 via-orange-400 to-yellow-500",
  },
  "planner": {
    type: "planner",
    title: "The Planner",
    description: "Structure is your superpower. You excel with schedules and hit every milestone.",
    traits: ["Organized", "Consistent", "Reliable"],
    image: archetypePlanner,
    glowColor: "hsl(var(--primary))",
    gradient: "from-emerald-400 via-teal-400 to-cyan-500",
  },
  "perfectionist": {
    type: "perfectionist",
    title: "The Perfectionist",
    description: "Quality over quantity defines you. Your deep focus leads to mastery.",
    traits: ["Detail-Oriented", "High Focus", "Mastery"],
    image: archetypePerfectionist,
    glowColor: "hsl(var(--destructive))",
    gradient: "from-rose-400 via-pink-500 to-fuchsia-500",
  },
  "visual-learner": {
    type: "visual-learner",
    title: "The Visual Learner",
    description: "You understand fastest when you can see it. Diagrams, charts, and visuals make ideas click.",
    traits: ["Diagram Thinker", "Pattern Spotter", "Big Picture"],
    image: archetypeVisualLearner,
    glowColor: "hsl(var(--accent))",
    gradient: "from-lime-300 via-emerald-300 to-teal-400",
  },
  "practice-grinder": {
    type: "practice-grinder",
    title: "The Practice Grinder",
    description: "You learn by doing. Practice questions and repetition are your path to confident mastery.",
    traits: ["Repetition", "Active Recall", "Consistency"],
    image: archetypePracticeGrinder,
    glowColor: "hsl(var(--primary))",
    gradient: "from-amber-300 via-lime-300 to-emerald-400",
  },
};

export const StudyArchetypeCard = ({ userId }: StudyArchetypeCardProps) => {
  const [archetype, setArchetype] = useState<ArchetypeData | null>(null);
  const [secondaryArchetype, setSecondaryArchetype] = useState<ArchetypeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Calibration refs for gyroscope
  const calibratedBeta = useRef<number | null>(null);
  const calibratedGamma = useRef<number | null>(null);

  // Mouse/gyro position for 3D effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smoother spring animation for premium feel
  const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [30, -30]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-30, 30]), springConfig);

  // Shine position with faster response
  const shineSpringConfig = { stiffness: 250, damping: 30 };
  const shineX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), shineSpringConfig);
  const shineY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), shineSpringConfig);

  // Glow intensity based on hover
  const glowIntensity = useSpring(0, { stiffness: 300, damping: 30 });

  // Create all transforms at top level (not inside JSX)
  const shineBackground = useTransform(
    [shineX, shineY],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.6) 15%, rgba(255,255,255,0.2) 35%, transparent 60%)`
  );

  const holoBackground = useTransform(
    [shineX, shineY],
    ([x, y]) =>
      `linear-gradient(${Number(x) * 3.6}deg, 
        hsl(var(--primary) / 0.3) 0%, 
        hsl(var(--accent) / 0.3) 25%, 
        hsl(var(--primary) / 0.2) 50%, 
        hsl(var(--accent) / 0.3) 75%, 
        hsl(var(--primary) / 0.3) 100%)`
  );

  const sparkleBackground = useTransform(
    [shineX, shineY],
    ([x, y]) =>
      `conic-gradient(from ${Number(x) * 3.6}deg at ${x}% ${y}%, 
        rgba(255,255,255,1) 0deg, 
        transparent 40deg, 
        rgba(255,255,255,0.7) 90deg, 
        transparent 130deg,
        rgba(255,255,255,0.9) 180deg,
        transparent 220deg,
        rgba(255,255,255,0.7) 270deg,
        transparent 310deg,
        rgba(255,255,255,1) 360deg)`
  );

  const glowOpacity = useTransform(glowIntensity, [0, 1], [0.4, 1]);
  const glowScale = useTransform(glowIntensity, [0, 1], [1, 1.1]);

  // Gyroscope support for mobile with calibration
  useEffect(() => {
    let isActive = true;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (!isActive) return;
      
      const beta = event.beta ?? 0;
      const gamma = event.gamma ?? 0;
      
      // Calibrate on first reading
      if (calibratedBeta.current === null) {
        calibratedBeta.current = beta;
        calibratedGamma.current = gamma;
      }
      
      // Calculate delta from calibrated position
      const deltaBeta = beta - (calibratedBeta.current || 0);
      const deltaGamma = gamma - (calibratedGamma.current || 0);
      
      // Normalize to -0.5 to 0.5 range (using ±25 degrees as max for more sensitivity)
      const normalizedX = Math.max(-0.5, Math.min(0.5, deltaGamma / 50));
      const normalizedY = Math.max(-0.5, Math.min(0.5, deltaBeta / 50));
      
      mouseX.set(normalizedX);
      mouseY.set(normalizedY);
      glowIntensity.set(0.8);
    };

    // Request permission for iOS 13+
    const requestPermission = async () => {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        } catch (e) {
          console.log('Gyro permission denied');
        }
      } else {
        // Non-iOS or older iOS
        window.addEventListener('deviceorientation', handleOrientation);
      }
    };

    // Check if device has gyro
    if (window.DeviceOrientationEvent) {
      requestPermission();
    }

    return () => {
      isActive = false;
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [mouseX, mouseY, glowIntensity]);

  useEffect(() => {
    determineArchetype();
  }, [userId]);

  const determineArchetype = async () => {
    try {
      // Fetch study sessions AND study preferences for comprehensive analysis
      const [sessionsResult, preferencesResult] = await Promise.all([
        supabase
          .from("study_sessions")
          .select(
            "planned_start, actual_duration_minutes, focus_score, status, created_at, session_type"
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("study_preferences")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle(),
      ]);

      const sessions = sessionsResult.data || [];
      const preferences = preferencesResult.data;

      const pickSecondaryForNewUser = (): ArchetypeType => {
        const startHour = preferences?.preferred_start_time
          ? parseInt(preferences.preferred_start_time.split(":")[0])
          : null;
        if (startHour !== null && !Number.isNaN(startHour) && startHour >= 20) return "night-owl";
        return "early-bird";
      };

      // Default to planner for new users with insufficient data
      if (!sessions || sessions.length < 5) {
        const secondary = pickSecondaryForNewUser();
        setArchetype(archetypes["planner"]);
        setSecondaryArchetype(archetypes[secondary]);
        setLoading(false);
        setIsRefreshing(false);
        return;
      }

      // Scoring system for each archetype - start all at 0
      const scores: Record<ArchetypeType, number> = {
        "night-owl": 0,
        "early-bird": 0,
        planner: 10,
        perfectionist: 0,
        "visual-learner": 0,
        "practice-grinder": 0,
      };

      // Analyze session timing patterns
      let morningCount = 0;
      let eveningCount = 0;
      let lateNightCount = 0;
      let earlyMorningCount = 0;
      let completedCount = 0;
      let skippedCount = 0;
      let totalFocusScore = 0;
      let focusCount = 0;
      let totalDuration = 0;
      let sessionCount = 0;
      let practiceSessionCount = 0;

      sessions.forEach((session) => {
        if (session.planned_start) {
          const hour = new Date(session.planned_start).getHours();

          if (hour < 8) earlyMorningCount++;
          if (hour >= 8 && hour < 10) morningCount++;
          if (hour >= 18 && hour < 22) eveningCount++;
          if (hour >= 22 || hour < 5) lateNightCount++;
        }

        if (session.status === "completed") {
          completedCount++;
          sessionCount++;
          if (session.actual_duration_minutes) {
            totalDuration += session.actual_duration_minutes;
          }

          const st = (session.session_type || "").toLowerCase();
          if (/(practice|quiz|blurt|pmt|save|gradlify)/.test(st)) {
            practiceSessionCount++;
          }
        } else if (session.status === "skipped" || session.status === "missed") {
          skippedCount++;
        }

        if (session.focus_score && session.focus_score > 0) {
          totalFocusScore += session.focus_score;
          focusCount++;
        }
      });

      const totalSessions = sessions.length;
      const earlyMorningRatio = earlyMorningCount / totalSessions;
      const morningRatio = morningCount / totalSessions;
      const eveningRatio = eveningCount / totalSessions;
      const lateNightRatio = lateNightCount / totalSessions;

      // Early Bird scoring
      if (earlyMorningRatio > 0.2) scores["early-bird"] += 35;
      else if (morningRatio > 0.25) scores["early-bird"] += 20;
      if (preferences?.study_before_school === true) scores["early-bird"] += 25;

      // Night Owl scoring
      if (lateNightRatio > 0.15) scores["night-owl"] += 40;
      else if (eveningRatio > 0.35) scores["night-owl"] += 25;

      // Planner and Perfectionist metrics
      const totalTracked = completedCount + skippedCount;
      const completionRate = totalTracked > 0 ? completedCount / totalTracked : 0;
      const avgFocus = focusCount > 0 ? totalFocusScore / focusCount : 0;
      const avgDuration = sessionCount > 0 ? totalDuration / sessionCount : 0;
      const missedRate = totalTracked > 0 ? skippedCount / totalTracked : 0;

      // Planner scoring
      if (completionRate >= 0.85 && missedRate < 0.15) scores.planner += 40;
      else if (completionRate >= 0.7) scores.planner += 25;
      else if (completionRate >= 0.5) scores.planner += 10;

      // Perfectionist scoring
      if (avgFocus >= 4.5) scores.perfectionist += 40;
      else if (avgFocus >= 4) scores.perfectionist += 25;
      else if (avgFocus >= 3.5) scores.perfectionist += 15;
      if (avgDuration >= 50) scores.perfectionist += 20;
      else if (avgDuration >= 40) scores.perfectionist += 10;

      // Visual Learner scoring (balanced duration + solid focus)
      if (avgFocus >= 3.5 && avgFocus <= 4.4) scores["visual-learner"] += 20;
      if (avgDuration >= 25 && avgDuration <= 45) scores["visual-learner"] += 20;
      if (completionRate >= 0.6 && missedRate < 0.25) scores["visual-learner"] += 10;

      // Practice Grinder scoring (practice-heavy sessions + consistency)
      const practiceRatio = sessionCount > 0 ? practiceSessionCount / sessionCount : 0;
      if (practiceRatio > 0.5) scores["practice-grinder"] += 45;
      else if (practiceRatio > 0.3) scores["practice-grinder"] += 25;
      if (completionRate >= 0.75) scores["practice-grinder"] += 10;
      if (avgDuration <= 40) scores["practice-grinder"] += 10;

      // Check preferred study time
      if (preferences?.preferred_start_time) {
        const startHour = parseInt(preferences.preferred_start_time.split(":")[0]);
        if (startHour < 7) scores["early-bird"] += 15;
        else if (startHour >= 20) scores["night-owl"] += 15;
      }

      // Rank and pick top 2 (ensure we always keep a secondary archetype)
      const ranked = (Object.entries(scores) as [ArchetypeType, number][]).sort(
        (a, b) => b[1] - a[1]
      );

      const primaryType = ranked[0]?.[0] ?? "planner";
      const secondaryType =
        ranked.find(([t]) => t !== primaryType)?.[0] ?? pickSecondaryForNewUser();

      console.log("Archetype scores:", scores, "Primary:", primaryType, "Secondary:", secondaryType);
      setArchetype(archetypes[primaryType]);
      setSecondaryArchetype(archetypes[secondaryType]);
    } catch (error) {
      console.error("Error determining archetype:", error);
      setArchetype(archetypes["planner"]);
      setSecondaryArchetype(archetypes["early-bird"]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setIsFlipped(false);
    // Reset calibration for next gyro reading
    calibratedBeta.current = null;
    calibratedGamma.current = null;
    await new Promise(resolve => setTimeout(resolve, 1500));
    await determineArchetype();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isRefreshing) return;
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
    if (!isRefreshing) {
      setIsFlipped(!isFlipped);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center py-4">
        <p className="text-sm font-medium text-muted-foreground mb-3">Your Study Archetype</p>
        <div className="w-[200px] h-[280px] sm:w-[220px] sm:h-[320px] flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 rounded-[20px] border border-primary/10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Analyzing patterns...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!archetype) return null;

  return (
    <div className="flex flex-col items-center py-4">
      <div className="flex items-center gap-2 mb-3">
        <p className="text-sm font-medium text-muted-foreground">Your Study Archetype</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-7 w-7 p-0 rounded-full hover:bg-primary/10"
        >
          <RefreshCw className={`h-4 w-4 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {secondaryArchetype && (
        <p className="text-[11px] text-muted-foreground/70 mb-3 text-center">
          Primary: <span className="font-medium text-foreground/80">{archetype.title}</span> · Secondary:{" "}
          <span className="font-medium text-foreground/80">{secondaryArchetype.title}</span>
        </p>
      )}

      <p className="text-xs text-muted-foreground/70 mb-4">Click card to flip</p>
      
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
          animate={{ 
            rotateY: isFlipped ? 180 : 0,
            scale: isRefreshing ? 0.95 : 1,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          whileHover={!isFlipped && !isRefreshing ? { scale: 1.05, z: 50 } : {}}
        >
          {/* Enhanced outer glow effect with pulsing */}
          <motion.div
            className="absolute -inset-6 rounded-[32px] blur-2xl"
            style={{
              background: `radial-gradient(circle, ${archetype.glowColor} 0%, transparent 70%)`,
              opacity: glowOpacity,
              scale: glowScale,
            }}
          />
          
          {/* Secondary glow ring */}
          <motion.div
            className="absolute -inset-3 rounded-[26px] blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-300"
            style={{
              background: `conic-gradient(from 0deg, ${archetype.glowColor}, hsl(var(--accent)), ${archetype.glowColor})`,
            }}
          />

          {/* Refreshing overlay */}
          {isRefreshing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-50 flex items-center justify-center rounded-[20px] bg-background/80 backdrop-blur-sm"
            >
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="h-8 w-8 text-primary" />
                </motion.div>
                <motion.p 
                  className="text-sm font-medium text-primary"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  AI is thinking...
                </motion.p>
              </div>
            </motion.div>
          )}

          {/* FRONT CARD - The Image */}
          <div
            className="relative w-[200px] h-[280px] sm:w-[220px] sm:h-[320px] rounded-[20px] overflow-hidden backface-hidden"
            style={{
              boxShadow: `
                0 25px 50px -12px rgba(0, 0, 0, 0.5),
                0 0 40px ${archetype.glowColor}
              `,
              backfaceVisibility: "hidden",
            }}
          >
            {/* Card border gradient */}
            <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-white/50 via-white/20 to-white/40 p-[3px]">
              <div className="absolute inset-[3px] rounded-[17px] bg-card overflow-hidden">
                {/* The archetype image as the card background */}
                <img
                  src={archetype.image}
                  alt={`${archetype.title} study archetype card`}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transform: "translateZ(0)" }}
                />
              </div>
            </div>

            {/* Holographic rainbow overlay with theme colors */}
            <motion.div
              className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 pointer-events-none mix-blend-overlay transition-opacity duration-200"
              style={{
                background: holoBackground,
              }}
            />

            {/* Primary shine effect - enhanced brightness */}
            <motion.div
              className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200"
              style={{
                background: shineBackground,
              }}
            />

            {/* Secondary sparkle effect - enhanced */}
            <motion.div
              className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-80 pointer-events-none transition-opacity duration-200 mix-blend-soft-light"
              style={{
                background: sparkleBackground,
              }}
            />

            {/* Edge highlight for 3D effect */}
            <div className="absolute inset-0 rounded-[20px] pointer-events-none border-2 border-white/30" />

            {/* Inner shadow for depth */}
            <div
              className="absolute inset-0 rounded-[20px] pointer-events-none"
              style={{
                boxShadow: "inset 0 2px 6px rgba(255,255,255,0.4), inset 0 -2px 6px rgba(0,0,0,0.3)",
              }}
            />
          </div>

          {/* BACK CARD - The Details (uses same archetype data) */}
          <div
            className="absolute inset-0 w-[200px] h-[280px] sm:w-[220px] sm:h-[320px] rounded-[20px] overflow-hidden backface-hidden"
            style={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              boxShadow: `
                0 25px 50px -12px rgba(0, 0, 0, 0.5),
                0 0 40px ${archetype.glowColor}
              `,
            }}
          >
            <div className={`absolute inset-0 rounded-[20px] bg-gradient-to-br ${archetype.gradient} p-[3px]`}>
              <div className="absolute inset-[3px] rounded-[17px] bg-card/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-5 text-center">
                {/* Title */}
                <h3 className={`text-lg sm:text-xl font-bold bg-gradient-to-r ${archetype.gradient} bg-clip-text text-transparent mb-2 sm:mb-3`}>
                  {archetype.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3 sm:mb-4">
                  {archetype.description}
                </p>

                {/* Traits */}
                <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  {archetype.traits.map((trait, i) => (
                    <span
                      key={i}
                      className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-gradient-to-r ${archetype.gradient} text-white`}
                    >
                      {trait}
                    </span>
                  ))}
                </div>

                {/* Flip back hint */}
                <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-auto">
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
