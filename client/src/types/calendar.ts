export type EventCategory = "work" | "personal" | "health" | "social" | "travel" | "holiday";

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  date: Date;
  time?: string;
  category: EventCategory;
  isRecurring?: boolean;
  recurrence?: RecurrencePattern | null;
  originalEventId?: number | null;
  exceptionDates?: string[];
}

export interface RecurrencePattern {
  frequency: "daily" | "weekly" | "monthly" | "custom";
  interval: number;
  daysOfWeek?: number[];
  endDate?: string;
  count?: number;
}

export interface CalendarState {
  currentDate: Date;
  selectedDate: Date;
  searchQuery: string;
  activeFilters: EventCategory[];
  isEventModalOpen: boolean;
  editingEvent: CalendarEvent | null;
}
