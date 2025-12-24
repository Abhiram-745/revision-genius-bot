import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import vistaraMascot from "@/assets/vistara-mascot-logo.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallAppButtonProps {
  variant?: "default" | "outline" | "ghost" | "landing";
  size?: "sm" | "default" | "lg";
  showIcon?: boolean;
  className?: string;
}

export const InstallAppButton = ({ 
  variant = "outline", 
  size = "default",
  showIcon = true,
  className = ""
}: InstallAppButtonProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check for iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isIOS && !isInStandaloneMode) {
      setIsInstallable(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        toast.success('Vistara installed successfully!');
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // iOS fallback - show instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        toast.info('Tap the Share button, then "Add to Home Screen" to install Vistara', {
          duration: 5000
        });
      } else {
        toast.info('Use your browser menu to install Vistara');
      }
    }
  };

  if (isInstalled) {
    return null;
  }

  if (!isInstallable) {
    return null;
  }

  if (variant === "landing") {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          size={size}
          variant="outline"
          onClick={handleInstall}
          className={`gap-2 rounded-full border-primary/30 bg-primary/5 hover:bg-primary/10 ${className}`}
        >
          <Smartphone className="w-4 h-4" />
          Install App
        </Button>
      </motion.div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleInstall}
      className={`gap-2 ${className}`}
    >
      {showIcon && <Download className="w-4 h-4" />}
      Install Vistara
    </Button>
  );
};

export default InstallAppButton;
