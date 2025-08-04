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
    
    // Get timeslots for each event and ensure data integrity
    const eventsWithTimeslots = await Promise.all(
      events.map(async (event) => {
        const timeslots = await ctx.db
          .query("timeslots")
          .filter((q) => q.eq(q.field("eventId"), event._id))
          .collect();
        
        // Data integrity check - events should always have timeslots
        if (timeslots.length === 0) {
          console.error(`Event ${event._id} has no timeslots - this should not happen`);
        }
        
        return {
          ...event,
          guestLimitPerDJ: event.guestLimitPerDJ ?? 2,
          payment: {
            ...event.payment,
            perDJ: event.payment.perDJ ?? event.payment.amount,
          },
          hashtags: event.hashtags ?? '',
          timeslots, // Always an array (empty if no timeslots found)
        };
      })
    );
    
    return eventsWithTimeslots;
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
    
    // Validate that at least one timeslot is provided
    if (!timeslots || timeslots.length === 0) {
      throw new Error("At least one timeslot is required to create an event");
    }
    
    // Validate timeslot data before creating anything
    for (let i = 0; i < timeslots.length; i++) {
      const slot = timeslots[i];
      if (!slot.startTime || !slot.endTime) {
        throw new Error(`Timeslot ${i + 1} must have both start and end times`);
      }
      if (!slot.djInstagram) {
        throw new Error(`Timeslot ${i + 1} must have an Instagram handle`);
      }
    }
    
    const now = new Date().toISOString();
    let eventId: any;
    let timeslotResults: Array<{ timeslotId: any; submissionToken: string }> = [];
    
    try {
      // Create the event with authenticated user as organizer
      eventId = await ctx.db.insert("events", {
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
      
      // Create timeslots one by one with error handling
      for (let i = 0; i < timeslots.length; i++) {
        const slot = timeslots[i];
        try {
          const submissionToken = generateSubmissionToken();
          const timeslotId = await ctx.db.insert("timeslots", {
            eventId,
            startTime: slot.startTime,
            endTime: slot.endTime,
            djName: slot.djName,
            djInstagram: slot.djInstagram,
            submissionToken,
          });
          timeslotResults.push({ timeslotId, submissionToken });
        } catch (timeslotError) {
          // If any timeslot creation fails, delete the event and all created timeslots
          console.error(`Failed to create timeslot ${i + 1}:`, timeslotError);
          
          // Clean up: delete all created timeslots
          for (const result of timeslotResults) {
            try {
              await ctx.db.delete(result.timeslotId);
            } catch (cleanupError) {
              console.error('Failed to cleanup timeslot:', cleanupError);
            }
          }
          
          // Delete the event
          try {
            await ctx.db.delete(eventId);
          } catch (cleanupError) {
            console.error('Failed to cleanup event:', cleanupError);
          }
          
          throw new Error(`Failed to create timeslot ${i + 1}: ${timeslotError instanceof Error ? timeslotError.message : 'Unknown error'}`);
        }
      }
      
      // Verify all timeslots were created successfully
      if (timeslotResults.length !== timeslots.length) {
        throw new Error(`Expected ${timeslots.length} timeslots but only created ${timeslotResults.length}`);
      }
      
      // Update capabilities now that all timeslots are created successfully
      const updatedEvent = await ctx.db.get(eventId);
      if (updatedEvent) {
        // Get the actual created timeslots from the database
        const createdTimeslots = await ctx.db
          .query("timeslots")
          .filter((q) => q.eq(q.field("eventId"), eventId))
          .collect();
        const capabilities = computeEventCapabilities(updatedEvent, createdTimeslots, []);
        await ctx.db.patch(eventId, { capabilities });
      }
      
      return { 
        eventId, 
        timeslots: timeslotResults 
      };
      
    } catch (error) {
      // If we get here and eventId exists, ensure cleanup
      if (eventId) {
        // Clean up any created timeslots
        for (const result of timeslotResults) {
          try {
            await ctx.db.delete(result.timeslotId);
          } catch (cleanupError) {
            console.error('Failed to cleanup timeslot in final catch:', cleanupError);
          }
        }
        
        // Delete the event
        try {
          await ctx.db.delete(eventId);
        } catch (cleanupError) {
          console.error('Failed to cleanup event in final catch:', cleanupError);
        }
      }
      
      // Re-throw the original error
      throw error;
    }
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

// Mutation to update an existing event
export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
    name: v.optional(v.string()),
    date: v.optional(v.string()),
    venue: v.optional(v.object({
      name: v.string(),
      address: v.string(),
    })),
    description: v.optional(v.string()),
    hashtags: v.optional(v.string()),
    deadlines: v.optional(v.object({
      guestList: v.string(),
      promoMaterials: v.string(),
    })),
    payment: v.optional(v.object({
      amount: v.number(),
      perDJ: v.number(),
      currency: v.string(),
      dueDate: v.string(),
    })),
    guestLimitPerDJ: v.optional(v.number()),
    timeslots: v.optional(v.array(v.object({
      id: v.optional(v.id("timeslots")),
      startTime: v.string(),
      endTime: v.string(),
      djName: v.string(),
      djInstagram: v.string(),
    }))),
  },
  handler: async (ctx, args) => {
    const { userId, eventId, timeslots, ...updateData } = args;
    
    // Verify the event belongs to the authenticated user
    const event = await ctx.db.get(eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    if (event.organizerId !== userId) {
      throw new Error("Access denied");
    }
    
    // Check if event can be edited (only draft and planning phases)
    const currentTimeslots = await ctx.db
      .query("timeslots")
      .filter((q) => q.eq(q.field("eventId"), eventId))
      .collect();
    const submissions = await ctx.db
      .query("submissions")
      .filter((q) => q.eq(q.field("eventId"), eventId))
      .collect();
    
    const capabilities = computeEventCapabilities(event, currentTimeslots, submissions);
    if (!capabilities.canEdit) {
      throw new Error("Event cannot be edited in its current state");
    }
    
    // Update event data (only include defined fields)
    const eventUpdates: any = {};
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] !== undefined) {
        eventUpdates[key] = updateData[key as keyof typeof updateData];
      }
    });
    
    if (Object.keys(eventUpdates).length > 0) {
      await ctx.db.patch(eventId, eventUpdates);
    }
    
    // Handle timeslots updates if provided
    if (timeslots) {
      // Get existing timeslots to compare
      const existingTimeslots = await ctx.db
        .query("timeslots")
        .filter((q) => q.eq(q.field("eventId"), eventId))
        .collect();
      
      const existingIds = new Set(existingTimeslots.map(t => t._id));
      const providedIds = new Set(timeslots.map(t => t.id).filter(Boolean));
      
      // Delete timeslots that are no longer in the list
      for (const existing of existingTimeslots) {
        if (!providedIds.has(existing._id)) {
          // Check if timeslot has submissions before deleting
          const hasSubmissions = submissions.some(s => s.timeslotId === existing._id);
          if (hasSubmissions) {
            throw new Error(`Cannot delete timeslot with existing submissions: ${existing.djName}`);
          }
          await ctx.db.delete(existing._id);
        }
      }
      
      // Update or create timeslots
      for (const slot of timeslots) {
        if (slot.id && existingIds.has(slot.id)) {
          // Update existing timeslot
          await ctx.db.patch(slot.id, {
            startTime: slot.startTime,
            endTime: slot.endTime,
            djName: slot.djName,
            djInstagram: slot.djInstagram,
          });
        } else {
          // Create new timeslot
          const submissionToken = generateSubmissionToken();
          await ctx.db.insert("timeslots", {
            eventId,
            startTime: slot.startTime,
            endTime: slot.endTime,
            djName: slot.djName,
            djInstagram: slot.djInstagram,
            submissionToken,
          });
        }
      }
    }
    
    return { success: true };
  },
});

// Mutation to delete an event
export const deleteEvent = mutation({
  args: {
    eventId: v.id("events"),
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
    
    // Check if event has submissions - cannot delete if it does
    const submissions = await ctx.db
      .query("submissions")
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .collect();
    
    if (submissions.length > 0) {
      throw new Error("Cannot delete event with existing submissions. Consider cancelling instead.");
    }
    
    // Delete all related timeslots first
    const timeslots = await ctx.db
      .query("timeslots")
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .collect();
    
    for (const timeslot of timeslots) {
      await ctx.db.delete(timeslot._id);
    }
    
    // Delete the event
    await ctx.db.delete(args.eventId);
    
    return { success: true };
  },
});

// Mutation to cancel an event (soft delete - keeps data but marks as cancelled)
export const cancelEvent = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
    reason: v.optional(v.string()),
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
    
    // Cannot cancel already completed or cancelled events
    if (event.phase === EventPhase.COMPLETED || event.phase === EventPhase.CANCELLED) {
      throw new Error(`Cannot cancel event in ${event.phase} state`);
    }
    
    // Transition to cancelled phase
    const now = new Date().toISOString();
    const milestones = event.milestones || { createdAt: event.createdAt };
    milestones.cancelledAt = now;
    
    await ctx.db.patch(args.eventId, {
      phase: EventPhase.CANCELLED,
      phaseMetadata: {
        enteredAt: now,
        enteredBy: args.userId,
        reason: args.reason,
      },
      stateVersion: (event.stateVersion || 0) + 1,
      milestones,
      capabilities: {
        canEdit: false,
        canPublish: false,
        canAcceptSubmissions: false,
        canGenerateContent: false,
        canFinalize: false,
        showUrgentBanner: false,
        showDayOfFeatures: false,
      },
    });
    
    return { success: true };
  },
});