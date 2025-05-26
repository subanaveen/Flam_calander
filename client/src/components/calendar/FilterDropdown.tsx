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
  { value: "health", label: "Health & Fitness", color: "bg-yellow-500" },
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
        "absolute right-0 top-full mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-40",
        "animate-in fade-in-0 zoom-in-95 duration-200"
      )}
    >
      <div className="p-4">
        <h4 className="font-medium text-gray-900 mb-3">Filter Events</h4>
        
        {/* Category Filters */}
        <div className="space-y-2 mb-4">
          {FILTER_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center space-x-3">
              <Checkbox
                id={option.value}
                checked={activeFilters.includes(option.value as EventCategory)}
                onCheckedChange={() => handleFilterToggle(option.value as EventCategory)}
              />
              <div className={cn("w-3 h-3 rounded", option.color)} />
              <Label htmlFor={option.value} className="text-sm cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
        
        {/* Quick Actions */}
        <div className="border-t pt-3 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="w-full justify-start h-8"
          >
            Select All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="w-full justify-start h-8"
          >
            Clear All
          </Button>
        </div>
      </div>
    </div>
  );
}
