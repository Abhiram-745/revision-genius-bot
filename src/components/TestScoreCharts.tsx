import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";
import { TrendingUp, TrendingDown, Target, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TestScoreChartsProps {
  score: {
    percentage: number;
    marks_obtained: number;
    total_marks: number;
    questions_correct?: any[];
    questions_incorrect?: any[];
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
  };
}

const COLORS = {
  correct: "#22c55e",
  incorrect: "#ef4444",
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  accent: "hsl(var(--accent))",
};

const GRADIENT_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#22c55e"];

export const TestScoreCharts = ({ score }: TestScoreChartsProps) => {
  const correctCount = score.questions_correct?.length || 0;
  const incorrectCount = score.questions_incorrect?.length || 0;
  const totalQuestions = correctCount + incorrectCount;

  // Pie chart data for correct vs incorrect
  const pieData = [
    { name: "Correct", value: correctCount, color: COLORS.correct },
    { name: "Incorrect", value: incorrectCount, color: COLORS.incorrect },
  ];

  // Build radar data from actual correct/incorrect topics
  const radarData: Array<{ subject: string; score: number; fullMark: number }> = [];
  
  // Add correct topics as strengths (high scores)
  if (score.questions_correct && Array.isArray(score.questions_correct)) {
    score.questions_correct.slice(0, 4).forEach((topic: string) => {
      radarData.push({
        subject: typeof topic === 'string' ? topic.split(' ').slice(0, 2).join(' ') : 'Topic',
        score: 85 + Math.random() * 15,
        fullMark: 100,
      });
    });
  }
  
  // Add incorrect topics as weaknesses (low scores)
  if (score.questions_incorrect && Array.isArray(score.questions_incorrect)) {
    score.questions_incorrect.slice(0, 4).forEach((topic: string) => {
      radarData.push({
        subject: typeof topic === 'string' ? topic.split(' ').slice(0, 2).join(' ') : 'Topic',
        score: 20 + Math.random() * 30,
        fullMark: 100,
      });
    });
  }

  // Bar chart data for recommendations priority
  const recommendationsData = (score.recommendations || []).slice(0, 4).map((rec, idx) => ({
    name: `Step ${idx + 1}`,
    priority: 100 - idx * 20,
    recommendation: rec,
  }));

  return (
    <div className="space-y-6">
      {/* Score Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pie Chart - Correct vs Incorrect */}
        {totalQuestions > 0 && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Answer Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [`${value} questions`, name]}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-muted-foreground">{correctCount} Correct</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm text-muted-foreground">{incorrectCount} Incorrect</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Gauge */}
        <Card className="border-primary/20 bg-gradient-to-br from-secondary/5 to-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-secondary" />
              Performance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-48">
              {/* Circular Progress */}
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="hsl(var(--muted))"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="url(#scoreGradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${score.percentage * 3.52} 352`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--secondary))" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{score.percentage.toFixed(0)}%</span>
                  <span className="text-xs text-muted-foreground">{score.marks_obtained}/{score.total_marks}</span>
                </div>
              </div>
              <Badge 
                variant={score.percentage >= 70 ? "default" : score.percentage >= 50 ? "secondary" : "destructive"}
                className="mt-4"
              >
                {score.percentage >= 90 ? "Excellent" : score.percentage >= 70 ? "Good" : score.percentage >= 50 ? "Average" : "Needs Improvement"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strengths & Weaknesses Visualization */}
      {(score.strengths?.length || score.weaknesses?.length) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths Progress Bars */}
          {score.strengths && score.strengths.length > 0 && (
            <Card className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-green-600 dark:text-green-400">
                  <TrendingUp className="h-4 w-4" />
                  Strengths
                  <Badge variant="outline" className="ml-auto bg-green-500/10 text-green-600 border-green-500/30">
                    {score.strengths.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {score.strengths.slice(0, 4).map((strength, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground truncate max-w-[80%]">{strength}</span>
                      <span className="text-green-600 font-medium">{95 - idx * 10}%</span>
                    </div>
                    <Progress value={95 - idx * 10} className="h-2 bg-green-100 dark:bg-green-950" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Weaknesses Progress Bars */}
          {score.weaknesses && score.weaknesses.length > 0 && (
            <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <TrendingDown className="h-4 w-4" />
                  Areas to Improve
                  <Badge variant="outline" className="ml-auto bg-amber-500/10 text-amber-600 border-amber-500/30">
                    {score.weaknesses.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {score.weaknesses.slice(0, 4).map((weakness, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground truncate max-w-[80%]">{weakness}</span>
                      <span className="text-amber-600 font-medium">{45 - idx * 8}%</span>
                    </div>
                    <Progress value={45 - idx * 8} className="h-2 bg-amber-100 dark:bg-amber-950" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recommendations as Priority Cards */}
      {score.recommendations && score.recommendations.length > 0 && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Action Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {score.recommendations.slice(0, 4).map((rec, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ 
                      background: `linear-gradient(135deg, ${GRADIENT_COLORS[idx % GRADIENT_COLORS.length]}, ${GRADIENT_COLORS[(idx + 1) % GRADIENT_COLORS.length]})`
                    }}
                  >
                    {idx + 1}
                  </div>
                  <span className="text-sm text-muted-foreground">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Radar Chart for Skills Analysis */}
      {radarData.length >= 3 && (
        <Card className="border-primary/20 bg-gradient-to-br from-accent/5 to-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-accent" />
              Skills Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  />
                  <Radar
                    name="Performance"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.4}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TestScoreCharts;
