import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TimetableDatesEditStepProps {
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
}

const TimetableDatesEditStep = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: TimetableDatesEditStepProps) => {
  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    // If end date is before new start date, adjust it
    if (endDate && new Date(endDate) <= new Date(value)) {
      const newEnd = new Date(value);
      newEnd.setDate(newEnd.getDate() + 7);
      setEndDate(newEnd.toISOString().split('T')[0]);
    }
  };

  const getDayCount = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Timetable Date Range
          </CardTitle>
          <CardDescription>
            Adjust when your timetable starts and ends
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-start-date">Start Date</Label>
              <Input
                id="edit-start-date"
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                min={today}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-end-date">End Date</Label>
              <Input
                id="edit-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate ? (() => {
                  const minEnd = new Date(startDate);
                  minEnd.setDate(minEnd.getDate() + 1);
                  return minEnd.toISOString().split('T')[0];
                })() : undefined}
              />
            </div>
          </div>

          {startDate && endDate && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Info className="h-4 w-4 text-primary" />
                <span>
                  Your timetable will cover <strong>{getDayCount()} days</strong>
                </span>
              </div>
            </div>
          )}

          {getDayCount() > 28 && (
            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-sm text-destructive">
                Maximum timetable length is 4 weeks (28 days). Please choose a shorter date range.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
        <p className="text-sm text-muted-foreground">
          <Info className="h-4 w-4 inline mr-2" />
          Changing dates will regenerate your entire timetable. Events within the new date range will be respected.
        </p>
      </div>
    </div>
  );
};

export default TimetableDatesEditStep;
