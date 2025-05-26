import { addDays, addWeeks, addMonths, isSameDay, startOfMonth, endOfMonth } from "date-fns";
import type { Event, RecurrencePattern } from "@shared/schema";

export function generateRecurringEvents(
  baseEvent: Event,
  startDate: Date,
  endDate: Date
): Event[] {
  if (!baseEvent.isRecurring || !baseEvent.recurrence) {
    return [baseEvent];
  }

  const pattern = baseEvent.recurrence as RecurrencePattern;
  const events: Event[] = [];
  let currentDate = new Date(baseEvent.date);

  // Limit to prevent infinite loops
  const maxOccurrences = 100;
  let occurrenceCount = 0;

  while (currentDate <= endDate && occurrenceCount < maxOccurrences) {
    if (currentDate >= startDate) {
      // Check if this date is not in exception dates
      const isException = baseEvent.exceptionDates && 
        (baseEvent.exceptionDates as string[]).some(exceptionDate => 
          isSameDay(new Date(exceptionDate), currentDate)
        );

      if (!isException) {
        events.push({
          ...baseEvent,
          date: new Date(currentDate),
          id: baseEvent.id + occurrenceCount * 10000, // Generate unique ID for recurring instances
        });
      }
    }

    // Calculate next occurrence
    currentDate = getNextOccurrence(currentDate, pattern);
    occurrenceCount++;
  }

  return events;
}

function getNextOccurrence(currentDate: Date, pattern: RecurrencePattern): Date {
  switch (pattern.frequency) {
    case "daily":
      return addDays(currentDate, pattern.interval);
    
    case "weekly":
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        // Find next day of week
        const currentDayOfWeek = currentDate.getDay();
        const sortedDays = [...pattern.daysOfWeek].sort((a, b) => a - b);
        
        // Find next day in current week
        const nextDayThisWeek = sortedDays.find(day => day > currentDayOfWeek);
        if (nextDayThisWeek !== undefined) {
          return addDays(currentDate, nextDayThisWeek - currentDayOfWeek);
        }
        
        // Go to first day of next week interval
        const firstDay = sortedDays[0];
        const daysUntilNextWeek = 7 - currentDayOfWeek + firstDay + (pattern.interval - 1) * 7;
        return addDays(currentDate, daysUntilNextWeek);
      } else {
        return addWeeks(currentDate, pattern.interval);
      }
    
    case "monthly":
      return addMonths(currentDate, pattern.interval);
    
    case "custom":
      // For custom patterns, fall back to the specified frequency
      return getNextOccurrence(currentDate, {
        ...pattern,
        frequency: pattern.frequency === "custom" ? "weekly" : pattern.frequency
      });
    
    default:
      return addDays(currentDate, 1);
  }
}

export function expandRecurringEventsForMonth(
  events: Event[],
  monthDate: Date
): Event[] {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  
  const expandedEvents: Event[] = [];

  for (const event of events) {
    if (event.isRecurring && event.recurrence) {
      const recurring = generateRecurringEvents(event, monthStart, monthEnd);
      expandedEvents.push(...recurring);
    } else {
      // Only include non-recurring events that fall within the month
      const eventDate = new Date(event.date);
      if (eventDate >= monthStart && eventDate <= monthEnd) {
        expandedEvents.push(event);
      }
    }
  }

  return expandedEvents;
}
