import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Query to list all events for the organizer
export const listEvents = query({
  args: {
    organizerId: v.string(),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("organizerId"), args.organizerId))
      .order("desc")
      .collect();
    
    return events;
  },
});

// Query to get a single event by ID
export const getEvent = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    
    // Also get the timeslots for this event
    const timeslots = await ctx.db
      .query("timeslots")
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .collect();
    
    return {
      ...event,
      timeslots,
    };
  },
});

// Mutation to create a new event with timeslots
export const createEvent = mutation({
  args: {
    organizerId: v.string(),
    name: v.string(),
    date: v.string(),
    venue: v.object({
      name: v.string(),
      address: v.string(),
    }),
    description: v.optional(v.string()),
    deadlines: v.object({
      guestList: v.string(),
      promoMaterials: v.string(),
    }),
    payment: v.object({
      amount: v.number(),
      currency: v.string(),
      dueDate: v.string(),
    }),
    timeslots: v.array(v.object({
      startTime: v.string(),
      endTime: v.string(),
      djName: v.string(),
      djInstagram: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const { timeslots, ...eventData } = args;
    
    // Create the event
    const eventId = await ctx.db.insert("events", {
      ...eventData,
      createdAt: new Date().toISOString(),
      status: "draft" as const,
    });
    
    // Create timeslots for the event
    const timeslotIds = await Promise.all(
      timeslots.map(async (slot) => {
        const timeslotId = await ctx.db.insert("timeslots", {
          eventId,
          startTime: slot.startTime,
          endTime: slot.endTime,
          djName: slot.djName,
          djInstagram: slot.djInstagram,
        });
        return timeslotId;
      })
    );
    
    console.log("Created new event with id:", eventId, "and timeslots:", timeslotIds);
    return { eventId, timeslotIds };
  },
});

// Mutation to update event status
export const updateEventStatus = mutation({
  args: {
    eventId: v.id("events"),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, {
      status: args.status,
    });
  },
});