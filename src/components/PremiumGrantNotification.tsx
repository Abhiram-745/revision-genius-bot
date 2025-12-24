import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, X } from "lucide-react";
import confetti from "canvas-confetti";
import OwlMascot from "@/components/mascot/OwlMascot";

interface PremiumGrantNotificationProps {
  show: boolean;
  onClose: () => void;
}

const PremiumGrantNotification = ({ show, onClose }: PremiumGrantNotificationProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      // Trigger confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FFD700', '#FFA500', '#FF6347', '#9333EA', '#3B82F6'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FFD700', '#FFA500', '#FF6347', '#9333EA', '#3B82F6'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [show]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <Card className="w-full max-w-md border-2 border-primary/30 shadow-2xl bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden">
              <CardContent className="p-6 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </Button>

                <div className="flex flex-col items-center text-center space-y-4">
                  <motion.div
                    animate={{ 
                      rotate: [0, -10, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 0.6,
                      repeat: 2,
                      repeatDelay: 0.5
                    }}
                    className="relative"
                  >
                    <OwlMascot type="happy" size="lg" />
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-2 -right-2"
                    >
                      <Crown className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                    </motion.div>
                  </motion.div>

                  <div className="space-y-2">
                    <motion.h2 
                      className="text-2xl font-bold font-display gradient-text"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      🎉 Welcome to Premium!
                    </motion.h2>
                    <motion.p 
                      className="text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      You've unlocked <span className="font-semibold text-primary">2 months</span> of free Premium access as an early supporter!
                    </motion.p>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="w-full space-y-3 pt-2"
                  >
                    <div className="bg-primary/10 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span>Unlimited timetable generations</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span>Unlimited AI insights</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span>Full access to all features</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Your premium access will expire in 2 months. Enjoy! 🚀
                    </p>
                  </motion.div>

                  <Button 
                    onClick={handleClose}
                    className="w-full bg-gradient-primary hover:opacity-90"
                  >
                    Start Studying!
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PremiumGrantNotification;
