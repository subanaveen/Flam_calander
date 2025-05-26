import { useMemo } from "react";
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  format,
  isSameDay 
} from "date-fns";
import EventCard from "./EventCard";
import { cn } from "@/lib/utils";
import { getEventsForDay, filterEvents } from "@/lib/calendar-utils";
import type { Event } from "@shared/schema";
import type { EventCategory } from "@/types/calendar";

interface CalendarGridProps {
  currentDate: Date;
  events: Event[];
  searchQuery: string;
  activeFilters: EventCategory[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: Event) => void;
  onEventMove: (eventId: number, newDate: Date) => void;
  isLoading: boolean;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarGrid({
  currentDate,
  events,
  searchQuery,
  activeFilters,
  onDayClick,
  onEventClick,
  onEventMove,
  isLoading,
}: CalendarGridProps) {
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  const filteredEvents = useMemo(() => {
    return filterEvents(events, searchQuery, activeFilters);
  }, [events, searchQuery, activeFilters]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    const eventId = parseInt(e.dataTransfer.getData("text/plain"));
    onEventMove(eventId, targetDate);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Calendar Header (Days of Week) */}
      <div className="grid grid-cols-7 bg-gray-50 border-b">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-medium text-secondary border-r last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day) => {
          const dayEvents = getEventsForDay(filteredEvents, day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);
          
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "aspect-square p-2 border-r border-b last:border-r-0 cursor-pointer transition-colors duration-150",
                isCurrentMonth
                  ? "hover:bg-gray-50"
                  : "bg-gray-50/50 hover:bg-gray-100",
                isCurrentDay && "bg-blue-50 hover:bg-blue-100"
              )}
              onClick={() => onDayClick(day)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day)}
            >
              <div className={cn(
                "text-sm font-medium mb-1 flex items-center",
                isCurrentMonth ? "text-gray-900" : "text-gray-400",
                isCurrentDay && "text-primary font-bold"
              )}>
                {format(day, "d")}
                {isCurrentDay && (
                  <span className="ml-1 text-xs bg-primary text-white px-1 rounded">
                    Today
                  </span>
                )}
              </div>
              
              <div className="space-y-1 overflow-y-auto max-h-20">
                {dayEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => onEventClick(event)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
