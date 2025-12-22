import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, BookOpen, Sparkles, ExternalLink, Play, Clock, GraduationCap } from "lucide-react";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { SaveMyExamsPracticeSession } from "@/components/SaveMyExamsPracticeSession";

interface Timetable {
  id: string;
  name: string;
  subjects: any[];
  topics: any[];
}

interface TopicInfo {
  id: string;
  name: string;
  subjectId: string;
  subjectName: string;
  examBoard?: string;
}

const SaveMyExams = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [selectedTimetableId, setSelectedTimetableId] = useState<string>("");
  const [topics, setTopics] = useState<TopicInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [practiceSession, setPracticeSession] = useState<{ subject: string; topic: string; examBoard?: string } | null>(null);
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  // Fetch timetables
  useEffect(() => {
    const fetchTimetables = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("timetables")
          .select("id, name, subjects, topics")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        const parsed = (data || []).map(t => ({
          id: t.id,
          name: t.name,
          subjects: (t.subjects as any[]) || [],
          topics: (t.topics as any[]) || [],
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
        // Fetch SaveMyExams session counts
        const { data: activityLogs, error: logsError } = await supabase
          .from("blurt_activity_logs")
          .select("duration_seconds")
          .eq("user_id", user.id)
          .eq("session_type", "savemyexams");

        if (logsError) throw logsError;

        let time = 0;
        (activityLogs || []).forEach(log => {
          time += log.duration_seconds || 0;
        });

        setTotalSessions(activityLogs?.length || 0);
        setTotalTime(Math.round(time / 60));

        // Build topics list
        const topicsList: TopicInfo[] = selectedTimetable.topics.map((topic: any) => {
          const subject = selectedTimetable.subjects.find((s: any) => s.id === topic.subject_id);
          return {
            id: topic.id || `${topic.subject_id}-${topic.name}`,
            name: topic.name,
            subjectId: topic.subject_id,
            subjectName: subject?.name || "Unknown",
            examBoard: subject?.exam_board || subject?.examBoard,
          };
        });

        setTopics(topicsList);
      } catch (err) {
        console.error("Error fetching topics and stats:", err);
      }
    };

    fetchTopicsAndStats();
  }, [user, selectedTimetableId, timetables]);

  // Group topics by subject
  const topicsBySubject = topics.reduce((acc, topic) => {
    if (!acc[topic.subjectName]) {
      acc[topic.subjectName] = { topics: [], examBoard: topic.examBoard };
    }
    acc[topic.subjectName].topics.push(topic);
    return acc;
  }, {} as Record<string, { topics: TopicInfo[]; examBoard?: string }>);

  const handleStartPractice = (subject: string, topic: string, examBoard?: string) => {
    setPracticeSession({ subject, topic, examBoard });
  };

  const handleSessionComplete = () => {
    setPracticeSession(null);
    // Refresh stats by triggering re-fetch
    setSelectedTimetableId(prev => prev);
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
          </div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-cyan-500/10 border border-emerald-500/30 p-6 md:p-8"
          >
            <div className="absolute top-4 right-4 w-20 h-20 bg-emerald-500/20 rounded-full blur-2xl" />
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-cyan-500/20 rounded-full blur-xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">SaveMyExams</h1>
                  <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/50">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    External Resource
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
                  Access revision notes, past papers, and exam resources from SaveMyExams. Select a topic to study.
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalSessions}</p>
                  <p className="text-xs text-muted-foreground">Study Sessions</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalTime} min</p>
                  <p className="text-xs text-muted-foreground">Total Study Time</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subjects & Topics Accordion */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                Subjects & Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : Object.keys(topicsBySubject).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No topics found. Select a timetable with topics to get started.
                </p>
              ) : (
                <Accordion type="multiple" className="space-y-2">
                  {Object.entries(topicsBySubject).map(([subject, { topics: subjectTopics, examBoard }]) => (
                    <AccordionItem key={subject} value={subject} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{subject}</span>
                          <Badge variant="outline" className="text-xs">
                            {subjectTopics.length} topics
                          </Badge>
                          {examBoard && (
                            <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                              {examBoard}
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-2">
                          {subjectTopics.map((topic) => (
                            <div
                              key={topic.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium">{topic.name}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStartPractice(subject, topic.name, examBoard)}
                                className="gap-1 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-400"
                              >
                                <Play className="w-3 h-3" />
                                Study
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
          <SaveMyExamsPracticeSession
            open={!!practiceSession}
            onOpenChange={(open) => !open && setPracticeSession(null)}
            subject={practiceSession.subject}
            topic={practiceSession.topic}
            examBoard={practiceSession.examBoard}
            onComplete={handleSessionComplete}
            userId={user?.id}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default SaveMyExams;
