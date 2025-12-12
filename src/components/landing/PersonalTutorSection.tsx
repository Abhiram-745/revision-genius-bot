import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Brain, Target, BookOpen, Zap, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cube3D, Sphere3D, Diamond3D, GlowingParticle } from "./3DObjects";

interface PersonalTutorSectionProps {
  onTryClick: () => void;
}

// Animated 3D Mascot Character - Friendly AI Tutor
const TutorMascot = () => {
  return (
    <motion.div 
      className="relative w-80 h-96"
      animate={{ y: [0, -15, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Glow effect behind mascot */}
      <motion.div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, hsl(var(--secondary) / 0.3) 0%, transparent 70%)"
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      {/* Main body - Friendly blob shape */}
      <motion.div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: 200, height: 240 }}
      >
        {/* Body */}
        <motion.svg
          viewBox="0 0 200 240"
          className="w-full h-full"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Body gradient */}
          <defs>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--secondary))" />
              <stop offset="50%" stopColor="hsl(160, 60%, 45%)" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
            <linearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.4" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            {/* Circuit pattern */}
            <pattern id="circuitPattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="5" r="2" fill="hsl(var(--secondary) / 0.3)" />
              <line x1="5" y1="5" x2="25" y2="5" stroke="hsl(var(--secondary) / 0.2)" strokeWidth="1" />
              <line x1="5" y1="5" x2="5" y2="25" stroke="hsl(var(--secondary) / 0.2)" strokeWidth="1" />
            </pattern>
          </defs>
          
          {/* Main body blob */}
          <motion.path
            d="M100,20 C160,20 180,60 180,120 C180,180 150,220 100,220 C50,220 20,180 20,120 C20,60 40,20 100,20"
            fill="url(#bodyGradient)"
            stroke="hsl(var(--secondary))"
            strokeWidth="2"
            animate={{
              d: [
                "M100,20 C160,20 180,60 180,120 C180,180 150,220 100,220 C50,220 20,180 20,120 C20,60 40,20 100,20",
                "M100,18 C165,22 182,58 178,122 C178,182 148,218 100,222 C52,222 22,182 22,118 C22,58 38,18 100,18",
                "M100,20 C160,20 180,60 180,120 C180,180 150,220 100,220 C50,220 20,180 20,120 C20,60 40,20 100,20"
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Circuit pattern overlay */}
          <path
            d="M100,25 C155,25 175,62 175,120 C175,178 147,215 100,215 C53,215 25,178 25,120 C25,62 45,25 100,25"
            fill="url(#circuitPattern)"
            opacity="0.5"
          />
          
          {/* Shine effect */}
          <ellipse cx="70" cy="80" rx="40" ry="30" fill="url(#shineGradient)" />
        </motion.svg>
        
        {/* Eyes */}
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 flex gap-8">
          {/* Left eye */}
          <motion.div 
            className="relative w-10 h-10"
            animate={{ scaleY: [1, 1, 1, 0.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.85, 0.9, 0.92, 1] }}
          >
            <div className="absolute inset-0 bg-white rounded-full shadow-lg" />
            <motion.div 
              className="absolute w-5 h-5 bg-gray-900 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{ x: [0, 2, 0, -2, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="absolute w-2 h-2 bg-white rounded-full top-1 left-1" />
            </motion.div>
          </motion.div>
          
          {/* Right eye */}
          <motion.div 
            className="relative w-10 h-10"
            animate={{ scaleY: [1, 1, 1, 0.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.85, 0.9, 0.92, 1] }}
          >
            <div className="absolute inset-0 bg-white rounded-full shadow-lg" />
            <motion.div 
              className="absolute w-5 h-5 bg-gray-900 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{ x: [0, 2, 0, -2, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="absolute w-2 h-2 bg-white rounded-full top-1 left-1" />
            </motion.div>
          </motion.div>
        </div>
        
        {/* Smile */}
        <motion.div 
          className="absolute top-[55%] left-1/2 -translate-x-1/2"
          animate={{ scaleX: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg width="50" height="25" viewBox="0 0 50 25">
            <path 
              d="M5,8 Q25,25 45,8" 
              fill="none" 
              stroke="white" 
              strokeWidth="4" 
              strokeLinecap="round"
            />
          </svg>
        </motion.div>
        
        {/* Pointing arm */}
        <motion.div 
          className="absolute -right-16 top-[45%]"
          animate={{ 
            rotate: [0, 5, 0, -5, 0],
            x: [0, 5, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ transformOrigin: "left center" }}
        >
          <svg width="120" height="60" viewBox="0 0 120 60">
            {/* Arm */}
            <path 
              d="M0,30 Q30,25 60,30 Q80,32 95,25" 
              fill="none" 
              stroke="hsl(var(--secondary))" 
              strokeWidth="20" 
              strokeLinecap="round"
            />
            {/* Hand */}
            <circle cx="100" cy="22" r="15" fill="hsl(var(--secondary))" />
            {/* Pointing finger */}
            <motion.path 
              d="M110,18 L130,10" 
              fill="none" 
              stroke="hsl(var(--secondary))" 
              strokeWidth="8" 
              strokeLinecap="round"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </svg>
        </motion.div>
        
        {/* Holding clipboard/notes */}
        <motion.div 
          className="absolute -left-10 top-[50%]"
          animate={{ rotate: [-5, 0, -5] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="bg-white rounded-lg shadow-xl p-2 w-16 h-20 border-2 border-gray-200">
            <div className="w-full h-2 bg-primary/30 rounded mb-1" />
            <div className="w-3/4 h-2 bg-secondary/30 rounded mb-1" />
            <div className="w-full h-2 bg-accent/30 rounded mb-1" />
            <div className="w-1/2 h-2 bg-primary/30 rounded" />
          </div>
        </motion.div>
      </motion.div>
      
      {/* Floating sparkles around mascot */}
      {[
        { x: 20, y: 20, delay: 0 },
        { x: 80, y: 15, delay: 0.5 },
        { x: 15, y: 70, delay: 1 },
        { x: 85, y: 75, delay: 1.5 },
        { x: 50, y: 5, delay: 2 },
      ].map((spark, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: `${spark.x}%`, top: `${spark.y}%` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
            rotate: [0, 180]
          }}
          transition={{ 
            duration: 2, 
            delay: spark.delay, 
            repeat: Infinity 
          }}
        >
          <Sparkles className="w-5 h-5 text-secondary" />
        </motion.div>
      ))}
    </motion.div>
  );
};

const PersonalTutorSection = ({ onTryClick }: PersonalTutorSectionProps) => {
  const features = [
    { icon: BookOpen, text: "AI parses your notes & syllabus automatically" },
    { icon: Brain, text: "Creates topic-based study sessions" },
    { icon: Zap, text: "Active recall techniques for 3x better retention" },
    { icon: Target, text: "Tracks progress & identifies weak areas" },
  ];

  return (
    <section className="py-24 px-6 relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-secondary/5">
      {/* 3D Objects floating in background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-[10%]">
          <Cube3D size={50} rotationDuration={12} />
        </div>
        <div className="absolute top-40 right-[15%]">
          <Sphere3D size={40} colors={["hsl(var(--secondary))", "hsl(var(--accent))"]} />
        </div>
        <div className="absolute bottom-32 left-[20%]">
          <Diamond3D size={45} color="hsl(var(--primary))" rotationDuration={8} />
        </div>
        <div className="absolute bottom-20 right-[10%]">
          <Cube3D size={35} colors={["hsl(var(--accent))", "hsl(var(--primary))", "hsl(var(--secondary))"]} rotationDuration={15} />
        </div>
        
        {/* Glowing particles */}
        {[...Array(8)].map((_, i) => (
          <GlowingParticle
            key={i}
            size={6 + Math.random() * 8}
            x={10 + Math.random() * 80}
            y={10 + Math.random() * 80}
            color={i % 2 === 0 ? "hsl(var(--secondary))" : "hsl(var(--accent))"}
            delay={i * 0.4}
          />
        ))}
        
        {/* Rotating rings */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-secondary/10 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-primary/5 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
            <Brain className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">Your Personal AI Tutor</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Meet Your{" "}
            <span className="bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent">
              Study Buddy
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powered by BlurtAI integration - upload your notes and let AI create the perfect study plan just for you.
          </p>
        </motion.div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - 3D Mascot */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex justify-center lg:justify-end"
          >
            <TutorMascot />
          </motion.div>

          {/* Right side - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <Card className="bg-card/80 backdrop-blur-md border-secondary/20 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">BlurtAI Integration</h3>
                    <p className="text-muted-foreground">Active Recall Powered Learning</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {features.map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                        <feature.icon className="w-4 h-4 text-secondary" />
                      </div>
                      <span className="text-foreground/80">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-muted/50 rounded-xl">
                  {[
                    { value: "3x", label: "Better Retention" },
                    { value: "85%", label: "Avg. Recall Score" },
                    { value: "50%", label: "Less Study Time" },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-2xl font-bold text-secondary">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={onTryClick}
                    className="bg-gradient-to-r from-secondary to-accent hover:opacity-90 transition-all group flex-1"
                    size="lg"
                  >
                    <Sparkles className="mr-2 w-4 h-4" />
                    Try Integration
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <a
                      href="https://blurtaigcseo.vercel.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center"
                    >
                      Visit BlurtAI
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* How it works mini cards */}
            <div className="grid grid-cols-3 gap-4">
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
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`p-4 rounded-xl bg-${item.color}/5 border border-${item.color}/20 text-center`}
                >
                  <div className={`w-8 h-8 rounded-full bg-${item.color}/10 flex items-center justify-center mx-auto mb-2`}>
                    <item.icon className={`w-4 h-4 text-${item.color}`} />
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">Step {item.step}</div>
                  <div className="text-sm font-semibold">{item.title}</div>
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
