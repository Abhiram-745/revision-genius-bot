import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { X, Check, AlertTriangle, Frown, Smile, ArrowRight } from "lucide-react";

const BeforeAfterSection = () => {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-destructive/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl -translate-y-1/2" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Life before vs after{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Vistara
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            See the difference a smart study plan makes
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* Before Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <Card className="h-full border-destructive/30 bg-gradient-to-br from-destructive/5 to-card relative overflow-hidden group">
              <div className="absolute top-4 right-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Frown className="w-8 h-8 text-destructive/60" />
                </motion.div>
              </div>
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-destructive">Before</h3>
                    <p className="text-sm text-muted-foreground">The struggle is real</p>
                  </div>
                </div>

                <ul className="space-y-4">
                  {[
                    "Endless to-do lists that never get done",
                    "Last-minute cramming sessions",
                    "Constant anxiety about exams",
                    "Missing football practice to study",
                    "Feeling overwhelmed every single day",
                    "Guessing what to revise next",
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 + 0.2, type: "spring" }}
                        className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center shrink-0 mt-0.5"
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </motion.div>
                      <span className="text-muted-foreground line-through decoration-destructive/40">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Arrow between (mobile hidden) */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, type: "spring" }}
            className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
              <ArrowRight className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          {/* After Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
          >
            <Card className="h-full border-secondary/30 bg-gradient-to-br from-secondary/5 to-card relative overflow-hidden group">
              <div className="absolute top-4 right-4">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Smile className="w-8 h-8 text-secondary/60" />
                </motion.div>
              </div>
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <motion.div 
                    className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center"
                    animate={{ boxShadow: ["0 0 0 0 hsl(var(--secondary) / 0.3)", "0 0 0 10px hsl(var(--secondary) / 0)", "0 0 0 0 hsl(var(--secondary) / 0)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Check className="w-6 h-6 text-secondary" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-secondary">After</h3>
                    <p className="text-sm text-muted-foreground">Finally in control</p>
                  </div>
                </div>

                <ul className="space-y-4">
                  {[
                    "Clear daily schedule that actually works",
                    "Consistent revision spread over time",
                    "Confidence going into every exam",
                    "Time for sports, friends, and life",
                    "Calm, focused study sessions",
                    "AI tells you exactly what to study next",
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 + 0.3 }}
                      className="flex items-start gap-3"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 + 0.5, type: "spring" }}
                        className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-0.5"
                      >
                        <Check className="w-4 h-4 text-secondary" />
                      </motion.div>
                      <span className="font-medium">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfterSection;
