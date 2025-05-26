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
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl border-0 shadow-xl overflow-hidden">
      {/* Calendar Header (Days of Week) */}
      <div className="grid grid-cols-7 bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-gray-100">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="p-4 text-center text-sm font-semibold text-gray-700 border-r border-gray-100 last:border-r-0"
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
                "aspect-square p-3 border-r border-b border-gray-100 last:border-r-0 cursor-pointer transition-all duration-200 hover:shadow-md",
                isCurrentMonth
                  ? "hover:bg-blue-50/30 bg-white"
                  : "bg-gray-50/40 hover:bg-gray-50/60 text-gray-400",
                isCurrentDay && "bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100"
              )}
              onClick={() => onDayClick(day)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day)}
            >
              <div className={cn(
                "text-sm font-semibold mb-2 flex items-center justify-between",
                isCurrentMonth ? "text-gray-900" : "text-gray-400",
                isCurrentDay && "text-blue-700"
              )}>
                <span className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full",
                  isCurrentDay && "bg-blue-600 text-white text-xs font-bold"
                )}>
                  {format(day, "d")}
                </span>
                {isCurrentDay && !isCurrentDay && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
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
