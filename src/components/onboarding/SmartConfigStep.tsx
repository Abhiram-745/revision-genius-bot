import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, Plus, X, Sparkles, CalendarDays } from "lucide-react";
import { format, addDays, addWeeks, differenceInDays } from "date-fns";
import { Subject, TestDate, StudyPreferences, DayTimeSlot } from "../OnboardingWizard";

interface SmartConfigStepProps {
  subjects: Subject[];
  testDates: TestDate[];
  setTestDates: (dates: TestDate[]) => void;
  preferences: StudyPreferences;
  setPreferences: (prefs: StudyPreferences) => void;
  timetableName: string;
  setTimetableName: (name: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const SmartConfigStep = ({
  subjects,
  testDates,
  setTestDates,
  preferences,
  setPreferences,
  timetableName,
  setTimetableName,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: SmartConfigStepProps) => {
  const [newTestSubject, setNewTestSubject] = useState(subjects[0]?.id || "");
  const [newTestDate, setNewTestDate] = useState("");
  const [newTestType, setNewTestType] = useState("exam");

  // Auto-set dates based on test dates
  useEffect(() => {
    if (!startDate) {
      setStartDate(format(new Date(), "yyyy-MM-dd"));
    }
    if (testDates.length > 0 && !endDate) {
      const latestTest = testDates.reduce((latest, td) => 
        new Date(td.test_date) > new Date(latest.test_date) ? td : latest
      );
      setEndDate(latestTest.test_date);
    } else if (!endDate) {
      setEndDate(format(addWeeks(new Date(), 4), "yyyy-MM-dd"));
    }
  }, [testDates]);

  const handleAddTestDate = () => {
    if (!newTestSubject || !newTestDate) return;
    
    const newTest: TestDate = {
      id: `test-${Date.now()}`,
      subject_id: newTestSubject,
      test_date: newTestDate,
      test_type: newTestType,
    };
    setTestDates([...testDates, newTest]);
    setNewTestDate("");
  };

  const handleRemoveTestDate = (id: string) => {
    setTestDates(testDates.filter(td => td.id !== id));
  };

  const toggleDayEnabled = (dayIndex: number) => {
    const newSlots = [...preferences.day_time_slots];
    newSlots[dayIndex] = { ...newSlots[dayIndex], enabled: !newSlots[dayIndex].enabled };
    setPreferences({ ...preferences, day_time_slots: newSlots });
  };

  const hasExams = subjects.some(s => s.mode !== "no-exam");
  const daysUntilEnd = endDate ? differenceInDays(new Date(endDate), new Date()) : 0;

  // Smart suggestions
  const suggestedHours = hasExams 
    ? daysUntilEnd < 14 ? 3 : daysUntilEnd < 30 ? 2.5 : 2
    : 1.5;

  return (
    <div className="space-y-6">
      {/* Timetable Name & Dates */}
      <Card className="border-primary/20">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <CalendarDays className="w-5 h-5" />
            <Label className="font-medium">Timetable Period</Label>
          </div>
          
          <Input
            placeholder="Timetable name"
            value={timetableName}
            onChange={(e) => setTimetableName(e.target.value)}
          />
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || format(new Date(), "yyyy-MM-dd")}
              />
            </div>
          </div>
          
          {daysUntilEnd > 0 && (
            <p className="text-xs text-muted-foreground">
              {daysUntilEnd} days of study planned
            </p>
          )}
        </CardContent>
      </Card>

      {/* Test Dates (only for exam mode) */}
      {hasExams && (
        <Card className="border-amber-500/20">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-amber-500">
              <Calendar className="w-5 h-5" />
              <Label className="font-medium">Exam Dates</Label>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <select
                value={newTestSubject}
                onChange={(e) => setNewTestSubject(e.target.value)}
                className="h-9 px-2 rounded-md border border-input bg-background text-sm"
              >
                {subjects.filter(s => s.mode !== "no-exam").map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <Input
                type="date"
                value={newTestDate}
                onChange={(e) => setNewTestDate(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
                className="h-9"
              />
              <Button size="sm" onClick={handleAddTestDate} disabled={!newTestSubject || !newTestDate}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {testDates.length > 0 && (
              <ScrollArea className="h-[100px]">
                <div className="space-y-1">
                  {testDates.map((td) => {
                    const subject = subjects.find(s => s.id === td.subject_id);
                    return (
                      <div key={td.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <span className="text-sm">
                          {subject?.name} - {format(new Date(td.test_date), "dd MMM yyyy")}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleRemoveTestDate(td.id!)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}

      {/* Study Preferences */}
      <Card className="border-secondary/20">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-secondary">
              <Clock className="w-5 h-5" />
              <Label className="font-medium">Study Preferences</Label>
            </div>
            <Badge variant="outline" className="text-xs gap-1">
              <Sparkles className="w-3 h-3" />
              AI suggested: {suggestedHours}h/day
            </Badge>
          </div>

          {/* Daily Hours */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Daily study hours</Label>
              <span className="text-sm font-medium">{preferences.daily_study_hours}h</span>
            </div>
            <Slider
              value={[preferences.daily_study_hours]}
              onValueChange={([val]) => setPreferences({ ...preferences, daily_study_hours: val })}
              min={0.5}
              max={6}
              step={0.5}
            />
          </div>

          {/* Session Duration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Session length</Label>
              <span className="text-sm font-medium">{preferences.session_duration} min</span>
            </div>
            <Slider
              value={[preferences.session_duration]}
              onValueChange={([val]) => setPreferences({ ...preferences, session_duration: val })}
              min={15}
              max={90}
              step={5}
            />
          </div>

          {/* Break Duration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Break between sessions</Label>
              <span className="text-sm font-medium">{preferences.break_duration} min</span>
            </div>
            <Slider
              value={[preferences.break_duration]}
              onValueChange={([val]) => setPreferences({ ...preferences, break_duration: val })}
              min={5}
              max={30}
              step={5}
            />
          </div>

          {/* Study Days */}
          <div className="space-y-2">
            <Label className="text-sm">Study days</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day, index) => (
                <Badge
                  key={day}
                  variant={preferences.day_time_slots[index]?.enabled ? "default" : "outline"}
                  className={`cursor-pointer capitalize transition-all ${
                    preferences.day_time_slots[index]?.enabled 
                      ? "bg-primary/20 text-primary border-primary/30" 
                      : "hover:bg-primary/10"
                  }`}
                  onClick={() => toggleDayEnabled(index)}
                >
                  {day.slice(0, 3)}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartConfigStep;
