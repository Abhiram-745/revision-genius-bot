import { useState, ReactNode, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface RippleButtonProps extends ButtonProps {
  children: ReactNode;
  rippleColor?: string;
}

const RippleButton = ({ 
  children, 
  onClick, 
  className = "",
  rippleColor = "rgba(255, 255, 255, 0.4)",
  ...props 
}: RippleButtonProps) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple: Ripple = {
      id: Date.now(),
      x,
      y,
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
    
    onClick?.(e);
  };

  return (
    <Button
      onClick={handleClick}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 100,
              height: 100,
              marginLeft: -50,
              marginTop: -50,
              background: rippleColor,
            }}
          />
        ))}
      </AnimatePresence>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </Button>
  );
};

export default RippleButton;
