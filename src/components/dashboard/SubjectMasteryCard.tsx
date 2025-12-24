import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

interface SubjectMasteryCardProps {
  userId: string;
}

interface SubjectProgress {
  name: string;
  mastery: number;
  color: string;
}

const COLORS = [
  "from-primary to-primary/60",
  "from-secondary to-secondary/60",
  "from-accent to-accent/60",
  "from-emerald-500 to-emerald-400",
  "from-violet-500 to-violet-400",
];

export function SubjectMasteryCard({ userId }: SubjectMasteryCardProps) {
  const [subjects, setSubjects] = useState<SubjectProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) fetchMastery();
  }, [userId]);

  const fetchMastery = async () => {
    const { data: subjectsData } = await supabase
      .from("subjects")
      .select("id, name")
      .eq("user_id", userId)
      .limit(5);

    if (!subjectsData || subjectsData.length === 0) {
      setLoading(false);
      return;
    }

    // Get topic progress for each subject
    const progressPromises = subjectsData.map(async (subject, index) => {
      const { data: progressData } = await supabase
        .from("topic_progress")
        .select("progress_percentage")
        .eq("user_id", userId)
        .eq("subject_id", subject.id);

      const avgProgress = progressData && progressData.length > 0
        ? progressData.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / progressData.length
        : 0;

      return {
        name: subject.name,
        mastery: Math.round(avgProgress),
        color: COLORS[index % COLORS.length]
      };
    });

    const results = await Promise.all(progressPromises);
    setSubjects(results);
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-card to-accent/5 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-accent" />
            Subject Mastery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-8 bg-muted rounded" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (subjects.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-card to-accent/5 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-accent" />
            Subject Mastery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Add subjects to track your mastery progress
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card to-accent/5 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-accent" />
          Subject Mastery
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {subjects.map((subject, i) => (
          <motion.div
            key={subject.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="space-y-1"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium truncate max-w-[140px]">{subject.name}</span>
              <span className="text-muted-foreground">{subject.mastery}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${subject.mastery}%` }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className={`h-full rounded-full bg-gradient-to-r ${subject.color}`}
              />
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
