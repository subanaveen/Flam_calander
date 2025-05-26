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
import { getEventsForDay, filterEvents, hasConflictsOnDay, getDayEventDensity } from "@/lib/calendar-utils";
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
          const hasConflicts = hasConflictsOnDay(filteredEvents, day);
          const density = getDayEventDensity(filteredEvents, day);
          
          // Dynamic background based on event density
          const getDensityBackground = () => {
            if (!isCurrentMonth) return "bg-gray-50/40";
            if (isCurrentDay) return "bg-gradient-to-br from-blue-50 to-indigo-50";
            
            switch (density) {
              case 'high': return "bg-gradient-to-br from-orange-50 to-red-50";
              case 'medium': return "bg-gradient-to-br from-cyan-50 to-blue-50";
              default: return "bg-white";
            }
          };
          
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "aspect-square p-3 border-r border-b border-gray-100 last:border-r-0 cursor-pointer transition-all duration-200 hover:shadow-md relative",
                getDensityBackground(),
                isCurrentMonth
                  ? "hover:bg-blue-50/30"
                  : "hover:bg-gray-50/60 text-gray-400",
                isCurrentDay && "hover:from-blue-100 hover:to-indigo-100"
              )}
              onClick={() => onDayClick(day)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day)}
            >
              {/* Conflict indicator */}
              {hasConflicts && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full shadow-sm animate-pulse" 
                     title="Schedule conflicts detected" />
              )}
              
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
                
                {/* Event count badge for high density days */}
                {density === 'high' && dayEvents.length > 3 && (
                  <span className="text-xs bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded-full font-medium">
                    {dayEvents.length}
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
