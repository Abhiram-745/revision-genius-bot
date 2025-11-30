import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StudyPreferences } from "../OnboardingWizard";
import { Card } from "@/components/ui/card";
import { Clock, Brain, MessageSquare } from "lucide-react";

interface PreferencesStepProps {
  preferences: StudyPreferences;
  setPreferences: (prefs: StudyPreferences) => void;
}

const PreferencesStep = ({ preferences, setPreferences }: PreferencesStepProps) => {
  return (
    <div className="space-y-6">
      {/* Daily Study Hours */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <Label htmlFor="daily-hours" className="text-base font-medium">Daily Study Hours (Target)</Label>
        </div>
        <Input
          id="daily-hours"
          type="number"
          min="1"
          max="12"
          value={preferences.daily_study_hours}
          onChange={(e) =>
            setPreferences({
              ...preferences,
              daily_study_hours: parseInt(e.target.value) || 2,
            })
          }
          className="w-32"
        />
        <p className="text-xs text-muted-foreground">
          How many hours per day do you want to dedicate to studying?
        </p>
      </div>

      {/* Duration Mode */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <Label className="text-base font-medium">Session & Break Duration Mode</Label>
        </div>
        <RadioGroup
          value={preferences.duration_mode}
          onValueChange={(value: "fixed" | "flexible") =>
            setPreferences({
              ...preferences,
              duration_mode: value,
            })
          }
          className="space-y-3"
        >
          <Card className="p-3">
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="flexible" id="flexible" className="mt-1" />
              <Label htmlFor="flexible" className="font-normal cursor-pointer flex-1">
                <span className="font-medium">Flexible (Recommended)</span>
                <p className="text-xs text-muted-foreground mt-1">
                  AI tailors session length based on task type and complexity
                </p>
              </Label>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="fixed" id="fixed" className="mt-1" />
              <Label htmlFor="fixed" className="font-normal cursor-pointer flex-1">
                <span className="font-medium">Fixed</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Use specific durations for all sessions
                </p>
              </Label>
            </div>
          </Card>
        </RadioGroup>

        {preferences.duration_mode === "fixed" && (
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div className="space-y-2">
              <Label htmlFor="session-duration" className="text-sm">Session Duration (mins)</Label>
              <Input
                id="session-duration"
                type="number"
                min="15"
                max="120"
                value={preferences.session_duration}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    session_duration: parseInt(e.target.value) || 45,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="break-duration" className="text-sm">Break Duration (mins)</Label>
              <Input
                id="break-duration"
                type="number"
                min="5"
                max="60"
                value={preferences.break_duration}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    break_duration: parseInt(e.target.value) || 15,
                  })
                }
              />
            </div>
          </div>
        )}

        {preferences.duration_mode === "flexible" && (
          <Card className="p-3 bg-muted/50 border-dashed">
            <p className="text-xs text-muted-foreground">
              <strong>AI will automatically adjust:</strong><br />
              • Homework: Exact duration specified<br />
              • Focus/difficult topics: 60-90 minutes<br />
              • Regular topics: 30-45 minutes
            </p>
          </Card>
        )}
      </div>

      {/* AI Notes */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <Label htmlFor="ai-notes" className="text-base font-medium">Notes for AI (Optional)</Label>
        </div>
        <Textarea
          id="ai-notes"
          placeholder="Any special instructions, preferences, or constraints for the AI to consider when generating your timetable..."
          value={preferences.aiNotes || ""}
          onChange={(e) =>
            setPreferences({
              ...preferences,
              aiNotes: e.target.value,
            })
          }
          rows={4}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          E.g., "I focus better in the mornings" or "Schedule harder topics early"
        </p>
      </div>
    </div>
  );
};

export default PreferencesStep;
