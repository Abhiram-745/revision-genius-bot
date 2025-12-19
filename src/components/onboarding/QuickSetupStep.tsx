import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X, BookOpen, Clock, Target, Zap } from "lucide-react";
import { Subject } from "../OnboardingWizard";

interface QuickSetupStepProps {
  subjects: Subject[];
  setSubjects: (subjects: Subject[]) => void;
}

const POPULAR_SUBJECTS = [
  "Mathematics", "English Language", "English Literature", "Biology", "Chemistry", 
  "Physics", "Combined Science", "History", "Geography", "French", "Spanish",
  "German", "Computer Science", "Religious Studies", "Art & Design", "Music",
  "Physical Education", "Business Studies", "Economics", "Psychology"
];

const EXAM_BOARDS = ["AQA", "Edexcel", "OCR", "WJEC", "CIE", "Other"];

const STUDY_MODES = [
  {
    id: "short-term-exam" as const,
    icon: Zap,
    label: "Exam Soon",
    description: "Within 2 weeks",
    color: "text-red-500 bg-red-500/10 border-red-500/30",
  },
  {
    id: "long-term-exam" as const,
    icon: Target,
    label: "Exam Later",
    description: "2+ weeks away",
    color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  },
  {
    id: "no-exam" as const,
    icon: BookOpen,
    label: "General Study",
    description: "No specific exam",
    color: "text-secondary bg-secondary/10 border-secondary/30",
  },
];

const QuickSetupStep = ({ subjects, setSubjects }: QuickSetupStepProps) => {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [selectedBoard, setSelectedBoard] = useState("AQA");
  const [selectedMode, setSelectedMode] = useState<Subject["mode"]>("long-term-exam");

  const handleAddSubject = () => {
    const subjectName = selectedSubject === "custom" ? customSubject.trim() : selectedSubject;
    if (!subjectName) return;

    const newSubject: Subject = {
      id: `subject-${Date.now()}`,
      name: subjectName,
      exam_board: selectedBoard,
      mode: selectedMode,
    };

    setSubjects([...subjects, newSubject]);
    setSelectedSubject("");
    setCustomSubject("");
  };

  const handleRemoveSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleQuickAdd = (subjectName: string) => {
    if (subjects.some(s => s.name.toLowerCase() === subjectName.toLowerCase())) return;
    
    const newSubject: Subject = {
      id: `subject-${Date.now()}`,
      name: subjectName,
      exam_board: "AQA",
      mode: "long-term-exam",
    };
    setSubjects([...subjects, newSubject]);
  };

  const getModeInfo = (mode: Subject["mode"]) => {
    return STUDY_MODES.find(m => m.id === mode) || STUDY_MODES[1];
  };

  return (
    <div className="space-y-6">
      {/* Quick Add Popular Subjects */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Quick Add Popular Subjects</Label>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SUBJECTS.slice(0, 10).map((subject) => {
            const isAdded = subjects.some(s => s.name.toLowerCase() === subject.toLowerCase());
            return (
              <Badge
                key={subject}
                variant={isAdded ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  isAdded 
                    ? "bg-primary/20 text-primary border-primary/30" 
                    : "hover:bg-primary/10 hover:border-primary/30"
                }`}
                onClick={() => !isAdded && handleQuickAdd(subject)}
              >
                {isAdded ? "✓" : "+"} {subject}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Custom Subject Entry */}
      <Card className="border-dashed">
        <CardContent className="p-4 space-y-4">
          <Label className="text-sm font-medium">Add Custom Subject</Label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select or type subject" />
                </SelectTrigger>
                <SelectContent>
                  {POPULAR_SUBJECTS.map((subject) => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                  <SelectItem value="custom">Other (type below)</SelectItem>
                </SelectContent>
              </Select>
              
              {selectedSubject === "custom" && (
                <Input
                  placeholder="Enter subject name"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                />
              )}
            </div>
            
            <Select value={selectedBoard} onValueChange={setSelectedBoard}>
              <SelectTrigger>
                <SelectValue placeholder="Exam board" />
              </SelectTrigger>
              <SelectContent>
                {EXAM_BOARDS.map((board) => (
                  <SelectItem key={board} value={board}>{board}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Study Mode Selection */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Study Mode</Label>
            <div className="grid grid-cols-3 gap-2">
              {STUDY_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setSelectedMode(mode.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedMode === mode.id
                      ? mode.color + " border-2"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <mode.icon className={`w-4 h-4 mb-1 ${selectedMode === mode.id ? mode.color.split(" ")[0] : "text-muted-foreground"}`} />
                  <p className="text-xs font-medium">{mode.label}</p>
                  <p className="text-[10px] text-muted-foreground">{mode.description}</p>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleAddSubject}
            disabled={!selectedSubject || (selectedSubject === "custom" && !customSubject.trim())}
            className="w-full"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Subject
          </Button>
        </CardContent>
      </Card>

      {/* Added Subjects */}
      {subjects.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Your Subjects ({subjects.length})</Label>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2 pr-4">
              {subjects.map((subject, index) => {
                const modeInfo = getModeInfo(subject.mode);
                return (
                  <Card key={subject.id || index} className="border-border/50">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${modeInfo.color}`}>
                          <modeInfo.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{subject.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {subject.exam_board} • {modeInfo.label}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveSubject(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default QuickSetupStep;
