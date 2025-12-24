import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import QuickSetupStep from "./onboarding/QuickSetupStep";
import SmartTopicsStep from "./onboarding/SmartTopicsStep";
import SubjectPriorityStep, { SubjectPriority } from "./onboarding/SubjectPriorityStep";
import SmartConfigStep from "./onboarding/SmartConfigStep";
import GenerateStep from "./onboarding/GenerateStep";
import AgendaStep from "./onboarding/AgendaStep";

const WIZARD_STORAGE_KEY = "timetable-wizard-progress";

interface OnboardingWizardProps {
  onComplete: () => void;
  onCancel?: () => void;
}

export interface Subject {
  id?: string;
  name: string;
  exam_board: string;
  mode: "short-term-exam" | "long-term-exam" | "no-exam";
}

export interface Topic {
  id?: string;
  subject_id: string;
  name: string;
  confidence?: number;
  difficulties?: string;
}

export interface TestDate {
  id?: string;
  subject_id: string;
  test_date: string;
  test_type: string;
}

export interface DayTimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

export interface StudyPreferences {
  daily_study_hours: number;
  day_time_slots: DayTimeSlot[];
  break_duration: number;
  session_duration: number;
  duration_mode: "fixed" | "flexible";
  flexibleTimings?: boolean;
  aiNotes?: string;
  study_before_school?: boolean;
  study_during_lunch?: boolean;
  study_during_free_periods?: boolean;
  before_school_start?: string;
  before_school_end?: string;
  lunch_start?: string;
  lunch_end?: string;
  free_period_times?: string[];
}

const defaultPreferences: StudyPreferences = {
  daily_study_hours: 2,
  day_time_slots: [
    { day: "monday", startTime: "09:00", endTime: "17:00", enabled: true },
    { day: "tuesday", startTime: "09:00", endTime: "17:00", enabled: true },
    { day: "wednesday", startTime: "09:00", endTime: "17:00", enabled: true },
    { day: "thursday", startTime: "09:00", endTime: "17:00", enabled: true },
    { day: "friday", startTime: "09:00", endTime: "17:00", enabled: true },
    { day: "saturday", startTime: "09:00", endTime: "17:00", enabled: true },
    { day: "sunday", startTime: "09:00", endTime: "17:00", enabled: true },
  ],
  break_duration: 15,
  session_duration: 45,
  duration_mode: "flexible",
  flexibleTimings: false,
};

const loadSavedProgress = () => {
  try {
    const saved = localStorage.getItem(WIZARD_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load wizard progress:", e);
  }
  return null;
};

const OnboardingWizard = ({ onComplete, onCancel }: OnboardingWizardProps) => {
  const savedProgress = loadSavedProgress();
  
  const [step, setStep] = useState(savedProgress?.step || 1);
  const [subjects, setSubjects] = useState<Subject[]>(savedProgress?.subjects || []);
  const [topics, setTopics] = useState<Topic[]>(savedProgress?.topics || []);
  const [topicAnalysis, setTopicAnalysis] = useState<any>(savedProgress?.topicAnalysis || null);
  const [testDates, setTestDates] = useState<TestDate[]>(savedProgress?.testDates || []);
  const [preferences, setPreferences] = useState<StudyPreferences>(savedProgress?.preferences || defaultPreferences);
  const [homeworks, setHomeworks] = useState<any[]>(savedProgress?.homeworks || []);
  const [events, setEvents] = useState<any[]>(savedProgress?.events || []);
  const [timetableName, setTimetableName] = useState(savedProgress?.timetableName || "My Study Timetable");
  const [startDate, setStartDate] = useState(savedProgress?.startDate || "");
  const [endDate, setEndDate] = useState(savedProgress?.endDate || "");
  const [subjectPriorities, setSubjectPriorities] = useState<SubjectPriority[]>(savedProgress?.subjectPriorities || []);

  // Save progress to localStorage whenever state changes
  const saveProgress = useCallback(() => {
    const progress = {
      step,
      subjects,
      topics,
      topicAnalysis,
      testDates,
      preferences,
      homeworks,
      events,
      timetableName,
      startDate,
      endDate,
      subjectPriorities,
    };
    localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(progress));
  }, [step, subjects, topics, topicAnalysis, testDates, preferences, homeworks, events, timetableName, startDate, endDate, subjectPriorities]);

  useEffect(() => {
    saveProgress();
  }, [saveProgress]);

  // Clear progress when timetable is created
  const handleComplete = () => {
    localStorage.removeItem(WIZARD_STORAGE_KEY);
    onComplete();
  };

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step === 1 && onCancel) {
      onCancel();
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  const stepTitles = [
    "Your Subjects",
    "Topics & Confidence",
    "Subject Priority",
    "Your Agenda",
    "Schedule & Preferences",
    "Generate Timetable",
  ];

  const stepDescriptions = [
    "Add the subjects you're studying - click to quickly add or customize each one",
    "Add your topics and rate your confidence (optional - you can skip this step)",
    "Set how much time to dedicate to each subject",
    "Add homework and events so AI can schedule around them",
    "Set your exam dates, study schedule, and preferences",
    "Review and generate your personalized AI study timetable",
  ];

  // Get timetableMode based on subjects - prioritize most urgent
  const timetableMode = subjects.some(s => s.mode === "short-term-exam") 
    ? "short-term-exam" 
    : subjects.some(s => s.mode === "long-term-exam")
    ? "long-term-exam"
    : "no-exam";

  const canProceed = () => {
    switch (step) {
      case 1:
        return subjects.length > 0;
      case 2:
        return true; // Topics are optional
      case 3:
        return true; // Priorities are optional
      case 4:
        return true; // Agenda is optional
      case 5:
        return startDate && endDate && timetableName.trim();
      default:
        return true;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full flex items-start justify-center py-4 px-2 sm:py-8 sm:px-4">
        <Card className="w-full max-w-3xl shadow-lg flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)]">
          <CardHeader className="flex-shrink-0 pb-2 sm:pb-4 px-4 sm:px-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                <span>Step {step} of {totalSteps}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <CardTitle className="text-lg sm:text-xl md:text-2xl">{stepTitles[step - 1]}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {stepDescriptions[step - 1]}
            </CardDescription>
          </CardHeader>
          
          {/* Scrollable content area */}
          <CardContent className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 pb-4">
            <div className="space-y-4 pr-1">
              {step === 1 && (
                <div data-tour="subjects-step">
                  <QuickSetupStep subjects={subjects} setSubjects={setSubjects} />
                </div>
              )}
              {step === 2 && (
                <div data-tour="topics-step">
                  <SmartTopicsStep subjects={subjects} topics={topics} setTopics={setTopics} />
                </div>
              )}
              {step === 3 && (
                <div data-tour="priority-step">
                  <SubjectPriorityStep
                    subjects={subjects}
                    topics={topics}
                    subjectPriorities={subjectPriorities}
                    setSubjectPriorities={setSubjectPriorities}
                  />
                </div>
              )}
              {step === 4 && (
                <div data-tour="agenda-step">
                  <AgendaStep
                    subjects={subjects}
                    homeworks={homeworks}
                    setHomeworks={setHomeworks}
                    events={events}
                    setEvents={setEvents}
                  />
                </div>
              )}
              {step === 5 && (
                <div data-tour="config-step">
                  <SmartConfigStep
                    subjects={subjects}
                    testDates={testDates}
                    setTestDates={setTestDates}
                    preferences={preferences}
                    setPreferences={setPreferences}
                    timetableName={timetableName}
                    setTimetableName={setTimetableName}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                  />
                </div>
              )}
              {step === 6 && (
                <div data-tour="generate-step">
                  <GenerateStep
                    subjects={subjects}
                    topics={topics}
                    testDates={testDates}
                    preferences={preferences}
                    homeworks={homeworks}
                    topicAnalysis={topicAnalysis}
                    timetableMode={timetableMode}
                    timetableName={timetableName}
                    startDate={startDate}
                    endDate={endDate}
                    onComplete={handleComplete}
                    subjectPriorities={subjectPriorities}
                  />
                </div>
              )}
            </div>
          </CardContent>

          {/* Fixed footer with navigation buttons */}
          <div className="flex-shrink-0 border-t bg-card px-4 sm:px-6 py-4">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
              >
                Back
              </Button>
              {step < totalSteps && (
                <Button
                  onClick={handleNext}
                  className="bg-gradient-primary hover:opacity-90"
                  disabled={!canProceed()}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingWizard;
