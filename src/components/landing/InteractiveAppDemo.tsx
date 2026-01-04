import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Clock, CheckCircle2, Play, Sparkles, 
  TrendingUp, Target, RefreshCw, BookOpen, Brain, BarChart3,
  ArrowRight, ChevronRight, Star, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

// Demo data
const demoSubjects = [
  { name: "Mathematics", topics: 12, color: "bg-primary/10 border-primary/30" },
  { name: "Biology", topics: 15, color: "bg-secondary/10 border-secondary/30" },
  { name: "Physics", topics: 10, color: "bg-accent/10 border-accent/30" },
  { name: "Chemistry", topics: 14, color: "bg-primary/10 border-primary/30" },
];

const demoSessions = [
  { time: "15:30", duration: "45 min", subject: "Biology", topic: "Cell Division - Mitosis", status: "upcoming" },
  { time: "16:30", duration: "90 min", subject: "Football Practice", topic: "Team training", status: "event" },
  { time: "18:15", duration: "45 min", subject: "Physics", topic: "Newton's Laws", status: "upcoming" },
  { time: "19:15", duration: "30 min", subject: "Chemistry", topic: "Atomic Structure", status: "upcoming" },
];

const demoPracticeTools = [
  { name: "SaveMyExams", desc: "Past papers & marking schemes", icon: MessageSquare, color: "bg-primary" },
  { name: "Blurt AI", desc: "Active recall practice", icon: Brain, color: "bg-primary" },
  { name: "Physics & Maths Tutor", desc: "Video explanations", icon: BarChart3, color: "bg-primary" },
];

interface TabConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  title: string;
  description: string;
  benefits: string[];
}

const tabConfigs: TabConfig[] = [
  {
    id: "generation",
    label: "Timetable",
    icon: Calendar,
    title: "AI-Powered Timetable Generation",
    description: "Tell us your subjects, exam dates, and available time. Our AI creates a personalized study schedule that adapts to your life.",
    benefits: [
      "Add subjects & topics from your syllabus",
      "AI prioritizes based on exam proximity",
      "Fits around school, activities & breaks",
    ],
  },
  {
    id: "schedule",
    label: "Daily View",
    icon: Clock,
    title: "Your Daily Study Schedule",
    description: "See exactly what to study and when. Start sessions with one click and track your progress throughout the day.",
    benefits: [
      "Clear daily overview of sessions",
      "One-click session start",
      "Automatic break scheduling",
    ],
  },
  {
    id: "review",
    label: "Review",
    icon: CheckCircle2,
    title: "End-of-Day Review",
    description: "Complete sessions, reflect on your learning, and earn XP. Build streaks and see your mastery grow.",
    benefits: [
      "Rate your confidence after each topic",
      "Track XP and study streaks",
      "See your daily accomplishments",
    ],
  },
  {
    id: "reschedule",
    label: "Reschedule",
    icon: RefreshCw,
    title: "Smart Rescheduling",
    description: "Life happens! Missed a session? AI automatically redistributes your work to keep you on track without stress.",
    benefits: [
      "Automatic missed session handling",
      "Intelligent priority redistribution",
      "Never fall behind on your plan",
    ],
  },
  {
    id: "practice",
    label: "Practice",
    icon: BookOpen,
    title: "Integrated Practice Hub",
    description: "Connect to your favorite study tools – SaveMyExams, PMT, Blurt AI and more. All progress tracked in one place.",
    benefits: [
      "SaveMyExams, PMT, Quizlet integration",
      "Blurt AI for active recall",
      "All practice logged automatically",
    ],
  },
];

export const InteractiveAppDemo = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("generation");
  const [selectedSession, setSelectedSession] = useState<number | null>(null);

  const activeConfig = tabConfigs.find(t => t.id === activeTab)!;

  return (
    <section id="try-demo" className="py-16 md:py-24 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-muted/20 to-background">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Interactive Demo</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-3">
            Try it yourself
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore how Vistara helps you study smarter, not harder
          </p>
        </motion.div>

        {/* Main Demo Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border shadow-xl overflow-hidden"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab Navigation - Top bar like the reference */}
            <div className="border-b bg-muted/30 px-2 py-2">
              <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-transparent h-auto gap-1">
                {tabConfigs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex-shrink-0 gap-2 px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border rounded-lg transition-all text-sm font-medium"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {/* Content Grid - Split View */}
            <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
              {/* Left Side - Interactive Demo UI */}
              <div className="min-h-[480px] bg-background">
                <AnimatePresence mode="wait">
                  {/* Timetable Generation Demo */}
                  <TabsContent value="generation" className="m-0 h-full">
                    <motion.div
                      key="generation"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-6 h-full"
                    >
                      <div className="space-y-5">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-3">Your Subjects</h4>
                          <div className="grid grid-cols-2 gap-3">
                            {demoSubjects.map((subject, i) => (
                              <motion.div
                                key={subject.name}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className={`p-4 rounded-xl border ${subject.color} cursor-pointer hover:scale-[1.02] transition-transform`}
                              >
                                <p className="font-semibold text-sm">{subject.name}</p>
                                <p className="text-xs text-muted-foreground">{subject.topics} topics</p>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">AI Optimization</span>
                            <span className="font-medium text-primary">87%</span>
                          </div>
                          <Progress value={87} className="h-2" />
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <Sparkles className="w-3 h-3 text-primary" />
                            </motion.div>
                            <span>Analyzing difficulty levels and exam proximity...</span>
                          </div>
                        </div>

                        <div className="bg-muted/40 rounded-xl p-4">
                          <p className="text-xs font-medium mb-3 text-muted-foreground">Preview: Monday Schedule</p>
                          <div className="space-y-2">
                            {["06:45 - Mathematics", "15:30 - Biology", "18:15 - Physics"].map((item, i) => (
                              <motion.div
                                key={item}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                                className="flex items-center gap-3 text-sm bg-background rounded-lg px-3 py-2 border"
                              >
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span>{item}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* Daily Schedule Demo */}
                  <TabsContent value="schedule" className="m-0 h-full">
                    <motion.div
                      key="schedule"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-6 h-full"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">Today's Sessions</h4>
                        <span className="text-sm text-muted-foreground">Monday, Jan 6</span>
                      </div>
                      <div className="space-y-3">
                        {demoSessions.map((session, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            onClick={() => setSelectedSession(selectedSession === i ? null : i)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                              selectedSession === i 
                                ? "border-primary bg-primary/5 shadow-sm" 
                                : session.status === "event"
                                ? "border-accent/30 bg-accent/5"
                                : "border-border hover:border-primary/40 bg-background"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                  session.status === "event" ? "bg-accent/20" : "bg-primary/10"
                                }`}>
                                  {session.status === "event" ? (
                                    <Target className="w-5 h-5 text-accent" />
                                  ) : (
                                    <BookOpen className="w-5 h-5 text-primary" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{session.subject}</p>
                                  <p className="text-xs text-muted-foreground">{session.topic}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-sm">{session.time}</p>
                                <p className="text-xs text-muted-foreground">{session.duration}</p>
                              </div>
                            </div>
                            {selectedSession === i && session.status !== "event" && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-3 pt-3 border-t"
                              >
                                <Button size="sm" className="w-full gap-2">
                                  <Play className="w-4 h-4" />
                                  Start Session
                                </Button>
                              </motion.div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* Review Demo */}
                  <TabsContent value="review" className="m-0 h-full">
                    <motion.div
                      key="review"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-6 h-full"
                    >
                      <div className="space-y-5">
                        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                          <CardContent className="p-5 text-center">
                            <motion.div
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <CheckCircle2 className="w-14 h-14 mx-auto text-primary mb-3" />
                            </motion.div>
                            <h4 className="text-lg font-bold mb-1">Biology - Cell Division</h4>
                            <p className="text-sm text-muted-foreground mb-4">45 minutes completed</p>
                            <div className="flex items-center justify-center gap-6">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-primary">+50</p>
                                <p className="text-xs text-muted-foreground">XP Earned</p>
                              </div>
                              <div className="w-px h-10 bg-border" />
                              <div className="text-center">
                                <p className="text-2xl font-bold text-orange-500">7</p>
                                <p className="text-xs text-muted-foreground">Day Streak</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <div>
                          <p className="text-sm font-medium mb-3">How confident do you feel?</p>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <motion.button
                                key={rating}
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.95 }}
                                className={`flex-1 p-3 rounded-xl border transition-colors ${
                                  rating === 4 
                                    ? "border-primary bg-primary/10" 
                                    : "border-border hover:border-primary/40 bg-background"
                                }`}
                              >
                                <Star className={`w-5 h-5 mx-auto ${rating <= 4 ? "text-primary fill-primary" : "text-muted-foreground"}`} />
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        <div className="bg-muted/40 rounded-xl p-4">
                          <p className="text-xs font-medium mb-3 text-muted-foreground">Today's Progress</p>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-xl font-bold">3/4</p>
                              <p className="text-xs text-muted-foreground">Sessions</p>
                            </div>
                            <div>
                              <p className="text-xl font-bold text-primary">150</p>
                              <p className="text-xs text-muted-foreground">XP Today</p>
                            </div>
                            <div>
                              <p className="text-xl font-bold text-orange-500">2.5h</p>
                              <p className="text-xs text-muted-foreground">Studied</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* Reschedule Demo */}
                  <TabsContent value="reschedule" className="m-0 h-full">
                    <motion.div
                      key="reschedule"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-6 h-full"
                    >
                      <div className="space-y-5">
                        <Card className="border-orange-400/30 bg-orange-500/5">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5 text-orange-500" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">Missed: Physics - Newton's Laws</p>
                                <p className="text-xs text-muted-foreground">Was scheduled for 18:15</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <div className="text-center py-3">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="w-10 h-10 mx-auto mb-2"
                          >
                            <RefreshCw className="w-10 h-10 text-primary" />
                          </motion.div>
                          <p className="font-medium text-sm">AI is rescheduling...</p>
                          <p className="text-xs text-muted-foreground">Finding the best time for your missed session</p>
                        </div>

                        <Card className="border-primary/20 bg-primary/5">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                              <p className="font-medium text-sm">New Schedule</p>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between bg-background rounded-lg px-3 py-2 border text-sm">
                                <span>Physics - Newton's Laws</span>
                                <span className="font-medium text-primary">Tomorrow 06:45</span>
                              </div>
                              <div className="flex items-center justify-between bg-background rounded-lg px-3 py-2 border text-sm">
                                <span>Chemistry moved to</span>
                                <span className="font-medium">Tomorrow 15:30</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* Practice Hub Demo */}
                  <TabsContent value="practice" className="m-0 h-full">
                    <motion.div
                      key="practice"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-6 h-full"
                    >
                      <div className="space-y-5">
                        <h4 className="font-semibold text-sm">Choose Your Practice Tool</h4>
                        
                        <div className="space-y-3">
                          {demoPracticeTools.map((tool, i) => {
                            const Icon = tool.icon;
                            return (
                              <motion.div
                                key={tool.name}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                whileHover={{ scale: 1.01 }}
                                className="p-4 rounded-xl border bg-background hover:border-primary/40 cursor-pointer transition-all flex items-center gap-4"
                              >
                                <div className={`w-11 h-11 rounded-xl ${tool.color} flex items-center justify-center`}>
                                  <Icon className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm">{tool.name}</p>
                                  <p className="text-xs text-muted-foreground">{tool.desc}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                              </motion.div>
                            );
                          })}
                        </div>

                        <div className="bg-muted/40 rounded-xl p-4">
                          <p className="text-xs font-medium mb-3 text-muted-foreground">Recent Practice</p>
                          <div className="space-y-2">
                            {["Biology - Cell Division (Blurt AI)", "Physics - Forces (SaveMyExams)"].map((item, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                                <span className="truncate">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>
              </div>

              {/* Right Side - Clean Infographic Panel */}
              <div className="bg-muted/20 p-6 lg:p-8 flex flex-col min-h-[480px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col h-full"
                  >
                    {/* Feature Icon */}
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                      <activeConfig.icon className="w-6 h-6 text-primary" />
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl lg:text-2xl font-bold mb-3">{activeConfig.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">{activeConfig.description}</p>

                    {/* Benefits List with Check Icons */}
                    <div className="space-y-4 flex-1">
                      {activeConfig.benefits.map((benefit, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + i * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="text-sm">{benefit}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Curved Arrow with "Try it live" */}
                    <div className="my-6 relative h-12 flex items-center justify-end">
                      <svg className="absolute left-1/4 right-16 h-full" viewBox="0 0 150 40" preserveAspectRatio="none">
                        <motion.path
                          d="M 0 30 Q 75 5 140 25"
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="2"
                          strokeLinecap="round"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 0.6 }}
                          transition={{ duration: 0.8, delay: 0.4 }}
                        />
                        <motion.polygon
                          points="135,20 145,25 135,30"
                          fill="hsl(var(--primary))"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.6 }}
                          transition={{ delay: 1 }}
                        />
                      </svg>
                      <motion.span
                        className="relative text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full"
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.1 }}
                      >
                        Try it live →
                      </motion.span>
                    </div>

                    {/* CTA Button */}
                    <Button
                      size="lg"
                      onClick={() => navigate("/auth")}
                      className="w-full gap-2 shadow-md"
                    >
                      Get Started Free
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
};

export default InteractiveAppDemo;
