import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Calendar, Clock, CheckCircle2, Dumbbell, BookOpen, 
  Brain, FlaskConical, Sigma, Play, Sparkles, Timer, Star, 
  TrendingUp, Target, ThumbsUp, ThumbsDown, Lightbulb, X,
  Zap, Award, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import FloatingIcon from "./FloatingIcon";

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
    completed: false,
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

type DemoStep = "timetable" | "timer" | "reflection" | "insights";

interface InteractiveTimetableDemoProps {
  onArrowClick: () => void;
}

const InteractiveTimetableDemo = ({ onArrowClick }: InteractiveTimetableDemoProps) => {
  const [sessions, setSessions] = useState(demoSessions);
  const [isHovering, setIsHovering] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<DemoStep>("timetable");
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [timerProgress, setTimerProgress] = useState(0);
  const [reflectionData, setReflectionData] = useState({
    confidence: 3,
    difficulty: 2,
    notes: "",
  });

  const completedCount = sessions.filter(s => s.completed && s.type === "study").length;
  const totalStudy = sessions.filter(s => s.type === "study").length;

  const startSession = (session: Session) => {
    if (session.type !== "study" || session.completed) return;
    setActiveSession(session);
    setCurrentStep("timer");
    // Simulate timer progress
    setTimerProgress(0);
    const interval = setInterval(() => {
      setTimerProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const finishSession = () => {
    setCurrentStep("reflection");
  };

  const submitReflection = () => {
    if (activeSession) {
      setSessions(prev => 
        prev.map(s => s.id === activeSession.id ? { ...s, completed: true } : s)
      );
    }
    setCurrentStep("insights");
  };

  const backToTimetable = () => {
    setCurrentStep("timetable");
    setActiveSession(null);
    setTimerProgress(0);
    setReflectionData({ confidence: 3, difficulty: 2, notes: "" });
  };

  return (
    <div className="w-full max-w-5xl mx-auto relative">
      {/* Floating Decorative Cards */}
      <div className="hidden lg:block absolute -left-32 top-20 z-0">
        <FloatingIcon delay={0} duration={4}>
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4 shadow-lg w-48">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium">Streak</span>
            </div>
            <p className="text-2xl font-bold text-accent">7 days 🔥</p>
          </div>
        </FloatingIcon>
      </div>

      <div className="hidden lg:block absolute -right-32 top-10 z-0">
        <FloatingIcon delay={1} duration={5}>
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4 shadow-lg w-52">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Weekly Progress</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Maths</span>
                <span className="text-primary">+15%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
          </div>
        </FloatingIcon>
      </div>

      <div className="hidden lg:block absolute -left-24 bottom-32 z-0">
        <FloatingIcon delay={0.5} duration={4.5}>
          <div className="bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 rounded-2xl p-4 shadow-lg w-44">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">XP Today</span>
            </div>
            <p className="text-2xl font-bold text-primary">+250</p>
          </div>
        </FloatingIcon>
      </div>

      <div className="hidden lg:block absolute -right-28 bottom-20 z-0">
        <FloatingIcon delay={1.5} duration={5.5}>
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4 shadow-lg w-48">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-secondary" />
              <span className="text-sm font-medium">Goal</span>
            </div>
            <p className="text-sm text-muted-foreground">3/4 sessions done</p>
            <Progress value={75} className="h-2 mt-2" />
          </div>
        </FloatingIcon>
      </div>

      <AnimatePresence mode="wait">
        {currentStep === "timetable" && (
          <motion.div
            key="timetable"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="relative z-10"
          >
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
                Click a study session to start the timer and experience the full flow!
              </p>
            </motion.div>

            {/* Progress Bar */}
            <div className="mb-6">
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
            </div>

            {/* Timetable Grid */}
            <div className="grid gap-3">
              {sessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
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
                        : session.type === "study"
                        ? "bg-card hover:shadow-lg hover:scale-[1.02] hover:border-l-primary"
                        : "bg-muted/30 border-l-muted"
                    }`}
                    style={{
                      borderLeftColor: session.completed 
                        ? undefined 
                        : `hsl(var(--${session.color}))`
                    }}
                    onClick={() => startSession(session)}
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
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform ${
                            isHovering === session.id && session.type === "study" && !session.completed ? "scale-110" : ""
                          }`}
                          style={{
                            backgroundColor: session.completed ? "hsl(var(--muted))" : `hsl(var(--${session.color}) / 0.1)`,
                            color: session.completed ? "hsl(var(--muted-foreground))" : `hsl(var(--${session.color}))`
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
                          {session.type === "study" && !session.completed && (
                            <motion.div
                              animate={{ scale: isHovering === session.id ? 1.1 : 1 }}
                              className="flex items-center gap-2"
                            >
                              <span className="text-xs text-primary font-medium hidden sm:inline">Click to start</span>
                              <Play className="w-5 h-5 text-primary" />
                            </motion.div>
                          )}
                          {session.type === "study" && session.completed && (
                            <CheckCircle2 className="w-6 h-6 text-primary fill-primary" />
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
            </div>

            {/* CTA Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
          </motion.div>
        )}

        {currentStep === "timer" && activeSession && (
          <motion.div
            key="timer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10"
          >
            <Card className="max-w-lg mx-auto border-2 border-primary/30 shadow-2xl">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  {/* Session Info */}
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      <Timer className="w-4 h-4" />
                      Session in Progress
                    </div>
                    <h3 className="text-2xl font-bold">{activeSession.subject}</h3>
                    <p className="text-muted-foreground">{activeSession.topic}</p>
                  </div>

                  {/* Timer Circle */}
                  <div className="relative w-48 h-48 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="hsl(var(--muted))"
                        strokeWidth="8"
                        fill="none"
                      />
                      <motion.circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={553}
                        strokeDashoffset={553 - (553 * timerProgress) / 100}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="hsl(var(--primary))" />
                          <stop offset="100%" stopColor="hsl(var(--secondary))" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.p 
                        className="text-4xl font-bold"
                        animate={{ scale: timerProgress >= 100 ? [1, 1.1, 1] : 1 }}
                      >
                        {timerProgress >= 100 ? "Done!" : `${Math.floor((45 * (100 - timerProgress)) / 100)}:00`}
                      </motion.p>
                      <p className="text-sm text-muted-foreground">remaining</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{timerProgress}%</span>
                    </div>
                    <Progress value={timerProgress} className="h-2" />
                  </div>

                  {/* Action Button */}
                  <Button 
                    size="lg" 
                    onClick={finishSession}
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  >
                    <CheckCircle2 className="mr-2 w-5 h-5" />
                    Finish Session
                  </Button>

                  <Button 
                    variant="ghost" 
                    onClick={backToTimetable}
                    className="text-muted-foreground"
                  >
                    <X className="mr-2 w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === "reflection" && activeSession && (
          <motion.div
            key="reflection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10"
          >
            <Card className="max-w-lg mx-auto border-2 border-secondary/30 shadow-2xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center space-y-2">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center mx-auto"
                    >
                      <Brain className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold">Session Reflection</h3>
                    <p className="text-muted-foreground">How did your {activeSession.subject} session go?</p>
                  </div>

                  {/* Confidence Rating */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">How confident do you feel?</label>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <motion.button
                          key={level}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setReflectionData(prev => ({ ...prev, confidence: level }))}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                            reflectionData.confidence >= level 
                              ? "bg-primary text-white" 
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          <Star className={`w-5 h-5 ${reflectionData.confidence >= level ? "fill-white" : ""}`} />
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Was it challenging?</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { level: 1, label: "Easy", icon: ThumbsUp },
                        { level: 2, label: "Medium", icon: Lightbulb },
                        { level: 3, label: "Hard", icon: ThumbsDown },
                      ].map((option) => (
                        <motion.button
                          key={option.level}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setReflectionData(prev => ({ ...prev, difficulty: option.level }))}
                          className={`p-3 rounded-xl border transition-all ${
                            reflectionData.difficulty === option.level 
                              ? "border-secondary bg-secondary/10 text-secondary" 
                              : "border-border hover:border-secondary/50"
                          }`}
                        >
                          <option.icon className="w-5 h-5 mx-auto mb-1" />
                          <span className="text-sm">{option.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quick notes (optional)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Need more practice", "Examples helped", "Understood well", "Review tomorrow"].map((note) => (
                        <motion.button
                          key={note}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setReflectionData(prev => ({ ...prev, notes: note }))}
                          className={`p-2 rounded-lg text-sm border transition-all ${
                            reflectionData.notes === note 
                              ? "border-accent bg-accent/10 text-accent" 
                              : "border-border hover:border-accent/50"
                          }`}
                        >
                          {note}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <Button 
                    size="lg" 
                    onClick={submitReflection}
                    className="w-full bg-gradient-to-r from-secondary to-accent hover:opacity-90"
                  >
                    <Sparkles className="mr-2 w-5 h-5" />
                    Save & See Insights
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === "insights" && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10"
          >
            <Card className="max-w-2xl mx-auto border-2 border-accent/30 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary via-secondary to-accent p-6">
                <div className="flex items-center justify-center gap-3 text-white">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-8 h-8" />
                  </motion.div>
                  <h3 className="text-2xl font-bold">Daily Insights</h3>
                </div>
              </div>
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-center p-4 rounded-xl bg-primary/10"
                    >
                      <BarChart3 className="w-6 h-6 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold text-primary">{completedCount + 1}</p>
                      <p className="text-xs text-muted-foreground">Sessions Done</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-center p-4 rounded-xl bg-secondary/10"
                    >
                      <Clock className="w-6 h-6 text-secondary mx-auto mb-2" />
                      <p className="text-2xl font-bold text-secondary">2.5h</p>
                      <p className="text-xs text-muted-foreground">Study Time</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-center p-4 rounded-xl bg-accent/10"
                    >
                      <Zap className="w-6 h-6 text-accent mx-auto mb-2" />
                      <p className="text-2xl font-bold text-accent">8</p>
                      <p className="text-xs text-muted-foreground">Day Streak</p>
                    </motion.div>
                  </div>

                  {/* AI Insight */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium mb-1">AI Recommendation</p>
                        <p className="text-sm text-muted-foreground">
                          Great progress on Biology! Based on your reflection, I've added an extra 15-minute review session tomorrow to reinforce cell division concepts before your test next week.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Subject Progress */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-3"
                  >
                    <p className="font-medium">Today's Subject Progress</p>
                    {[
                      { subject: "Mathematics", progress: 85, color: "primary" },
                      { subject: "Biology", progress: 72, color: "secondary" },
                      { subject: "Physics", progress: 0, color: "accent" },
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.subject}</span>
                          <span className="text-muted-foreground">{item.progress}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            transition={{ duration: 1, delay: 0.6 + i * 0.1 }}
                            className="h-full rounded-full"
                            style={{ background: `hsl(var(--${item.color}))` }}
                          />
                        </div>
                      </div>
                    ))}
                  </motion.div>

                  {/* Back Button */}
                  <Button 
                    size="lg" 
                    onClick={backToTimetable}
                    className="w-full"
                    variant="outline"
                  >
                    <ArrowRight className="mr-2 w-5 h-5 rotate-180" />
                    Back to Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InteractiveTimetableDemo;
