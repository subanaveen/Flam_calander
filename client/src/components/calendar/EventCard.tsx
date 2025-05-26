import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Briefcase, Dumbbell, Users, Calendar, Plane, Gift, Star, Utensils, Repeat } from "lucide-react";
import type { Event } from "@shared/schema";

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

const categoryStyles = {
  work: {
    bg: "bg-blue-100 hover:bg-blue-200",
    border: "border-l-blue-500",
    text: "text-blue-800",
    icon: Briefcase,
  },
  personal: {
    bg: "bg-green-100 hover:bg-green-200", 
    border: "border-l-green-500",
    text: "text-green-800",
    icon: Users,
  },
  health: {
    bg: "bg-yellow-100 hover:bg-yellow-200",
    border: "border-l-yellow-500", 
    text: "text-yellow-800",
    icon: Dumbbell,
  },
  social: {
    bg: "bg-purple-100 hover:bg-purple-200",
    border: "border-l-purple-500",
    text: "text-purple-800", 
    icon: Users,
  },
  travel: {
    bg: "bg-orange-100 hover:bg-orange-200",
    border: "border-l-orange-500",
    text: "text-orange-800",
    icon: Plane,
  },
  holiday: {
    bg: "bg-red-100 hover:bg-red-200",
    border: "border-l-red-500",
    text: "text-red-800",
    icon: Star,
  },
};

export default function EventCard({ event, onClick }: EventCardProps) {
  const style = categoryStyles[event.category as keyof typeof categoryStyles] || categoryStyles.work;
  const Icon = style.icon;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", event.id.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <div
      className={cn(
        "p-1 rounded text-xs cursor-move border-l-4 transition-colors duration-150",
        style.bg,
        style.border,
        style.text
      )}
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
    >
      <div className="flex items-center gap-1">
        <Icon className="h-3 w-3 flex-shrink-0" />
        <span className="truncate font-medium">{event.title}</span>
        {event.isRecurring && (
          <Repeat className="h-2 w-2 flex-shrink-0 opacity-70" />
        )}
      </div>
      {event.time && (
        <div className="text-xs opacity-75 mt-0.5">
          {event.time}
        </div>
      )}
    </div>
  );
}
