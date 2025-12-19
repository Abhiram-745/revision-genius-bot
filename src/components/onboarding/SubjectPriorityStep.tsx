import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import { Subject, Topic } from "../OnboardingWizard";

export interface SubjectPriority {
  subjectId: string;
  percentage: number;
  rank: number;
}

interface SubjectPriorityStepProps {
  subjects: Subject[];
  topics: Topic[];
  subjectPriorities: SubjectPriority[];
  setSubjectPriorities: (priorities: SubjectPriority[]) => void;
}

const SubjectPriorityStep = ({
  subjects,
  topics,
  subjectPriorities,
  setSubjectPriorities,
}: SubjectPriorityStepProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Initialize priorities if empty
  useEffect(() => {
    if (subjectPriorities.length === 0 && subjects.length > 0) {
      const equalPercentage = Math.floor(100 / subjects.length);
      const initialPriorities = subjects.map((subject, index) => ({
        subjectId: subject.id || "",
        percentage: equalPercentage,
        rank: index + 1,
      }));
      // Adjust last item to make total 100
      if (initialPriorities.length > 0) {
        const total = initialPriorities.reduce((sum, p) => sum + p.percentage, 0);
        initialPriorities[initialPriorities.length - 1].percentage += 100 - total;
      }
      setSubjectPriorities(initialPriorities);
    }
  }, [subjects, subjectPriorities.length, setSubjectPriorities]);

  // Calculate average confidence per subject
  const getSubjectConfidence = (subjectId: string) => {
    const subjectTopics = topics.filter(t => t.subject_id === subjectId);
    if (subjectTopics.length === 0) return null;
    const avgConfidence = subjectTopics.reduce((sum, t) => sum + (t.confidence || 50), 0) / subjectTopics.length;
    return Math.round(avgConfidence);
  };

  // AI suggested percentages based on confidence (lower confidence = more time)
  const getAISuggestedPercentage = (subjectId: string) => {
    const confidences = subjects.map(s => ({
      id: s.id || "",
      confidence: getSubjectConfidence(s.id || "") || 50
    }));
    
    // Invert confidence (lower confidence should get more time)
    const invertedScores = confidences.map(c => ({
      id: c.id,
      score: 100 - c.confidence
    }));
    
    const totalScore = invertedScores.reduce((sum, s) => sum + s.score, 0);
    if (totalScore === 0) return Math.floor(100 / subjects.length);
    
    const subject = invertedScores.find(s => s.id === subjectId);
    return subject ? Math.round((subject.score / totalScore) * 100) : Math.floor(100 / subjects.length);
  };

  const handlePercentageChange = (subjectId: string, newPercentage: number) => {
    const currentPriority = subjectPriorities.find(p => p.subjectId === subjectId);
    if (!currentPriority) return;

    const oldPercentage = currentPriority.percentage;
    const diff = newPercentage - oldPercentage;
    
    // Distribute the difference among other subjects proportionally
    const otherPriorities = subjectPriorities.filter(p => p.subjectId !== subjectId);
    const otherTotal = otherPriorities.reduce((sum, p) => sum + p.percentage, 0);
    
    const newPriorities = subjectPriorities.map(p => {
      if (p.subjectId === subjectId) {
        return { ...p, percentage: newPercentage };
      }
      if (otherTotal === 0) {
        return { ...p, percentage: Math.floor((100 - newPercentage) / otherPriorities.length) };
      }
      const ratio = p.percentage / otherTotal;
      const newValue = Math.max(5, Math.round(p.percentage - (diff * ratio)));
      return { ...p, percentage: newValue };
    });

    // Normalize to ensure total is 100
    const total = newPriorities.reduce((sum, p) => sum + p.percentage, 0);
    if (total !== 100) {
      const adjustment = 100 - total;
      const adjustIndex = newPriorities.findIndex(p => p.subjectId !== subjectId);
      if (adjustIndex !== -1) {
        newPriorities[adjustIndex].percentage += adjustment;
      }
    }

    setSubjectPriorities(newPriorities);
  };

  const applyAISuggestions = () => {
    const newPriorities = subjects.map((subject, index) => ({
      subjectId: subject.id || "",
      percentage: getAISuggestedPercentage(subject.id || ""),
      rank: index + 1,
    }));
    
    // Normalize to 100
    const total = newPriorities.reduce((sum, p) => sum + p.percentage, 0);
    if (total !== 100 && newPriorities.length > 0) {
      newPriorities[0].percentage += 100 - total;
    }
    
    setSubjectPriorities(newPriorities);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPriorities = [...subjectPriorities];
    const draggedItem = newPriorities[draggedIndex];
    newPriorities.splice(draggedIndex, 1);
    newPriorities.splice(index, 0, draggedItem);
    
    // Update ranks
    newPriorities.forEach((p, i) => p.rank = i + 1);
    
    setSubjectPriorities(newPriorities);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getSubjectById = (id: string) => subjects.find(s => s.id === id);

  const sortedPriorities = [...subjectPriorities].sort((a, b) => a.rank - b.rank);

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <Label className="font-medium">Subject Time Allocation</Label>
            </div>
            <button
              onClick={applyAISuggestions}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-secondary/20 text-secondary hover:bg-secondary/30 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Apply AI Suggestions
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Drag to reorder priority or adjust sliders. AI suggests more time for topics you're less confident in.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {sortedPriorities.map((priority, index) => {
          const subject = getSubjectById(priority.subjectId);
          if (!subject) return null;

          const confidence = getSubjectConfidence(priority.subjectId);
          const aiSuggested = getAISuggestedPercentage(priority.subjectId);
          const isAboveAI = priority.percentage > aiSuggested;

          return (
            <Card
              key={priority.subjectId}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`border transition-all ${
                draggedIndex === index ? "opacity-50 scale-[0.98]" : ""
              } hover:border-primary/30`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-normal">
                          #{priority.rank}
                        </Badge>
                        <span className="font-medium text-sm">{subject.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {confidence !== null && (
                          <span className={`text-xs ${
                            confidence >= 70 ? "text-green-500" : 
                            confidence >= 40 ? "text-amber-500" : "text-red-500"
                          }`}>
                            {confidence}% confident
                          </span>
                        )}
                        <Badge 
                          variant={isAboveAI ? "default" : "secondary"}
                          className="text-xs font-bold min-w-[48px] justify-center"
                        >
                          {priority.percentage}%
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[priority.percentage]}
                        onValueChange={([val]) => handlePercentageChange(priority.subjectId, val)}
                        min={5}
                        max={80}
                        step={5}
                        className="flex-1"
                      />
                    </div>

                    {confidence !== null && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Sparkles className="w-3 h-3 text-secondary" />
                        <span>AI suggests: {aiSuggested}%</span>
                        {Math.abs(priority.percentage - aiSuggested) > 10 && (
                          isAboveAI ? (
                            <TrendingUp className="w-3 h-3 text-green-500 ml-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-amber-500 ml-1" />
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-xs text-muted-foreground pt-2">
        Total: {subjectPriorities.reduce((sum, p) => sum + p.percentage, 0)}%
      </div>
    </div>
  );
};

export default SubjectPriorityStep;
