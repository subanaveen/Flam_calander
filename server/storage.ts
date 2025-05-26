import { events, type Event, type InsertEvent } from "@shared/schema";
import { startOfDay, endOfDay, parseISO, format } from "date-fns";

export interface IStorage {
  getEvent(id: number): Promise<Event | undefined>;
  getEvents(): Promise<Event[]>;
  getEventsByDateRange(startDate: Date, endDate: Date): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  getEventsByRecurrence(originalEventId: number): Promise<Event[]>;
}

export class MemStorage implements IStorage {
  private events: Map<number, Event>;
  private currentId: number;

  constructor() {
    this.events = new Map();
    this.currentId = 1;
    this.seedData();
  }

  private seedData() {
    // Add some initial events for demonstration
    const now = new Date();
    const sampleEvents = [
      {
        title: "Team Meeting",
        description: "Weekly team sync",
        date: new Date(now.getFullYear(), now.getMonth(), 1),
        time: "10:00",
        category: "work",
        recurrence: {
          frequency: "weekly",
          interval: 1,
          daysOfWeek: [1] // Monday
        },
        isRecurring: true,
        exceptionDates: []
      },
      {
        title: "Gym Session", 
        description: "Regular workout",
        date: new Date(now.getFullYear(), now.getMonth(), 3),
        time: "18:00",
        category: "health",
        recurrence: {
          frequency: "weekly",
          interval: 1,
          daysOfWeek: [2, 4] // Tuesday, Thursday
        },
        isRecurring: true,
        exceptionDates: []
      },
      {
        title: "Birthday Party",
        description: "John's birthday celebration",
        date: new Date(now.getFullYear(), now.getMonth(), 7),
        time: "19:00",
        category: "social",
        isRecurring: false,
        exceptionDates: []
      }
    ];

    for (const event of sampleEvents) {
      this.createEvent(event as any);
    }
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    const allEvents = Array.from(this.events.values());
    return allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfDay(startDate) && eventDate <= endOfDay(endDate);
    });
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentId++;
    const now = new Date();
    const event: Event = {
      id,
      title: insertEvent.title,
      description: insertEvent.description || null,
      date: insertEvent.date,
      time: insertEvent.time || null,
      category: insertEvent.category || "work",
      recurrence: insertEvent.recurrence || null,
      isRecurring: insertEvent.isRecurring || false,
      originalEventId: insertEvent.originalEventId || null,
      exceptionDates: insertEvent.exceptionDates || [],
      createdAt: now,
      updatedAt: now,
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: number, updateData: Partial<InsertEvent>): Promise<Event | undefined> {
    const existingEvent = this.events.get(id);
    if (!existingEvent) {
      return undefined;
    }

    const updatedEvent: Event = {
      ...existingEvent,
      ...updateData,
      updatedAt: new Date(),
    };

    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  async getEventsByRecurrence(originalEventId: number): Promise<Event[]> {
    const allEvents = Array.from(this.events.values());
    return allEvents.filter(event => event.originalEventId === originalEventId);
  }
}

export const storage = new MemStorage();
