import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { 
  Calendar, Brain, Target, Users, Clock, Sparkles, ArrowRight, 
  CheckCircle2, Star, Heart, Zap, Laptop, TrendingUp, Award,
  BookOpen, RefreshCw, Shield, Rocket, BarChart3, MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageTransition from "@/components/PageTransition";
import TypewriterText from "@/components/landing/TypewriterText";
import FloatingIcon from "@/components/landing/FloatingIcon";
import InteractiveTimetableDemo from "@/components/landing/InteractiveTimetableDemo";
import BlurtAIIntegration from "@/components/landing/BlurtAIIntegration";
import ComingSoonDialog from "@/components/landing/ComingSoonDialog";

const Landing = () => {
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(false);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  const typewriterPhrases = [
    "exam revision",
    "study planning",
    "time management",
    "staying focused",
    "hitting goals",
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background overflow-hidden">
        {/* Floating background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -30, 0], rotate: [0, 5, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 40, 0], rotate: [0, -5, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-40 right-10 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ y: [0, -20, 0], x: [0, 30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 left-1/3 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
          />
        </div>

        {/* Hero Section */}
        <motion.section
          ref={heroRef}
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative min-h-[85vh] flex items-center justify-center px-6 pt-20 pb-16"
        >
          {/* Floating UI Feature Cards with Arrows */}
          <div className="hidden xl:block absolute left-6 top-24 z-10">
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
            {/* Arrow pointing right */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute -right-16 top-1/2 -translate-y-1/2"
            >
              <svg width="60" height="40" viewBox="0 0 60 40" className="text-primary/40">
                <path d="M0 20 Q30 5 50 20" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M45 15 L55 20 L45 25" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </motion.div>
          </div>

          <div className="hidden xl:block absolute right-6 top-28 z-10">
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
            {/* Arrow pointing down-left */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="absolute -left-12 bottom-0 translate-y-full"
            >
              <svg width="50" height="60" viewBox="0 0 50 60" className="text-secondary/40">
                <path d="M40 0 Q45 30 20 50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M25 45 L18 55 L15 43" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </motion.div>
          </div>

          <div className="hidden xl:block absolute left-12 bottom-36 z-10">
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
            {/* Arrow pointing up-right */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="absolute -right-14 -top-8"
            >
              <svg width="50" height="50" viewBox="0 0 50 50" className="text-accent/40">
                <path d="M10 45 Q15 20 40 10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M35 5 L45 8 L38 16" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </motion.div>
          </div>

          <div className="hidden xl:block absolute right-10 bottom-32 z-10">
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
          </div>

          <div className="relative z-10 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8 text-center"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border border-secondary/30"
              >
                <Zap className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-secondary-foreground">
                  Built by students, for students
                </span>
              </motion.div>

              {/* Main headline with typewriter */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-[1.1]">
                Stop stressing about
                <br />
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  <TypewriterText phrases={typewriterPhrases} />
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                AI-powered study timetables that work around your life.
              </p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
              >
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="text-lg px-10 py-7 bg-gradient-to-r from-primary to-secondary hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg group rounded-full"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    const demoSection = document.getElementById('try-demo');
                    demoSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-lg px-10 py-7 hover:scale-105 transition-all duration-300 rounded-full"
                >
                  <Laptop className="mr-2 w-5 h-5" />
                  Try Demo
                </Button>
              </motion.div>

              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground"
              >
                <span>✓ No credit card</span>
                <span>✓ 2 min setup</span>
                <span>✓ Cancel anytime</span>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Floating Features Strip */}
        <section className="py-16 px-6 border-y border-border/50 bg-muted/30 relative overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Calendar, label: "Smart Scheduling", delay: 0 },
                { icon: Brain, label: "AI Insights", delay: 0.1 },
                { icon: Target, label: "Goal Tracking", delay: 0.2 },
                { icon: Users, label: "Study Groups", delay: 0.3 },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: item.delay }}
                  className="flex flex-col items-center gap-3 text-center"
                >
                  <FloatingIcon delay={item.delay * 2} className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-primary" />
                  </FloatingIcon>
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Problem/Solution Section with Floating Cards */}
        <section className="py-24 px-6 relative">
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

            <div className="grid md:grid-cols-3 gap-8">
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
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="relative"
                >
                  <Card className="h-full bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-t-4"
                    style={{ borderTopColor: `hsl(var(--${item.color}))` }}
                  >
                    <CardContent className="p-6">
                      <motion.div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4"
                        style={{ background: `hsl(var(--${item.color}))` }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
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
        </section>

        {/* Features Deep Dive Section */}
        <section className="py-24 px-6 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
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

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Brain,
                  title: "AI-Powered Planning",
                  desc: "Smart algorithms create optimal study schedules based on your learning patterns.",
                  color: "primary",
                },
                {
                  icon: RefreshCw,
                  title: "Adaptive Rescheduling",
                  desc: "Missed a session? The AI automatically adjusts your plan to keep you on track.",
                  color: "secondary",
                },
                {
                  icon: BarChart3,
                  title: "Progress Analytics",
                  desc: "Track your confidence levels and see your improvement over time.",
                  color: "accent",
                },
                {
                  icon: MessageSquare,
                  title: "Session Reflections",
                  desc: "Quick feedback after each session helps the AI understand your needs.",
                  color: "primary",
                },
                {
                  icon: Users,
                  title: "Study Groups",
                  desc: "Connect with friends, share timetables, and motivate each other.",
                  color: "secondary",
                },
                {
                  icon: Shield,
                  title: "Exam Countdown",
                  desc: "Never forget a test date with smart reminders and preparation tracking.",
                  color: "accent",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <Card className="h-full bg-card/60 backdrop-blur-sm hover:shadow-lg transition-all duration-300 border-l-4"
                    style={{ borderLeftColor: `hsl(var(--${feature.color}))` }}
                  >
                    <CardContent className="p-6">
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                        style={{ backgroundColor: `hsl(var(--${feature.color}) / 0.1)` }}
                      >
                        <feature.icon className="w-6 h-6" style={{ color: `hsl(var(--${feature.color}))` }} />
                      </motion.div>
                      <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
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

        {/* Stats Section */}
        <section className="py-20 px-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "10K+", label: "Students", icon: Users },
                { value: "50K+", label: "Sessions Completed", icon: CheckCircle2 },
                { value: "95%", label: "Stick to Plans", icon: Target },
                { value: "4.9★", label: "User Rating", icon: Star },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, type: "spring" }}
                  className="text-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-12 h-12 rounded-full bg-background/80 flex items-center justify-center mx-auto mb-3"
                  >
                    <stat.icon className="w-6 h-6 text-primary" />
                  </motion.div>
                  <motion.p 
                    className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                  >
                    {stat.value}
                  </motion.p>
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
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative bg-gradient-to-br from-card to-primary/5 border border-border rounded-3xl p-10 shadow-xl"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
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

        {/* BlurtAI Integration Section */}
        <BlurtAIIntegration onTryClick={() => setShowComingSoon(true)} />

        {/* Pricing Section */}
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
                whileHover={{ y: -5 }}
              >
                <Card className="h-full bg-card/80 backdrop-blur-sm">
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
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/auth")}
                      className="w-full mt-6"
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Premium Plan */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="relative"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <motion.span 
                    className="bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold px-4 py-1.5 rounded-full"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Popular
                  </motion.span>
                </div>
                <Card className="h-full border-primary/50 bg-gradient-to-br from-card to-primary/5">
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
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Sparkles className="w-5 h-5 text-primary shrink-0" />
                          <span className="font-medium">{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => navigate("/auth")}
                      className="w-full mt-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    >
                      Upgrade Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center space-y-8 p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-primary/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
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
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="text-lg px-10 py-7 bg-gradient-to-r from-primary to-secondary hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg group rounded-full"
                >
                  Create your plan — it's free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
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

        {/* Coming Soon Dialog */}
        <ComingSoonDialog isOpen={showComingSoon} onClose={() => setShowComingSoon(false)} />
      </div>
    </PageTransition>
  );
};

export default Landing;