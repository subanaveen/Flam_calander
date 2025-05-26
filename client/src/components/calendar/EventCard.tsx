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
    bg: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    text: "text-white",
    icon: Briefcase,
  },
  personal: {
    bg: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700", 
    text: "text-white",
    icon: Users,
  },
  health: {
    bg: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
    text: "text-white",
    icon: Dumbbell,
  },
  social: {
    bg: "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
    text: "text-white", 
    icon: Users,
  },
  travel: {
    bg: "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
    text: "text-white",
    icon: Plane,
  },
  holiday: {
    bg: "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600",
    text: "text-white",
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
        "p-2 rounded-lg text-xs cursor-move transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105",
        style.bg,
        style.text
      )}
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="h-3 w-3 flex-shrink-0 opacity-90" />
        <span className="truncate font-semibold">{event.title}</span>
        {event.isRecurring && (
          <Repeat className="h-2.5 w-2.5 flex-shrink-0 opacity-80" />
        )}
      </div>
      {event.time && (
        <div className="text-xs opacity-90 font-medium">
          {event.time}
        </div>
      )}
    </div>
  );
}
