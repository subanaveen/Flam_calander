import { useState } from "react";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import EventModal from "@/components/calendar/EventModal";
import { useCalendarState } from "@/hooks/useCalendarState";
import { useEvents } from "@/hooks/useEvents";
import { format } from "date-fns";

export default function Calendar() {
  const {
    currentDate,
    selectedDate,
    searchQuery,
    activeFilters,
    isEventModalOpen,
    editingEvent,
    setCurrentDate,
    setSelectedDate,
    setSearchQuery,
    setActiveFilters,
    openEventModal,
    closeEventModal,
    setEditingEvent,
  } = useCalendarState();

  const { events, createEvent, updateEvent, deleteEvent, isLoading } = useEvents();

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    openEventModal();
  };

  const handleEventClick = (event: any) => {
    setEditingEvent(event);
    setSelectedDate(new Date(event.date));
    openEventModal();
  };

  const handleEventSave = async (eventData: any) => {
    try {
      if (editingEvent) {
        await updateEvent.mutateAsync({ id: editingEvent.id, ...eventData });
      } else {
        await createEvent.mutateAsync(eventData);
      }
      closeEventModal();
    } catch (error) {
      console.error("Failed to save event:", error);
    }
  };

  const handleEventDelete = async (eventId: number) => {
    try {
      await deleteEvent.mutateAsync(eventId);
      closeEventModal();
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        <CalendarHeader
          currentDate={currentDate}
          searchQuery={searchQuery}
          activeFilters={activeFilters}
          onPreviousMonth={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
          onNextMonth={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
          onToday={() => setCurrentDate(new Date())}
          onSearchChange={setSearchQuery}
          onFiltersChange={setActiveFilters}
          onAddEvent={() => {
            setEditingEvent(null);
            setSelectedDate(new Date());
            openEventModal();
          }}
        />

        <CalendarGrid
          currentDate={currentDate}
          events={events || []}
          searchQuery={searchQuery}
          activeFilters={activeFilters}
          onDayClick={handleDayClick}
          onEventClick={handleEventClick}
          onEventMove={async (eventId: number, newDate: Date) => {
            const event = events?.find(e => e.id === eventId);
            if (event) {
              await updateEvent.mutateAsync({
                id: eventId,
                date: newDate
              });
            }
          }}
          isLoading={isLoading}
        />

        <EventModal
          isOpen={isEventModalOpen}
          onClose={closeEventModal}
          onSave={handleEventSave}
          onDelete={editingEvent ? () => handleEventDelete(editingEvent.id) : undefined}
          event={editingEvent}
          selectedDate={selectedDate}
          existingEvents={events || []}
        />
      </div>
    </div>
  );
}
