import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Clock, CheckCircle2, Play, Sparkles, 
  Target, RefreshCw, BookOpen, Brain, BarChart3,
  ArrowRight, ChevronRight, Star, FileText, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

// Demo data matching actual app
const demoSubjects = [
  { name: "Mathematics", topics: 12, icon: "📐" },
  { name: "Biology", topics: 15, icon: "🧬" },
  { name: "Physics", topics: 10, icon: "⚡" },
  { name: "Chemistry", topics: 14, icon: "🧪" },
];

const demoSessions = [
  { time: "15:30", duration: "45 min", subject: "Biology", topic: "Cell Division - Mitosis", type: "study" },
  { time: "16:30", duration: "90 min", subject: "Football Practice", topic: "Team training", type: "event" },
  { time: "18:15", duration: "45 min", subject: "Physics", topic: "Newton's Laws", type: "study" },
  { time: "19:15", duration: "30 min", subject: "Chemistry", topic: "Atomic Structure", type: "study" },
];

const demoPracticeTools = [
  { name: "SaveMyExams", desc: "Past papers & marking schemes", icon: FileText, color: "bg-emerald-500" },
  { name: "Blurt AI", desc: "Active recall practice", icon: Brain, color: "bg-violet-500" },
  { name: "Physics & Maths Tutor", desc: "Video explanations", icon: BarChart3, color: "bg-blue-500" },
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
    <section id="try-demo" className="py-16 md:py-24 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
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
          className="bg-card rounded-2xl border shadow-2xl overflow-hidden"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab Navigation */}
            <div className="border-b bg-muted/30 px-3 py-2">
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
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-border">
              {/* Left Side - Interactive Demo UI (3 cols) */}
              <div className="lg:col-span-3 min-h-[520px] bg-background">
                <AnimatePresence mode="wait">
                  {/* Timetable Generation */}
                  <TabsContent value="generation" className="m-0 h-full">
                    <motion.div
                      key="generation"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-6 h-full"
                    >
                      <div className="space-y-6">
                        {/* Subjects Grid */}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Your Subjects</p>
                          <div className="grid grid-cols-2 gap-3">
                            {demoSubjects.map((subject, i) => (
                              <motion.div
                                key={subject.name}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.08 }}
                                className="group p-4 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 hover:border-primary/30 hover:shadow-md cursor-pointer transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{subject.icon}</span>
                                  <div>
                                    <p className="font-semibold text-sm group-hover:text-primary transition-colors">{subject.name}</p>
                                    <p className="text-xs text-muted-foreground">{subject.topics} topics</p>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* AI Progress */}
                        <div className="bg-muted/30 rounded-xl p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">AI Optimization</span>
                            </div>
                            <span className="text-sm font-bold text-primary">87%</span>
                          </div>
                          <Progress value={87} className="h-2 mb-2" />
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <Sparkles className="w-3 h-3 text-primary" />
                            </motion.div>
                            <span className="text-xs text-muted-foreground">Analyzing difficulty levels and exam proximity...</span>
                          </div>
                        </div>

                        {/* Schedule Preview */}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Preview: Monday Schedule</p>
                          <div className="space-y-2">
                            {[
                              { time: "06:45", subject: "Mathematics", color: "bg-blue-500" },
                              { time: "15:30", subject: "Biology", color: "bg-green-500" },
                              { time: "18:15", subject: "Physics", color: "bg-amber-500" },
                            ].map((item, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="flex items-center gap-3 bg-background border rounded-lg px-4 py-3 hover:shadow-sm transition-shadow"
                              >
                                <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                                <span className="text-sm font-medium text-muted-foreground w-12">{item.time}</span>
                                <span className="text-sm font-medium">{item.subject}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* Daily Schedule */}
                  <TabsContent value="schedule" className="m-0 h-full">
                    <motion.div
                      key="schedule"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-6 h-full"
                    >
                      <div className="flex items-center justify-between mb-5">
                        <h4 className="font-semibold">Today's Sessions</h4>
                        <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">Monday, Jan 6</span>
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
                                ? "border-primary bg-primary/5 shadow-md" 
                                : session.type === "event"
                                ? "border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/30"
                                : "border-border hover:border-primary/30 hover:shadow-sm bg-background"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                  session.type === "event" 
                                    ? "bg-orange-100 dark:bg-orange-900/40" 
                                    : "bg-primary/10"
                                }`}>
                                  {session.type === "event" ? (
                                    <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                  ) : (
                                    <BookOpen className="w-5 h-5 text-primary" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold text-sm">{session.subject}</p>
                                  <p className="text-xs text-muted-foreground">{session.topic}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-sm">{session.time}</p>
                                <p className="text-xs text-muted-foreground">{session.duration}</p>
                              </div>
                            </div>
                            {selectedSession === i && session.type !== "event" && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-4 pt-4 border-t"
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

                  {/* Review */}
                  <TabsContent value="review" className="m-0 h-full">
                    <motion.div
                      key="review"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-6 h-full flex flex-col justify-center"
                    >
                      <div className="space-y-6 max-w-md mx-auto w-full">
                        {/* Completion Card */}
                        <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border border-primary/20">
                          <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center"
                          >
                            <CheckCircle2 className="w-8 h-8 text-primary" />
                          </motion.div>
                          <h4 className="text-lg font-bold mb-1">Biology - Cell Division</h4>
                          <p className="text-sm text-muted-foreground mb-5">45 minutes completed</p>
                          <div className="flex items-center justify-center gap-8">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-primary">+50</p>
                              <p className="text-xs text-muted-foreground">XP Earned</p>
                            </div>
                            <div className="w-px h-12 bg-border" />
                            <div className="text-center">
                              <p className="text-2xl font-bold text-orange-500">7</p>
                              <p className="text-xs text-muted-foreground">Day Streak</p>
                            </div>
                          </div>
                        </div>

                        {/* Confidence Rating */}
                        <div>
                          <p className="text-sm font-medium mb-3 text-center">How confident do you feel?</p>
                          <div className="flex gap-2 justify-center">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <motion.button
                                key={rating}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                                  rating === 4 
                                    ? "border-primary bg-primary/10" 
                                    : "border-border hover:border-primary/40 bg-background"
                                }`}
                              >
                                <Star className={`w-5 h-5 ${rating <= 4 ? "text-primary fill-primary" : "text-muted-foreground"}`} />
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        {/* Today's Progress */}
                        <div className="bg-muted/30 rounded-xl p-4 border">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 text-center">Today's Progress</p>
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

                  {/* Reschedule */}
                  <TabsContent value="reschedule" className="m-0 h-full">
                    <motion.div
                      key="reschedule"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-6 h-full flex flex-col justify-center"
                    >
                      <div className="space-y-5 max-w-md mx-auto w-full">
                        {/* Missed Session Alert */}
                        <div className="p-4 rounded-xl border-2 border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/40">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-200 dark:bg-orange-900 flex items-center justify-center shrink-0">
                              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-orange-800 dark:text-orange-200">Missed: Physics - Newton's Laws</p>
                              <p className="text-xs text-orange-600 dark:text-orange-400">Was scheduled for 18:15</p>
                            </div>
                          </div>
                        </div>

                        {/* AI Rescheduling Animation */}
                        <div className="text-center py-4">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="inline-block mb-3"
                          >
                            <RefreshCw className="w-10 h-10 text-primary" />
                          </motion.div>
                          <p className="font-semibold text-sm">AI is rescheduling...</p>
                          <p className="text-xs text-muted-foreground">Finding the best time for your missed session</p>
                        </div>

                        {/* New Schedule */}
                        <div className="p-4 rounded-xl border-2 border-primary/30 bg-primary/5">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                            </div>
                            <p className="font-semibold text-sm">New Schedule</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between bg-background rounded-lg px-4 py-3 border">
                              <span className="text-sm">Physics - Newton's Laws</span>
                              <span className="text-sm font-semibold text-primary">Tomorrow 06:45</span>
                            </div>
                            <div className="flex items-center justify-between bg-background rounded-lg px-4 py-3 border">
                              <span className="text-sm">Chemistry moved to</span>
                              <span className="text-sm font-medium text-muted-foreground">Tomorrow 15:30</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* Practice Hub */}
                  <TabsContent value="practice" className="m-0 h-full">
                    <motion.div
                      key="practice"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-6 h-full"
                    >
                      <div className="space-y-5">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Choose Your Practice Tool</p>
                        
                        <div className="space-y-3">
                          {demoPracticeTools.map((tool, i) => {
                            const Icon = tool.icon;
                            return (
                              <motion.div
                                key={tool.name}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                whileHover={{ scale: 1.01, x: 4 }}
                                className="p-4 rounded-xl border bg-background hover:border-primary/30 hover:shadow-md cursor-pointer transition-all flex items-center gap-4"
                              >
                                <div className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center shadow-sm`}>
                                  <Icon className="w-5 h-5 text-white" />
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

                        {/* Recent Practice */}
                        <div className="bg-muted/30 rounded-xl p-4 border">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Recent Practice</p>
                          <div className="space-y-3">
                            {[
                              { text: "Biology - Cell Division", tool: "Blurt AI", time: "2 hours ago" },
                              { text: "Physics - Forces", tool: "SaveMyExams", time: "Yesterday" },
                            ].map((item, i) => (
                              <div key={i} className="flex items-center gap-3 bg-background rounded-lg p-3 border">
                                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{item.text}</p>
                                  <p className="text-xs text-muted-foreground">{item.tool} • {item.time}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>
              </div>

              {/* Right Side - Infographic Panel (2 cols) */}
              <div className="lg:col-span-2 bg-gradient-to-br from-muted/40 via-muted/20 to-background p-6 lg:p-8 flex flex-col min-h-[520px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col h-full"
                  >
                    {/* Feature Icon */}
                    <motion.div 
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 flex items-center justify-center mb-6 shadow-sm"
                    >
                      <activeConfig.icon className="w-7 h-7 text-primary" />
                    </motion.div>

                    {/* Title & Description */}
                    <h3 className="text-xl lg:text-2xl font-bold mb-3 leading-tight">{activeConfig.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-8">{activeConfig.description}</p>

                    {/* Benefits List */}
                    <div className="space-y-4 flex-1">
                      {activeConfig.benefits.map((benefit, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm leading-relaxed">{benefit}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* CTA Section */}
                    <div className="mt-auto pt-6 space-y-4">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span>Try it live with your own subjects</span>
                      </motion.div>
                      
                      <Button
                        size="lg"
                        onClick={() => navigate("/auth")}
                        className="w-full gap-2 shadow-lg hover:shadow-xl transition-shadow"
                      >
                        Get Started Free
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
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
