import { motion } from "framer-motion";

interface MorphingBlobProps {
  className?: string;
  size?: number;
}

const MorphingBlob = ({ className = "", size = 400 }: MorphingBlobProps) => {
  const paths = [
    "M440,320Q420,390,350,420Q280,450,210,420Q140,390,100,320Q60,250,100,180Q140,110,210,80Q280,50,350,80Q420,110,440,180Q460,250,440,320Z",
    "M420,340Q380,430,290,450Q200,470,130,400Q60,330,80,240Q100,150,180,100Q260,50,340,90Q420,130,450,215Q480,300,420,340Z",
    "M450,310Q440,370,380,410Q320,450,240,440Q160,430,110,370Q60,310,80,230Q100,150,170,100Q240,50,320,70Q400,90,440,165Q480,240,450,310Z",
    "M430,330Q400,410,310,430Q220,450,150,390Q80,330,90,240Q100,150,180,90Q260,30,340,80Q420,130,450,215Q480,300,430,330Z",
  ];

  return (
    <div className={`absolute pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 500 500"
        width={size}
        height={size}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <motion.stop
              offset="0%"
              animate={{
                stopColor: [
                  "hsl(var(--primary))",
                  "hsl(var(--secondary))",
                  "hsl(var(--accent))",
                  "hsl(var(--primary))",
                ],
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.stop
              offset="50%"
              animate={{
                stopColor: [
                  "hsl(var(--secondary))",
                  "hsl(var(--accent))",
                  "hsl(var(--primary))",
                  "hsl(var(--secondary))",
                ],
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.stop
              offset="100%"
              animate={{
                stopColor: [
                  "hsl(var(--accent))",
                  "hsl(var(--primary))",
                  "hsl(var(--secondary))",
                  "hsl(var(--accent))",
                ],
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
          </linearGradient>
          <filter id="blobBlur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>
        <motion.path
          fill="url(#blobGradient)"
          opacity={0.3}
          filter="url(#blobBlur)"
          animate={{
            d: paths,
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>
    </div>
  );
};

export default MorphingBlob;
