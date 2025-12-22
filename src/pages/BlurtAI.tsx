import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Brain, Sparkles, Target, Zap, BookOpen, Play, Star, Clock, TrendingUp } from "lucide-react";
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

interface TopicWithStats {
  id: string;
  name: string;
  subjectId: string;
  subjectName: string;
  practiceCount: number;
  isRecommended: boolean;
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

  // Fetch practice stats and build topic list when timetable changes
  useEffect(() => {
    const fetchTopicsAndStats = async () => {
      if (!user || !selectedTimetableId) return;

      const selectedTimetable = timetables.find(t => t.id === selectedTimetableId);
      if (!selectedTimetable) return;

      try {
        // Fetch practice counts from blurt_activity_logs
        const { data: activityLogs, error: logsError } = await supabase
          .from("blurt_activity_logs")
          .select("topic_name, subject_name, duration_seconds")
          .eq("user_id", user.id);

        if (logsError) throw logsError;

        // Calculate practice counts per topic
        const practiceCountMap: Record<string, number> = {};
        let totalTime = 0;
        (activityLogs || []).forEach(log => {
          const key = `${log.subject_name}:${log.topic_name}`;
          practiceCountMap[key] = (practiceCountMap[key] || 0) + 1;
          totalTime += log.duration_seconds || 0;
        });

        setTotalPracticeSessions(activityLogs?.length || 0);
        setTotalPracticeTime(Math.round(totalTime / 60)); // Convert to minutes

        // Find today's scheduled topics for recommendations
        const today = new Date().toISOString().split("T")[0];
        const todaySchedule = selectedTimetable.schedule[today] || [];
        const scheduledTopicNames = todaySchedule.map((s: any) => s.topic?.toLowerCase());

        // Build topics with stats
        const topics: TopicWithStats[] = selectedTimetable.topics.map((topic: any) => {
          const subject = selectedTimetable.subjects.find((s: any) => s.id === topic.subject_id);
          const subjectName = subject?.name || "Unknown";
          const key = `${subjectName}:${topic.name}`;
          const isRecommended = scheduledTopicNames.includes(topic.name?.toLowerCase());

          return {
            id: topic.id || `${topic.subject_id}-${topic.name}`,
            name: topic.name,
            subjectId: topic.subject_id,
            subjectName,
            practiceCount: practiceCountMap[key] || 0,
            isRecommended,
          };
        });

        setTopicsWithStats(topics);

        // Set recommended topic (first scheduled topic with lowest practice count)
        const recommended = topics
          .filter(t => t.isRecommended)
          .sort((a, b) => a.practiceCount - b.practiceCount)[0] 
          || topics.sort((a, b) => a.practiceCount - b.practiceCount)[0];
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
    // Refresh stats
    setSelectedTimetableId(prev => prev); // Trigger re-fetch
  };

  const selectedTimetable = timetables.find(t => t.id === selectedTimetableId);

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
              onClick={() => navigate("/activity")}
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
              <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Star className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Recommended Now</p>
                        <p className="font-semibold text-foreground">{recommendedTopic.subjectName}: {recommendedTopic.name}</p>
                      </div>
                      {recommendedTopic.isRecommended && (
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                          Scheduled Today
                        </Badge>
                      )}
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
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium">{topic.name}</span>
                                {topic.practiceCount > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    Practiced: {topic.practiceCount}x
                                  </Badge>
                                )}
                                {topic.isRecommended && (
                                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                                    <Star className="w-3 h-3 mr-1" />
                                    Recommended
                                  </Badge>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
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

export default BlurtAI;
