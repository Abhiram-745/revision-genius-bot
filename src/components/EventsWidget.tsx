import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Trash2, Clock, Repeat, Pencil, Sun, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addDays, addWeeks, addMonths, startOfDay, endOfDay, setHours, setMinutes } from "date-fns";
import { z } from "zod";
import { cn } from "@/lib/utils";

type EventType = "one-time" | "all-day" | "recurring";

const eventSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  eventType: z.enum(["one-time", "all-day", "recurring"]),
  startDate: z.string().min(1, "Start date is required"),
  startTime: z.string().optional(),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  recurrenceRule: z.enum(["none", "daily", "every-2-days", "weekly", "biweekly", "every-3-weeks", "monthly"]),
  recurrenceEndDate: z.string().optional(),
}).refine((data) => {
  if (data.recurrenceRule !== "none" && !data.recurrenceEndDate) {
    return false;
  }
  return true;
}, {
  message: "Recurrence end date is required for recurring events",
  path: ["recurrenceEndDate"],
});

interface Event {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  recurrence_rule: string | null;
  recurrence_end_date: string | null;
  parent_event_id: string | null;
}

export const EventsWidget = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<EventType>("one-time");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("17:00");
  const [recurrenceRule, setRecurrenceRule] = useState<string>("weekly");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setEventType("one-time");
    setStartDate("");
    setStartTime("09:00");
    setEndDate("");
    setEndTime("17:00");
    setRecurrenceRule("weekly");
    setRecurrenceEndDate("");
    setEditingEvent(null);
  };

  const fetchEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id)
        .is("parent_event_id", null)
        .order("start_time", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    const channel = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
        },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const generateRecurringInstances = (
    startDateTime: Date,
    endDateTime: Date,
    rule: string,
    recurrenceEnd: Date
  ): { start: Date; end: Date }[] => {
    const instances: { start: Date; end: Date }[] = [];
    const duration = endDateTime.getTime() - startDateTime.getTime();
    let currentStart = new Date(startDateTime);

    while (currentStart <= recurrenceEnd) {
      instances.push({
        start: new Date(currentStart),
        end: new Date(currentStart.getTime() + duration),
      });

      if (rule === "daily") {
        currentStart = addDays(currentStart, 1);
      } else if (rule === "every-2-days") {
        currentStart = addDays(currentStart, 2);
      } else if (rule === "weekly") {
        currentStart = addWeeks(currentStart, 1);
      } else if (rule === "biweekly") {
        currentStart = addWeeks(currentStart, 2);
      } else if (rule === "every-3-weeks") {
        currentStart = addWeeks(currentStart, 3);
      } else if (rule === "monthly") {
        currentStart = addMonths(currentStart, 1);
      } else {
        break;
      }
    }

    return instances;
  };

  const regenerateTimetables = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = format(new Date(), "yyyy-MM-dd");
      const { data: timetables, error } = await supabase
        .from("timetables")
        .select("*")
        .eq("user_id", user.id)
        .gte("end_date", today)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error || !timetables || timetables.length === 0) {
        return;
      }

      toast.info("Regenerating timetables to account for events...", {
        duration: 3000,
      });

      for (const timetable of timetables) {
        const { data: preferences } = await supabase
          .from("study_preferences")
          .select("*")
          .eq("user_id", user.id)
          .single();

        const { data: events } = await supabase
          .from("events")
          .select("*")
          .eq("user_id", user.id)
          .gte("end_time", `${timetable.start_date}T00:00:00`)
          .lte("start_time", `${timetable.end_date}T23:59:59`)
          .order("start_time", { ascending: true });

        const uniqueEvents = Array.from(
          new Map(
            (events || []).map((evt) => [
              `${evt.title}-${evt.start_time}-${evt.end_time}`,
              evt,
            ])
          ).values()
        );

        const { data: homeworks } = await supabase
          .from("homeworks")
          .select("*")
          .eq("user_id", user.id)
          .eq("completed", false)
          .gte("due_date", timetable.start_date)
          .lte("due_date", timetable.end_date);

        await supabase.functions.invoke("regenerate-tomorrow", {
          body: {
            timetableId: timetable.id,
            subjects: timetable.subjects || [],
            topics: timetable.topics || [],
            testDates: timetable.test_dates || [],
            preferences: preferences || timetable.preferences,
            homeworks: homeworks || [],
            events: uniqueEvents || [],
            startDate: timetable.start_date,
            endDate: timetable.end_date,
          },
        });
      }
    } catch (error) {
      console.error("Error regenerating timetables:", error);
    }
  };

  const buildDateTime = (date: string, time: string, isAllDay: boolean, isEnd: boolean = false): Date => {
    const baseDate = new Date(date);
    if (isAllDay) {
      return isEnd ? endOfDay(baseDate) : startOfDay(baseDate);
    }
    const [hours, minutes] = time.split(':').map(Number);
    return setMinutes(setHours(baseDate, hours), minutes);
  };

  const handleAddEvent = async () => {
    if (!title.trim()) {
      toast.error("Please enter an event title");
      return;
    }
    if (!startDate) {
      toast.error("Please select a start date");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      let finalStartTime: Date;
      let finalEndTime: Date;

      if (eventType === "all-day") {
        finalStartTime = buildDateTime(startDate, "", true, false);
        finalEndTime = buildDateTime(endDate || startDate, "", true, true);
      } else {
        finalStartTime = buildDateTime(startDate, startTime, false);
        finalEndTime = buildDateTime(startDate, endTime, false);
        
        if (finalEndTime <= finalStartTime) {
          toast.error("End time must be after start time");
          return;
        }
      }

      const isRecurring = eventType === "recurring";

      if (isRecurring && recurrenceEndDate) {
        const recEnd = new Date(recurrenceEndDate);
        
        if (recEnd <= finalStartTime) {
          toast.error("Recurrence end date must be after the event start date");
          return;
        }

        const instances = generateRecurringInstances(
          finalStartTime,
          finalEndTime,
          recurrenceRule,
          recEnd
        );

        if (instances.length > 100) {
          toast.error("Too many recurring instances. Please choose a shorter recurrence period.");
          return;
        }
      }

      // Create parent event
      const { data: parentEvent, error: parentError } = await supabase
        .from("events")
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description?.trim() || null,
          start_time: finalStartTime.toISOString(),
          end_time: finalEndTime.toISOString(),
          is_recurring: isRecurring,
          recurrence_rule: isRecurring ? recurrenceRule : null,
          recurrence_end_date: isRecurring ? recurrenceEndDate : null,
        })
        .select()
        .single();

      if (parentError) throw parentError;

      // Generate recurring instances if applicable
      if (isRecurring && recurrenceEndDate) {
        const instances = generateRecurringInstances(
          finalStartTime,
          finalEndTime,
          recurrenceRule,
          new Date(recurrenceEndDate)
        );

        const recurringInstances = instances.slice(1).map((instance) => ({
          user_id: user.id,
          title: title.trim(),
          description: description?.trim() || null,
          start_time: instance.start.toISOString(),
          end_time: instance.end.toISOString(),
          is_recurring: false,
          parent_event_id: parentEvent.id,
        }));

        if (recurringInstances.length > 0) {
          const { error: instancesError } = await supabase
            .from("events")
            .insert(recurringInstances);

          if (instancesError) throw instancesError;
        }

        toast.success(`Recurring event created with ${instances.length} instances`);
      } else {
        toast.success(eventType === "all-day" ? "All-day event added" : "Event added successfully");
      }

      setDialogOpen(false);
      resetForm();
      fetchEvents();
      regenerateTimetables();
    } catch (error) {
      console.error("Error adding event:", error);
      toast.error("Failed to add event");
    }
  };

  const handleDeleteEvent = async (id: string, isRecurringParent: boolean) => {
    try {
      if (isRecurringParent) {
        const { error } = await supabase.from("events").delete().eq("id", id);
        if (error) throw error;
        toast.success("Recurring event and all instances deleted");
      } else {
        const { error } = await supabase.from("events").delete().eq("id", id);
        if (error) throw error;
        toast.success("Event deleted");
      }

      fetchEvents();
      regenerateTimetables();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  const detectEventType = (event: Event): EventType => {
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    const startHour = start.getHours();
    const startMin = start.getMinutes();
    const endHour = end.getHours();
    const endMin = end.getMinutes();
    
    // All-day: starts at 00:00 and ends at 23:59
    const isAllDay = startHour === 0 && startMin === 0 && endHour === 23 && endMin === 59;
    
    if (event.is_recurring) return "recurring";
    if (isAllDay) return "all-day";
    return "one-time";
  };

  const handleEditClick = (event: Event) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDescription(event.description || "");
    
    const detectedType = detectEventType(event);
    setEventType(detectedType);
    
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    
    setStartDate(format(start, "yyyy-MM-dd"));
    setStartTime(format(start, "HH:mm"));
    setEndDate(format(end, "yyyy-MM-dd"));
    setEndTime(format(end, "HH:mm"));
    setRecurrenceRule(event.recurrence_rule || "weekly");
    setRecurrenceEndDate(event.recurrence_end_date ? format(new Date(event.recurrence_end_date), "yyyy-MM-dd") : "");
    
    setEditDialogOpen(true);
  };

  const handleEditEvent = async () => {
    if (!editingEvent) return;
    if (!title.trim()) {
      toast.error("Please enter an event title");
      return;
    }
    if (!startDate) {
      toast.error("Please select a start date");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      let finalStartTime: Date;
      let finalEndTime: Date;

      if (eventType === "all-day") {
        finalStartTime = buildDateTime(startDate, "", true, false);
        finalEndTime = buildDateTime(endDate || startDate, "", true, true);
      } else {
        finalStartTime = buildDateTime(startDate, startTime, false);
        finalEndTime = buildDateTime(startDate, endTime, false);
        
        if (finalEndTime <= finalStartTime) {
          toast.error("End time must be after start time");
          return;
        }
      }

      const isRecurring = eventType === "recurring";

      if (isRecurring && recurrenceEndDate) {
        const recEnd = new Date(recurrenceEndDate);
        
        if (recEnd <= finalStartTime) {
          toast.error("Recurrence end date must be after the event start date");
          return;
        }

        const instances = generateRecurringInstances(
          finalStartTime,
          finalEndTime,
          recurrenceRule,
          recEnd
        );

        if (instances.length > 100) {
          toast.error("Too many recurring instances. Please choose a shorter recurrence period.");
          return;
        }

        // Delete old instances
        if (editingEvent.is_recurring) {
          await supabase.from("events").delete().eq("parent_event_id", editingEvent.id);
        }
      }

      // Update the parent event
      const { error: updateError } = await supabase
        .from("events")
        .update({
          title: title.trim(),
          description: description?.trim() || null,
          start_time: finalStartTime.toISOString(),
          end_time: finalEndTime.toISOString(),
          is_recurring: isRecurring,
          recurrence_rule: isRecurring ? recurrenceRule : null,
          recurrence_end_date: isRecurring ? recurrenceEndDate : null,
        })
        .eq("id", editingEvent.id);

      if (updateError) throw updateError;

      // Generate new recurring instances if applicable
      if (isRecurring && recurrenceEndDate) {
        const instances = generateRecurringInstances(
          finalStartTime,
          finalEndTime,
          recurrenceRule,
          new Date(recurrenceEndDate)
        );

        const recurringInstances = instances.slice(1).map((instance) => ({
          user_id: user.id,
          title: title.trim(),
          description: description?.trim() || null,
          start_time: instance.start.toISOString(),
          end_time: instance.end.toISOString(),
          is_recurring: false,
          parent_event_id: editingEvent.id,
        }));

        if (recurringInstances.length > 0) {
          const { error: instancesError } = await supabase
            .from("events")
            .insert(recurringInstances);

          if (instancesError) throw instancesError;
        }

        toast.success(`Event updated with ${instances.length} instances`);
      } else {
        toast.success("Event updated successfully");
      }

      setEditDialogOpen(false);
      resetForm();
      fetchEvents();
      regenerateTimetables();
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event");
    }
  };

  const getEventTypeBadge = (event: Event) => {
    const type = detectEventType(event);
    
    switch (type) {
      case "recurring":
        return <Badge variant="secondary" className="gap-1 text-xs"><Repeat className="w-3 h-3" /> {event.recurrence_rule}</Badge>;
      case "all-day":
        return <Badge variant="outline" className="gap-1 text-xs"><Sun className="w-3 h-3" /> All Day</Badge>;
      default:
        return <Badge variant="default" className="gap-1 text-xs"><Clock className="w-3 h-3" /> One-time</Badge>;
    }
  };

  const formatEventTime = (event: Event) => {
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    const type = detectEventType(event);

    if (type === "all-day") {
      if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
        return format(start, "EEE, MMM d");
      }
      return `${format(start, "MMM d")} - ${format(end, "MMM d")}`;
    }

    return `${format(start, "EEE, MMM d")} • ${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
  };

  const displayEvents = events.slice().sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  const EventTypeSelector = () => (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Event Type</Label>
      <RadioGroup 
        value={eventType} 
        onValueChange={(v) => setEventType(v as EventType)}
        className="grid grid-cols-3 gap-3"
      >
        <div>
          <RadioGroupItem value="one-time" id="one-time" className="peer sr-only" />
          <Label
            htmlFor="one-time"
            className={cn(
              "flex flex-col items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-all hover:bg-accent/50",
              eventType === "one-time" ? "border-primary bg-primary/10" : "border-muted"
            )}
          >
            <Clock className="w-5 h-5 mb-1.5" />
            <span className="text-xs font-medium">One-time</span>
          </Label>
        </div>
        <div>
          <RadioGroupItem value="all-day" id="all-day" className="peer sr-only" />
          <Label
            htmlFor="all-day"
            className={cn(
              "flex flex-col items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-all hover:bg-accent/50",
              eventType === "all-day" ? "border-primary bg-primary/10" : "border-muted"
            )}
          >
            <Sun className="w-5 h-5 mb-1.5" />
            <span className="text-xs font-medium">All Day</span>
          </Label>
        </div>
        <div>
          <RadioGroupItem value="recurring" id="recurring" className="peer sr-only" />
          <Label
            htmlFor="recurring"
            className={cn(
              "flex flex-col items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-all hover:bg-accent/50",
              eventType === "recurring" ? "border-primary bg-primary/10" : "border-muted"
            )}
          >
            <Repeat className="w-5 h-5 mb-1.5" />
            <span className="text-xs font-medium">Recurring</span>
          </Label>
        </div>
      </RadioGroup>
      <p className="text-xs text-muted-foreground">
        {eventType === "one-time" && "A single event at a specific time"}
        {eventType === "all-day" && "Block entire day(s) - no study sessions will be scheduled"}
        {eventType === "recurring" && "Repeats daily, weekly, or monthly"}
      </p>
    </div>
  );

  const EventFormFields = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Event Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Football practice, Family trip"
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details about this event..."
          rows={2}
        />
      </div>

      {/* Date Selection */}
      <div className={cn("grid gap-4", eventType === "all-day" ? "grid-cols-2" : "grid-cols-1")}>
        <div>
          <Label htmlFor="startDate">{eventType === "all-day" ? "Start Date *" : "Date *"}</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        {eventType === "all-day" && (
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
            />
          </div>
        )}
      </div>

      {/* Time Selection (not for all-day) */}
      {eventType !== "all-day" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startTime">Start Time *</Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="endTime">End Time *</Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Recurrence Options */}
      {eventType === "recurring" && (
        <div className="space-y-4 p-3 bg-muted/50 rounded-lg">
          <div>
            <Label htmlFor="recurrence">Repeat</Label>
            <Select value={recurrenceRule} onValueChange={setRecurrenceRule}>
              <SelectTrigger id="recurrence">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="every-2-days">Every 2 days</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                <SelectItem value="every-3-weeks">Every 3 weeks</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="recurrence_end">Repeat Until *</Label>
            <Input
              id="recurrence_end"
              type="date"
              value={recurrenceEndDate}
              onChange={(e) => setRecurrenceEndDate(e.target.value)}
              min={startDate}
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card data-tour="events-list">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Events
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2" data-tour="add-event">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
              <DialogDescription>
                Block time in your timetable for events and commitments.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-2">
              <EventTypeSelector />
              <EventFormFields />
              <Button onClick={handleAddEvent} className="w-full">
                Add Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading events...</p>
        ) : displayEvents.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No events yet</p>
            <p className="text-xs">Add events so the AI can schedule around them!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-sm truncate">{event.title}</h4>
                    {getEventTypeBadge(event)}
                  </div>
                  {event.description && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatEventTime(event)}</span>
                  </div>
                  {event.is_recurring && event.recurrence_end_date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Until {format(new Date(event.recurrence_end_date), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClick(event)}
                    title="Edit event"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEvent(event.id, event.is_recurring)}
                    title={event.is_recurring ? "Delete all instances" : "Delete event"}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Event Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Modify the details of this event.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <EventTypeSelector />
            <EventFormFields />
            <Button onClick={handleEditEvent} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};