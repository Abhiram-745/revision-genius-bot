import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Zap, Shield, Clock, Brain, Heart, Sparkles 
} from "lucide-react";
import laughingOwl from "@/assets/laughing-owl.png";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast Setup",
    description: "Create your personalized study plan in under 2 minutes",
    color: "primary",
    delay: 0,
  },
  {
    icon: Brain,
    title: "Learns Your Style",
    description: "AI adapts to when you focus best and what needs work",
    color: "secondary",
    delay: 0.1,
  },
  {
    icon: Clock,
    title: "Respects Your Life",
    description: "Football, family, friends — we schedule around it all",
    color: "accent",
    delay: 0.2,
  },
  {
    icon: Shield,
    title: "No More Overwhelm",
    description: "Small, focused sessions that actually stick",
    color: "primary",
    delay: 0.3,
  },
  {
    icon: Heart,
    title: "Built With Care",
    description: "Made by students who've been in your shoes",
    color: "secondary",
    delay: 0.4,
  },
  {
    icon: Sparkles,
    title: "Actually Works",
    description: "95% of users stick to their plans for the first time",
    color: "accent",
    delay: 0.5,
  },
];

const WhyStudentsLoveUs = () => {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      
      {/* Laughing Owl Mascot */}
      <motion.img
        src={laughingOwl}
        alt="Happy owl mascot"
        className="absolute bottom-8 left-4 md:left-8 w-36 h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 object-contain drop-shadow-xl z-10"
        initial={{ opacity: 0, y: 30, rotate: -10 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            Why students love us
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Study smarter,{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              not harder
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to transform exam stress into exam success
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                delay: feature.delay, 
                type: "spring", 
                stiffness: 100,
                damping: 15 
              }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group"
            >
              <Card className="h-full bg-card/80 backdrop-blur-sm border-2 border-transparent hover:border-primary/20 transition-all duration-300 overflow-hidden">
                <CardContent className="p-6 relative">
                  {/* Hover glow effect */}
                  <motion.div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ 
                      background: `radial-gradient(circle at center, hsl(var(--${feature.color}) / 0.1) 0%, transparent 70%)` 
                    }}
                  />
                  
                  <motion.div
                    className={`w-14 h-14 rounded-2xl bg-${feature.color}/10 flex items-center justify-center mb-4 relative z-10`}
                    style={{ backgroundColor: `hsl(var(--${feature.color}) / 0.1)` }}
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: feature.delay }}
                    >
                      <feature.icon 
                        className="w-7 h-7" 
                        style={{ color: `hsl(var(--${feature.color}))` }}
                      />
                    </motion.div>
                  </motion.div>
                  
                  <h3 className="text-lg font-display font-bold mb-2 relative z-10">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground relative z-10">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyStudentsLoveUs;
