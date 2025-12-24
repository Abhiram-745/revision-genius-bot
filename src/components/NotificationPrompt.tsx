import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { OwlMascot } from "@/components/mascot/OwlMascot";

interface NotificationPromptProps {
  onClose?: () => void;
  variant?: "modal" | "inline" | "banner";
}

export const NotificationPrompt = ({ onClose, variant = "modal" }: NotificationPromptProps) => {
  const { isSupported, isSubscribed, subscribe, isLoading } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);

  if (!isSupported || isSubscribed || dismissed) {
    return null;
  }

  const handleEnable = async () => {
    await subscribe();
    onClose?.();
  };

  const handleDismiss = () => {
    setDismissed(true);
    onClose?.();
  };

  if (variant === "banner") {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-secondary text-white py-3 px-4 shadow-lg"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 animate-bounce" />
              <span className="text-sm font-medium">
                Enable notifications to get study reminders and updates!
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleEnable}
                disabled={isLoading}
                className="bg-white text-primary hover:bg-white/90"
              >
                {isLoading ? "Enabling..." : "Enable"}
              </Button>
              <button
                onClick={handleDismiss}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (variant === "inline") {
    return (
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <OwlMascot type="waving" size="sm" animate />
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Stay on track!</h4>
              <p className="text-xs text-muted-foreground">
                Get reminders for your study sessions
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleEnable}
              disabled={isLoading}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              <Bell className="w-4 h-4 mr-1" />
              {isLoading ? "..." : "Enable"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Modal variant
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={handleDismiss}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="w-full max-w-sm overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white text-center relative">
              <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1.5 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center mb-4"
              >
                <OwlMascot type="waving" size="lg" animate glow />
              </motion.div>
              <h3 className="text-xl font-bold">Never Miss a Study Session!</h3>
            </div>
            <CardContent className="p-6 space-y-4">
              <p className="text-center text-muted-foreground">
                Get friendly reminders from Vistari to help you stay on track with your study schedule.
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  "Study session reminders",
                  "Timetable ready notifications",
                  "Streak motivation alerts",
                  "Goal completion celebrations"
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bell className="w-3 h-3 text-primary" />
                    </div>
                    {item}
                  </motion.li>
                ))}
              </ul>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleDismiss}
                  className="flex-1"
                >
                  Maybe Later
                </Button>
                <Button
                  onClick={handleEnable}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary"
                >
                  {isLoading ? "Enabling..." : "Enable Notifications"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationPrompt;
