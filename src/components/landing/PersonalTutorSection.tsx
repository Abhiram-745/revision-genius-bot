import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Brain, Target, BookOpen, Zap, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GlowingParticle } from "./3DObjects";
import studyingOwl from "@/assets/studying-owl.png";
import { useIsMobile } from "@/hooks/use-mobile";

interface PersonalTutorSectionProps {
  onTryClick: () => void;
}

// Animated 3D Mascot using AI-generated image
const TutorMascot = ({ isMobile }: { isMobile: boolean }) => {
  return (
    <motion.div 
      className={`relative ${isMobile ? 'w-48 h-56' : 'w-80 h-96'} flex items-center justify-center`}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Glow effect behind mascot */}
      <motion.div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, hsl(160 60% 45% / 0.3) 0%, transparent 70%)"
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      {/* The studying owl mascot */}
      <motion.img
        src={studyingOwl}
        alt="Studying Owl Mascot"
        className={`relative z-10 ${isMobile ? 'w-44' : 'w-72'} h-auto drop-shadow-2xl`}
        animate={{ 
          rotate: [-2, 2, -2],
          scale: [1, 1.02, 1]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.25))" }}
      />
      
      {/* Floating sparkles - reduced on mobile */}
      {!isMobile && [
        { x: 10, y: 10, delay: 0 },
        { x: 90, y: 15, delay: 0.5 },
        { x: 5, y: 60, delay: 1 },
        { x: 95, y: 65, delay: 1.5 },
      ].map((spark, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: `${spark.x}%`, top: `${spark.y}%` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 2.5, delay: spark.delay, repeat: Infinity }}
        >
          <Sparkles className="w-4 h-4 text-secondary" />
        </motion.div>
      ))}
    </motion.div>
  );
};

const PersonalTutorSection = ({ onTryClick }: PersonalTutorSectionProps) => {
  const isMobile = useIsMobile();
  
  const features = [
    { icon: BookOpen, text: "AI parses your notes & syllabus automatically" },
    { icon: Brain, text: "Creates topic-based study sessions" },
    { icon: Zap, text: "Active recall techniques for 3x better retention" },
    { icon: Target, text: "Tracks progress & identifies weak areas" },
  ];

  return (
    <section className="py-12 md:py-24 px-4 md:px-6 relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-secondary/5">
      {/* Background floating particles - hidden on mobile */}
      {!isMobile && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <GlowingParticle
              key={i}
              size={6 + Math.random() * 8}
              x={5 + Math.random() * 90}
              y={5 + Math.random() * 90}
              color={i % 3 === 0 ? "hsl(var(--secondary))" : i % 3 === 1 ? "hsl(var(--accent))" : "hsl(var(--primary))"}
              delay={i * 0.3}
            />
          ))}
          
          {/* Rotating rings - desktop only */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-secondary/10 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-4 md:mb-6">
            <Brain className="w-3 h-3 md:w-4 md:h-4 text-secondary" />
            <span className="text-xs md:text-sm font-medium text-secondary">Your Personal AI Tutor</span>
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold mb-3 md:mb-6">
            Meet Your{" "}
            <span className="bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent">
              Study Buddy
            </span>
          </h2>
          <p className="text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Powered by BlurtAI integration - upload your notes and let AI create the perfect study plan.
          </p>
        </motion.div>

        {/* Main content grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Mascot - centered on mobile, side on desktop */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex justify-center lg:justify-end order-1 lg:order-1"
          >
            <TutorMascot isMobile={isMobile} />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4 md:space-y-8 order-2 lg:order-2"
          >
            <Card className="bg-card/80 backdrop-blur-md border-secondary/20 shadow-xl">
              <CardContent className="p-4 md:p-8">
                <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                    <BookOpen className="w-5 h-5 md:w-7 md:h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-2xl font-bold">BlurtAI Integration</h3>
                    <p className="text-xs md:text-base text-muted-foreground">Active Recall Powered Learning</p>
                  </div>
                </div>

                <div className="space-y-2 md:space-y-4 mb-4 md:mb-8">
                  {features.map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-2 md:gap-3"
                    >
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                        <feature.icon className="w-3 h-3 md:w-4 md:h-4 text-secondary" />
                      </div>
                      <span className="text-xs md:text-base text-foreground/80">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-8 p-3 md:p-4 bg-muted/50 rounded-lg md:rounded-xl">
                  {[
                    { value: "3x", label: "Better Retention" },
                    { value: "85%", label: "Avg. Recall" },
                    { value: "50%", label: "Less Time" },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-lg md:text-2xl font-bold text-secondary">{stat.value}</div>
                      <div className="text-[10px] md:text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                  <Button
                    onClick={onTryClick}
                    className="bg-gradient-to-r from-secondary to-accent hover:opacity-90 transition-all group flex-1 text-sm md:text-base"
                    size={isMobile ? "default" : "lg"}
                  >
                    <Sparkles className="mr-2 w-3 h-3 md:w-4 md:h-4" />
                    Try Integration
                    <ArrowRight className="ml-2 w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="outline" size={isMobile ? "default" : "lg"} asChild className="text-sm md:text-base">
                    <a
                      href="https://blurtaigcseo.vercel.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center"
                    >
                      Visit BlurtAI
                      <ExternalLink className="ml-2 w-3 h-3 md:w-4 md:h-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* How it works mini cards */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              {[
                { step: "1", title: "Upload Notes", icon: BookOpen, color: "primary" },
                { step: "2", title: "AI Parses", icon: Brain, color: "secondary" },
                { step: "3", title: "Start Learning", icon: Target, color: "accent" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-2 md:p-4 rounded-lg md:rounded-xl bg-${item.color}/5 border border-${item.color}/20 text-center`}
                >
                  <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full bg-${item.color}/10 flex items-center justify-center mx-auto mb-1 md:mb-2`}>
                    <item.icon className={`w-3 h-3 md:w-4 md:h-4 text-${item.color}`} />
                  </div>
                  <div className="text-[10px] md:text-xs font-medium text-muted-foreground">Step {item.step}</div>
                  <div className="text-xs md:text-sm font-semibold">{item.title}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PersonalTutorSection;