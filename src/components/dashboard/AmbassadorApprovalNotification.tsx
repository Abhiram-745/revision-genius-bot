import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, X, PartyPopper, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { triggerConfetti, triggerEmoji } from "@/utils/celebrations";
import owlThumbsup from "@/assets/owl-thumbsup.png";

interface AmbassadorApprovalNotificationProps {
  userId: string;
  onClose: () => void;
}

export const AmbassadorApprovalNotification = ({ userId, onClose }: AmbassadorApprovalNotificationProps) => {
  const [show, setShow] = useState(false);
  const [approvalCount, setApprovalCount] = useState(0);

  useEffect(() => {
    const checkForNewApprovals = async () => {
      if (!userId) return;

      // Check for recently approved ambassador submissions
      const lastCheckedKey = `ambassador_approval_checked_${userId}`;
      const lastChecked = localStorage.getItem(lastCheckedKey);
      const lastCheckedDate = lastChecked ? new Date(lastChecked) : new Date(0);

      const { data: approvedSubmissions, error } = await supabase
        .from("ambassador_submissions")
        .select("id, updated_at")
        .eq("user_id", userId)
        .eq("status", "approved")
        .gt("updated_at", lastCheckedDate.toISOString());

      if (!error && approvedSubmissions && approvedSubmissions.length > 0) {
        // New approvals found!
        setApprovalCount(approvedSubmissions.length);
        setShow(true);
        
        // Trigger celebrations
        setTimeout(() => {
          triggerConfetti('achievement');
          triggerEmoji('🎉');
        }, 300);

        // Update last checked timestamp
        localStorage.setItem(lastCheckedKey, new Date().toISOString());
      }
    };

    checkForNewApprovals();
  }, [userId]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.4 }}
            className="relative w-full max-w-lg bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/90 dark:via-yellow-950/90 dark:to-orange-950/90 rounded-3xl p-8 shadow-2xl border-2 border-yellow-400"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* Animated sparkles */}
            <motion.div
              className="absolute top-6 left-6"
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-8 w-8 text-yellow-500" />
            </motion.div>
            <motion.div
              className="absolute bottom-6 right-6"
              animate={{ rotate: -360, scale: [1, 1.3, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <PartyPopper className="h-8 w-8 text-orange-500" />
            </motion.div>

            {/* Content */}
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Mascot */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
              >
                <img 
                  src={owlThumbsup} 
                  alt="Celebration owl" 
                  className="w-32 h-32 object-contain drop-shadow-lg"
                />
              </motion.div>

              {/* Crown badge */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-yellow-400 to-orange-400 p-3 rounded-full shadow-lg"
              >
                <Crown className="h-10 w-10 text-white" />
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Video Approved! 🎉
                </h2>
                <p className="text-lg text-muted-foreground">
                  {approvalCount === 1 
                    ? "Your ambassador video has been approved!" 
                    : `${approvalCount} of your videos have been approved!`}
                </p>
              </motion.div>

              {/* Progress indicator */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="w-full bg-white/80 dark:bg-black/40 rounded-2xl p-4 border border-yellow-300"
              >
                <div className="flex items-center justify-center gap-2 text-yellow-700 dark:text-yellow-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">You're one step closer to Unlimited Premium!</span>
                </div>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="w-full"
              >
                <Button
                  size="lg"
                  onClick={handleClose}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-semibold text-lg py-6 rounded-xl shadow-lg"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Amazing!
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
