import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const OfferCountdown = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2025-01-01T00:00:00Z');

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <motion.span 
        key={value}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="font-bold text-sm sm:text-base md:text-lg tabular-nums"
      >
        {value.toString().padStart(2, '0')}
      </motion.span>
      <span className="text-[8px] sm:text-[10px] uppercase opacity-80">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-1 sm:gap-2 bg-white/20 rounded-lg px-2 py-1 sm:px-3 sm:py-1.5">
      <TimeBlock value={timeLeft.days} label="D" />
      <span className="text-sm font-bold opacity-60">:</span>
      <TimeBlock value={timeLeft.hours} label="H" />
      <span className="text-sm font-bold opacity-60">:</span>
      <TimeBlock value={timeLeft.minutes} label="M" />
      <span className="text-sm font-bold opacity-60 hidden sm:block">:</span>
      <div className="hidden sm:block">
        <TimeBlock value={timeLeft.seconds} label="S" />
      </div>
    </div>
  );
};

export default OfferCountdown;
