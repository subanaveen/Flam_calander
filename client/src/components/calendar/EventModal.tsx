import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { detectEventConflicts } from "@/lib/calendar-utils";
import { generateRecurringEvents } from "@/lib/recurrence-utils";
import { useToast } from "@/hooks/use-toast";
import { eventCategories } from "@shared/schema";
import type { Event, RecurrencePattern } from "@shared/schema";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: any) => void;
  onDelete?: () => void;
  event?: Event | null;
  selectedDate: Date;
  existingEvents: Event[];
}

const RECURRENCE_OPTIONS = [
  { value: "none", label: "Does not repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom..." },
];

const CATEGORY_OPTIONS = [
  { value: "work", label: "🔵 Work", color: "blue" },
  { value: "personal", label: "🟢 Personal", color: "green" },
  { value: "health", label: "🟡 Health", color: "yellow" },
  { value: "social", label: "🟣 Social", color: "purple" },
  { value: "travel", label: "🟠 Travel", color: "orange" },
  { value: "holiday", label: "🔴 Holiday", color: "red" },
];

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  selectedDate,
  existingEvents,
}: EventModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    category: "work" as any,
    recurrence: "none",
    customRecurrence: {
      frequency: "weekly" as const,
      interval: 1,
      daysOfWeek: [] as number[],
    },
  });

  const [showCustomRecurrence, setShowCustomRecurrence] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictingEvents, setConflictingEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || "",
        date: format(new Date(event.date), "yyyy-MM-dd"),
        time: event.time || "",
        category: event.category,
        recurrence: event.isRecurring ? "custom" : "none",
        customRecurrence: event.recurrence || {
          frequency: "weekly",
          interval: 1,
          daysOfWeek: [],
        },
      });
    } else {
      setFormData({
        title: "",
        description: "",
        date: format(selectedDate, "yyyy-MM-dd"),
        time: "",
        category: "work",
        recurrence: "none",
        customRecurrence: {
          frequency: "weekly",
          interval: 1,
          daysOfWeek: [],
        },
      });
    }
  }, [event, selectedDate, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Event title is required",
        variant: "destructive",
      });
      return;
    }

    const eventData = {
      title: formData.title,
      description: formData.description,
      date: new Date(formData.date),
      time: formData.time,
      category: formData.category,
      isRecurring: formData.recurrence !== "none",
      recurrence: formData.recurrence !== "none" ? formData.customRecurrence : null,
    };

    // Check for conflicts
    const conflicts = detectEventConflicts(eventData, existingEvents, event?.id);
    if (conflicts.length > 0) {
      setConflictingEvents(conflicts);
      setShowConflictDialog(true);
      return;
    }

    onSave(eventData);
  };

  const handleForceCreate = () => {
    const eventData = {
      title: formData.title,
      description: formData.description,
      date: new Date(formData.date),
      time: formData.time,
      category: formData.category,
      isRecurring: formData.recurrence !== "none",
      recurrence: formData.recurrence !== "none" ? formData.customRecurrence : null,
    };

    setShowConflictDialog(false);
    onSave(eventData);
  };

  const handleRecurrenceChange = (value: string) => {
    setFormData(prev => ({ ...prev, recurrence: value }));
    setShowCustomRecurrence(value === "custom");
    
    if (value === "daily") {
      setFormData(prev => ({
        ...prev,
        customRecurrence: { frequency: "daily", interval: 1, daysOfWeek: [] }
      }));
    } else if (value === "weekly") {
      setFormData(prev => ({
        ...prev,
        customRecurrence: { frequency: "weekly", interval: 1, daysOfWeek: [new Date(prev.date).getDay()] }
      }));
    } else if (value === "monthly") {
      setFormData(prev => ({
        ...prev,
        customRecurrence: { frequency: "monthly", interval: 1, daysOfWeek: [] }
      }));
    }
  };

  const handleDayOfWeekToggle = (dayIndex: number) => {
    setFormData(prev => ({
      ...prev,
      customRecurrence: {
        ...prev.customRecurrence,
        daysOfWeek: prev.customRecurrence.daysOfWeek.includes(dayIndex)
          ? prev.customRecurrence.daysOfWeek.filter(d => d !== dayIndex)
          : [...prev.customRecurrence.daysOfWeek, dayIndex]
      }
    }));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{event ? "Edit Event" : "Add New Event"}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Event Title */}
            <div>
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter event title..."
                required
              />
            </div>
            
            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            
            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add event description..."
                rows={3}
              />
            </div>
            
            {/* Category */}
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Recurrence */}
            <div>
              <Label htmlFor="recurrence">Repeat</Label>
              <Select value={formData.recurrence} onValueChange={handleRecurrenceChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECURRENCE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Custom Recurrence */}
            {showCustomRecurrence && (
              <div className="space-y-3 p-3 bg-gray-50 rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="interval">Every</Label>
                    <Input
                      id="interval"
                      type="number"
                      min="1"
                      value={formData.customRecurrence.interval}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        customRecurrence: {
                          ...prev.customRecurrence,
                          interval: parseInt(e.target.value) || 1
                        }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Period</Label>
                    <Select 
                      value={formData.customRecurrence.frequency} 
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        customRecurrence: {
                          ...prev.customRecurrence,
                          frequency: value as any
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Days</SelectItem>
                        <SelectItem value="weekly">Weeks</SelectItem>
                        <SelectItem value="monthly">Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {formData.customRecurrence.frequency === "weekly" && (
                  <div>
                    <Label>Repeat on</Label>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox
                            id={`day-${index}`}
                            checked={formData.customRecurrence.daysOfWeek.includes(index)}
                            onCheckedChange={() => handleDayOfWeekToggle(index)}
                          />
                          <Label htmlFor={`day-${index}`} className="text-sm">
                            {day}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {event ? "Update Event" : "Save Event"}
              </Button>
            </div>
            
            {/* Delete Button */}
            {onDelete && (
              <div className="pt-2 border-t space-y-2">
                {event?.isRecurring ? (
                  <>
                    <Button 
                      type="button" 
                      variant="destructive" 
                      onClick={onDelete}
                      className="w-full"
                    >
                      Delete This Event Only
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        // TODO: Implement delete all occurrences
                        onDelete();
                      }}
                      className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Delete All Occurrences
                    </Button>
                  </>
                ) : (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={onDelete}
                    className="w-full"
                  >
                    Delete Event
                  </Button>
                )}
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* Conflict Dialog */}
      <Dialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event Conflict Detected</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              This event conflicts with the following existing events:
            </p>
            
            <div className="space-y-2">
              {conflictingEvents.map((conflictEvent) => (
                <div key={conflictEvent.id} className="p-2 bg-red-50 border border-red-200 rounded">
                  <div className="font-medium">{conflictEvent.title}</div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(conflictEvent.date), "MMM dd")} 
                    {conflictEvent.time && ` at ${conflictEvent.time}`}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowConflictDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleForceCreate}
                className="flex-1"
              >
                Create Anyway
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
