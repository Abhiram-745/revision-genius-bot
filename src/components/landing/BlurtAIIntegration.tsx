import { motion } from "framer-motion";
import { ArrowRight, Brain, Zap, Target, BookOpen, RefreshCw, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface BlurtAIIntegrationProps {
  onTryClick: () => void;
}

const BlurtAIIntegration = ({ onTryClick }: BlurtAIIntegrationProps) => {
  return (
    <section className="py-24 px-6 bg-gradient-to-br from-muted/50 via-background to-primary/5 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-80 h-80 border border-primary/10 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-20 -left-20 w-60 h-60 border border-secondary/10 rounded-full"
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
            <Zap className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">Powerful Integration</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Supercharge with{" "}
            <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              BlurtAI
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Combine Vistara's smart scheduling with BlurtAI's active recall techniques for the ultimate revision experience.
          </p>
        </motion.div>

        {/* Integration Flow */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">1. Plan with Vistara</h3>
                <p className="text-muted-foreground">
                  Let Vistara create your personalized study timetable, scheduling sessions around your life.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full bg-card/80 backdrop-blur-sm border-secondary/20 hover:border-secondary/40 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-2">2. Learn with BlurtAI</h3>
                <p className="text-muted-foreground">
                  During study sessions, use BlurtAI's "blurting" technique to actively recall and reinforce knowledge.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full bg-card/80 backdrop-blur-sm border-accent/20 hover:border-accent/40 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <RefreshCw className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2">3. Optimize Together</h3>
                <p className="text-muted-foreground">
                  Your progress syncs to identify weak topics, automatically adjusting future schedules.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* BlurtAI Preview Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          <Card className="bg-gradient-to-br from-card via-card to-secondary/5 border-secondary/30 shadow-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2">
                {/* Left side - BlurtAI description */}
                <div className="p-8 md:p-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">BlurtAI</h3>
                      <p className="text-sm text-muted-foreground">Active Recall Platform</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-secondary">✓</span>
                      </div>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">3x more effective</span> than re-reading notes using proven blurting techniques
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-secondary">✓</span>
                      </div>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">AQA GCSE aligned</span> content for Chemistry, Physics, Biology & Maths
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-secondary">✓</span>
                      </div>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Instant feedback</span> on keywords remembered vs. missed
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={onTryClick}
                      className="bg-gradient-to-r from-secondary to-accent hover:opacity-90 transition-all group"
                    >
                      <Sparkles className="mr-2 w-4 h-4" />
                      Try Integration
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button 
                      variant="outline"
                      asChild
                    >
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
                </div>

                {/* Right side - Visual representation */}
                <div className="bg-gradient-to-br from-emerald-500/10 to-teal-600/10 p-8 md:p-12 flex items-center justify-center">
                  <div className="relative w-full max-w-sm">
                    {/* BlurtAI Card Mock */}
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="bg-card rounded-2xl border border-border shadow-xl p-6"
                    >
                      <div className="text-sm font-medium text-muted-foreground mb-3">Topic: Cell Division</div>
                      <div className="bg-muted/50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-foreground/80 italic">
                          "Mitosis is the process of cell division that results in two daughter cells with identical chromosomes..."
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <span className="text-emerald-600 font-bold text-sm">85%</span>
                          </div>
                          <span className="text-xs text-muted-foreground">Recall Score</span>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
                          +12 keywords
                        </span>
                      </div>
                    </motion.div>

                    {/* Connection line */}
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -left-8 top-1/2 w-8 h-px bg-gradient-to-r from-primary to-secondary"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default BlurtAIIntegration;
