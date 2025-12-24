import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { StudyPreferences } from "../OnboardingWizard";
import { Card } from "@/components/ui/card";
import { Clock, Brain, MessageSquare, Calendar, Sun, UtensilsCrossed, GraduationCap } from "lucide-react";

interface PreferencesStepProps {
  preferences: StudyPreferences;
  setPreferences: (prefs: StudyPreferences) => void;
}

const PreferencesStep = ({ preferences, setPreferences }: PreferencesStepProps) => {
  const weekDays = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
  ];

  const toggleDay = (day: string) => {
    setPreferences({
      ...preferences,
      day_time_slots: preferences.day_time_slots.map((slot) =>
        slot.day === day ? { ...slot, enabled: !slot.enabled } : slot
      ),
    });
  };

  const updateTimeSlot = (day: string, field: 'startTime' | 'endTime', value: string) => {
    setPreferences({
      ...preferences,
      day_time_slots: preferences.day_time_slots.map((slot) =>
        slot.day === day ? { ...slot, [field]: value } : slot
      ),
    });
  };

  return (
    <div className="space-y-6">
      {/* AI Scheduling Notice */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">AI-Optimized Scheduling</p>
            <p className="text-xs text-muted-foreground mt-1">
              Don't worry about your events, homework, and other commitments - the AI will automatically schedule around them and ensure your study sessions fit perfectly into your day.
            </p>
          </div>
        </div>
      </Card>

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

      {/* Study Days & Time Windows */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <Label className="text-base font-medium">Study Days & Time Windows</Label>
        </div>
        <p className="text-xs text-muted-foreground">
          Set which days you study and your available time windows for each day.
        </p>
        <div className="space-y-2">
            {weekDays.map((day) => {
              const slot = preferences.day_time_slots.find((s) => s.day === day.value);
              return (
                <Card key={day.value} className="p-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center space-x-2 min-w-[110px]">
                      <Checkbox
                        id={`timing-${day.value}`}
                        checked={slot?.enabled || false}
                        onCheckedChange={() => toggleDay(day.value)}
                      />
                      <label
                        htmlFor={`timing-${day.value}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {day.label}
                      </label>
                    </div>
                    
                    {slot?.enabled && (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateTimeSlot(day.value, 'startTime', e.target.value)}
                          className="w-28 h-8 text-sm"
                        />
                        <span className="text-sm text-muted-foreground">to</span>
                        <Input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateTimeSlot(day.value, 'endTime', e.target.value)}
                          className="w-28 h-8 text-sm"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
        </div>
      </div>

      {/* Additional Time Slots */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sun className="h-4 w-4 text-primary" />
          <Label className="text-base font-medium">Additional Time Slots</Label>
        </div>
        <p className="text-xs text-muted-foreground">
          Enable extra study windows for quick homework tasks (15-25 mins only).
        </p>
        
        <Card className="p-4 space-y-4">
          {/* Before School */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="timing-before-school"
                checked={preferences.study_before_school || false}
                onCheckedChange={(checked) =>
                  setPreferences({
                    ...preferences,
                    study_before_school: !!checked,
                  })
                }
              />
              <Sun className="h-4 w-4 text-orange-500" />
              <label htmlFor="timing-before-school" className="text-sm cursor-pointer font-medium">
                Morning sessions before school
              </label>
            </div>
            
            {preferences.study_before_school && (
              <div className="ml-8 flex items-center gap-2">
                <Input
                  type="time"
                  value={preferences.before_school_start || "07:00"}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      before_school_start: e.target.value,
                    })
                  }
                  className="w-28 h-8 text-sm"
                />
                <span className="text-sm text-muted-foreground">to</span>
                <Input
                  type="time"
                  value={preferences.before_school_end || "08:00"}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      before_school_end: e.target.value,
                    })
                  }
                  className="w-28 h-8 text-sm"
                />
              </div>
            )}
          </div>
          
          {/* Lunch */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="timing-during-lunch"
                checked={preferences.study_during_lunch || false}
                onCheckedChange={(checked) =>
                  setPreferences({
                    ...preferences,
                    study_during_lunch: !!checked,
                  })
                }
              />
              <UtensilsCrossed className="h-4 w-4 text-green-500" />
              <label htmlFor="timing-during-lunch" className="text-sm cursor-pointer font-medium">
                Study during lunch break
              </label>
            </div>
            
            {preferences.study_during_lunch && (
              <div className="ml-8 flex items-center gap-2">
                <Input
                  type="time"
                  value={preferences.lunch_start || "12:00"}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      lunch_start: e.target.value,
                    })
                  }
                  className="w-28 h-8 text-sm"
                />
                <span className="text-sm text-muted-foreground">to</span>
                <Input
                  type="time"
                  value={preferences.lunch_end || "12:30"}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      lunch_end: e.target.value,
                    })
                  }
                  className="w-28 h-8 text-sm"
                />
              </div>
            )}
          </div>
          
          {/* Free Periods */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="timing-free-periods"
              checked={preferences.study_during_free_periods || false}
              onCheckedChange={(checked) =>
                setPreferences({
                  ...preferences,
                  study_during_free_periods: !!checked,
                })
              }
            />
            <GraduationCap className="h-4 w-4 text-blue-500" />
            <label htmlFor="timing-free-periods" className="text-sm cursor-pointer font-medium">
              Study during school free periods
            </label>
          </div>
          
          <p className="text-xs text-muted-foreground pt-2 border-t">
            These additional slots are for quick homework tasks only (15-25 mins), not full revision sessions.
          </p>
        </Card>
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
