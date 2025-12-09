import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Calendar, Brain, Target, Users, Clock, Sparkles, ArrowRight, CheckCircle2, Star, Heart, Zap, Laptop } from "lucide-react";
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

              {/* Subheadline - shorter */}
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

              {/* Social proof - minimal */}
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
        <section className="py-16 px-6 border-y border-border/50 bg-muted/30">
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

        {/* How It Works - Simplified */}
        <section className="py-24 px-6">
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
                  className="relative"
                >
                  <Card className="h-full bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 border-t-4"
                    style={{ borderTopColor: `hsl(var(--${item.color}))` }}
                  >
                    <CardContent className="p-6">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4"
                        style={{ background: `hsl(var(--${item.color}))` }}
                      >
                        {item.step}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section id="try-demo" className="py-24 px-6 bg-gradient-to-b from-muted/50 to-background">
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

        {/* Testimonial - Single */}
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
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
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

        {/* Pricing Section - Simplified */}
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
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
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
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                          <span>{item}</span>
                        </li>
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
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold px-4 py-1.5 rounded-full">
                    Popular
                  </span>
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
                        <li key={i} className="flex items-center gap-3">
                          <Sparkles className="w-5 h-5 text-primary shrink-0" />
                          <span className="font-medium">{item}</span>
                        </li>
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

        {/* Final CTA - Simplified */}
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
              <h2 className="text-4xl md:text-5xl font-display font-bold">
                Ready to study smarter?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join students who've stopped stressing and started succeeding.
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="text-lg px-10 py-7 bg-gradient-to-r from-primary to-secondary hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg group rounded-full"
              >
                Create your plan — it's free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Footer - Minimal */}
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
