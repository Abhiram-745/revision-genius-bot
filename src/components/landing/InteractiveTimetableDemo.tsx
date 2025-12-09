import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Calendar, Clock, CheckCircle2, Dumbbell, BookOpen, Brain, FlaskConical, Sigma, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Session {
  id: string;
  time: string;
  duration: string;
  subject: string;
  topic: string;
  type: "study" | "break" | "event";
  icon: React.ReactNode;
  color: string;
  completed: boolean;
}

const demoSessions: Session[] = [
  {
    id: "1",
    time: "07:30",
    duration: "30 min",
    subject: "Mathematics",
    topic: "Quadratic Equations Practice",
    type: "study",
    icon: <Sigma className="w-5 h-5" />,
    color: "primary",
    completed: true,
  },
  {
    id: "2",
    time: "08:15",
    duration: "15 min",
    subject: "Break",
    topic: "Breakfast & refresh",
    type: "break",
    icon: <Clock className="w-5 h-5" />,
    color: "muted",
    completed: true,
  },
  {
    id: "3",
    time: "08:30",
    duration: "45 min",
    subject: "Biology",
    topic: "Cell Division - Mitosis",
    type: "study",
    icon: <FlaskConical className="w-5 h-5" />,
    color: "secondary",
    completed: true,
  },
  {
    id: "4",
    time: "16:00",
    duration: "90 min",
    subject: "Football Practice",
    topic: "Team training session",
    type: "event",
    icon: <Dumbbell className="w-5 h-5" />,
    color: "accent",
    completed: false,
  },
  {
    id: "5",
    time: "18:00",
    duration: "45 min",
    subject: "Physics",
    topic: "Forces & Motion",
    type: "study",
    icon: <Brain className="w-5 h-5" />,
    color: "primary",
    completed: false,
  },
  {
    id: "6",
    time: "19:00",
    duration: "30 min",
    subject: "Chemistry",
    topic: "Atomic Structure Review",
    type: "study",
    icon: <FlaskConical className="w-5 h-5" />,
    color: "secondary",
    completed: false,
  },
];

interface InteractiveTimetableDemoProps {
  onArrowClick: () => void;
}

const InteractiveTimetableDemo = ({ onArrowClick }: InteractiveTimetableDemoProps) => {
  const [sessions, setSessions] = useState(demoSessions);
  const [isHovering, setIsHovering] = useState<string | null>(null);

  const toggleComplete = (id: string) => {
    setSessions(prev => 
      prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s)
    );
  };

  const completedCount = sessions.filter(s => s.completed && s.type === "study").length;
  const totalStudy = sessions.filter(s => s.type === "study").length;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Play className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Interactive Demo</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-display font-bold mb-2">
          Your Wednesday Schedule
        </h3>
        <p className="text-muted-foreground">
          Click sessions to mark them complete. This is how Vistara organizes your day!
        </p>
      </motion.div>

      {/* Progress Bar */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Today's Progress</span>
          <span className="text-sm text-muted-foreground">{completedCount}/{totalStudy} sessions</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / totalStudy) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Timetable Grid */}
      <div className="grid gap-3">
        <AnimatePresence>
          {sessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onHoverStart={() => setIsHovering(session.id)}
              onHoverEnd={() => setIsHovering(null)}
            >
              <Card 
                className={`cursor-pointer transition-all duration-300 border-l-4 ${
                  session.completed 
                    ? "bg-muted/50 border-l-muted-foreground/30" 
                    : session.type === "event"
                    ? "bg-accent/5 border-l-accent hover:shadow-lg hover:scale-[1.02]"
                    : `bg-card border-l-${session.color} hover:shadow-lg hover:scale-[1.02]`
                }`}
                style={{
                  borderLeftColor: session.completed 
                    ? undefined 
                    : `hsl(var(--${session.color}))`
                }}
                onClick={() => session.type !== "event" && toggleComplete(session.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Time */}
                    <div className="text-center min-w-[60px]">
                      <p className={`font-bold ${session.completed ? "text-muted-foreground" : "text-foreground"}`}>
                        {session.time}
                      </p>
                      <p className="text-xs text-muted-foreground">{session.duration}</p>
                    </div>

                    {/* Divider */}
                    <div className={`w-px h-12 ${session.completed ? "bg-muted-foreground/20" : "bg-border"}`} />

                    {/* Icon */}
                    <div 
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        session.completed 
                          ? "bg-muted text-muted-foreground" 
                          : `bg-${session.color}/10 text-${session.color}`
                      }`}
                      style={{
                        backgroundColor: session.completed ? undefined : `hsl(var(--${session.color}) / 0.1)`,
                        color: session.completed ? undefined : `hsl(var(--${session.color}))`
                      }}
                    >
                      {session.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <p className={`font-semibold ${session.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {session.subject}
                      </p>
                      <p className={`text-sm ${session.completed ? "text-muted-foreground/70" : "text-muted-foreground"}`}>
                        {session.topic}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      {session.type === "study" && (
                        <motion.div
                          animate={{ scale: session.completed ? 1 : isHovering === session.id ? 1.1 : 1 }}
                        >
                          <CheckCircle2 
                            className={`w-6 h-6 transition-colors ${
                              session.completed ? "text-primary fill-primary" : "text-muted-foreground/30"
                            }`}
                          />
                        </motion.div>
                      )}
                      {session.type === "event" && (
                        <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent font-medium">
                          Event
                        </span>
                      )}
                      {session.type === "break" && (
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                          Break
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* CTA Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-center"
      >
        <Button 
          size="lg" 
          onClick={onArrowClick}
          className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg group rounded-full"
        >
          <Sparkles className="mr-2 w-5 h-5" />
          Create Your Own Schedule
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    </div>
  );
};

export default InteractiveTimetableDemo;
