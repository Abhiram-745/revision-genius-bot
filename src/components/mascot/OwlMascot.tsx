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
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  className?: string;
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
  sm: "w-12 h-12",
  md: "w-20 h-20",
  lg: "w-32 h-32",
  xl: "w-40 h-40",
};

export const OwlMascot = ({ type, size = "md", animate = true, className = "" }: OwlMascotProps) => {
  const animationVariants = {
    waving: {
      rotate: [0, -5, 5, -5, 0],
      transition: { duration: 2, repeat: Infinity, repeatDelay: 3 }
    },
    checklist: {
      y: [0, -3, 0],
      transition: { duration: 1.5, repeat: Infinity }
    },
    thumbsup: {
      scale: [1, 1.05, 1],
      transition: { duration: 1, repeat: Infinity, repeatDelay: 2 }
    },
    sleeping: {
      y: [0, -2, 0],
      transition: { duration: 2, repeat: Infinity }
    },
    lightbulb: {
      rotate: [0, -3, 3, 0],
      transition: { duration: 2.5, repeat: Infinity }
    },
    magnifying: {
      x: [0, 2, -2, 0],
      transition: { duration: 2, repeat: Infinity }
    },
    folder: {
      y: [0, -2, 0],
      transition: { duration: 1.8, repeat: Infinity }
    },
    chart: {
      scale: [1, 1.02, 1],
      transition: { duration: 1.5, repeat: Infinity }
    },
    confused: {
      rotate: [0, -3, 3, 0],
      transition: { duration: 2, repeat: Infinity }
    },
    happy: {
      y: [0, -4, 0],
      scale: [1, 1.03, 1],
      transition: { duration: 1.2, repeat: Infinity }
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: "spring" }}
      className={`relative ${className}`}
    >
      <motion.img
        src={owlImages[type]}
        alt={`Vistara owl mascot - ${type}`}
        className={`${sizeClasses[size]} object-contain drop-shadow-lg`}
        animate={animate ? animationVariants[type] : undefined}
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300 }}
      />
    </motion.div>
  );
};

export default OwlMascot;
