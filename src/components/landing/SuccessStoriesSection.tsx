import { motion } from "framer-motion";
import { Quote, Star, TrendingUp, Award } from "lucide-react";
import pointingOwl from "@/assets/pointing-owl.png";

const stories = [
  {
    name: "James K.",
    school: "QE Boys",
    avatar: "JK",
    before: "Struggling with 5s in Chemistry",
    after: "Achieved 8 in GCSE",
    quote: "Vistara completely changed how I approach revision. The AI knew exactly when I was losing focus and scheduled breaks perfectly. My predicted grades went from 5s to 8s in just one term.",
    subjects: ["Chemistry", "Biology", "Maths"],
    improvement: "+3 grades",
  },
  {
    name: "Sophia M.",
    school: "Highgate School",
    avatar: "SM",
    before: "Overwhelmed by A-Level workload",
    after: "Straight A*s predicted",
    quote: "I was drowning in content before Vistara. Now I have a clear path through everything. The spaced repetition actually works - I remember things I studied weeks ago without re-reading.",
    subjects: ["History", "English", "Politics"],
    improvement: "A* predicted",
  },
  {
    name: "Oliver T.",
    school: "Mill Hill School",
    avatar: "OT",
    before: "Constant procrastination",
    after: "4-hour daily study streaks",
    quote: "The session timer with reflections keeps me accountable. I went from barely studying to maintaining 4-hour daily streaks. My parents can't believe the change.",
    subjects: ["Physics", "Maths", "Economics"],
    improvement: "4hr/day streak",
  },
  {
    name: "Emma L.",
    school: "North London Collegiate",
    avatar: "EL",
    before: "Anxiety about exams",
    after: "Confident and prepared",
    quote: "Seeing my progress visually made such a difference. The confidence tracking showed me I actually knew more than I thought. Went into my mocks feeling prepared for the first time ever.",
    subjects: ["Biology", "Chemistry", "Psychology"],
    improvement: "Exam confidence",
  },
];

const SuccessStoriesSection = () => {
  return (
    <section className="py-24 px-6 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      {/* Pointing owl mascot */}
      <motion.img
        src={pointingOwl}
        alt="Pointing owl mascot"
        className="absolute top-20 right-4 md:right-12 lg:right-20 w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 object-contain drop-shadow-xl z-10 hidden lg:block"
        initial={{ opacity: 0, y: -20, rotate: 5 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
      />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-500 text-sm font-medium mb-6"
          >
            <Award className="w-4 h-4" />
            Real Results
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Join Thousands of{" "}
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
              Successful Students
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how students from top schools transformed their revision and achieved their goals
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {stories.map((story, index) => (
            <motion.div
              key={story.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-card border border-border rounded-2xl p-8 h-full shadow-lg hover:shadow-xl transition-all hover:border-primary/30">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
                    {story.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{story.name}</h3>
                    <p className="text-sm text-muted-foreground">{story.school}</p>
                    <div className="flex gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium"
                    >
                      <TrendingUp className="w-3 h-3" />
                      {story.improvement}
                    </motion.div>
                  </div>
                </div>

                <div className="flex gap-4 mb-6">
                  <div className="flex-1 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-xs text-destructive font-medium mb-1">Before</p>
                    <p className="text-sm">{story.before}</p>
                  </div>
                  <div className="flex-1 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-xs text-green-500 font-medium mb-1">After</p>
                    <p className="text-sm">{story.after}</p>
                  </div>
                </div>

                <div className="relative mb-6">
                  <Quote className="absolute -top-2 -left-2 w-8 h-8 text-primary/20" />
                  <p className="text-muted-foreground italic pl-6 leading-relaxed">
                    "{story.quote}"
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {story.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="px-3 py-1 rounded-full bg-muted text-xs font-medium"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground">
            <span className="font-bold text-foreground">2,500+</span> students already improving their grades with Vistara
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default SuccessStoriesSection;
