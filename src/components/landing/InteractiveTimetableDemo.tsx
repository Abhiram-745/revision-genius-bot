import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Calendar, Clock, CheckCircle2, Dumbbell, BookOpen, 
  Brain, FlaskConical, Sigma, Play, Sparkles, Timer, Star, 
  TrendingUp, Target, ThumbsUp, ThumbsDown, Lightbulb, X,
  Zap, Award, BarChart3, Upload, FileText, AlertTriangle, Wand2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import FloatingIcon from "./FloatingIcon";

interface Session {
  id: string;
  time: string;
  endTime: string;
  duration: string;
  subject: string;
  topic: string;
  type: "study" | "break" | "event";
  icon: React.ReactNode;
  color: string;
  completed: boolean;
}

// Fixed realistic timings for a school day
const demoSessions: Session[] = [
  {
    id: "1",
    time: "06:45",
    endTime: "07:15",
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
    time: "07:15",
    endTime: "07:30",
    duration: "15 min",
    subject: "Break",
    topic: "Breakfast & get ready for school",
    type: "break",
    icon: <Clock className="w-5 h-5" />,
    color: "muted",
    completed: true,
  },
  {
    id: "3",
    time: "15:30",
    endTime: "16:15",
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
    time: "16:30",
    endTime: "18:00",
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
    time: "18:30",
    endTime: "19:15",
    duration: "45 min",
    subject: "Physics",
    topic: "Forces & Motion - Newton's Laws",
    type: "study",
    icon: <Brain className="w-5 h-5" />,
    color: "primary",
    completed: false,
  },
  {
    id: "6",
    time: "19:30",
    endTime: "20:00",
    duration: "30 min",
    subject: "Chemistry",
    topic: "Atomic Structure Review",
    type: "study",
    icon: <FlaskConical className="w-5 h-5" />,
    color: "secondary",
    completed: false,
  },
];

type DemoStep = "generation" | "timetable" | "timer" | "reflection" | "insights";

interface InteractiveTimetableDemoProps {
  onArrowClick: () => void;
}

const InteractiveTimetableDemo = ({ onArrowClick }: InteractiveTimetableDemoProps) => {
  const [sessions, setSessions] = useState(demoSessions);
  const [isHovering, setIsHovering] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<DemoStep>("generation");
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [timerProgress, setTimerProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState(0);
  const [reflectionData, setReflectionData] = useState({
    confidence: 3,
    difficulty: 2,
    notes: "",
  });

  const completedCount = sessions.filter(s => s.completed && s.type === "study").length;
  const totalStudy = sessions.filter(s => s.type === "study").length;

  // Auto-advance generation steps
  useEffect(() => {
    if (currentStep === "generation" && generationStep < 4) {
      const timer = setTimeout(() => {
        setGenerationStep(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, generationStep]);

  const startSession = (session: Session) => {
    if (session.type !== "study" || session.completed) return;
    setActiveSession(session);
    setCurrentStep("timer");
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

  const skipToTimetable = () => {
    setGenerationStep(4);
    setTimeout(() => setCurrentStep("timetable"), 500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto relative">
      <AnimatePresence mode="wait">
        {currentStep === "generation" && (
          <motion.div
            key="generation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 min-h-[600px]"
          >
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-4">
                <Wand2 className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-secondary">AI Generation Preview</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-display font-bold mb-2">
                Watch your timetable come to life
              </h3>
              <p className="text-muted-foreground">
                See how Vistara creates your personalized study plan
              </p>
            </motion.div>

            {/* Generation Steps with Floating Cards */}
            <div className="relative flex flex-col items-center gap-8">
              
              {/* Step 1: Upload Notes */}
              <motion.div
                initial={{ opacity: 0, x: -100, rotate: -5 }}
                animate={{ 
                  opacity: generationStep >= 0 ? 1 : 0, 
                  x: generationStep >= 0 ? 0 : -100,
                  rotate: generationStep >= 0 ? -3 : -5
                }}
                transition={{ type: "spring", damping: 20 }}
                className="absolute left-0 md:left-10 top-0"
              >
                <FloatingIcon delay={0} duration={4}>
                  <Card className="w-64 border-2 border-primary/30 bg-card/95 backdrop-blur-sm shadow-xl">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div 
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"
                        >
                          <Upload className="w-5 h-5 text-primary" />
                        </motion.div>
                        <div>
                          <p className="font-semibold text-sm">Step 1</p>
                          <p className="text-xs text-muted-foreground">Upload Notes</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <FileText className="w-3 h-3 text-muted-foreground" />
                          <span>Biology_Notes.pdf</span>
                          <CheckCircle2 className="w-3 h-3 text-primary ml-auto" />
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <FileText className="w-3 h-3 text-muted-foreground" />
                          <span>Maths_Revision.pdf</span>
                          <CheckCircle2 className="w-3 h-3 text-primary ml-auto" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FloatingIcon>
              </motion.div>

              {/* Step 2: AI Parsing Topics */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ 
                  opacity: generationStep >= 1 ? 1 : 0, 
                  y: generationStep >= 1 ? 0 : 50 
                }}
                transition={{ type: "spring", damping: 20 }}
                className="absolute right-0 md:right-10 top-20"
              >
                <FloatingIcon delay={0.5} duration={4.5}>
                  <Card className="w-72 border-2 border-secondary/30 bg-card/95 backdrop-blur-sm shadow-xl">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div 
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center"
                        >
                          <Brain className="w-5 h-5 text-secondary" />
                        </motion.div>
                        <div>
                          <p className="font-semibold text-sm">Step 2</p>
                          <p className="text-xs text-muted-foreground">AI Parsing Topics</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {["Quadratic Equations", "Cell Division", "Newton's Laws", "Atomic Structure"].map((topic, i) => (
                          <motion.div 
                            key={topic}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.2 }}
                            className="flex items-center gap-2 text-xs bg-secondary/5 rounded-lg px-2 py-1.5"
                          >
                            <Sparkles className="w-3 h-3 text-secondary" />
                            <span>{topic}</span>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </FloatingIcon>
              </motion.div>

              {/* Step 3: Difficulty Analysis */}
              <motion.div
                initial={{ opacity: 0, x: -80 }}
                animate={{ 
                  opacity: generationStep >= 2 ? 1 : 0, 
                  x: generationStep >= 2 ? 0 : -80 
                }}
                transition={{ type: "spring", damping: 20 }}
                className="absolute left-4 md:left-20 top-48"
              >
                <FloatingIcon delay={1} duration={5}>
                  <Card className="w-60 border-2 border-accent/30 bg-card/95 backdrop-blur-sm shadow-xl">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div 
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"
                        >
                          <AlertTriangle className="w-5 h-5 text-accent" />
                        </motion.div>
                        <div>
                          <p className="font-semibold text-sm">Step 3</p>
                          <p className="text-xs text-muted-foreground">Focus Points</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>Quadratic Equations</span>
                          <span className="text-destructive font-medium">Hard</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>Newton's Laws</span>
                          <span className="text-accent font-medium">Medium</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>Cell Division</span>
                          <span className="text-primary font-medium">Easy</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FloatingIcon>
              </motion.div>

              {/* Step 4: Schedule Optimization */}
              <motion.div
                initial={{ opacity: 0, x: 80 }}
                animate={{ 
                  opacity: generationStep >= 3 ? 1 : 0, 
                  x: generationStep >= 3 ? 0 : 80 
                }}
                transition={{ type: "spring", damping: 20 }}
                className="absolute right-4 md:right-16 top-64"
              >
                <FloatingIcon delay={1.5} duration={5.5}>
                  <Card className="w-64 border-2 border-primary/30 bg-gradient-to-br from-card to-primary/5 backdrop-blur-sm shadow-xl">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"
                        >
                          <Calendar className="w-5 h-5 text-primary" />
                        </motion.div>
                        <div>
                          <p className="font-semibold text-sm">Step 4</p>
                          <p className="text-xs text-muted-foreground">Optimizing Schedule</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-primary" />
                          <span>Avoiding Football Practice</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-primary" />
                          <span>Morning sessions added</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-primary" />
                          <span>Breaks scheduled</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FloatingIcon>
              </motion.div>

              {/* Center Progress Indicator */}
              <motion.div 
                className="flex flex-col items-center justify-center py-32"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="relative w-32 h-32 mb-6">
                  {/* Animated rings */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-dashed border-primary/20 rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 border-4 border-dashed border-secondary/20 rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-4 border-4 border-dashed border-accent/20 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
                    >
                      <Wand2 className="w-8 h-8 text-white" />
                    </motion.div>
                  </div>
                </div>
                
                <motion.p 
                  className="text-lg font-medium mb-2"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {generationStep === 0 && "Analyzing your notes..."}
                  {generationStep === 1 && "Extracting topics..."}
                  {generationStep === 2 && "Identifying focus areas..."}
                  {generationStep === 3 && "Building your schedule..."}
                  {generationStep >= 4 && "Timetable ready! ✨"}
                </motion.p>
                
                <div className="flex gap-2 mb-6">
                  {[0, 1, 2, 3].map((step) => (
                    <motion.div
                      key={step}
                      className={`w-3 h-3 rounded-full ${
                        step <= generationStep ? "bg-primary" : "bg-muted"
                      }`}
                      animate={{ scale: step === generationStep ? [1, 1.3, 1] : 1 }}
                      transition={{ duration: 0.5, repeat: step === generationStep ? Infinity : 0 }}
                    />
                  ))}
                </div>

                <Button 
                  onClick={skipToTimetable}
                  variant={generationStep >= 4 ? "default" : "outline"}
                  className={generationStep >= 4 ? "bg-gradient-to-r from-primary to-secondary hover:opacity-90" : ""}
                >
                  {generationStep >= 4 ? (
                    <>
                      View Your Timetable
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  ) : (
                    "Skip Preview"
                  )}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {currentStep === "timetable" && (
          <motion.div
            key="timetable"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="relative z-10"
          >
            {/* Floating Stats Cards */}
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

            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Play className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Your Generated Schedule</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-display font-bold mb-2">
                Wednesday, 15th January
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
                        <div className="text-center min-w-[80px]">
                          <p className={`font-bold ${session.completed ? "text-muted-foreground" : "text-foreground"}`}>
                            {session.time}
                          </p>
                          <p className="text-xs text-muted-foreground">{session.duration}</p>
                        </div>

                        {/* Divider */}
                        <div className={`w-px h-12 ${session.completed ? "bg-muted-foreground/20" : "bg-border"}`} />

                        {/* Icon */}
                        <motion.div 
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform`}
                          animate={{ 
                            scale: isHovering === session.id && session.type === "study" && !session.completed ? 1.1 : 1,
                            rotate: isHovering === session.id && session.type === "study" && !session.completed ? [0, -5, 5, 0] : 0
                          }}
                          style={{
                            backgroundColor: session.completed ? "hsl(var(--muted))" : `hsl(var(--${session.color}) / 0.1)`,
                            color: session.completed ? "hsl(var(--muted-foreground))" : `hsl(var(--${session.color}))`
                          }}
                        >
                          {session.icon}
                        </motion.div>

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
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      <Timer className="w-4 h-4" />
                      Session in Progress
                    </div>
                    <h3 className="text-2xl font-bold">{activeSession.subject}</h3>
                    <p className="text-muted-foreground">{activeSession.topic}</p>
                  </div>

                  <div className="relative w-48 h-48 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="96" cy="96" r="88" stroke="hsl(var(--muted))" strokeWidth="8" fill="none" />
                      <motion.circle
                        cx="96" cy="96" r="88"
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

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{timerProgress}%</span>
                    </div>
                    <Progress value={timerProgress} className="h-2" />
                  </div>

                  <Button 
                    size="lg" 
                    onClick={finishSession}
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  >
                    <CheckCircle2 className="mr-2 w-5 h-5" />
                    Finish Session
                  </Button>

                  <Button variant="ghost" onClick={backToTimetable} className="text-muted-foreground">
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
                  <div className="text-center space-y-2">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                      transition={{ rotate: { repeat: Infinity, duration: 2 } }}
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center mx-auto"
                    >
                      <Brain className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold">Session Reflection</h3>
                    <p className="text-muted-foreground">How did your {activeSession.subject} session go?</p>
                  </div>

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
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { icon: BarChart3, value: `${completedCount + 1}`, label: "Sessions Done", color: "primary" },
                      { icon: Clock, value: "2.5h", label: "Study Time", color: "secondary" },
                      { icon: Zap, value: "8", label: "Day Streak", color: "accent" },
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * (i + 1) }}
                        className="text-center p-4 rounded-xl"
                        style={{ backgroundColor: `hsl(var(--${stat.color}) / 0.1)` }}
                      >
                        <stat.icon className="w-6 h-6 mx-auto mb-2" style={{ color: `hsl(var(--${stat.color}))` }} />
                        <p className="text-2xl font-bold" style={{ color: `hsl(var(--${stat.color}))` }}>{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20"
                  >
                    <div className="flex items-start gap-3">
                      <motion.div 
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0"
                      >
                        <Brain className="w-5 h-5 text-white" />
                      </motion.div>
                      <div>
                        <p className="font-medium mb-1">AI Recommendation</p>
                        <p className="text-sm text-muted-foreground">
                          Great progress on Biology! I've added an extra 15-minute review session tomorrow to reinforce cell division concepts before your test.
                        </p>
                      </div>
                    </div>
                  </motion.div>

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

                  <Button size="lg" onClick={backToTimetable} className="w-full" variant="outline">
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
