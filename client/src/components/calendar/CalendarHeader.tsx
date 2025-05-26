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
    <header className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <CalendarIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Event Calendar
              </h1>
              <p className="text-sm text-gray-500 mt-1">Manage your schedule with ease</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 lg:flex-none lg:w-72">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-11 pr-4 py-3 border-0 bg-white/80 backdrop-blur-sm shadow-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
            />
          </div>
          
          {/* Filter Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 border-0 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white hover:shadow-md transition-all rounded-xl px-4 py-3"
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
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all rounded-xl px-6 py-3 font-medium"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Event</span>
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="mt-8">
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl border-0 shadow-lg p-6">
          <Button
            variant="ghost"
            onClick={onPreviousMonth}
            className="flex items-center gap-2 hover:bg-gray-50 rounded-xl px-4 py-2 transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="hidden sm:inline font-medium">Previous</span>
          </Button>
          
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <Button
              variant="ghost"
              onClick={onToday}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium rounded-xl px-4 py-2 transition-all"
            >
              Today
            </Button>
          </div>
          
          <Button
            variant="ghost"
            onClick={onNextMonth}
            className="flex items-center gap-2 hover:bg-gray-50 rounded-xl px-4 py-2 transition-all"
          >
            <span className="hidden sm:inline font-medium">Next</span>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
