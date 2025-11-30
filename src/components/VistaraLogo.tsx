import { cn } from "@/lib/utils";

interface VistaraLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

const VistaraLogo = ({ className, size = "md", showText = false }: VistaraLogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <svg
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-lg"
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="vistaraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="50%" stopColor="hsl(var(--secondary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
            <linearGradient id="vistaraGradientAlt" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--accent))" />
              <stop offset="100%" stopColor="hsl(var(--primary))" />
            </linearGradient>
            <linearGradient id="vistaraShine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.3" />
              <stop offset="50%" stopColor="white" stopOpacity="0.1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <filter id="vistaraGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Main rounded square background */}
          <rect
            x="2"
            y="2"
            width="52"
            height="52"
            rx="14"
            className="fill-card"
            stroke="url(#vistaraGradient)"
            strokeWidth="2"
          />

          {/* Calendar grid lines */}
          <line x1="2" y1="18" x2="54" y2="18" stroke="url(#vistaraGradient)" strokeWidth="1.5" strokeOpacity="0.3" />
          <line x1="20" y1="18" x2="20" y2="54" stroke="url(#vistaraGradient)" strokeWidth="1" strokeOpacity="0.15" />
          <line x1="38" y1="18" x2="38" y2="54" stroke="url(#vistaraGradient)" strokeWidth="1" strokeOpacity="0.15" />
          
          {/* Calendar header dots */}
          <circle cx="14" cy="10" r="2.5" fill="url(#vistaraGradient)" />
          <circle cx="28" cy="10" r="2.5" fill="url(#vistaraGradientAlt)" />
          <circle cx="42" cy="10" r="2.5" fill="url(#vistaraGradient)" />

          {/* Stylized "V" mark integrated with calendar */}
          <path
            d="M16 24L28 44L40 24"
            stroke="url(#vistaraGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter="url(#vistaraGlow)"
          />

          {/* Checkmark accent on V */}
          <path
            d="M24 34L28 38L36 28"
            stroke="url(#vistaraGradientAlt)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.8"
          />

          {/* Shine overlay */}
          <rect
            x="2"
            y="2"
            width="52"
            height="26"
            rx="14"
            fill="url(#vistaraShine)"
          />
        </svg>

        {/* Subtle ambient glow */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-40 blur-xl -z-10"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary) / 0.5), hsl(var(--secondary) / 0.4))"
          }}
        />
      </div>

      {showText && (
        <span className={cn(
          "font-display font-bold gradient-text",
          textSizeClasses[size]
        )}>
          Vistara
        </span>
      )}
    </div>
  );
};

export default VistaraLogo;
