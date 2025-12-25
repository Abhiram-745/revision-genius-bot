import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Zap, Infinity as InfinityIcon, Brain, Calendar, ChevronRight } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

export const PremiumUpgradeCTA = () => {
  const navigate = useNavigate();
  const { data: userRole, isLoading } = useUserRole();

  // Don't show for premium users or while loading
  if (isLoading || userRole === "paid") {
    return null;
  }

  const benefits = [
    { icon: InfinityIcon, text: "Unlimited timetables" },
    { icon: Brain, text: "AI-powered insights" },
    { icon: Calendar, text: "Advanced scheduling" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-violet-600/20 via-purple-600/10 to-fuchsia-600/20 shadow-xl">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-br from-purple-500/30 to-violet-500/30 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>

        <CardContent className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Left side - Icon and text */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <motion.div
                  className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Crown className="h-8 w-8 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                    Go Premium
                  </h3>
                  <p className="text-muted-foreground text-sm">Unlock your full potential</p>
                </div>
              </div>

              {/* Benefits list */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-background/50 backdrop-blur-sm border border-violet-500/20"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <benefit.icon className="h-4 w-4 text-violet-400" />
                    <span className="text-sm font-medium">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>

              <p className="text-muted-foreground max-w-md">
                Supercharge your study sessions with unlimited features, personalized AI coaching, and advanced analytics.
              </p>
            </div>

            {/* Right side - CTA */}
            <div className="flex flex-col items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  onClick={() => navigate("/pricing")}
                  className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25 text-white px-8 py-6 text-lg"
                >
                  <Sparkles className="h-5 w-5" />
                  Upgrade Now
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </motion.div>
              <p className="text-xs text-muted-foreground">
                <Zap className="h-3 w-3 inline mr-1" />
                Special launch pricing available
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PremiumUpgradeCTA;
