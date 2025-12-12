import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, useScroll, useTransform, useInView, useSpring } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { 
  Calendar, Brain, Target, Users, Clock, Sparkles, ArrowRight, 
  CheckCircle2, Star, Heart, Zap, Laptop, TrendingUp, Award,
  BookOpen, RefreshCw, Shield, Rocket, BarChart3, MessageSquare, ChevronUp,
  MousePointer
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageTransition from "@/components/PageTransition";
import TypewriterText from "@/components/landing/TypewriterText";
import FloatingIcon from "@/components/landing/FloatingIcon";
import InteractiveTimetableDemo from "@/components/landing/InteractiveTimetableDemo";
import BlurtAIIntegration from "@/components/landing/BlurtAIIntegration";
import ComingSoonDialog from "@/components/landing/ComingSoonDialog";
import ScrollProgressBar from "@/components/landing/ScrollProgressBar";
import ParallaxBackground from "@/components/landing/ParallaxBackground";
import AnimatedCounter from "@/components/landing/AnimatedCounter";
import RippleButton from "@/components/landing/RippleButton";
import MouseFollowCard from "@/components/landing/MouseFollowCard";
import AnimatedConnectionLine from "@/components/landing/AnimatedConnectionLine";
import WhyStudentsLoveUs from "@/components/landing/WhyStudentsLoveUs";
import BeforeAfterSection from "@/components/landing/BeforeAfterSection";
import FAQSection from "@/components/landing/FAQSection";
import TrustedBySection from "@/components/landing/TrustedBySection";
import ParticleBackground from "@/components/landing/ParticleBackground";
import Card3DCarousel from "@/components/landing/Card3DCarousel";
import TimetableCreationSection from "@/components/landing/TimetableCreationSection";
import SuccessStoriesSection from "@/components/landing/SuccessStoriesSection";

const Landing = () => {
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  // Back to top visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const heroRef = useRef(null);
  const howItWorksRef = useRef(null);
  const featuresRef = useRef(null);
  
  const { scrollYProgress } = useScroll();
  const { scrollYProgress: howItWorksProgress } = useScroll({
    target: howItWorksRef,
    offset: ["start end", "end start"]
  });
  
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  // Feature icons mouse tracking
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const handleFeaturesMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left - rect.width / 2) / 30,
      y: (e.clientY - rect.top - rect.height / 2) / 30,
    });
  };

  const typewriterPhrases = [
    "exam revision",
    "study planning",
    "time management",
    "staying focused",
    "hitting goals",
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <PageTransition>
      {/* Scroll Progress Bar */}
      <ScrollProgressBar />
      
      <div className="min-h-screen bg-background overflow-hidden">
        {/* Parallax Background */}
        <ParallaxBackground />
        
        {/* Particle Background */}
        <ParticleBackground />

        {/* Hero Section */}
        <motion.section
          ref={heroRef}
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative min-h-[85vh] flex items-center justify-center px-6 pt-20 pb-16"
        >
          {/* Floating UI Feature Cards with Arrows */}
          <div className="hidden xl:block absolute left-6 top-24 z-10">
            <MouseFollowCard glowColor="190 70% 50%">
              <FloatingIcon delay={0} duration={4}>
                <Card className="w-64 bg-card/90 backdrop-blur-sm border-l-4 border-l-primary shadow-xl">
                  <CardContent className="p-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                      <Brain className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="font-bold text-sm mb-1">AI-Powered Planning</h4>
                    <p className="text-xs text-muted-foreground">Smart algorithms create optimal study schedules based on your learning patterns.</p>
                  </CardContent>
                </Card>
              </FloatingIcon>
            </MouseFollowCard>
            {/* Arrow pointing right */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute -right-16 top-1/2 -translate-y-1/2"
            >
              <svg width="60" height="40" viewBox="0 0 60 40" className="text-primary/40">
                <motion.path 
                  d="M0 20 Q30 5 50 20" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
                <path d="M45 15 L55 20 L45 25" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </motion.div>
          </div>

          <div className="hidden xl:block absolute right-6 top-28 z-10">
            <MouseFollowCard glowColor="155 60% 52%">
              <FloatingIcon delay={0.5} duration={4.5}>
                <Card className="w-64 bg-card/90 backdrop-blur-sm border-l-4 border-l-secondary shadow-xl">
                  <CardContent className="p-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-3">
                      <RefreshCw className="w-5 h-5 text-secondary" />
                    </div>
                    <h4 className="font-bold text-sm mb-1">Adaptive Rescheduling</h4>
                    <p className="text-xs text-muted-foreground">Missed a session? The AI automatically adjusts your plan to keep you on track.</p>
                  </CardContent>
                </Card>
              </FloatingIcon>
            </MouseFollowCard>
            {/* Arrow pointing down-left */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="absolute -left-12 bottom-0 translate-y-full"
            >
              <svg width="50" height="60" viewBox="0 0 50 60" className="text-secondary/40">
                <motion.path 
                  d="M40 0 Q45 30 20 50" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.7 }}
                />
                <path d="M25 45 L18 55 L15 43" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </motion.div>
          </div>

          <div className="hidden xl:block absolute left-12 bottom-36 z-10">
            <MouseFollowCard glowColor="42 85% 58%">
              <FloatingIcon delay={1} duration={5}>
                <Card className="w-60 bg-card/90 backdrop-blur-sm border-l-4 border-l-accent shadow-xl">
                  <CardContent className="p-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                      <BarChart3 className="w-5 h-5 text-accent" />
                    </div>
                    <h4 className="font-bold text-sm mb-1">Progress Analytics</h4>
                    <p className="text-xs text-muted-foreground">Track your confidence levels and see your improvement over time.</p>
                  </CardContent>
                </Card>
              </FloatingIcon>
            </MouseFollowCard>
            {/* Arrow pointing up-right */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="absolute -right-14 -top-8"
            >
              <svg width="50" height="50" viewBox="0 0 50 50" className="text-accent/40">
                <motion.path 
                  d="M10 45 Q15 20 40 10" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.9 }}
                />
                <path d="M35 5 L45 8 L38 16" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </motion.div>
          </div>

          <div className="hidden xl:block absolute right-10 bottom-32 z-10">
            <MouseFollowCard glowColor="190 70% 50%">
              <FloatingIcon delay={1.5} duration={5.5}>
                <Card className="w-60 bg-card/90 backdrop-blur-sm border-l-4 border-l-primary shadow-xl">
                  <CardContent className="p-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="font-bold text-sm mb-1">Session Reflections</h4>
                    <p className="text-xs text-muted-foreground">Quick feedback after each session helps the AI understand your needs.</p>
                  </CardContent>
                </Card>
              </FloatingIcon>
            </MouseFollowCard>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8 text-center"
            >
              {/* Badge with bounce */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 150 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border border-secondary/30"
              >
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap className="w-4 h-4 text-secondary" />
                </motion.div>
                <span className="text-sm font-medium text-secondary-foreground">
                  Built by students, for students
                </span>
              </motion.div>

              {/* Main headline with character animation */}
              <motion.h1 
                className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-[1.1]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Stop stressing about
                </motion.span>
                <br />
                <motion.span 
                  className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent inline-block"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                >
                  <TypewriterText phrases={typewriterPhrases} />
                </motion.span>
              </motion.h1>

              {/* Subheadline with fade */}
              <motion.p 
                className="text-xl text-muted-foreground max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                AI-powered study timetables that work around your life.
              </motion.p>

              {/* CTA Buttons with enhanced animations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative"
                >
                  {/* Glow effect behind button */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-xl opacity-50"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <RippleButton
                    size="lg"
                    onClick={() => navigate("/auth")}
                    className="relative text-lg px-10 py-7 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all duration-300 shadow-lg group rounded-full"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </RippleButton>
                </motion.div>
                <RippleButton
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    const demoSection = document.getElementById('try-demo');
                    demoSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-lg px-10 py-7 hover:scale-105 transition-all duration-300 rounded-full"
                  rippleColor="rgba(0, 0, 0, 0.2)"
                >
                  <Laptop className="mr-2 w-5 h-5" />
                  Try Demo
                </RippleButton>
              </motion.div>

              {/* Social proof with stagger */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground"
              >
                {["✓ No credit card", "✓ 2 min setup", "✓ Cancel anytime"].map((item, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + i * 0.15 }}
                  >
                    {item}
                  </motion.span>
                ))}
              </motion.div>

              {/* Scroll indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="pt-8"
              >
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex flex-col items-center gap-2 text-muted-foreground"
                >
                  <MousePointer className="w-5 h-5" />
                  <span className="text-xs">Scroll to explore</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Trusted By Section */}
        <TrustedBySection />

        {/* Floating Features Strip with Enhanced Mouse Parallax */}
        <section 
          className="py-20 px-6 border-y border-border/50 bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30 relative overflow-hidden"
          onMouseMove={handleFeaturesMouseMove}
          onMouseLeave={() => setMousePosition({ x: 0, y: 0 })}
        >
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: [
                "radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 50%, hsl(var(--secondary) / 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%)",
              ]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Calendar, label: "Smart Scheduling", color: "primary", delay: 0 },
                { icon: Brain, label: "AI Insights", color: "secondary", delay: 0.1 },
                { icon: Target, label: "Goal Tracking", color: "accent", delay: 0.2 },
                { icon: Users, label: "Study Groups", color: "primary", delay: 0.3 },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: item.delay, type: "spring", stiffness: 100 }}
                  className="flex flex-col items-center gap-4 text-center group"
                >
                  <motion.div
                    animate={{
                      x: mousePosition.x * (1 + i * 0.3),
                      y: mousePosition.y * (1 + i * 0.3),
                    }}
                    transition={{ type: "spring", stiffness: 150, damping: 15 }}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    className="relative"
                  >
                    {/* Glow effect */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"
                      style={{ backgroundColor: `hsl(var(--${item.color}))` }}
                    />
                    <FloatingIcon 
                      delay={item.delay * 2} 
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 relative z-10 border-2 bg-${item.color}/15 border-${item.color}/30`}
                    >
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                      >
                        <item.icon className={`w-8 h-8 text-${item.color}`} />
                      </motion.div>
                    </FloatingIcon>
                  </motion.div>
                  <motion.span 
                    className="font-display font-semibold text-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    {item.label}
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section with Step-by-Step Reveal */}
        <section ref={howItWorksRef} className="py-24 px-6 relative">
          {/* Floating cards */}
          <div className="hidden lg:block absolute right-10 top-20">
            <FloatingIcon delay={0.5} duration={5}>
              <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 shadow-lg w-48">
                <p className="text-sm font-medium text-destructive">❌ Old Way</p>
                <p className="text-xs text-muted-foreground mt-1">Endless to-do lists, cramming, stress...</p>
              </div>
            </FloatingIcon>
          </div>
          
          <div className="hidden lg:block absolute left-10 bottom-32">
            <FloatingIcon delay={1} duration={5.5}>
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 shadow-lg w-48">
                <p className="text-sm font-medium text-primary">✨ Vistara Way</p>
                <p className="text-xs text-muted-foreground mt-1">Smart planning, balanced life, confidence!</p>
              </div>
            </FloatingIcon>
          </div>

          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
                How it works
              </h2>
              <p className="text-xl text-muted-foreground">
                Three steps to stress-free revision
              </p>
            </motion.div>

            {/* Steps with connecting lines */}
            <div className="relative">
              {/* SVG Connecting Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block" viewBox="0 0 1000 200">
                <AnimatedConnectionLine 
                  path="M 200 100 Q 350 50 500 100" 
                  color="hsl(var(--primary) / 0.4)" 
                  delay={0.5} 
                />
                <AnimatedConnectionLine 
                  path="M 500 100 Q 650 150 800 100" 
                  color="hsl(var(--secondary) / 0.4)" 
                  delay={1} 
                />
              </svg>

              <div className="grid md:grid-cols-3 gap-8 relative z-10">
                {[
                  {
                    step: "1",
                    title: "Add your subjects",
                    desc: "Tell us what you're studying, upcoming tests, and when you're free.",
                    icon: <Calendar className="w-6 h-6" />,
                    color: "primary",
                  },
                  {
                    step: "2",
                    title: "Get your plan",
                    desc: "AI creates a personalized schedule around football, family, and life.",
                    icon: <Brain className="w-6 h-6" />,
                    color: "secondary",
                  },
                  {
                    step: "3",
                    title: "Track & improve",
                    desc: "Complete sessions, reflect, and watch your confidence grow.",
                    icon: <Target className="w-6 h-6" />,
                    color: "accent",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 50, rotateY: -15 }}
                    whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2, type: "spring", stiffness: 100 }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className="relative"
                  >
                    <Card className="h-full bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-t-4"
                      style={{ borderTopColor: `hsl(var(--${item.color}))` }}
                    >
                      <CardContent className="p-6">
                        <motion.div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4"
                          style={{ background: `hsl(var(--${item.color}))` }}
                          whileHover={{ scale: 1.15, rotate: 10 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          {item.step}
                        </motion.div>
                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                        <p className="text-muted-foreground">{item.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Timetable Creation Section */}
        <TimetableCreationSection />

        {/* 3D Feature Carousel */}
        <Card3DCarousel />

        {/* Floating UI Showcase Section */}
        <section ref={featuresRef} className="py-24 px-6 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Everything you need to{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  succeed
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed specifically for students
              </p>
            </motion.div>

            {/* Floating UI Cards with Enhanced Connections */}
            <div className="relative min-h-[700px] hidden lg:block">
              {/* SVG Connection Lines with Glow */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 1000 700">
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <AnimatedConnectionLine 
                  path="M 250 150 Q 400 100 500 180" 
                  color="hsl(var(--primary) / 0.4)" 
                  delay={0.5} 
                />
                <AnimatedConnectionLine 
                  path="M 750 150 Q 600 100 500 180" 
                  color="hsl(var(--secondary) / 0.4)" 
                  delay={0.7} 
                />
                <AnimatedConnectionLine 
                  path="M 500 280 Q 500 350 300 420" 
                  color="hsl(var(--accent) / 0.4)" 
                  delay={0.9} 
                />
                <AnimatedConnectionLine 
                  path="M 500 280 Q 500 350 700 420" 
                  color="hsl(var(--primary) / 0.4)" 
                  delay={1.1} 
                />
                <AnimatedConnectionLine 
                  path="M 300 520 Q 500 600 700 520" 
                  color="hsl(var(--secondary) / 0.4)" 
                  delay={1.3} 
                />
              </svg>

              {/* Welcome Dashboard Card - Top Left */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="absolute left-0 top-0 z-10"
              >
                <MouseFollowCard glowColor="190 70% 50%">
                  <FloatingIcon delay={0} duration={5}>
                    <Card className="w-72 bg-card shadow-xl border-t-4 border-t-primary">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                            A
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Welcome back</p>
                            <p className="font-bold">Abhiram!</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Zap className="w-4 h-4 text-primary" />
                            <span className="font-medium">12 day streak</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-accent" />
                            <span>Level 5</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </FloatingIcon>
                </MouseFollowCard>
              </motion.div>

              {/* Streak Tracker Card - Top Right */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="absolute right-0 top-0 z-10"
              >
                <MouseFollowCard glowColor="155 60% 52%">
                  <FloatingIcon delay={0.5} duration={4.5}>
                    <Card className="w-64 bg-card shadow-xl border-t-4 border-t-secondary">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-secondary" />
                          </div>
                          <span className="font-bold text-sm">Weekly Progress</span>
                        </div>
                        <div className="flex gap-1 mb-2">
                          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                            <motion.div 
                              key={i} 
                              className="flex flex-col items-center gap-1"
                              initial={{ scale: 0 }}
                              whileInView={{ scale: 1 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.5 + i * 0.1 }}
                            >
                              <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${i < 5 ? 'bg-secondary text-white' : 'bg-muted'}`}>
                                {i < 5 ? '✓' : ''}
                              </div>
                              <span className="text-[10px] text-muted-foreground">{day}</span>
                            </motion.div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">5/7 days completed</p>
                      </CardContent>
                    </Card>
                  </FloatingIcon>
                </MouseFollowCard>
              </motion.div>

              {/* Central Timetable Preview - Center */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute left-1/2 top-32 -translate-x-1/2 z-20"
              >
                <MouseFollowCard glowColor="190 70% 50%" tiltAmount={5}>
                  <FloatingIcon delay={0.2} duration={6}>
                    <Card className="w-80 bg-card shadow-2xl border-2 border-primary/30">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            Today's Schedule
                          </CardTitle>
                          <span className="text-xs text-muted-foreground">3 sessions</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {[
                          { time: "9:00", period: "AM", subject: "Mathematics", topic: "Calculus - Integration", color: "primary", done: true },
                          { time: "2:00", period: "PM", subject: "Physics", topic: "Waves - Interference", color: "secondary", done: false },
                          { time: "5:30", period: "PM", subject: "Chemistry", topic: "Organic - Alkenes", color: "accent", done: false },
                        ].map((session, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                            className={`flex items-center gap-3 p-2 rounded-lg bg-${session.color}/5 border-l-3 border-l-${session.color}`}
                            style={{ borderLeftColor: `hsl(var(--${session.color}))`, backgroundColor: `hsl(var(--${session.color}) / 0.05)` }}
                          >
                            <div className="text-center">
                              <p className="text-xs font-bold">{session.time}</p>
                              <p className="text-[10px] text-muted-foreground">{session.period}</p>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{session.subject}</p>
                              <p className="text-xs text-muted-foreground">{session.topic}</p>
                            </div>
                            {session.done ? (
                              <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />
                            ) : (
                              <Clock className="w-4 h-4 text-muted-foreground ml-auto" />
                            )}
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
                  </FloatingIcon>
                </MouseFollowCard>
              </motion.div>

              {/* Session Timer Card - Bottom Left */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="absolute left-8 bottom-24 z-10"
              >
                <MouseFollowCard glowColor="42 85% 58%">
                  <FloatingIcon delay={1} duration={5.5}>
                    <Card className="w-56 bg-card shadow-xl border-l-4 border-l-accent">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-accent" />
                          </div>
                          <span className="font-bold text-sm">Focus Timer</span>
                        </div>
                        <div className="text-center py-2">
                          <p className="text-3xl font-mono font-bold text-primary">23:45</p>
                          <p className="text-xs text-muted-foreground mt-1">Remaining</p>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-primary to-secondary"
                            initial={{ width: '0%' }}
                            whileInView={{ width: '65%' }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, delay: 1 }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </FloatingIcon>
                </MouseFollowCard>
              </motion.div>

              {/* Reflection Card - Bottom Right */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="absolute right-8 bottom-24 z-10"
              >
                <MouseFollowCard glowColor="190 70% 50%">
                  <FloatingIcon delay={1.5} duration={4}>
                    <Card className="w-60 bg-card shadow-xl border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-bold text-sm">Session Feedback</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">How did your session go?</p>
                        <div className="flex gap-2">
                          {['😊', '😐', '😓'].map((emoji, i) => (
                            <motion.button
                              key={i}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${i === 0 ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted'}`}
                            >
                              {emoji}
                            </motion.button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </FloatingIcon>
                </MouseFollowCard>
              </motion.div>

              {/* Exam Countdown Card - Bottom Center */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1 }}
                className="absolute left-1/2 bottom-0 -translate-x-1/2 z-10"
              >
                <MouseFollowCard glowColor="155 60% 52%">
                  <FloatingIcon delay={2} duration={5}>
                    <Card className="w-64 bg-gradient-to-br from-card to-secondary/5 shadow-xl border-t-4 border-t-secondary">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                            <Target className="w-4 h-4 text-secondary" />
                          </div>
                          <span className="font-bold text-sm">Next Exam</span>
                        </div>
                        <p className="font-medium">Physics Paper 1</p>
                        <div className="flex items-center gap-2 mt-2">
                          <motion.span 
                            className="text-2xl font-bold text-secondary"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            5
                          </motion.span>
                          <span className="text-sm text-muted-foreground">days remaining</span>
                        </div>
                      </CardContent>
                    </Card>
                  </FloatingIcon>
                </MouseFollowCard>
              </motion.div>
            </div>

            {/* Mobile Grid Fallback */}
            <div className="grid md:grid-cols-2 gap-6 lg:hidden">
              {[
                { icon: Brain, title: "AI-Powered Planning", desc: "Smart algorithms create optimal study schedules.", color: "primary" },
                { icon: RefreshCw, title: "Adaptive Rescheduling", desc: "Missed a session? AI adjusts your plan.", color: "secondary" },
                { icon: BarChart3, title: "Progress Analytics", desc: "Track confidence and improvement.", color: "accent" },
                { icon: MessageSquare, title: "Session Reflections", desc: "Quick feedback helps AI understand you.", color: "primary" },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full border-l-4" style={{ borderLeftColor: `hsl(var(--${feature.color}))` }}>
                    <CardContent className="p-5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `hsl(var(--${feature.color}) / 0.1)` }}>
                        <feature.icon className="w-5 h-5" style={{ color: `hsl(var(--${feature.color}))` }} />
                      </div>
                      <h3 className="font-bold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section id="try-demo" className="py-24 px-6 bg-gradient-to-b from-background to-muted/50">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Try it yourself
              </h2>
              <p className="text-xl text-muted-foreground">
                See what a day with Vistara looks like
              </p>
            </motion.div>

            <InteractiveTimetableDemo onArrowClick={() => setShowComingSoon(true)} />
          </div>
        </section>

        {/* Stats Section with Animated Counters */}
        <section className="py-20 px-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: 10000, suffix: "+", label: "Students", icon: Users },
                { value: 50000, suffix: "+", label: "Sessions Completed", icon: CheckCircle2 },
                { value: 95, suffix: "%", label: "Stick to Plans", icon: Target },
                { value: 4.9, suffix: "★", label: "User Rating", icon: Star, isDecimal: true },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, type: "spring" }}
                  className="text-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-12 h-12 rounded-full bg-background/80 flex items-center justify-center mx-auto mb-3 shadow-lg"
                  >
                    <stat.icon className="w-6 h-6 text-primary" />
                  </motion.div>
                  <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {stat.isDecimal ? (
                      <span>{stat.value}{stat.suffix}</span>
                    ) : (
                      <AnimatedCounter 
                        target={stat.value} 
                        suffix={stat.suffix}
                        duration={2000}
                      />
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100 }}
              className="relative bg-gradient-to-br from-card to-primary/5 border border-border rounded-3xl p-10 shadow-xl"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0, rotate: -180 }}
                      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                    >
                      <Star className="w-5 h-5 fill-accent text-accent" />
                    </motion.div>
                  ))}
                </div>
                <blockquote className="text-xl md:text-2xl font-display font-medium leading-relaxed mb-6">
                  "I had 6 tests in 3 weeks and felt completely lost. Now I have a plan that actually works around my football practice!"
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                    A
                  </div>
                  <div>
                    <p className="font-semibold">Abhiram K.</p>
                    <p className="text-sm text-muted-foreground">Year 10 Student</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Success Stories Section */}
        <SuccessStoriesSection />

        {/* Why Students Love Us */}
        <WhyStudentsLoveUs />

        {/* Before/After Section */}
        <BeforeAfterSection />

        {/* BlurtAI Integration Section */}
        <BlurtAIIntegration onTryClick={() => setShowComingSoon(true)} />

        {/* Pricing Section with Enhanced Hover */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Simple pricing
              </h2>
              <p className="text-xl text-muted-foreground">
                Start free, upgrade when you need more
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group"
              >
                <Card className="h-full bg-card/80 backdrop-blur-sm group-hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-2xl">Free</CardTitle>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">£0</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <CardDescription>Perfect to get started</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {["1 timetable", "1 daily regeneration", "Basic insights", "Session tracking"].map((item, i) => (
                        <motion.li 
                          key={i} 
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 + 0.2, type: "spring" }}
                          >
                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                          </motion.div>
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <RippleButton
                      variant="outline"
                      onClick={() => navigate("/auth")}
                      className="w-full mt-6"
                      rippleColor="rgba(0, 0, 0, 0.1)"
                    >
                      Get Started
                    </RippleButton>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Premium Plan */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -12, transition: { duration: 0.2 } }}
                className="relative group"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <motion.span 
                    className="bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Popular
                  </motion.span>
                </div>
                <Card className="h-full border-primary/50 bg-gradient-to-br from-card to-primary/5 group-hover:shadow-2xl group-hover:border-primary transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Premium
                    </CardTitle>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">£5</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <CardDescription>For serious students</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {["Unlimited timetables", "Unlimited regenerations", "Advanced AI insights", "Priority support", "Early access"].map((item, i) => (
                        <motion.li 
                          key={i} 
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 + 0.2, type: "spring" }}
                          >
                            <Sparkles className="w-5 h-5 text-primary shrink-0" />
                          </motion.div>
                          <span className="font-medium">{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <RippleButton
                      onClick={() => navigate("/auth")}
                      className="w-full mt-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    >
                      Upgrade Now
                    </RippleButton>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection />

        {/* Final CTA with Gradient Shift */}
        <section className="py-24 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center space-y-8 p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-primary/20 relative overflow-hidden"
          >
            <motion.div 
              className="absolute inset-0"
              animate={{
                background: [
                  "linear-gradient(135deg, hsl(190 70% 50% / 0.1) 0%, hsl(155 60% 52% / 0.1) 50%, hsl(42 85% 58% / 0.1) 100%)",
                  "linear-gradient(135deg, hsl(155 60% 52% / 0.1) 0%, hsl(42 85% 58% / 0.1) 50%, hsl(190 70% 50% / 0.1) 100%)",
                  "linear-gradient(135deg, hsl(42 85% 58% / 0.1) 0%, hsl(190 70% 50% / 0.1) 50%, hsl(155 60% 52% / 0.1) 100%)",
                  "linear-gradient(135deg, hsl(190 70% 50% / 0.1) 0%, hsl(155 60% 52% / 0.1) 50%, hsl(42 85% 58% / 0.1) 100%)",
                ]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute top-0 right-0 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />

            <div className="relative z-10 space-y-6">
              <motion.h2 
                className="text-4xl md:text-5xl font-display font-bold"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Ready to study smarter?
              </motion.h2>
              <motion.p 
                className="text-xl text-muted-foreground max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                Join students who've stopped stressing and started succeeding.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <RippleButton
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="text-lg px-10 py-7 bg-gradient-to-r from-primary to-secondary hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg group rounded-full"
                >
                  Create your plan — it's free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </RippleButton>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t bg-card/50">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold">Vistara</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>

            <p className="text-sm text-muted-foreground">
              © 2025 Vistara. Made with <Heart className="w-4 h-4 inline text-secondary" /> for students
            </p>
          </div>
        </footer>

        {/* Back to Top Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: showBackToTop ? 1 : 0, scale: showBackToTop ? 1 : 0 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center z-50 hover:bg-primary/90 transition-colors"
        >
          <ChevronUp className="w-6 h-6" />
        </motion.button>

        {/* Coming Soon Dialog */}
        <ComingSoonDialog isOpen={showComingSoon} onClose={() => setShowComingSoon(false)} />
      </div>
    </PageTransition>
  );
};

export default Landing;
