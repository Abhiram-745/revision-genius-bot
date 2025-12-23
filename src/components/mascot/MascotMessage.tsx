import { motion } from "framer-motion";
import { OwlMascot, OwlType } from "./OwlMascot";

interface MascotMessageProps {
  type: OwlType;
  message: string;
  subMessage?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const MascotMessage = ({ 
  type, 
  message, 
  subMessage, 
  size = "md", 
  className = "" 
}: MascotMessageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-center text-center gap-3 ${className}`}
    >
      <OwlMascot type={type} size={size} />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-1"
      >
        <p className="text-sm font-medium text-foreground">{message}</p>
        {subMessage && (
          <p className="text-xs text-muted-foreground">{subMessage}</p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MascotMessage;
