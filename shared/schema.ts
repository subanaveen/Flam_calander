import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  time: text("time"),
  category: text("category").notNull().default("work"),
  recurrence: jsonb("recurrence"),
  isRecurring: boolean("is_recurring").default(false),
  originalEventId: integer("original_event_id"),
  exceptionDates: jsonb("exception_dates").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Recurrence pattern schema
export const recurrenceSchema = z.object({
  frequency: z.enum(["daily", "weekly", "monthly", "custom"]),
  interval: z.number().min(1).default(1),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  endDate: z.string().optional(),
  count: z.number().optional(),
});

export type RecurrencePattern = z.infer<typeof recurrenceSchema>;

// Event category enum
export const eventCategories = [
  "work",
  "personal", 
  "health",
  "social",
  "travel",
  "holiday"
] as const;

export type EventCategory = typeof eventCategories[number];
