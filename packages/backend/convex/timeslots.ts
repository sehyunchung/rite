import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Generate a unique submission token for a timeslot
function generateSubmissionToken(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 16; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return token;
}

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

// Query to get a timeslot by its submission token
export const getTimeslotByToken = query({
  args: {
    submissionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const timeslot = await ctx.db
      .query("timeslots")
      .filter((q) => q.eq(q.field("submissionToken"), args.submissionToken))
      .first();
    
    if (!timeslot || !timeslot.submissionToken) {
      throw new Error("Invalid submission link");
    }
    
    // Also get the event details
    const event = await ctx.db.get(timeslot.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    
    // Check if there's an existing submission for this timeslot
    const existingSubmission = await ctx.db
      .query("submissions")
      .filter((q) => q.eq(q.field("timeslotId"), timeslot._id))
      .first();
    
    return {
      ...timeslot,
      event,
      existingSubmission,
    };
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
    const submissionToken = generateSubmissionToken();
    
    const timeslotId = await ctx.db.insert("timeslots", {
      ...args,
      submissionToken,
    });
    
    console.log("Created new timeslot with id:", timeslotId, "and token:", submissionToken);
    return { timeslotId, submissionToken };
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

// Migration function to add submission tokens to existing timeslots
export const addSubmissionTokensToExistingTimeslots = mutation({
  args: {},
  handler: async (ctx) => {
    const timeslotsWithoutTokens = await ctx.db
      .query("timeslots")
      .filter((q) => q.eq(q.field("submissionToken"), undefined))
      .collect();
    
    console.log(`Found ${timeslotsWithoutTokens.length} timeslots without submission tokens`);
    
    for (const timeslot of timeslotsWithoutTokens) {
      const submissionToken = generateSubmissionToken();
      await ctx.db.patch(timeslot._id, { submissionToken });
      console.log(`Added token ${submissionToken} to timeslot ${timeslot._id}`);
    }
    
    return { updated: timeslotsWithoutTokens.length };
  },
});