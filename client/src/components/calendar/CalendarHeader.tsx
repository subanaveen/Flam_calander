import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FilterDropdown from "./FilterDropdown";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight, Plus, Search, Filter } from "lucide-react";
import type { EventCategory } from "@/types/calendar";

interface CalendarHeaderProps {
  currentDate: Date;
  searchQuery: string;
  activeFilters: EventCategory[];
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onSearchChange: (query: string) => void;
  onFiltersChange: (filters: EventCategory[]) => void;
  onAddEvent: () => void;
}

export default function CalendarHeader({
  currentDate,
  searchQuery,
  activeFilters,
  onPreviousMonth,
  onNextMonth,
  onToday,
  onSearchChange,
  onFiltersChange,
  onAddEvent,
}: CalendarHeaderProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <header className="mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-primary" />
            Event Calendar
          </h1>
          <span className="hidden lg:inline-block text-sm text-secondary bg-white px-3 py-1 rounded-full border">
            {format(currentDate, "MMMM yyyy")}
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 lg:flex-none lg:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary h-4 w-4" />
            <Input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filter Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            
            <FilterDropdown
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              activeFilters={activeFilters}
              onFiltersChange={onFiltersChange}
            />
          </div>
          
          {/* Add Event Button */}
          <Button
            onClick={onAddEvent}
            className="flex items-center gap-2 bg-primary hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Event</span>
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="mt-6">
        <div className="flex items-center justify-between bg-white rounded-lg border p-4">
          <Button
            variant="ghost"
            onClick={onPreviousMonth}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <Button
              variant="ghost"
              onClick={onToday}
              className="text-primary hover:text-blue-700 font-medium"
            >
              Today
            </Button>
          </div>
          
          <Button
            variant="ghost"
            onClick={onNextMonth}
            className="flex items-center gap-2"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
