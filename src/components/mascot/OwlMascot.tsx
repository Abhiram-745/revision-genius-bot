import { motion } from "framer-motion";

// Import all owl images
import owlWavingBook from "@/assets/owl-waving-book.png";
import owlChecklist from "@/assets/owl-checklist.png";
import owlThumbsup from "@/assets/owl-thumbsup.png";
import owlSleeping from "@/assets/owl-sleeping.png";
import owlLightbulb from "@/assets/owl-lightbulb.png";
import owlMagnifying from "@/assets/owl-magnifying.png";
import owlFolder from "@/assets/owl-folder.png";
import owlChart from "@/assets/owl-chart.png";
import confusedOwl from "@/assets/confused-owl.png";
import happyOwl from "@/assets/happy-owl.png";

export type OwlType = 
  | "waving" 
  | "checklist" 
  | "thumbsup" 
  | "sleeping" 
  | "lightbulb" 
  | "magnifying" 
  | "folder" 
  | "chart" 
  | "confused" 
  | "happy";

interface OwlMascotProps {
  type: OwlType;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  animate?: boolean;
  className?: string;
  glow?: boolean;
}

const owlImages: Record<OwlType, string> = {
  waving: owlWavingBook,
  checklist: owlChecklist,
  thumbsup: owlThumbsup,
  sleeping: owlSleeping,
  lightbulb: owlLightbulb,
  magnifying: owlMagnifying,
  folder: owlFolder,
  chart: owlChart,
  confused: confusedOwl,
  happy: happyOwl,
};

const sizeClasses: Record<string, string> = {
  xs: "w-8 h-8",
  sm: "w-12 h-12",
  md: "w-20 h-20",
  lg: "w-32 h-32",
  xl: "w-40 h-40",
  "2xl": "w-48 h-48",
  "3xl": "w-56 h-56",
};

export const OwlMascot = ({ type, size = "md", animate = true, className = "", glow = false }: OwlMascotProps) => {
  const animationVariants = {
    waving: {
      rotate: [0, -8, 8, -8, 0],
      y: [0, -3, 0],
      transition: { duration: 2.5, repeat: Infinity, repeatDelay: 2 }
    },
    checklist: {
      y: [0, -5, 0],
      scale: [1, 1.02, 1],
      transition: { duration: 1.5, repeat: Infinity }
    },
    thumbsup: {
      scale: [1, 1.08, 1],
      rotate: [0, -5, 5, 0],
      transition: { duration: 1.2, repeat: Infinity, repeatDelay: 1.5 }
    },
    sleeping: {
      y: [0, -3, 0],
      rotate: [0, 1, -1, 0],
      transition: { duration: 3, repeat: Infinity }
    },
    lightbulb: {
      rotate: [0, -5, 5, 0],
      scale: [1, 1.03, 1],
      transition: { duration: 2.5, repeat: Infinity }
    },
    magnifying: {
      x: [0, 4, -4, 0],
      rotate: [0, 3, -3, 0],
      transition: { duration: 2.5, repeat: Infinity }
    },
    folder: {
      y: [0, -4, 0],
      transition: { duration: 1.8, repeat: Infinity }
    },
    chart: {
      scale: [1, 1.04, 1],
      y: [0, -2, 0],
      transition: { duration: 1.5, repeat: Infinity }
    },
    confused: {
      rotate: [0, -5, 5, -3, 3, 0],
      transition: { duration: 2.5, repeat: Infinity }
    },
    happy: {
      y: [0, -8, 0],
      scale: [1, 1.05, 1],
      rotate: [0, -3, 3, 0],
      transition: { duration: 1.5, repeat: Infinity }
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
      className={`relative ${className}`}
    >
      {glow && (
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-110" />
      )}
      <motion.img
        src={owlImages[type]}
        alt={`Vistara owl mascot - ${type}`}
        className={`${sizeClasses[size]} object-contain drop-shadow-xl relative z-10`}
        animate={animate ? animationVariants[type] : undefined}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      />
    </motion.div>
  );
};

export default OwlMascot;
