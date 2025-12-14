import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { X, Check, AlertTriangle, Frown, Smile, ArrowRight, ArrowDown } from "lucide-react";
import happyOwl from "@/assets/happy-owl.png";
import { useIsMobile } from "@/hooks/use-mobile";

const BeforeAfterSection = () => {
  const isMobile = useIsMobile();
  
  return (
    <section className="py-12 md:py-24 px-4 md:px-6 relative overflow-hidden">
      {/* Background blobs - hidden on mobile */}
      {!isMobile && (
        <>
          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-destructive/5 rounded-full blur-3xl -translate-y-1/2" />
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl -translate-y-1/2" />
        </>
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold mb-2 md:mb-4">
            Life before vs after{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Vistara
            </span>
          </h2>
          <p className="text-sm md:text-xl text-muted-foreground">
            See the difference a smart study plan makes
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-8 lg:gap-12 items-stretch">
          {/* Before Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <Card className="h-full border-destructive/30 bg-gradient-to-br from-destructive/5 to-card relative overflow-hidden">
              <div className="absolute top-3 right-3 md:top-4 md:right-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Frown className="w-6 h-6 md:w-8 md:h-8 text-destructive/60" />
                </motion.div>
              </div>
              <CardContent className="p-4 md:p-8">
                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-display font-bold text-destructive">Before</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">The struggle is real</p>
                  </div>
                </div>

                <ul className="space-y-2 md:space-y-4">
                  {[
                    "Endless to-do lists that never get done",
                    "Last-minute cramming sessions",
                    "Constant anxiety about exams",
                    "Missing sports to study",
                    "Feeling overwhelmed daily",
                    "Guessing what to revise next",
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-2 md:gap-3"
                    >
                      <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-destructive/20 flex items-center justify-center shrink-0 mt-0.5">
                        <X className="w-3 h-3 md:w-4 md:h-4 text-destructive" />
                      </div>
                      <span className="text-xs md:text-base text-muted-foreground line-through decoration-destructive/40">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Arrow between - visible on both mobile and desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, type: "spring" }}
            className="flex md:hidden justify-center -my-2 z-20"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
              <ArrowDown className="w-5 h-5 text-white" />
            </div>
          </motion.div>

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
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
          >
            <Card className="h-full border-secondary/30 bg-gradient-to-br from-secondary/5 to-card relative overflow-hidden">
              {/* Happy Owl peeking from bottom right - smaller on mobile */}
              <motion.img
                src={happyOwl}
                alt=""
                className={`absolute -right-4 -bottom-4 md:-right-8 md:-bottom-8 ${
                  isMobile ? 'w-20 h-20' : 'w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48'
                } object-contain z-20 pointer-events-none drop-shadow-xl`}
                initial={{ opacity: 0, y: 20, x: 10 }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, type: "spring", stiffness: 80 }}
              />

              <div className="absolute top-3 right-3 md:top-4 md:right-4">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Smile className="w-6 h-6 md:w-8 md:h-8 text-secondary/60" />
                </motion.div>
              </div>
              <CardContent className="p-4 md:p-8">
                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                  <motion.div 
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-secondary/10 flex items-center justify-center"
                    animate={{ boxShadow: ["0 0 0 0 hsl(var(--secondary) / 0.3)", "0 0 0 8px hsl(var(--secondary) / 0)", "0 0 0 0 hsl(var(--secondary) / 0)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Check className="w-5 h-5 md:w-6 md:h-6 text-secondary" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-display font-bold text-secondary">After</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">Finally in control</p>
                  </div>
                </div>

                <ul className="space-y-2 md:space-y-4">
                  {[
                    "Clear daily schedule that works",
                    "Consistent revision over time",
                    "Confidence going into exams",
                    "Time for sports & friends",
                    "Calm, focused study sessions",
                    "AI tells you what to study next",
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 + 0.2 }}
                      className="flex items-start gap-2 md:gap-3"
                    >
                      <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 md:w-4 md:h-4 text-secondary" />
                      </div>
                      <span className="text-xs md:text-base font-medium">{item}</span>
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