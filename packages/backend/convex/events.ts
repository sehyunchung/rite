import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth } from "./auth";

// Generate a unique submission token for a timeslot
function generateSubmissionToken(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 16; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return token;
}

// Public query to list all events (for demo purposes)
export const listEventsPublic = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db
      .query("events")
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

// Query to list all events for the authenticated organizer
export const listEvents = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("organizerId"), userId))
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

// Query to get a single event by ID (must be owned by authenticated user)
export const getEvent = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    
    // Ensure the event belongs to the authenticated user
    if (event.organizerId !== userId) {
      throw new Error("Access denied");
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
    // Temporary: accept organizerId directly until auth is fixed
    organizerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Try to get auth user, but fall back to provided organizerId for now
    let userId;
    try {
      userId = await requireAuth(ctx);
    } catch (error) {
      if (args.organizerId) {
        // For development: use the provided organizerId
        const user = await ctx.db.query("users")
          .filter((q) => q.eq(q.field("nextAuthId"), args.organizerId))
          .first();
          
        if (user) {
          userId = user._id;
        } else {
          // Try to find any user as fallback for development
          const anyUser = await ctx.db.query("users").first();
          if (anyUser) {
            userId = anyUser._id;
          } else {
            throw new Error("No users found in database");
          }
        }
      } else {
        throw error;
      }
    }
    
    const { timeslots, organizerId: _orgId, ...eventData } = args;
    
    // Create the event with authenticated user as organizer
    const eventId = await ctx.db.insert("events", {
      ...eventData,
      organizerId: userId,
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
    const userId = await requireAuth(ctx);
    
    // Verify the event belongs to the authenticated user
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    if (event.organizerId !== userId) {
      throw new Error("Access denied");
    }
    
    await ctx.db.patch(args.eventId, {
      status: args.status,
    });
  },
});