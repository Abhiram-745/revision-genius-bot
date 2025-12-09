import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Bell, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ComingSoonDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ComingSoonDialog = ({ isOpen, onClose }: ComingSoonDialogProps) => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        onClose();
        setSubscribed(false);
        setEmail("");
      }, 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-card border border-border rounded-3xl shadow-2xl overflow-hidden">
              {/* Gradient header */}
              <div className="bg-gradient-to-r from-primary via-secondary to-accent p-8 relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-5 -left-5 w-20 h-20 bg-white/10 rounded-full"
                />
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>

                <div className="relative z-10 text-center">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-16 h-16 text-white mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-display font-bold text-white mb-2">
                    Coming Soon!
                  </h3>
                  <p className="text-white/80">
                    The BlurtAI integration is currently in development
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {subscribed ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Bell className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-lg font-semibold text-primary">You're on the list!</p>
                    <p className="text-muted-foreground mt-2">We'll notify you when it launches.</p>
                  </motion.div>
                ) : (
                  <>
                    <p className="text-muted-foreground text-center mb-6">
                      We're building a seamless integration between Vistara and BlurtAI. 
                      Get notified when it's ready!
                    </p>

                    <form onSubmit={handleSubscribe} className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-11"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                        <Bell className="mr-2 w-4 h-4" />
                        Notify Me
                      </Button>
                    </form>

                    <p className="text-xs text-muted-foreground text-center mt-4">
                      No spam, just one notification when we launch.
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ComingSoonDialog;
