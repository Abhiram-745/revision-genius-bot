import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, GripVertical, TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Subject, Topic } from "../OnboardingWizard";
import { SubjectPriority } from "./SubjectPriorityStep";

interface SmartPriorityStepProps {
  subjects: Subject[];
  topics: Topic[];
  subjectPriorities: SubjectPriority[];
  setSubjectPriorities: (priorities: SubjectPriority[]) => void;
}

interface SubjectAnalysis {
  subjectId: string;
  subjectName: string;
  avgTestScore: number | null;
  avgConfidence: number | null;
  practiceCount: number;
  weaknessCount: number;
  strengthCount: number;
  priorityScore: number;
  weaknesses: string[];
  strengths: string[];
}

const SmartPriorityStep = ({
  subjects,
  topics,
  subjectPriorities,
  setSubjectPriorities,
}: SmartPriorityStepProps) => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<SubjectAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingAIOrder, setUsingAIOrder] = useState(true);

  useEffect(() => {
    fetchAnalysisData();
  }, [user, subjects]);

  const fetchAnalysisData = async () => {
    if (!user || subjects.length === 0) {
      setLoading(false);
      return;
    }

    try {
      // Fetch test scores
      const { data: testScores } = await supabase
        .from("test_scores")
        .select("subject, percentage, strengths, weaknesses")
        .eq("user_id", user.id);

      // Fetch practice logs
      const { data: practiceData } = await supabase
        .from("blurt_activity_logs")
        .select("subject_name, confidence_level")
        .eq("user_id", user.id);

      // Analyze each subject
      const analysisResults: SubjectAnalysis[] = subjects.map((subject) => {
        // Filter test scores for this subject
        const subjectScores = (testScores || []).filter(
          (s) => s.subject.toLowerCase() === subject.name.toLowerCase()
        );

        // Calculate average test score
        const avgTestScore = subjectScores.length > 0
          ? subjectScores.reduce((sum, s) => sum + s.percentage, 0) / subjectScores.length
          : null;

        // Get all weaknesses and strengths from test scores
        const weaknesses = subjectScores.flatMap((s) => s.weaknesses || []);
        const strengths = subjectScores.flatMap((s) => s.strengths || []);

        // Filter practice data for this subject
        const subjectPractice = (practiceData || []).filter(
          (p) => p.subject_name.toLowerCase() === subject.name.toLowerCase()
        );

        // Calculate average confidence
        const confidenceLogs = subjectPractice.filter((p) => p.confidence_level);
        const avgConfidence = confidenceLogs.length > 0
          ? confidenceLogs.reduce((sum, p) => sum + (p.confidence_level || 0), 0) / confidenceLogs.length
          : null;

        // Calculate priority score (higher = needs more attention)
        let priorityScore = 50; // Base score

        if (avgTestScore !== null) {
          priorityScore += (100 - avgTestScore) * 0.4;
        }
        if (avgConfidence !== null) {
          priorityScore += (5 - avgConfidence) * 8;
        }
        priorityScore += weaknesses.length * 5;
        priorityScore -= strengths.length * 2;

        // Clamp between 0-100
        priorityScore = Math.max(0, Math.min(100, priorityScore));

        return {
          subjectId: subject.id || subject.name,
          subjectName: subject.name,
          avgTestScore,
          avgConfidence,
          practiceCount: subjectPractice.length,
          weaknessCount: weaknesses.length,
          strengthCount: strengths.length,
          priorityScore,
          weaknesses: [...new Set(weaknesses)].slice(0, 3),
          strengths: [...new Set(strengths)].slice(0, 3),
        };
      });

      // Sort by priority score (highest first = needs most attention)
      analysisResults.sort((a, b) => b.priorityScore - a.priorityScore);

      setAnalysis(analysisResults);

      // Set initial priorities based on AI analysis
      if (subjectPriorities.length === 0) {
        const totalSubjects = analysisResults.length;
        const basePercentage = Math.floor(100 / totalSubjects);
        const remainder = 100 - basePercentage * totalSubjects;

        const priorities = analysisResults.map((a, index) => ({
          subjectId: a.subjectId,
          percentage: basePercentage + (index === 0 ? remainder : 0),
          rank: index + 1,
        }));

        setSubjectPriorities(priorities);
      }
    } catch (error) {
      console.error("Error fetching analysis data:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyAISuggestions = () => {
    const totalSubjects = analysis.length;
    const basePercentage = Math.floor(100 / totalSubjects);
    const remainder = 100 - basePercentage * totalSubjects;

    const priorities = analysis.map((a, index) => ({
      subjectId: a.subjectId,
      percentage: basePercentage + (index === 0 ? remainder : 0),
      rank: index + 1,
    }));

    setSubjectPriorities(priorities);
    setUsingAIOrder(true);
  };

  const moveSubject = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= analysis.length) return;

    const newAnalysis = [...analysis];
    const [moved] = newAnalysis.splice(fromIndex, 1);
    newAnalysis.splice(toIndex, 0, moved);

    setAnalysis(newAnalysis);
    setUsingAIOrder(false);

    // Update priorities based on new order
    const priorities = newAnalysis.map((a, index) => {
      const existing = subjectPriorities.find((p) => p.subjectId === a.subjectId);
      return {
        subjectId: a.subjectId,
        percentage: existing?.percentage || Math.floor(100 / newAnalysis.length),
        rank: index + 1,
      };
    });

    setSubjectPriorities(priorities);
  };

  const getPriorityColor = (score: number) => {
    if (score >= 70) return "text-red-500 bg-red-500/10";
    if (score >= 50) return "text-amber-500 bg-amber-500/10";
    return "text-green-500 bg-green-500/10";
  };

  const getPriorityLabel = (score: number) => {
    if (score >= 70) return "High Priority";
    if (score >= 50) return "Medium Priority";
    return "Low Priority";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <Sparkles className="w-8 h-8 animate-pulse text-primary mx-auto" />
          <p className="text-muted-foreground">Analyzing your performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">AI-Recommended Priority Order</h3>
        </div>
        {!usingAIOrder && (
          <Button size="sm" variant="outline" onClick={applyAISuggestions} className="gap-2">
            <Sparkles className="w-4 h-4" />
            Reset to AI Order
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Based on your test scores, practice confidence, and identified weaknesses, we've arranged your subjects 
        in order of priority. Drag to reorder if needed.
      </p>

      <div className="space-y-3">
        {analysis.map((subject, index) => (
          <Card
            key={subject.subjectId}
            className={`transition-all ${
              index === 0 ? "border-primary/50 bg-primary/5" : ""
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => moveSubject(index, index - 1)}
                    disabled={index === 0}
                    className="p-1 hover:bg-muted rounded disabled:opacity-30"
                  >
                    <TrendingUp className="w-4 h-4" />
                  </button>
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <button
                    onClick={() => moveSubject(index, index + 1)}
                    disabled={index === analysis.length - 1}
                    className="p-1 hover:bg-muted rounded disabled:opacity-30"
                  >
                    <TrendingDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{subject.subjectName}</span>
                    </div>
                    <Badge className={getPriorityColor(subject.priorityScore)}>
                      {getPriorityLabel(subject.priorityScore)}
                    </Badge>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Avg Test Score</p>
                      <p className="font-medium">
                        {subject.avgTestScore !== null
                          ? `${subject.avgTestScore.toFixed(0)}%`
                          : "No data"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Confidence</p>
                      <p className="font-medium">
                        {subject.avgConfidence !== null
                          ? `${subject.avgConfidence.toFixed(1)}/5`
                          : "No data"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Practice Sessions</p>
                      <p className="font-medium">{subject.practiceCount}</p>
                    </div>
                  </div>

                  {/* Priority Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Priority Score</span>
                      <span>{subject.priorityScore.toFixed(0)}</span>
                    </div>
                    <Progress value={subject.priorityScore} className="h-2" />
                  </div>

                  {/* Weaknesses & Strengths */}
                  {(subject.weaknesses.length > 0 || subject.strengths.length > 0) && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {subject.weaknesses.map((w, i) => (
                        <Badge
                          key={`w-${i}`}
                          variant="outline"
                          className="text-xs bg-red-500/10 text-red-600 border-red-500/30"
                        >
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {w}
                        </Badge>
                      ))}
                      {subject.strengths.map((s, i) => (
                        <Badge
                          key={`s-${i}`}
                          variant="outline"
                          className="text-xs bg-green-500/10 text-green-600 border-green-500/30"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {analysis.length === 0 && (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              No performance data yet. Complete some practice sessions and tests to get personalized recommendations.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartPriorityStep;
