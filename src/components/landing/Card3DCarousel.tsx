import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Upload, Calendar, Brain, Sparkles, Timer, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Upload,
    title: "Smart Content Upload",
    description: "Upload your syllabus, notes, or topic lists. Our AI extracts key topics, subtopics, and even detects your exam board automatically.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Calendar,
    title: "Life-Aware Scheduling",
    description: "Mark your commitments - sports, clubs, family time. The AI works around your life, never over it.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Brain,
    title: "Cognitive Optimization",
    description: "Harder topics scheduled during your peak focus hours. Spaced repetition built in for maximum retention.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Timer,
    title: "Focus Sessions",
    description: "Pomodoro-style sessions with ambient sounds. Strategic breaks prevent burnout while maintaining momentum.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description: "Visual dashboards showing your growth. Track streaks, confidence levels, and mastery across all subjects.",
    color: "from-indigo-500 to-violet-500",
  },
  {
    icon: Sparkles,
    title: "AI Reflections",
    description: "After each session, rate your focus and understanding. The AI learns and adapts your future schedule.",
    color: "from-pink-500 to-rose-500",
  },
];

const Card3DCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextCard = () => {
    setActiveIndex((prev) => (prev + 1) % features.length);
  };

  const prevCard = () => {
    setActiveIndex((prev) => (prev - 1 + features.length) % features.length);
  };

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A complete study ecosystem designed around how your brain actually works
          </p>
        </motion.div>

        <div className="relative h-[400px] flex items-center justify-center perspective-1000">
          <AnimatePresence mode="popLayout">
            {features.map((feature, index) => {
              const offset = index - activeIndex;
              const absOffset = Math.abs(offset);
              const isActive = index === activeIndex;

              if (absOffset > 2) return null;

              return (
                <motion.div
                  key={feature.title}
                  className="absolute w-80 cursor-pointer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: isActive ? 1 : 0.5 - absOffset * 0.15,
                    scale: isActive ? 1 : 0.85 - absOffset * 0.05,
                    x: offset * 200,
                    z: isActive ? 0 : -100 * absOffset,
                    rotateY: offset * -15,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  onClick={() => setActiveIndex(index)}
                  style={{ transformStyle: "preserve-3d" }}
                  whileHover={isActive ? { scale: 1.05 } : {}}
                >
                  <div
                    className={`bg-card border border-border rounded-2xl p-8 shadow-2xl ${
                      isActive ? "ring-2 ring-primary/50" : ""
                    }`}
                  >
                    <div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="outline"
            size="icon"
            onClick={prevCard}
            className="rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex gap-2">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === activeIndex
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={nextCard}
            className="rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Card3DCarousel;
