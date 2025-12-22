import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Layers, Target, Clock, TrendingUp, BookOpen, Play, Star, Languages } from "lucide-react";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import QuizletPracticeSession from "@/components/QuizletPracticeSession";

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
  isLanguage: boolean;
}

const LANGUAGE_SUBJECTS = ["french", "spanish", "german", "mandarin", "latin", "italian", "japanese", "korean", "portuguese", "russian", "arabic", "chinese"];

const Quizlet = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [selectedTimetableId, setSelectedTimetableId] = useState<string>("");
  const [topicsWithStats, setTopicsWithStats] = useState<TopicWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [practiceSession, setPracticeSession] = useState<{ subject: string; topic: string } | null>(null);
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

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

  useEffect(() => {
    const fetchTopicsAndStats = async () => {
      if (!user || !selectedTimetableId) return;

      const selectedTimetable = timetables.find(t => t.id === selectedTimetableId);
      if (!selectedTimetable) return;

      try {
        const { data: activityLogs, error } = await supabase
          .from("blurt_activity_logs")
          .select("topic_name, subject_name, duration_seconds, session_type")
          .eq("user_id", user.id)
          .eq("session_type", "quizlet");

        if (error) throw error;

        const practiceMap: Record<string, number> = {};
        let totalTimeSeconds = 0;

        (activityLogs || []).forEach(log => {
          const key = `${log.subject_name}:${log.topic_name}`;
          practiceMap[key] = (practiceMap[key] || 0) + 1;
          totalTimeSeconds += log.duration_seconds || 0;
        });

        setTotalSessions(activityLogs?.length || 0);
        setTotalTime(Math.round(totalTimeSeconds / 60));

        const topics: TopicWithStats[] = selectedTimetable.topics.map((topic: any) => {
          const subject = selectedTimetable.subjects.find((s: any) => s.id === topic.subject_id);
          const subjectName = subject?.name || "Unknown";
          const key = `${subjectName}:${topic.name}`;
          const isLanguage = LANGUAGE_SUBJECTS.some(lang => 
            subjectName.toLowerCase().includes(lang)
          );

          return {
            id: topic.id || `${topic.subject_id}-${topic.name}`,
            name: topic.name,
            subjectId: topic.subject_id,
            subjectName,
            practiceCount: practiceMap[key] || 0,
            isLanguage,
          };
        });

        setTopicsWithStats(topics);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchTopicsAndStats();
  }, [user, selectedTimetableId, timetables]);

  const topicsBySubject = topicsWithStats.reduce((acc, topic) => {
    if (!acc[topic.subjectName]) {
      acc[topic.subjectName] = [];
    }
    acc[topic.subjectName].push(topic);
    return acc;
  }, {} as Record<string, TopicWithStats[]>);

  // Sort subjects with languages first
  const sortedSubjects = Object.entries(topicsBySubject).sort(([a], [b]) => {
    const aIsLang = LANGUAGE_SUBJECTS.some(lang => a.toLowerCase().includes(lang));
    const bIsLang = LANGUAGE_SUBJECTS.some(lang => b.toLowerCase().includes(lang));
    if (aIsLang && !bIsLang) return -1;
    if (!aIsLang && bIsLang) return 1;
    return a.localeCompare(b);
  });

  const handleStartPractice = (subject: string, topic: string) => {
    setPracticeSession({ subject, topic });
  };

  const handleSessionComplete = () => {
    setPracticeSession(null);
    const currentId = selectedTimetableId;
    setSelectedTimetableId("");
    setTimeout(() => setSelectedTimetableId(currentId), 10);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-indigo-500/5">
        <Header />

        <main className="container mx-auto px-4 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/practice")}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Practice Hub
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
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500/20 via-indigo-500/10 to-purple-500/10 border border-indigo-500/30 p-6 md:p-8"
          >
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Layers className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">Quizlet</h1>
                  <Badge className="bg-indigo-500/20 text-indigo-600 border-indigo-500/30">Flashcards</Badge>
                </div>
                <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
                  Flashcard-based learning for vocabulary and key terms. Perfect for language learning and memorization.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Recommendation Banner */}
          <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
            <CardContent className="p-4 flex items-center gap-3">
              <Languages className="w-6 h-6 text-amber-500" />
              <div>
                <p className="font-medium text-foreground">Recommended for Languages</p>
                <p className="text-sm text-muted-foreground">
                  Quizlet is especially effective for vocabulary practice in French, Spanish, German, and other languages.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalSessions}</p>
                  <p className="text-xs text-muted-foreground">Quizlet Sessions</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalTime} min</p>
                  <p className="text-xs text-muted-foreground">Study Time</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Object.keys(topicsBySubject).length}</p>
                  <p className="text-xs text-muted-foreground">Subjects</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timetable Selector */}
          <Card className="bg-card/50">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-medium">Select Timetable:</span>
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

          {/* Topics by Subject */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                Topics by Subject
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedSubjects.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No topics found. Create a timetable first to see your topics.
                </p>
              ) : (
                <Accordion type="multiple" className="space-y-2">
                  {sortedSubjects.map(([subject, topics]) => {
                    const isLanguage = LANGUAGE_SUBJECTS.some(lang => subject.toLowerCase().includes(lang));
                    return (
                      <AccordionItem key={subject} value={subject} className={`border rounded-lg px-4 ${isLanguage ? 'border-amber-500/30 bg-amber-500/5' : ''}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{subject}</span>
                            <Badge variant="secondary">{topics.length} topics</Badge>
                            {isLanguage && (
                              <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">
                                <Languages className="w-3 h-3 mr-1" />
                                Language
                              </Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pt-2">
                            {topics.map((topic) => (
                              <div
                                key={topic.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-medium">{topic.name}</span>
                                  {topic.practiceCount > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      {topic.practiceCount} sessions
                                    </Badge>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStartPractice(subject, topic.name)}
                                  className="gap-2"
                                >
                                  <Play className="w-3 h-3" />
                                  Practice
                                </Button>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </main>

        {practiceSession && (
          <QuizletPracticeSession
            open={!!practiceSession}
            onOpenChange={(open) => !open && setPracticeSession(null)}
            subject={practiceSession.subject}
            topic={practiceSession.topic}
            onComplete={handleSessionComplete}
            userId={user?.id || ""}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default Quizlet;
