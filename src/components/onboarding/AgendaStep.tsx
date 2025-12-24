import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, Trash2, Plus, BookOpen, CalendarDays, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Homework {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  duration: number;
}

interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  isAllDay?: boolean;
}

interface AgendaStepProps {
  subjects: { name: string }[];
  homeworks: Homework[];
  setHomeworks: (homeworks: Homework[]) => void;
  events: Event[];
  setEvents: (events: Event[]) => void;
}

const AgendaStep = ({ subjects, homeworks, setHomeworks, events, setEvents }: AgendaStepProps) => {
  const [newHomework, setNewHomework] = useState<Partial<Homework>>({
    title: "",
    subject: subjects[0]?.name || "",
    dueDate: "",
    duration: 30,
  });

  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    date: "",
    startTime: "09:00",
    endTime: "17:00",
    isAllDay: false,
  });

  const addHomework = () => {
    if (newHomework.title && newHomework.subject && newHomework.dueDate) {
      setHomeworks([
        ...homeworks,
        {
          id: crypto.randomUUID(),
          title: newHomework.title,
          subject: newHomework.subject,
          dueDate: newHomework.dueDate,
          duration: newHomework.duration || 30,
        },
      ]);
      setNewHomework({
        title: "",
        subject: subjects[0]?.name || "",
        dueDate: "",
        duration: 30,
      });
    }
  };

  const removeHomework = (id: string) => {
    setHomeworks(homeworks.filter((h) => h.id !== id));
  };

  const addEvent = () => {
    if (newEvent.title && newEvent.date) {
      // For all-day events, set times to span the whole day
      const startTime = newEvent.isAllDay ? "00:00" : (newEvent.startTime || "09:00");
      const endTime = newEvent.isAllDay ? "23:59" : (newEvent.endTime || "17:00");
      
      setEvents([
        ...events,
        {
          id: crypto.randomUUID(),
          title: newEvent.title,
          date: newEvent.date,
          startTime,
          endTime,
          isAllDay: newEvent.isAllDay,
        },
      ]);
      setNewEvent({
        title: "",
        date: "",
        startTime: "09:00",
        endTime: "17:00",
        isAllDay: false,
      });
    }
  };

  const removeEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="p-4 bg-secondary/5 border-secondary/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
            <Info className="h-4 w-4 text-secondary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Why add your agenda?</p>
            <p className="text-xs text-muted-foreground mt-1">
              Adding your homework and events helps the AI schedule study sessions around your existing commitments. The AI will ensure you have time for everything!
            </p>
          </div>
        </div>
      </Card>

      {/* Homework Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <Label className="text-base font-semibold">Homework</Label>
          <span className="text-xs text-muted-foreground">(Optional)</span>
        </div>

        {/* Homework List */}
        {homeworks.length > 0 && (
          <div className="space-y-2">
            {homeworks.map((hw) => (
              <Card key={hw.id} className="p-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{hw.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {hw.subject} • Due: {format(new Date(hw.dueDate), "MMM d, yyyy")} • {hw.duration} mins
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeHomework(hw.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add Homework Form */}
        <Card className="p-4 border-dashed">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Title</Label>
              <Input
                placeholder="e.g., Physics worksheet"
                value={newHomework.title || ""}
                onChange={(e) => setNewHomework({ ...newHomework, title: e.target.value })}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Subject</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={newHomework.subject || ""}
                onChange={(e) => setNewHomework({ ...newHomework, subject: e.target.value })}
              >
                {subjects.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-9 justify-start text-left font-normal",
                      !newHomework.dueDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {newHomework.dueDate ? format(new Date(newHomework.dueDate), "PPP") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={newHomework.dueDate ? new Date(newHomework.dueDate) : undefined}
                    onSelect={(date) =>
                      setNewHomework({ ...newHomework, dueDate: date ? format(date, "yyyy-MM-dd") : "" })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Duration (mins)</Label>
              <Input
                type="number"
                min={5}
                max={180}
                value={newHomework.duration || 30}
                onChange={(e) => setNewHomework({ ...newHomework, duration: parseInt(e.target.value) || 30 })}
                className="h-9"
              />
            </div>
          </div>
          <Button
            onClick={addHomework}
            className="w-full mt-3"
            variant="secondary"
            size="sm"
            disabled={!newHomework.title || !newHomework.dueDate}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Homework
          </Button>
        </Card>
      </div>

      {/* Events Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-secondary" />
          <Label className="text-base font-semibold">Events & Commitments</Label>
          <span className="text-xs text-muted-foreground">(Optional)</span>
        </div>

        {/* Events List */}
        {events.length > 0 && (
          <div className="space-y-2">
            {events.map((event) => (
              <Card key={event.id} className="p-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(event.date), "MMM d, yyyy")} • {event.isAllDay ? "All day" : `${event.startTime} - ${event.endTime}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEvent(event.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add Event Form */}
        <Card className="p-4 border-dashed">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs">Event Title</Label>
              <Input
                placeholder="e.g., Football practice, Family dinner"
                value={newEvent.title || ""}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-9 justify-start text-left font-normal",
                      !newEvent.date && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {newEvent.date ? format(new Date(newEvent.date), "PPP") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={newEvent.date ? new Date(newEvent.date) : undefined}
                    onSelect={(date) =>
                      setNewEvent({ ...newEvent, date: date ? format(date, "yyyy-MM-dd") : "" })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="all-day-event"
                  checked={newEvent.isAllDay || false}
                  onCheckedChange={(checked) => setNewEvent({ ...newEvent, isAllDay: !!checked })}
                />
                <Label htmlFor="all-day-event" className="text-xs cursor-pointer">All-day event</Label>
              </div>
            </div>
            {!newEvent.isAllDay && (
              <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Start Time</Label>
                  <Input
                    type="time"
                    value={newEvent.startTime || "09:00"}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">End Time</Label>
                  <Input
                    type="time"
                    value={newEvent.endTime || "17:00"}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    className="h-9"
                  />
                </div>
              </div>
            )}
          </div>
          <Button
            onClick={addEvent}
            className="w-full mt-3"
            variant="secondary"
            size="sm"
            disabled={!newEvent.title || !newEvent.date}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </Card>
      </div>

      {/* Skip Note */}
      <p className="text-xs text-muted-foreground text-center">
        You can skip this step if you don't have any homework or events to add. You can always add them later from your dashboard.
      </p>
    </div>
  );
};

export default AgendaStep;
