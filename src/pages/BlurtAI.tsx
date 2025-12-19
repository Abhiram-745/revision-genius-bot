import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, Sparkles, Target, Zap, BookOpen, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";

const BlurtAI = () => {
  const navigate = useNavigate();
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

  const features = [
    {
      icon: Brain,
      title: "Active Recall",
      description: "The most effective learning technique",
      color: "text-secondary",
    },
    {
      icon: Zap,
      title: "3x More Effective",
      description: "Proven to boost retention",
      color: "text-amber-500",
    },
    {
      icon: Target,
      title: "GCSE Aligned",
      description: "Tailored to your exams",
      color: "text-primary",
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
        <Header />
        
        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-secondary/20 via-secondary/10 to-primary/10 border border-secondary/30 p-6 md:p-8"
          >
            {/* Floating decorations */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-secondary/20 rounded-full blur-2xl" />
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-primary/20 rounded-full blur-xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center shadow-lg">
                  <Brain className="w-8 h-8 md:w-10 md:h-10 text-secondary-foreground" />
                </div>
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    BlurtAI
                  </h1>
                  <Badge variant="secondary" className="bg-secondary/30 text-secondary-foreground border-secondary/50">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI-Powered
                  </Badge>
                </div>
                
                <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
                  Master your revision with active recall. Write everything you know about a topic, 
                  and BlurtAI identifies gaps in your knowledge instantly.
                </p>

                {/* Feature Badges */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                    >
                      <Card className="bg-card/50 border-border/50 hover:border-secondary/50 transition-colors">
                        <CardContent className="flex items-center gap-2 p-3">
                          <feature.icon className={`w-4 h-4 ${feature.color}`} />
                          <div>
                            <p className="text-xs font-medium text-foreground">{feature.title}</p>
                            <p className="text-[10px] text-muted-foreground">{feature.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="flex-shrink-0 w-full md:w-auto">
                <Button
                  size="lg"
                  className="w-full md:w-auto bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-secondary-foreground shadow-lg gap-2"
                  onClick={() => {
                    const iframe = document.getElementById('blurtai-iframe');
                    iframe?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <BookOpen className="w-4 h-4" />
                  Start Revising
                </Button>
              </div>
            </div>
          </motion.div>

          {/* How it Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {[
              { step: "1", title: "Choose a topic", desc: "Pick from your study subjects" },
              { step: "2", title: "Write what you know", desc: "Empty your brain onto the page" },
              { step: "3", title: "Get instant feedback", desc: "AI shows what you missed" },
            ].map((item, index) => (
              <Card key={index} className="bg-card/50 border-border/50 hover:border-primary/30 transition-all hover:shadow-md">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">{item.step}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* BlurtAI Iframe */}
          <motion.div
            id="blurtai-iframe"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative"
          >
            <Card className="overflow-hidden border-secondary/30 shadow-xl">
              <div className="bg-gradient-to-r from-secondary/10 to-primary/10 px-4 py-3 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-medium text-foreground">BlurtAI Practice Session</span>
                </div>
                <a
                  href="https://blurtaigcsee.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  Open in new tab
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              
              <div className="relative" style={{ height: "calc(100vh - 400px)", minHeight: "500px" }}>
                {!isIframeLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-3 border-secondary border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-muted-foreground">Loading BlurtAI...</p>
                    </div>
                  </div>
                )}
                <iframe
                  src="https://blurtaigcsee.vercel.app"
                  className="w-full h-full border-0"
                  title="BlurtAI Practice Session"
                  onLoad={() => setIsIframeLoaded(true)}
                  allow="clipboard-write"
                />
              </div>
            </Card>
          </motion.div>

          {/* Tips Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Pro Tip</p>
                    <p className="text-sm text-muted-foreground">
                      Use BlurtAI after each study session in your timetable. It's the fastest way to identify 
                      what you actually know vs. what you think you know.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </PageTransition>
  );
};

export default BlurtAI;
