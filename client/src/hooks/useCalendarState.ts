import { useState } from "react";
import type { Event } from "@shared/schema";
import type { EventCategory } from "@/types/calendar";

export function useCalendarState() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<EventCategory[]>([
    "work",
    "personal", 
    "health",
    "social",
    "travel",
    "holiday"
  ]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const openEventModal = () => setIsEventModalOpen(true);
  const closeEventModal = () => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  return {
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
  };
}
