import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Event, InsertEvent } from "@shared/schema";

export function useEvents() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: events, isLoading, error } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const createEvent = useMutation({
    mutationFn: async (eventData: Partial<InsertEvent>) => {
      const res = await apiRequest("POST", "/api/events", eventData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Success",
        description: "Event created successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...eventData }: { id: number } & Partial<InsertEvent>) => {
      const res = await apiRequest("PATCH", `/api/events/${id}`, eventData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Success",
        description: "Event updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Success",
        description: "Event deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    events,
    isLoading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
