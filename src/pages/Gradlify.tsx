import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Target, TrendingUp, Calculator, ExternalLink, Play } from "lucide-react";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GradlifyPracticeSession from "@/components/GradlifyPracticeSession";

interface GradlifySession {
  id: string;
  subject_name: string;
  topic_name: string;
  created_at: string;
  duration_seconds: number;
}

const Gradlify = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<GradlifySession[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [topics, setTopics] = useState<string[]>([]);
  const [showSession, setShowSession] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch Gradlify sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .from("blurt_activity_logs")
          .select("*")
          .eq("user_id", user.id)
          .eq("session_type", "gradlify")
          .order("created_at", { ascending: false });

        if (sessionsError) throw sessionsError;

        setSessions(sessionsData || []);
        setTotalSessions(sessionsData?.length || 0);
        const time = (sessionsData || []).reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
        setTotalTime(Math.round(time / 60));

        // Fetch available subjects from timetables
        const { data: timetableData, error: timetableError } = await supabase
          .from("timetables")
          .select("subjects, topics")
          .eq("user_id", user.id);

        if (timetableError) throw timetableError;

        const allSubjects = new Set<string>();
        const allTopics: Record<string, string[]> = {};

        timetableData?.forEach((tt) => {
          const subjectsArr = tt.subjects as any[];
          subjectsArr?.forEach((s) => {
            allSubjects.add(s.name);
            if (!allTopics[s.name]) allTopics[s.name] = [];
          });

          const topicsArr = tt.topics as any[];
          topicsArr?.forEach((t) => {
            const subjectName = subjectsArr?.find((s) => s.id === t.subject_id)?.name;
            if (subjectName && allTopics[subjectName]) {
              allTopics[subjectName].push(t.name);
            }
          });
        });

        setSubjects(Array.from(allSubjects));
        
        if (selectedSubject && allTopics[selectedSubject]) {
          setTopics(allTopics[selectedSubject]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, selectedSubject]);

  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
    setSelectedTopic("");
  };

  const handleStartSession = () => {
    if (selectedSubject && selectedTopic) {
      setShowSession(true);
    }
  };

  const handleSessionComplete = () => {
    setShowSession(false);
    setSelectedSubject("");
    setSelectedTopic("");
    // Refresh data
    window.location.reload();
  };

  // Get recommended topic based on time
  const getRecommendedTopic = () => {
    if (topics.length === 0) return null;
    const hour = currentTime.getHours();
    // Simple time-based recommendation
    const index = hour % topics.length;
    return topics[index];
  };

  const recommendedTopic = getRecommendedTopic();

  if (showSession) {
    return (
      <GradlifyPracticeSession
        subject={selectedSubject}
        topic={selectedTopic}
        onComplete={handleSessionComplete}
        onCancel={() => setShowSession(false)}
      />
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-orange-500/5">
        <Header />

        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Back Button */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/practice")}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Practice
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
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-amber-500/10 border border-orange-500/30 p-6 md:p-8"
          >
            <div className="absolute top-4 right-4 w-20 h-20 bg-orange-500/20 rounded-full blur-2xl" />
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-amber-500/20 rounded-full blur-xl" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                  <Calculator className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gradlify</h1>
                  <Badge variant="secondary" className="bg-orange-500/30 text-orange-700 dark:text-orange-300 border-orange-500/50">
                    <Calculator className="w-3 h-3 mr-1" />
                    Maths Focus
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
                  Interactive maths practice with step-by-step solutions. Perfect for GCSE and A-Level maths revision.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalSessions}</p>
                  <p className="text-xs text-muted-foreground">Study Sessions</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalTime} min</p>
                  <p className="text-xs text-muted-foreground">Total Study Time</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{subjects.length}</p>
                  <p className="text-xs text-muted-foreground">Subjects Available</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Topic Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-orange-500" />
                Start Practice Session
              </CardTitle>
              <CardDescription>
                Select a subject and topic to begin practicing on Gradlify
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Select value={selectedSubject} onValueChange={handleSubjectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Topic</label>
                  <Select
                    value={selectedTopic}
                    onValueChange={setSelectedTopic}
                    disabled={!selectedSubject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic} value={topic}>
                          {topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {recommendedTopic && selectedSubject && (
                <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <p className="text-sm">
                    <span className="font-medium text-orange-600 dark:text-orange-400">Recommended:</span>{" "}
                    {recommendedTopic}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleStartSession}
                  disabled={!selectedSubject || !selectedTopic}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Session
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open("https://gradlify.com", "_blank")}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Info Note */}
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <ExternalLink className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Recommended for Maths:</span> Gradlify 
                  specializes in interactive maths practice with step-by-step solutions. Use the "Open in New Tab" 
                  option if you need to sign in.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </PageTransition>
  );
};

export default Gradlify;
