import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Calendar, Clock, BookOpen, Languages } from "lucide-react";
import { Subject } from "../OnboardingWizard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SubjectsStepProps {
  subjects: Subject[];
  setSubjects: (subjects: Subject[]) => void;
}

const GCSE_SUBJECTS = [
  "Mathematics",
  "English Language",
  "English Literature",
  "Biology",
  "Chemistry",
  "Physics",
  "Combined Science",
  "History",
  "Geography",
  "French",
  "Spanish",
  "German",
  "Mandarin Chinese",
  "Italian",
  "Latin",
  "Japanese",
  "Arabic",
  "Computer Science",
  "Business Studies",
  "Economics",
  "Psychology",
  "Sociology",
  "Religious Studies",
  "Art & Design",
  "Drama",
  "Music",
  "Physical Education",
  "Food Technology",
  "Design & Technology",
];

const LANGUAGE_SUBJECTS = [
  "French",
  "Spanish",
  "German",
  "Mandarin Chinese",
  "Italian",
  "Latin",
  "Japanese",
  "Arabic",
];

const EXAM_LEVELS = [
  { value: "gcse", label: "GCSE" },
  { value: "a-level", label: "A-Level" },
  { value: "igcse", label: "IGCSE" },
  { value: "as", label: "AS Level" },
  { value: "ib", label: "IB / DP" },
  { value: "o-level", label: "O-Level" },
  { value: "ap", label: "AP" },
];

const EXAM_BOARDS = [
  "AQA",
  "Edexcel",
  "OCR",
  "WJEC",
  "CCEA",
  "Eduqas",
  "Cambridge (CIE)",
  "IB",
  "College Board",
];

const SubjectsStep = ({ subjects, setSubjects }: SubjectsStepProps) => {
  const [subjectName, setSubjectName] = useState("");
  const [examBoard, setExamBoard] = useState("");
  const [examLevel, setExamLevel] = useState<string>("");
  const [mode, setMode] = useState<"short-term-exam" | "long-term-exam" | "no-exam">("long-term-exam");
  const [isLanguage, setIsLanguage] = useState(false);
  const [languageFocus, setLanguageFocus] = useState({
    vocabulary: 30,
    grammar: 30,
    reading: 20,
    listening: 10,
    speaking: 10,
  });

  // Auto-detect language subjects
  useEffect(() => {
    if (subjectName && LANGUAGE_SUBJECTS.includes(subjectName)) {
      setIsLanguage(true);
    } else {
      setIsLanguage(false);
    }
  }, [subjectName]);

  const addSubject = () => {
    if (subjectName.trim() && examBoard.trim() && examLevel.trim()) {
      const newSubject: Subject = {
        id: crypto.randomUUID(),
        name: subjectName,
        exam_board: examBoard,
        exam_level: examLevel as Subject["exam_level"],
        mode: mode,
      };

      // Add language focus if it's a language subject
      if (isLanguage) {
        (newSubject as any).subject_type = "language";
        (newSubject as any).language_focus = languageFocus;
      }

      setSubjects([...subjects, newSubject]);
      setSubjectName("");
      setExamBoard("");
      setExamLevel("");
      setMode("long-term-exam");
      setIsLanguage(false);
      setLanguageFocus({
        vocabulary: 30,
        grammar: 30,
        reading: 20,
        listening: 10,
        speaking: 10,
      });
    }
  };

  const removeSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleLanguageFocusChange = (key: keyof typeof languageFocus, value: number) => {
    const newFocus = { ...languageFocus, [key]: value };
    // Normalize to 100%
    const total = Object.values(newFocus).reduce((a, b) => a + b, 0);
    if (total !== 100) {
      const diff = 100 - total;
      const otherKeys = Object.keys(newFocus).filter(k => k !== key) as (keyof typeof languageFocus)[];
      if (otherKeys.length > 0) {
        const adjustKey = otherKeys[0];
        newFocus[adjustKey] = Math.max(0, newFocus[adjustKey] + diff);
      }
    }
    setLanguageFocus(newFocus);
  };

  const getModeInfo = (mode: Subject["mode"]) => {
    switch (mode) {
      case "short-term-exam":
        return { icon: Calendar, label: "Short-Term", color: "destructive", description: "1-4 weeks" };
      case "long-term-exam":
        return { icon: Clock, label: "Long-Term", color: "primary", description: "5-8+ weeks" };
      case "no-exam":
        return { icon: BookOpen, label: "No Exam", color: "secondary", description: "Getting ahead" };
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label htmlFor="subject-name" className="text-sm">Subject</Label>
          <Select value={subjectName} onValueChange={setSubjectName}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-[200] max-h-[200px]">
              {GCSE_SUBJECTS.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="exam-level" className="text-sm">Exam Level</Label>
          <Select value={examLevel} onValueChange={setExamLevel}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-[200]">
              {EXAM_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="exam-board" className="text-sm">Exam Board</Label>
          <Select value={examBoard} onValueChange={setExamBoard}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select board" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-[200]">
              {EXAM_BOARDS.map((board) => (
                <SelectItem key={board} value={board}>
                  {board}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="space-y-2">
        <Label className="text-sm">Study Mode</Label>
        <div className="grid grid-cols-3 gap-2">
          {(["short-term-exam", "long-term-exam", "no-exam"] as const).map((m) => {
            const info = getModeInfo(m);
            const Icon = info.icon;
            return (
              <Card
                key={m}
                className={`p-2 cursor-pointer transition-all hover:shadow-md ${
                  mode === m ? "border-2 border-primary bg-primary/5" : "border"
                }`}
                onClick={() => setMode(m)}
              >
                <div className="flex flex-col items-center text-center gap-1">
                  <Icon className={`h-4 w-4 ${mode === m ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <p className={`text-xs font-medium ${mode === m ? "text-primary" : ""}`}>
                      {info.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{info.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Language Subject Options */}
      {isLanguage && (
        <Collapsible defaultOpen>
          <Card className="border-2 border-purple-500/30 bg-purple-500/5">
            <CollapsibleTrigger asChild>
              <div className="p-3 cursor-pointer flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Language Focus Settings</span>
                </div>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-700 dark:text-purple-300">
                  Language
                </Badge>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-3 pb-3 space-y-3">
                <p className="text-xs text-muted-foreground">
                  Set how much time you want to allocate to each language skill
                </p>
                {[
                  { key: "vocabulary", label: "Vocabulary", emoji: "📚" },
                  { key: "grammar", label: "Grammar", emoji: "📝" },
                  { key: "reading", label: "Reading", emoji: "📖" },
                  { key: "listening", label: "Listening", emoji: "🎧" },
                  { key: "speaking", label: "Speaking", emoji: "🗣️" },
                ].map(({ key, label, emoji }) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs flex items-center gap-1">
                        <span>{emoji}</span> {label}
                      </Label>
                      <span className="text-xs font-medium text-muted-foreground">
                        {languageFocus[key as keyof typeof languageFocus]}%
                      </span>
                    </div>
                    <Slider
                      value={[languageFocus[key as keyof typeof languageFocus]]}
                      onValueChange={(v) => handleLanguageFocusChange(key as keyof typeof languageFocus, v[0])}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      <Button
        type="button"
        onClick={addSubject}
        disabled={!subjectName.trim() || !examBoard.trim() || !examLevel.trim()}
        className="w-full bg-gradient-secondary hover:opacity-90"
        size="sm"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Subject
      </Button>

      {subjects.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm">Your Subjects ({subjects.length})</Label>
          <ScrollArea className="h-auto max-h-[30vh]">
            <div className="rounded-md border p-2 space-y-2">
              {subjects.map((subject, index) => {
                const info = getModeInfo(subject.mode);
                const Icon = info.icon;
                const levelLabel = EXAM_LEVELS.find(l => l.value === subject.exam_level)?.label || subject.exam_level;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm truncate">{subject.name}</p>
                        {levelLabel && (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0">
                            {levelLabel}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                          <Icon className="h-3 w-3 mr-1" />
                          {info.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{subject.exam_board}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSubject(index)}
                      className="text-destructive hover:text-destructive shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default SubjectsStep;
