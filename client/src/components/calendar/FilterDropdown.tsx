import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { EventCategory } from "@/types/calendar";

interface FilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilters: EventCategory[];
  onFiltersChange: (filters: EventCategory[]) => void;
}

const FILTER_OPTIONS = [
  { value: "work", label: "Work Events", color: "bg-blue-500" },
  { value: "personal", label: "Personal Events", color: "bg-green-500" },
  { value: "health", label: "Health & Fitness", color: "bg-teal-500" },
  { value: "social", label: "Social Events", color: "bg-purple-500" },
  { value: "travel", label: "Travel", color: "bg-orange-500" },
  { value: "holiday", label: "Holidays", color: "bg-red-500" },
] as const;

export default function FilterDropdown({
  isOpen,
  onClose,
  activeFilters,
  onFiltersChange,
}: FilterDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleFilterToggle = (filter: EventCategory) => {
    if (activeFilters.includes(filter)) {
      onFiltersChange(activeFilters.filter(f => f !== filter));
    } else {
      onFiltersChange([...activeFilters, filter]);
    }
  };

  const handleSelectAll = () => {
    onFiltersChange(FILTER_OPTIONS.map(option => option.value as EventCategory));
  };

  const handleClearAll = () => {
    onFiltersChange([]);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={cn(
        "absolute right-0 top-full mt-3 w-72 bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-xl z-40",
        "animate-in fade-in-0 zoom-in-95 duration-200"
      )}
    >
      <div className="p-6">
        <h4 className="font-semibold text-gray-900 mb-4 text-base">Filter Events</h4>
        
        {/* Category Filters */}
        <div className="space-y-3 mb-6">
          {FILTER_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Checkbox
                id={option.value}
                checked={activeFilters.includes(option.value as EventCategory)}
                onCheckedChange={() => handleFilterToggle(option.value as EventCategory)}
              />
              <div className={cn("w-4 h-4 rounded-full shadow-sm", option.color)} />
              <Label htmlFor={option.value} className="text-sm cursor-pointer font-medium text-gray-700 flex-1">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
        
        {/* Quick Actions */}
        <div className="border-t border-gray-100 pt-4 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="w-full justify-start h-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
          >
            Select All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="w-full justify-start h-9 text-gray-600 hover:text-gray-700 hover:bg-gray-50 font-medium"
          >
            Clear All
          </Button>
        </div>
      </div>
    </div>
  );
}
