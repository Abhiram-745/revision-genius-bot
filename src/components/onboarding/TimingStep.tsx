import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { StudyPreferences } from "../OnboardingWizard";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Sun, UtensilsCrossed, GraduationCap } from "lucide-react";

interface TimingStepProps {
  preferences: StudyPreferences;
  setPreferences: (prefs: StudyPreferences) => void;
}

const TimingStep = ({ preferences, setPreferences }: TimingStepProps) => {
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
      {/* Study Days & Time Windows */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <Label className="text-base font-medium">Study Days & Time Windows</Label>
        </div>
        <p className="text-xs text-muted-foreground">
          Set which days you study and your available time windows for each day.
        </p>
        <ScrollArea className="h-auto max-h-[30vh]">
          <div className="space-y-2 pr-2">
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
        </ScrollArea>
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
    </div>
  );
};

export default TimingStep;
