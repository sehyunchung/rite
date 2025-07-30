import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth } from "./auth";
import { 
  EventPhase, 
  computeEventCapabilities, 
  computeEventPhase,
  isValidTransition,
  type EventPhaseType 
} from "./eventStatus";

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

// Public query to get a single event by ID (temporary until auth is fixed)
export const getEventPublic = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      return null;
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

// Query to list all events for the authenticated organizer
export const listEvents = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("organizerId"), args.userId))
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
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    
    // Ensure the event belongs to the authenticated user
    if (event.organizerId !== args.userId) {
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

// Temporary mutation for testing without authentication
export const createEventTemp = mutation({
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
  },
  handler: async (ctx, args) => {
    const { timeslots, ...eventData } = args;
    
    // For testing: use a dummy user ID
    const dummyUserId = "k572n0z8kk3n8y8jnq4n5w26zf6z9hr6" as any; // dummy Convex ID format
    
    // Create the event with dummy organizer
    const eventId = await ctx.db.insert("events", {
      ...eventData,
      organizerId: dummyUserId,
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
    
    return { 
      eventId, 
      timeslots: timeslotResults,
      message: 'Event created successfully with temp auth!' 
    };
  },
});

// Mutation to create a new event with timeslots
export const createEvent = mutation({
  args: {
    userId: v.id("users"),
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
    const { userId, timeslots, ...eventData } = args;
    
    // Create the event with authenticated user as organizer
    const now = new Date().toISOString();
    const eventId = await ctx.db.insert("events", {
      ...eventData,
      organizerId: userId,
      createdAt: now,
      status: "draft" as const,
      // Initialize new phase system
      phase: EventPhase.DRAFT,
      phaseMetadata: {
        enteredAt: now,
        enteredBy: userId,
      },
      stateVersion: 1,
      milestones: {
        createdAt: now,
      },
      capabilities: {
        canEdit: true,
        canPublish: false, // Will be updated after timeslots are created
        canAcceptSubmissions: false,
        canGenerateContent: false,
        canFinalize: false,
        showUrgentBanner: false,
        showDayOfFeatures: false,
      },
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
    
    // Update capabilities now that timeslots are created
    const event = await ctx.db.get(eventId);
    if (event && timeslots.length > 0) {
      const capabilities = computeEventCapabilities(event, timeslots as any, []);
      await ctx.db.patch(eventId, { capabilities });
    }
    
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
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify the event belongs to the authenticated user
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    if (event.organizerId !== args.userId) {
      throw new Error("Access denied");
    }
    
    await ctx.db.patch(args.eventId, {
      status: args.status,
    });
  },
});

// Query to get event with computed capabilities
export const getEventWithCapabilities = query({
  args: {
    eventId: v.id("events"),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    
    // Check access if userId provided
    if (args.userId && event.organizerId !== args.userId) {
      throw new Error("Access denied");
    }
    
    // Get related data
    const timeslots = await ctx.db
      .query("timeslots")
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .collect();
      
    const submissions = await ctx.db
      .query("submissions")
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .collect();
    
    // Compute current phase and capabilities
    const phase = computeEventPhase(event, timeslots, submissions);
    const capabilities = computeEventCapabilities(event, timeslots, submissions);
    
    // Provide defaults for optional fields
    return {
      ...event,
      phase,
      capabilities,
      guestLimitPerDJ: event.guestLimitPerDJ ?? 2,
      payment: {
        ...event.payment,
        perDJ: event.payment.perDJ ?? event.payment.amount,
      },
      hashtags: event.hashtags ?? '',
      timeslots,
      submissionCount: submissions.length,
    };
  },
});

// Mutation to transition event phase
export const transitionEventPhase = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
    toPhase: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify ownership
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    if (event.organizerId !== args.userId) {
      throw new Error("Access denied");
    }
    
    // Get current phase
    const timeslots = await ctx.db
      .query("timeslots")
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .collect();
    const submissions = await ctx.db
      .query("submissions")
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .collect();
      
    const currentPhase = computeEventPhase(event, timeslots, submissions);
    const newPhase = args.toPhase as EventPhaseType;
    
    // Validate transition
    if (!isValidTransition(currentPhase, newPhase)) {
      throw new Error(`Invalid transition from ${currentPhase} to ${newPhase}`);
    }
    
    // Update event with new phase
    const now = new Date().toISOString();
    const updates: any = {
      phase: newPhase,
      phaseMetadata: {
        enteredAt: now,
        enteredBy: args.userId,
        reason: args.reason,
      },
      stateVersion: (event.stateVersion || 0) + 1,
    };
    
    // Update milestones based on transition
    const milestones = event.milestones || {
      createdAt: event.createdAt,
    };
    
    switch (newPhase) {
      case EventPhase.PLANNING:
        updates.status = "active"; // Update legacy status
        milestones.publishedAt = now;
        break;
      case EventPhase.FINALIZED:
        milestones.finalizedAt = now;
        break;
      case EventPhase.DAY_OF:
        milestones.dayOfStartedAt = now;
        break;
      case EventPhase.COMPLETED:
        updates.status = "completed"; // Update legacy status
        milestones.completedAt = now;
        break;
      case EventPhase.CANCELLED:
        milestones.cancelledAt = now;
        break;
    }
    
    updates.milestones = milestones;
    
    // Compute and update capabilities
    const capabilities = computeEventCapabilities(
      { ...event, phase: newPhase },
      timeslots,
      submissions
    );
    updates.capabilities = capabilities;
    
    await ctx.db.patch(args.eventId, updates);
    
    return {
      success: true,
      fromPhase: currentPhase,
      toPhase: newPhase,
    };
  },
});

// Mutation to update event phase when creating
export const initializeEventPhase = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event || event.phase) return; // Already initialized
    
    const timeslots = await ctx.db
      .query("timeslots")
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .collect();
    const submissions = await ctx.db
      .query("submissions")
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .collect();
    
    // Initialize with phase system
    const phase = computeEventPhase(event, timeslots, submissions);
    const capabilities = computeEventCapabilities(event, timeslots, submissions);
    
    await ctx.db.patch(args.eventId, {
      phase,
      capabilities,
      stateVersion: 1,
      milestones: {
        createdAt: event.createdAt,
      },
    });
  },
});