import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all events
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Get events by date range
  app.get("/api/events/range", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      const events = await storage.getEventsByDateRange(start, end);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events by date range" });
    }
  });

  // Get single event
  app.get("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  // Create new event
  app.post("/api/events", async (req, res) => {
    try {
      // Simple validation and data transformation
      const eventData = {
        title: req.body.title,
        description: req.body.description || "",
        date: new Date(req.body.date),
        time: req.body.time || "",
        category: req.body.category || "work",
        recurrence: req.body.recurrence || null,
        isRecurring: req.body.isRecurring || false,
        originalEventId: req.body.originalEventId || undefined,
        exceptionDates: req.body.exceptionDates || [],
      };
      
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // Update event
  app.patch("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Simple validation and data transformation for updates
      const updateData: any = {};
      if (req.body.title) updateData.title = req.body.title;
      if (req.body.description !== undefined) updateData.description = req.body.description;
      if (req.body.date) updateData.date = new Date(req.body.date);
      if (req.body.time !== undefined) updateData.time = req.body.time;
      if (req.body.category) updateData.category = req.body.category;
      if (req.body.recurrence !== undefined) updateData.recurrence = req.body.recurrence;
      if (req.body.isRecurring !== undefined) updateData.isRecurring = req.body.isRecurring;
      if (req.body.originalEventId !== undefined) updateData.originalEventId = req.body.originalEventId;
      if (req.body.exceptionDates !== undefined) updateData.exceptionDates = req.body.exceptionDates;
      
      const updatedEvent = await storage.updateEvent(id, updateData);
      
      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(updatedEvent);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  // Delete event
  app.delete("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteEvent(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Get recurring event instances
  app.get("/api/events/:id/recurrence", async (req, res) => {
    try {
      const originalEventId = parseInt(req.params.id);
      const events = await storage.getEventsByRecurrence(originalEventId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recurring events" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
