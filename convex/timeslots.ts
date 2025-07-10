import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Query to get timeslots for an event
export const getTimeslots = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const timeslots = await ctx.db
      .query("timeslots")
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .collect();
    
    return timeslots;
  },
});

// Mutation to create a timeslot
export const createTimeslot = mutation({
  args: {
    eventId: v.id("events"),
    startTime: v.string(),
    endTime: v.string(),
    djName: v.string(),
    djInstagram: v.string(),
  },
  handler: async (ctx, args) => {
    const timeslotId = await ctx.db.insert("timeslots", args);
    
    console.log("Created new timeslot with id:", timeslotId);
    return timeslotId;
  },
});

// Mutation to update a timeslot
export const updateTimeslot = mutation({
  args: {
    timeslotId: v.id("timeslots"),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    djName: v.optional(v.string()),
    djInstagram: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { timeslotId, ...updates } = args;
    
    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    await ctx.db.patch(timeslotId, cleanUpdates);
  },
});

// Mutation to delete a timeslot
export const deleteTimeslot = mutation({
  args: {
    timeslotId: v.id("timeslots"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.timeslotId);
  },
});