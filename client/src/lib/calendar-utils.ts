import { isSameDay, parse, isWithinInterval } from "date-fns";
import type { Event } from "@shared/schema";
import type { EventCategory } from "@/types/calendar";

export function getEventsForDay(events: Event[], date: Date): Event[] {
  return events.filter(event => isSameDay(new Date(event.date), date));
}

export function filterEvents(
  events: Event[], 
  searchQuery: string, 
  activeFilters: EventCategory[]
): Event[] {
  return events.filter(event => {
    // Filter by category
    if (!activeFilters.includes(event.category as EventCategory)) {
      return false;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(query) ||
        (event.description && event.description.toLowerCase().includes(query))
      );
    }

    return true;
  });
}

export function detectEventConflicts(
  newEvent: any,
  existingEvents: Event[],
  excludeEventId?: number
): Event[] {
  if (!newEvent.time) return [];

  const newEventDate = new Date(newEvent.date);
  const newEventTime = parse(newEvent.time, "HH:mm", newEventDate);

  return existingEvents.filter(existingEvent => {
    if (excludeEventId && existingEvent.id === excludeEventId) return false;
    if (!existingEvent.time) return false;

    const existingEventDate = new Date(existingEvent.date);
    if (!isSameDay(newEventDate, existingEventDate)) return false;

    const existingEventTime = parse(existingEvent.time, "HH:mm", existingEventDate);
    
    // Simple time conflict check (same time)
    return Math.abs(newEventTime.getTime() - existingEventTime.getTime()) < 60 * 60 * 1000; // Within 1 hour
  });
}

export function hasConflictsOnDay(events: Event[], date: Date): boolean {
  const dayEvents = getEventsForDay(events, date);
  const timedEvents = dayEvents.filter(event => event.time);
  
  if (timedEvents.length < 2) return false;

  // Check for overlapping times
  for (let i = 0; i < timedEvents.length; i++) {
    for (let j = i + 1; j < timedEvents.length; j++) {
      const event1Time = parse(timedEvents[i].time!, "HH:mm", date);
      const event2Time = parse(timedEvents[j].time!, "HH:mm", date);
      
      if (Math.abs(event1Time.getTime() - event2Time.getTime()) < 60 * 60 * 1000) {
        return true;
      }
    }
  }
  
  return false;
}

export function getDayEventDensity(events: Event[], date: Date): 'low' | 'medium' | 'high' {
  const dayEvents = getEventsForDay(events, date);
  const count = dayEvents.length;
  
  if (count >= 4) return 'high';
  if (count >= 2) return 'medium';
  return 'low';
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    work: "blue",
    personal: "green", 
    health: "yellow",
    social: "purple",
    travel: "orange",
    holiday: "red",
  };
  return colors[category] || "blue";
}
