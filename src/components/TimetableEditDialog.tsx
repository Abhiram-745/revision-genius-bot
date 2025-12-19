import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";
import SubjectsStep from "./onboarding/SubjectsStep";
import TopicsEditStep from "./onboarding/TopicsEditStep";
import TestDatesStep from "./onboarding/TestDatesStep";
import PreferencesStep from "./onboarding/PreferencesStep";
import TimingStep from "./onboarding/TimingStep";
import HomeworkEditStep from "./onboarding/HomeworkEditStep";
import GenerationProgress from "./onboarding/GenerationProgress";
import TimetableDatesEditStep from "./onboarding/TimetableDatesEditStep";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Subject, Topic, TestDate, StudyPreferences } from "./OnboardingWizard";
import { checkCanRegenerateTimetable, incrementUsage } from "@/hooks/useUserRole";
import PaywallDialog from "@/components/PaywallDialog";
import { useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TimetableEditDialogProps {
  timetableId: string;
  currentSubjects: Subject[];
  currentTopics: Topic[];
  currentTestDates: TestDate[];
  currentPreferences: StudyPreferences;
  startDate: string;
  endDate: string;
  onUpdate: () => void;
}

// Helper function to migrate old preferences format to new format
const migratePreferences = (prefs: any): StudyPreferences => {
  const weekDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  
  // If already in new format with day_time_slots
  if (prefs.day_time_slots && Array.isArray(prefs.day_time_slots)) {
    return {
      daily_study_hours: prefs.daily_study_hours || 2,
      session_duration: prefs.session_duration,
      break_duration: prefs.break_duration,
      duration_mode: prefs.duration_mode || "flexible",
      day_time_slots: prefs.day_time_slots,
      aiNotes: prefs.aiNotes,
    };
  }

  // Otherwise, convert old format to new format
  const studyDays = prefs.study_days || [];
  const startTime = prefs.preferred_start_time || "09:00";
  const endTime = prefs.preferred_end_time || "17:00";

  return {
    daily_study_hours: prefs.daily_study_hours || 2,
    session_duration: prefs.session_duration || 45,
    break_duration: prefs.break_duration || 15,
    duration_mode: prefs.duration_mode || "flexible",
    day_time_slots: weekDays.map(day => ({
      day,
      startTime,
      endTime,
      enabled: studyDays.includes(day),
    })),
    aiNotes: prefs.aiNotes,
  };
};

export const TimetableEditDialog = ({
  timetableId,
  currentSubjects,
  currentTopics,
  currentTestDates,
  currentPreferences,
  startDate,
  endDate,
  onUpdate,
}: TimetableEditDialogProps) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>(
    currentSubjects.map(s => ({ ...s, mode: s.mode || "no-exam" }))
  );
  
  // Normalize topics to use proper subject IDs (handle old data with index-based subject_ids)
  const normalizeTopics = (topics: Topic[], subs: Subject[]): Topic[] => {
    return topics.map(topic => {
      // If subject_id is already a valid UUID (36 chars with dashes), keep it
      if (topic.subject_id && topic.subject_id.length === 36 && topic.subject_id.includes('-')) {
        return topic;
      }
      // If it's an index-based subject_id (like "0", "1", etc.), map to actual subject ID
      const subjectIndex = parseInt(topic.subject_id, 10);
      if (!isNaN(subjectIndex) && subs[subjectIndex]?.id) {
        return { ...topic, subject_id: subs[subjectIndex].id };
      }
      return topic;
    });
  };
  
  const [topics, setTopics] = useState<Topic[]>(normalizeTopics(currentTopics, currentSubjects));
  const [testDates, setTestDates] = useState<TestDate[]>(currentTestDates);
  const [preferences, setPreferences] = useState<StudyPreferences>(migratePreferences(currentPreferences));
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState<string>("");
  const [showPaywall, setShowPaywall] = useState(false);
  const [editStartDate, setEditStartDate] = useState(startDate);
  const [editEndDate, setEditEndDate] = useState(endDate);

  const handleRegenerate = async () => {
    if (subjects.length === 0) {
      toast.error("Please add at least one subject");
      return;
    }
    if (topics.length === 0) {
      toast.error("Please add at least one topic");
      return;
    }
    
    // Check if any subject requires test dates (short-term or long-term exam prep)
    const subjectsNeedingExams = subjects.filter(s => 
      s.mode === 'short-term-exam' || s.mode === 'long-term-exam'
    );
    
    if (subjectsNeedingExams.length > 0 && testDates.length === 0) {
      toast.error("Please add test dates for subjects with exam preparation mode");
      return;
    }

    // Check if user can regenerate timetable
    const canRegenerate = await checkCanRegenerateTimetable();
    if (!canRegenerate) {
      setShowPaywall(true);
      return;
    }

    setIsRegenerating(true);
    setGenerationStage("saving");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch user's homework
      const { data: homeworks, error: homeworkError } = await supabase
        .from("homeworks")
        .select("*")
        .eq("user_id", user.id)
        .eq("completed", false);

      if (homeworkError) throw homeworkError;

      // Fetch user's events within the timetable date range (all instances, no parents)
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id)
        .gte("start_time", `${editStartDate}T00:00:00`)
        .lte("end_time", `${editEndDate}T23:59:59`)
        .order("start_time", { ascending: true });

      if (eventsError) throw eventsError;

      // Deduplicate events by unique combination of time and title (not ID)
      const uniqueEvents = Array.from(
        new Map(
          (events || []).map((evt) => [
            `${evt.title}-${evt.start_time}-${evt.end_time}`,
            evt,
          ])
        ).values()
      );

      // Update stage to analyzing
      setGenerationStage("analyzing");
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update stage to scheduling
      setGenerationStage("scheduling");

      const { data: scheduleData, error: functionError } = await supabase.functions.invoke(
        "generate-timetable",
        {
          body: {
            subjects,
            topics,
            testDates,
            preferences,
            homeworks: homeworks?.map(({ id, title, subject, due_date, duration, description }) => ({
              id,
              title,
              subject,
              due_date,
              duration,
              description
            })) || [],
            events: uniqueEvents,
            aiNotes: preferences.aiNotes || "",
            startDate: editStartDate,
            endDate: editEndDate,
          },
        }
      );

      if (functionError) throw functionError;

      // Update stage to optimizing
      setGenerationStage("optimizing");
      await new Promise(resolve => setTimeout(resolve, 300));

      // Update stage to finalizing
      setGenerationStage("finalizing");

      // Update the timetable with new schedule, dates, and configuration
      const { error: updateError } = await supabase
        .from("timetables")
        .update({
          schedule: scheduleData.schedule,
          subjects: subjects as any,
          topics: topics as any,
          test_dates: testDates as any,
          preferences: preferences as any,
          start_date: editStartDate,
          end_date: editEndDate,
        })
        .eq("id", timetableId);

      if (updateError) throw updateError;

      // Increment usage counter
      await incrementUsage("timetable_regeneration", queryClient);

      toast.success("Timetable regenerated successfully!");
      setOpen(false);
      onUpdate();
    } catch (error) {
      console.error("Error regenerating timetable:", error);
      toast.error("Failed to regenerate timetable");
    } finally {
      setIsRegenerating(false);
      setGenerationStage("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Edit & Regenerate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>Edit Timetable Configuration</DialogTitle>
          <DialogDescription>
            Add or modify subjects, topics, test dates, and preferences. Then regenerate your
            timetable with the updated configuration.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 px-6 relative">
          {/* Generation Progress Overlay */}
          {isRegenerating && generationStage && (
            <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center animate-fade-in">
              <div className="w-full max-w-md">
                <GenerationProgress currentStage={generationStage} />
              </div>
            </div>
          )}

          <Tabs defaultValue="dates" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-7 flex-shrink-0">
              <TabsTrigger value="dates">Dates</TabsTrigger>
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
              <TabsTrigger value="topics">Topics</TabsTrigger>
              <TabsTrigger value="tests">Tests</TabsTrigger>
              <TabsTrigger value="homework">Homework</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="timing">Timing</TabsTrigger>
            </TabsList>

            <div className="flex-1 min-h-0 mt-4">
              <TabsContent value="dates" className="mt-0 h-full data-[state=active]:flex data-[state=active]:flex-col">
                <ScrollArea className="flex-1">
                  <div className="pr-4 pb-4">
                    <TimetableDatesEditStep
                      startDate={editStartDate}
                      setStartDate={setEditStartDate}
                      endDate={editEndDate}
                      setEndDate={setEditEndDate}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="subjects" className="mt-0 h-full data-[state=active]:flex data-[state=active]:flex-col">
                <ScrollArea className="flex-1">
                  <div className="pr-4 pb-4">
                    <SubjectsStep subjects={subjects} setSubjects={setSubjects} />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="topics" className="mt-0 h-full data-[state=active]:flex data-[state=active]:flex-col">
                <ScrollArea className="flex-1">
                  <div className="pr-4 pb-4">
                    <TopicsEditStep subjects={subjects} topics={topics} setTopics={setTopics} />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="tests" className="mt-0 h-full data-[state=active]:flex data-[state=active]:flex-col">
                <ScrollArea className="flex-1">
                  <div className="pr-4 pb-4">
                    <TestDatesStep subjects={subjects} testDates={testDates} setTestDates={setTestDates} />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="homework" className="mt-0 h-full data-[state=active]:flex data-[state=active]:flex-col">
                <ScrollArea className="flex-1">
                  <div className="pr-4 pb-4">
                    <HomeworkEditStep subjects={subjects} />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="preferences" className="mt-0 h-full data-[state=active]:flex data-[state=active]:flex-col">
                <ScrollArea className="flex-1">
                  <div className="pr-4 pb-4">
                    <PreferencesStep preferences={preferences} setPreferences={setPreferences} />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="timing" className="mt-0 h-full data-[state=active]:flex data-[state=active]:flex-col">
                <ScrollArea className="flex-1">
                  <div className="pr-4 pb-4">
                    <TimingStep preferences={preferences} setPreferences={setPreferences} />
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Sticky Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t bg-background flex-shrink-0">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isRegenerating}>
            Cancel
          </Button>
          <Button
            onClick={handleRegenerate}
            disabled={
              isRegenerating || 
              subjects.length === 0 || 
              topics.length === 0 ||
              (subjects.some(s => s.mode === 'short-term-exam' || s.mode === 'long-term-exam') && testDates.length === 0)
            }
            className="gap-2"
          >
            {isRegenerating && <Loader2 className="h-4 w-4 animate-spin" />}
            {isRegenerating ? "Regenerating..." : "Regenerate Timetable"}
          </Button>
        </div>
      </DialogContent>

      <PaywallDialog
        open={showPaywall}
        onOpenChange={setShowPaywall}
        limitType="timetable_regeneration"
      />
    </Dialog>
  );
};

export default TimetableEditDialog;
