import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, CheckCircle2, XCircle, Sparkles, Target, ChevronDown, ChevronUp, PieChart } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface TestScore {
  id: string;
  subject: string;
  test_type: string;
  test_date: string;
  total_marks: number;
  marks_obtained: number;
  percentage: number;
  questions_correct: any[];
  questions_incorrect: any[];
  ai_analysis: any;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  created_at: string;
}

interface TestScoresListProps {
  userId: string;
  refresh?: number;
}

export const TestScoresList = ({ userId, refresh }: TestScoresListProps) => {
  const [scores, setScores] = useState<TestScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchScores();
  }, [userId, refresh]);

  const fetchScores = async () => {
    try {
      const { data, error } = await supabase
        .from("test_scores")
        .select("*")
        .eq("user_id", userId)
        .order("test_date", { ascending: false });

      if (error) throw error;
      setScores((data as TestScore[]) || []);
    } catch (error) {
      console.error("Error fetching test scores:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return "from-green-500 to-emerald-500";
    if (percentage >= 60) return "from-blue-500 to-cyan-500";
    if (percentage >= 40) return "from-amber-500 to-yellow-500";
    return "from-red-500 to-rose-500";
  };

  const getGradeBgColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500/10 border-green-500/30";
    if (percentage >= 60) return "bg-blue-500/10 border-blue-500/30";
    if (percentage >= 40) return "bg-amber-500/10 border-amber-500/30";
    return "bg-red-500/10 border-red-500/30";
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return "A*";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    if (percentage >= 40) return "E";
    return "U";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-muted rounded" />
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
                <div className="h-16 w-20 bg-muted rounded-lg" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (scores.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <PieChart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No test scores yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Add your first test score to track your progress and get AI-powered insights
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {scores.map((score) => {
        const isExpanded = expandedId === score.id;
        const correctCount = score.questions_correct?.length || 0;
        const incorrectCount = score.questions_incorrect?.length || 0;
        const totalQuestions = correctCount + incorrectCount;

        return (
          <Card 
            key={score.id} 
            className={`transition-all duration-300 hover:shadow-md ${getGradeBgColor(score.percentage)}`}
          >
            <CardHeader 
              className="cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : score.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-lg">{score.subject}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {score.test_type}
                    </Badge>
                  </div>
                  <CardDescription>
                    {new Date(score.test_date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </CardDescription>
                  
                  {/* Progress Bar */}
                  <div className="pt-2">
                    <Progress 
                      value={score.percentage} 
                      className="h-2"
                    />
                  </div>
                </div>

                {/* Grade Circle */}
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getGradeColor(score.percentage)} flex items-center justify-center shadow-lg`}>
                    <span className="text-2xl font-bold text-white">{getGrade(score.percentage)}</span>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{score.percentage.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">
                      {score.marks_obtained}/{score.total_marks}
                    </p>
                  </div>
                </div>
              </div>

              {/* Expand/Collapse Indicator */}
              <div className="flex justify-center pt-2">
                <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      View Analysis
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="space-y-6 pt-0">
                {/* Questions Summary Cards */}
                {totalQuestions > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Correct Answers */}
                    <Card className="border-green-500/30 bg-green-500/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-green-600 dark:text-green-400">
                          <CheckCircle2 className="h-4 w-4" />
                          Correct Answers
                          <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30">
                            {correctCount}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {score.questions_correct && score.questions_correct.length > 0 ? (
                          <ul className="space-y-2">
                            {score.questions_correct.slice(0, 5).map((q: any, idx: number) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                <span className="text-muted-foreground">{q.question}</span>
                              </li>
                            ))}
                            {score.questions_correct.length > 5 && (
                              <li className="text-xs text-muted-foreground italic">
                                +{score.questions_correct.length - 5} more...
                              </li>
                            )}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No details provided</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Incorrect Answers */}
                    <Card className="border-red-500/30 bg-red-500/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-red-600 dark:text-red-400">
                          <XCircle className="h-4 w-4" />
                          Incorrect Answers
                          <Badge className="bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30">
                            {incorrectCount}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {score.questions_incorrect && score.questions_incorrect.length > 0 ? (
                          <ul className="space-y-2">
                            {score.questions_incorrect.slice(0, 5).map((q: any, idx: number) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                <span className="text-muted-foreground">{q.question}</span>
                              </li>
                            ))}
                            {score.questions_incorrect.length > 5 && (
                              <li className="text-xs text-muted-foreground italic">
                                +{score.questions_incorrect.length - 5} more...
                              </li>
                            )}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No details provided</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* AI Analysis Section */}
                {(score.strengths?.length > 0 || score.weaknesses?.length > 0 || score.recommendations?.length > 0) && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">AI Analysis</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Strengths */}
                      {score.strengths && score.strengths.length > 0 && (
                        <Card className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2 text-green-600 dark:text-green-400">
                              <TrendingUp className="h-4 w-4" />
                              Strengths
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {score.strengths.map((strength, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 mt-2" />
                                  <span className="text-muted-foreground">{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                      {/* Weaknesses */}
                      {score.weaknesses && score.weaknesses.length > 0 && (
                        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2 text-amber-600 dark:text-amber-400">
                              <TrendingDown className="h-4 w-4" />
                              Areas to Improve
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {score.weaknesses.map((weakness, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2" />
                                  <span className="text-muted-foreground">{weakness}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                      {/* Recommendations */}
                      {score.recommendations && score.recommendations.length > 0 && (
                        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2 text-primary">
                              <Target className="h-4 w-4" />
                              Next Steps
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {score.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <span className="text-primary font-bold shrink-0">{idx + 1}.</span>
                                  <span className="text-muted-foreground">{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default TestScoresList;
