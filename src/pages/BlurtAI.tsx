import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Brain, Sparkles, Target, Zap, BookOpen, Play, Star, Clock, TrendingUp, Radio } from "lucide-react";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { BlurtAIPracticeSession } from "@/components/BlurtAIPracticeSession";

interface Timetable {
  id: string;
  name: string;
  subjects: any[];
  topics: any[];
  schedule: any;
}

interface ScheduleSession {
  subject: string;
  topic: string;
  startTime: string;
  endTime: string;
  duration: number;
}

interface TopicWithStats {
  id: string;
  name: string;
  subjectId: string;
  subjectName: string;
  practiceCount: number;
  isRecommended: boolean;
  isHappeningNow?: boolean;
  isUpNext?: boolean;
  scheduledTime?: string;
  avgConfidence?: number;
  avgAccuracy?: number;
}

const BlurtAI = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [selectedTimetableId, setSelectedTimetableId] = useState<string>("");
  const [topicsWithStats, setTopicsWithStats] = useState<TopicWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [practiceSession, setPracticeSession] = useState<{ subject: string; topic: string } | null>(null);
  const [totalPracticeSessions, setTotalPracticeSessions] = useState(0);
  const [totalPracticeTime, setTotalPracticeTime] = useState(0);
  const [recommendedTopic, setRecommendedTopic] = useState<TopicWithStats | null>(null);
  const [currentSession, setCurrentSession] = useState<ScheduleSession | null>(null);
  const [upNextSession, setUpNextSession] = useState<ScheduleSession | null>(null);

  // Fetch timetables
  useEffect(() => {
    const fetchTimetables = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("timetables")
          .select("id, name, subjects, topics, schedule")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        const parsed = (data || []).map(t => ({
          id: t.id,
          name: t.name,
          subjects: (t.subjects as any[]) || [],
          topics: (t.topics as any[]) || [],
          schedule: t.schedule || {},
        }));
        
        setTimetables(parsed);
        if (parsed.length > 0 && !selectedTimetableId) {
          setSelectedTimetableId(parsed[0].id);
        }
      } catch (err) {
        console.error("Error fetching timetables:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetables();
  }, [user]);

  // Parse time string to minutes from midnight
  const parseTimeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Get current time in minutes from midnight
  const getCurrentTimeMinutes = (): number => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

  // Find current and upcoming sessions from today's schedule
  const findCurrentAndUpNextSessions = (schedule: any): { current: ScheduleSession | null; upNext: ScheduleSession | null } => {
    const today = new Date().toISOString().split("T")[0];
    const todaySchedule: ScheduleSession[] = schedule[today] || [];
    
    if (todaySchedule.length === 0) {
      return { current: null, upNext: null };
    }

    const currentMinutes = getCurrentTimeMinutes();
    let currentSession: ScheduleSession | null = null;
    let upNextSession: ScheduleSession | null = null;

    // Sort sessions by start time
    const sortedSessions = [...todaySchedule].sort((a, b) => 
      parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
    );

    for (let i = 0; i < sortedSessions.length; i++) {
      const session = sortedSessions[i];
      const startMinutes = parseTimeToMinutes(session.startTime);
      const endMinutes = parseTimeToMinutes(session.endTime);

      // Check if current time is within this session
      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        currentSession = session;
        // Up next is the next session after this one
        if (i + 1 < sortedSessions.length) {
          upNextSession = sortedSessions[i + 1];
        }
        break;
      }
      
      // Check if this session is upcoming
      if (currentMinutes < startMinutes && !upNextSession) {
        upNextSession = session;
        break;
      }
    }

    return { current: currentSession, upNext: upNextSession };
  };

  // Fetch practice stats and build topic list when timetable changes
  useEffect(() => {
    const fetchTopicsAndStats = async () => {
      if (!user || !selectedTimetableId) return;

      const selectedTimetable = timetables.find(t => t.id === selectedTimetableId);
      if (!selectedTimetable) return;

      try {
        // Fetch practice counts and stats from blurt_activity_logs
        const { data: activityLogs, error: logsError } = await supabase
          .from("blurt_activity_logs")
          .select("topic_name, subject_name, duration_seconds, confidence_level, accuracy_percentage")
          .eq("user_id", user.id);

        if (logsError) throw logsError;

        // Calculate practice counts and averages per topic
        const practiceStatsMap: Record<string, { 
          count: number; 
          totalTime: number;
          confidenceSum: number;
          confidenceCount: number;
          accuracySum: number;
          accuracyCount: number;
        }> = {};
        
        let totalTime = 0;
        (activityLogs || []).forEach(log => {
          const key = `${log.subject_name}:${log.topic_name}`;
          if (!practiceStatsMap[key]) {
            practiceStatsMap[key] = { 
              count: 0, 
              totalTime: 0, 
              confidenceSum: 0, 
              confidenceCount: 0,
              accuracySum: 0,
              accuracyCount: 0
            };
          }
          practiceStatsMap[key].count++;
          practiceStatsMap[key].totalTime += log.duration_seconds || 0;
          if (log.confidence_level) {
            practiceStatsMap[key].confidenceSum += log.confidence_level;
            practiceStatsMap[key].confidenceCount++;
          }
          if (log.accuracy_percentage) {
            practiceStatsMap[key].accuracySum += log.accuracy_percentage;
            practiceStatsMap[key].accuracyCount++;
          }
          totalTime += log.duration_seconds || 0;
        });

        setTotalPracticeSessions(activityLogs?.length || 0);
        setTotalPracticeTime(Math.round(totalTime / 60));

        // Find current and upcoming sessions
        const { current, upNext } = findCurrentAndUpNextSessions(selectedTimetable.schedule);
        setCurrentSession(current);
        setUpNextSession(upNext);

        // Find today's scheduled topics for recommendations
        const today = new Date().toISOString().split("T")[0];
        const todaySchedule: ScheduleSession[] = selectedTimetable.schedule[today] || [];
        const scheduledTopicNames = todaySchedule.map((s: any) => s.topic?.toLowerCase());

        // Build topics with stats
        const topics: TopicWithStats[] = selectedTimetable.topics.map((topic: any) => {
          const subject = selectedTimetable.subjects.find((s: any) => s.id === topic.subject_id);
          const subjectName = subject?.name || "Unknown";
          const key = `${subjectName}:${topic.name}`;
          const stats = practiceStatsMap[key];
          const isRecommended = scheduledTopicNames.includes(topic.name?.toLowerCase());
          
          // Check if this topic is happening now or up next
          const isHappeningNow = current?.topic?.toLowerCase() === topic.name?.toLowerCase() && 
                                  current?.subject?.toLowerCase() === subjectName?.toLowerCase();
          const isUpNext = upNext?.topic?.toLowerCase() === topic.name?.toLowerCase() && 
                          upNext?.subject?.toLowerCase() === subjectName?.toLowerCase();

          return {
            id: topic.id || `${topic.subject_id}-${topic.name}`,
            name: topic.name,
            subjectId: topic.subject_id,
            subjectName,
            practiceCount: stats?.count || 0,
            isRecommended,
            isHappeningNow,
            isUpNext,
            scheduledTime: isHappeningNow ? current?.startTime : isUpNext ? upNext?.startTime : undefined,
            avgConfidence: stats?.confidenceCount > 0 
              ? Math.round(stats.confidenceSum / stats.confidenceCount * 10) / 10 
              : undefined,
            avgAccuracy: stats?.accuracyCount > 0 
              ? Math.round(stats.accuracySum / stats.accuracyCount) 
              : undefined,
          };
        });

        setTopicsWithStats(topics);

        // Set recommended topic with priority: happening now > up next > scheduled today > lowest practice
        let recommended = topics.find(t => t.isHappeningNow);
        if (!recommended) {
          recommended = topics.find(t => t.isUpNext);
        }
        if (!recommended) {
          recommended = topics
            .filter(t => t.isRecommended)
            .sort((a, b) => a.practiceCount - b.practiceCount)[0];
        }
        if (!recommended) {
          recommended = topics.sort((a, b) => a.practiceCount - b.practiceCount)[0];
        }
        setRecommendedTopic(recommended);

      } catch (err) {
        console.error("Error fetching topics and stats:", err);
      }
    };

    fetchTopicsAndStats();
  }, [user, selectedTimetableId, timetables]);

  // Group topics by subject
  const topicsBySubject = topicsWithStats.reduce((acc, topic) => {
    if (!acc[topic.subjectName]) {
      acc[topic.subjectName] = [];
    }
    acc[topic.subjectName].push(topic);
    return acc;
  }, {} as Record<string, TopicWithStats[]>);

  const handleStartPractice = (subject: string, topic: string) => {
    setPracticeSession({ subject, topic });
  };

  const handleSessionComplete = () => {
    setPracticeSession(null);
    // Trigger re-fetch by changing the ID reference
    const currentId = selectedTimetableId;
    setSelectedTimetableId("");
    setTimeout(() => setSelectedTimetableId(currentId), 10);
  };

  const selectedTimetable = timetables.find(t => t.id === selectedTimetableId);

  const getRecommendationBadge = (topic: TopicWithStats) => {
    if (topic.isHappeningNow) {
      return (
        <Badge className="bg-green-500/20 text-green-600 border-green-500/30 animate-pulse">
          <Radio className="w-3 h-3 mr-1" />
          Happening Now
        </Badge>
      );
    }
    if (topic.isUpNext) {
      return (
        <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">
          <Clock className="w-3 h-3 mr-1" />
          Up Next {topic.scheduledTime && `at ${topic.scheduledTime}`}
        </Badge>
      );
    }
    if (topic.isRecommended) {
      return (
        <Badge className="bg-primary/20 text-primary border-primary/30">
          <Star className="w-3 h-3 mr-1" />
          Scheduled Today
        </Badge>
      );
    }
    return null;
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
        <Header />
        
        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Back Button */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/ai-insights?tab=overview")}
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              View Activity
            </Button>
          </div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-secondary/20 via-secondary/10 to-primary/10 border border-secondary/30 p-6 md:p-8"
          >
            <div className="absolute top-4 right-4 w-20 h-20 bg-secondary/20 rounded-full blur-2xl" />
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-primary/20 rounded-full blur-xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center shadow-lg">
                  <Brain className="w-8 h-8 md:w-10 md:h-10 text-secondary-foreground" />
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">BlurtAI Practice</h1>
                  <Badge variant="secondary" className="bg-secondary/30 text-secondary-foreground border-secondary/50">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI-Powered
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
                  Master your revision with active recall. Choose a topic and test yourself.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Timetable Selector */}
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Select Timetable:</span>
                </div>
                <Select value={selectedTimetableId} onValueChange={setSelectedTimetableId}>
                  <SelectTrigger className="w-full sm:w-[280px]">
                    <SelectValue placeholder="Choose a timetable" />
                  </SelectTrigger>
                  <SelectContent>
                    {timetables.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalPracticeSessions}</p>
                  <p className="text-xs text-muted-foreground">Practice Sessions</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalPracticeTime} min</p>
                  <p className="text-xs text-muted-foreground">Total Practice Time</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{Object.keys(topicsBySubject).length}</p>
                  <p className="text-xs text-muted-foreground">Subjects Available</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommended Topic */}
          {recommendedTopic && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className={cn(
                "border",
                recommendedTopic.isHappeningNow 
                  ? "bg-gradient-to-r from-green-500/10 to-green-500/5 border-green-500/30" 
                  : recommendedTopic.isUpNext
                  ? "bg-gradient-to-r from-blue-500/10 to-blue-500/5 border-blue-500/30"
                  : "bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        recommendedTopic.isHappeningNow 
                          ? "bg-green-500/20" 
                          : recommendedTopic.isUpNext
                          ? "bg-blue-500/20"
                          : "bg-primary/20"
                      )}>
                        {recommendedTopic.isHappeningNow ? (
                          <Radio className="w-5 h-5 text-green-600" />
                        ) : (
                          <Star className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {recommendedTopic.isHappeningNow 
                            ? "Happening Now" 
                            : recommendedTopic.isUpNext 
                            ? "Up Next" 
                            : "Recommended Now"}
                        </p>
                        <p className="font-semibold text-foreground">
                          {recommendedTopic.subjectName}: {recommendedTopic.name}
                        </p>
                        {recommendedTopic.avgConfidence && (
                          <p className="text-xs text-muted-foreground">
                            Avg confidence: {recommendedTopic.avgConfidence}/5
                          </p>
                        )}
                      </div>
                      {getRecommendationBadge(recommendedTopic)}
                    </div>
                    <Button 
                      onClick={() => handleStartPractice(recommendedTopic.subjectName, recommendedTopic.name)}
                      className="gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Start Practice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Subjects & Topics Accordion */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Subjects & Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : Object.keys(topicsBySubject).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No topics found. Select a timetable with topics to get started.
                </p>
              ) : (
                <Accordion type="multiple" className="space-y-2">
                  {Object.entries(topicsBySubject).map(([subject, topics]) => (
                    <AccordionItem key={subject} value={subject} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{subject}</span>
                          <Badge variant="outline" className="text-xs">
                            {topics.length} topics
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-2">
                          {topics.map((topic) => (
                            <div
                              key={topic.id}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-lg transition-colors",
                                topic.isHappeningNow 
                                  ? "bg-green-500/10 border border-green-500/20" 
                                  : topic.isUpNext 
                                  ? "bg-blue-500/10 border border-blue-500/20"
                                  : "bg-muted/30 hover:bg-muted/50"
                              )}
                            >
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-sm font-medium">{topic.name}</span>
                                {topic.practiceCount > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    Practiced: {topic.practiceCount}x
                                  </Badge>
                                )}
                                {topic.avgConfidence && (
                                  <Badge variant="outline" className="text-xs">
                                    <Star className="w-3 h-3 mr-1 text-amber-400" />
                                    {topic.avgConfidence}/5
                                  </Badge>
                                )}
                                {getRecommendationBadge(topic)}
                              </div>
                              <Button
                                size="sm"
                                variant={topic.isHappeningNow ? "default" : "outline"}
                                onClick={() => handleStartPractice(subject, topic.name)}
                                className="gap-1"
                              >
                                <Play className="w-3 h-3" />
                                Start
                              </Button>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </main>

        {/* Practice Session Dialog */}
        {practiceSession && (
          <BlurtAIPracticeSession
            open={!!practiceSession}
            onOpenChange={(open) => !open && setPracticeSession(null)}
            subject={practiceSession.subject}
            topic={practiceSession.topic}
            plannedDurationMinutes={25}
            onComplete={handleSessionComplete}
            userId={user?.id}
          />
        )}
      </div>
    </PageTransition>
  );
};

// Helper for conditional classes
const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(" ");

export default BlurtAI;