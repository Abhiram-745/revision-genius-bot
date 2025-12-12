import { motion } from "framer-motion";
import { GraduationCap, School, Building, BookOpen, Award, Users } from "lucide-react";

const schools = [
  { name: "Westminster School", icon: Building },
  { name: "Eton College", icon: GraduationCap },
  { name: "King's College", icon: School },
  { name: "St Paul's School", icon: BookOpen },
  { name: "Harrow School", icon: Award },
  { name: "Rugby School", icon: Users },
  { name: "Charterhouse", icon: Building },
  { name: "Winchester College", icon: GraduationCap },
];

const TrustedBySection = () => {
  return (
    <section className="py-16 px-6 border-y border-border/50 bg-muted/20 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground mb-8 font-medium uppercase tracking-wider"
        >
          Trusted by students from top schools
        </motion.p>

        {/* Infinite scroll container */}
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-muted/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-muted/80 to-transparent z-10 pointer-events-none" />
          
          {/* Scrolling content */}
          <div className="flex animate-infinite-scroll">
            {/* First set */}
            {[...schools, ...schools].map((school, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 px-8 py-3 mx-4 bg-card/50 rounded-full border border-border/50 whitespace-nowrap shrink-0"
                whileHover={{ scale: 1.05, backgroundColor: "hsl(var(--card))" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <school.icon className="w-5 h-5 text-primary" />
                <span className="font-medium text-sm">{school.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBySection;
