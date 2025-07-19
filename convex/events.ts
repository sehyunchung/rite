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
    
    // Provide defaults for optional fields for backward compatibility
    return events.map(event => ({
      ...event,
      guestLimitPerDJ: event.guestLimitPerDJ ?? 2, // Default to 2 guests per DJ
      payment: {
        ...event.payment,
        perDJ: event.payment.perDJ ?? event.payment.amount, // Default perDJ to total amount
      },
      hashtags: event.hashtags ?? '', // Default to empty string
    }));
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
    
    // Provide defaults for optional fields for backward compatibility
    return {
      ...event,
      guestLimitPerDJ: event.guestLimitPerDJ ?? 2, // Default to 2 guests per DJ
      payment: {
        ...event.payment,
        perDJ: event.payment.perDJ ?? event.payment.amount, // Default perDJ to total amount
      },
      hashtags: event.hashtags ?? '', // Default to empty string
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
    hashtags: v.optional(v.string()),
    deadlines: v.object({
      guestList: v.string(),
      promoMaterials: v.string(),
    }),
    payment: v.object({
      amount: v.number(),
      perDJ: v.number(),
      currency: v.string(),
      dueDate: v.string(),
    }),
    guestLimitPerDJ: v.number(),
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
    
    // Create timeslots for the event with unique submission tokens
    const timeslotResults = await Promise.all(
      timeslots.map(async (slot) => {
        const submissionToken = generateSubmissionToken();
        const timeslotId = await ctx.db.insert("timeslots", {
          eventId,
          startTime: slot.startTime,
          endTime: slot.endTime,
          djName: slot.djName,
          djInstagram: slot.djInstagram,
          submissionToken,
        });
        return { timeslotId, submissionToken };
      })
    );
    
    console.log("Created new event with id:", eventId, "and timeslots:", timeslotResults);
    return { 
      eventId, 
      timeslots: timeslotResults 
    };
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