import { motion } from "framer-motion";
import { Upload, Calendar, Brain, Sparkles, FileText, Clock, Target, Zap } from "lucide-react";
import MorphingBlob from "./MorphingBlob";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Content",
    description: "Drop in your syllabus, revision notes, or just type your topics. Our AI does the heavy lifting.",
    details: [
      "Supports PDF notes, Word docs, and topic lists",
      "AI extracts key topics and subtopics automatically",
      "Detects exam boards (AQA, Edexcel, OCR, WJEC, CIE)",
      "Identifies which areas need more focus",
    ],
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: "02",
    icon: Calendar,
    title: "Mark Your Life",
    description: "Your schedule should work around your life, not the other way around.",
    details: [
      "Add recurring commitments (football, music lessons, clubs)",
      "Set preferred study times (morning lark vs night owl)",
      "Block out family dinners and social events",
      "Mark exam dates for smart countdown scheduling",
    ],
    color: "from-purple-500 to-pink-500",
  },
  {
    number: "03",
    icon: Brain,
    title: "AI Analysis",
    description: "Our algorithm considers how your brain actually learns and retains information.",
    details: [
      "Identifies which topics need more repetition",
      "Considers spaced repetition for long-term memory",
      "Balances difficult and easier subjects",
      "Accounts for your energy levels throughout the day",
    ],
    color: "from-orange-500 to-amber-500",
  },
  {
    number: "04",
    icon: Sparkles,
    title: "Smart Scheduling",
    description: "Watch as your personalized timetable generates in seconds, optimized for your success.",
    details: [
      "Optimal session lengths (25-45 minutes)",
      "Strategic breaks to prevent burnout",
      "Harder topics during peak focus hours",
      "Built-in flexibility for unexpected events",
    ],
    color: "from-green-500 to-emerald-500",
  },
];

const TimetableCreationSection = () => {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <MorphingBlob className="-top-40 -right-40 opacity-50" size={600} />
      <MorphingBlob className="-bottom-40 -left-40 opacity-50" size={500} />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <Zap className="w-4 h-4" />
            AI-Powered Generation
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            How AI Creates Your{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Perfect Timetable
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            In just 4 simple steps, go from scattered notes to a scientifically-optimized study plan 
            that adapts to your life, learning style, and goals.
          </p>
        </motion.div>

        <div className="grid gap-8 md:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`flex flex-col ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } gap-8 items-center`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-6xl font-display font-bold text-muted-foreground/20">
                    {step.number}
                  </span>
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                  >
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">{step.title}</h3>
                <p className="text-lg text-muted-foreground mb-6">{step.description}</p>
                <ul className="space-y-3">
                  {step.details.map((detail, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + i * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shrink-0 mt-0.5`}>
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-muted-foreground">{detail}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <motion.div
                className="flex-1 w-full max-w-md"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-20 blur-2xl rounded-3xl`} />
                  <div className="relative bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-xl">
                    {index === 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <FileText className="w-5 h-5 text-primary" />
                          <span className="text-sm">biology_syllabus.pdf</span>
                          <span className="ml-auto text-xs text-green-500">✓ Parsed</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <FileText className="w-5 h-5 text-primary" />
                          <span className="text-sm">chemistry_notes.docx</span>
                          <span className="ml-auto text-xs text-green-500">✓ Parsed</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-4">
                          <strong>Detected:</strong> AQA A-Level Biology, 24 topics
                        </div>
                      </div>
                    )}
                    {index === 1 && (
                      <div className="space-y-3">
                        {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
                          <div key={day} className="flex items-center gap-3">
                            <span className="w-10 text-sm font-medium">{day}</span>
                            <div className="flex-1 h-8 bg-muted/50 rounded flex items-center px-2 gap-2">
                              <div className="w-16 h-5 bg-blue-500/30 rounded text-xs flex items-center justify-center">School</div>
                              {day === "Tue" && (
                                <div className="w-14 h-5 bg-orange-500/30 rounded text-xs flex items-center justify-center">Football</div>
                              )}
                              {day === "Thu" && (
                                <div className="w-12 h-5 bg-purple-500/30 rounded text-xs flex items-center justify-center">Piano</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {index === 2 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Topic Difficulty Analysis</span>
                          <Brain className="w-4 h-4 text-primary animate-pulse" />
                        </div>
                        {["Organic Chemistry", "Cell Division", "Thermodynamics"].map((topic, i) => (
                          <div key={topic} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{topic}</span>
                              <span className="text-muted-foreground">{["High", "Medium", "High"][i]}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full bg-gradient-to-r ${step.color}`}
                                initial={{ width: 0 }}
                                whileInView={{ width: ["85%", "60%", "90%"][i] }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5 + i * 0.2, duration: 0.8 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {index === 3 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <Clock className="w-4 h-4" />
                          <span>Today's Schedule</span>
                        </div>
                        {[
                          { time: "16:00", subject: "Biology", topic: "Photosynthesis", duration: "45min" },
                          { time: "16:50", subject: "Break", topic: "", duration: "10min", isBreak: true },
                          { time: "17:00", subject: "Chemistry", topic: "Organic Reactions", duration: "40min" },
                        ].map((session, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 + i * 0.15 }}
                            className={`flex items-center gap-3 p-3 rounded-lg ${
                              session.isBreak ? "bg-green-500/10" : "bg-primary/10"
                            }`}
                          >
                            <span className="text-xs font-mono text-muted-foreground">{session.time}</span>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{session.subject}</div>
                              {session.topic && (
                                <div className="text-xs text-muted-foreground">{session.topic}</div>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">{session.duration}</span>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TimetableCreationSection;
