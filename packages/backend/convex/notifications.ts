import { v } from "convex/values";
import { mutation, query, action, internalAction } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { api, internal } from "./_generated/api";

// Email notification system for DJ status updates

// Store notification records
export const createNotification = mutation({
  args: {
    recipientId: v.id("users"),
    submissionId: v.id("submissions"),
    type: v.union(
      v.literal("submission_received"),
      v.literal("submission_accepted"),
      v.literal("submission_rejected"),
      v.literal("event_reminder")
    ),
    emailSent: v.boolean(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      ...args,
      createdAt: new Date().toISOString(),
      read: false,
    });
    return notificationId;
  },
});

// Get notifications for a user
export const getUserNotifications = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // Verify the user is requesting their own notifications
    const user = await ctx.db.get(args.userId);
    if (!user || user.email !== identity.email) {
      throw new Error("Unauthorized");
    }
    
    const notifications = await ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("recipientId"), args.userId))
      .order("desc")
      .take(args.limit || 50);
    
    return notifications;
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }
    
    // Verify the user owns this notification
    const user = await ctx.db.get(notification.recipientId);
    if (!user || user.email !== identity.email) {
      throw new Error("Unauthorized");
    }
    
    await ctx.db.patch(args.notificationId, { read: true });
  },
});

// Trigger DJ status notification (using new Resend component)
export const triggerDJStatusNotification = action({
  args: {
    submissionId: v.id("submissions"),
    status: v.union(
      v.literal("received"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; emailId?: any; error?: string }> => {
    try {
      // Get submission details
      const submission = await ctx.runQuery(api.submissions.getSubmissionById, {
        submissionId: args.submissionId,
      });
      
      if (!submission) {
        throw new Error("Submission not found");
      }
      
      // Get event and organizer details
      const event = await ctx.runQuery(api.events.getEventById, {
        eventId: submission.eventId,
      });
      
      if (!event) {
        throw new Error("Event not found");
      }
      
      const organizer = await ctx.runQuery(api.auth.getUserById, {
        userId: event.organizerId as Id<"users">,
      });
      
      // Get timeslot details
      const timeslot = await ctx.runQuery(api.timeslots.getTimeslot, {
        id: submission.timeslotId,
      });
      
      if (!timeslot) {
        throw new Error("Timeslot not found");
      }
      
      // Format date and time
      const eventDate = new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      const timeslotString = `${timeslot.startTime} - ${timeslot.endTime}`;
      
      // Prepare email context
      const emailContext = {
        djName: timeslot.djName,
        eventName: event.name,
        eventDate,
        venue: event.venue.name,
        timeslot: timeslotString,
        organizerName: organizer?.name || "Event Organizer",
        organizerEmail: organizer?.email,
        feedback: args.feedback,
      };
      
      // Get DJ email (from submission contact info)
      const djEmail = submission.djContact?.email;
      if (!djEmail) {
        throw new Error("DJ email not found in submission");
      }
      
      // Send appropriate email using Resend component
      let result;
      switch (args.status) {
        case "received":
          result = await ctx.runAction(internal.emails.sendSubmissionReceivedEmail, {
            to: djEmail,
            context: emailContext,
          });
          break;
        case "accepted":
          result = await ctx.runAction(internal.emails.sendInformationApprovedEmail, {
            to: djEmail,
            context: emailContext,
          });
          break;
        case "rejected":
          result = await ctx.runAction(internal.emails.sendActionRequiredEmail, {
            to: djEmail,
            context: { ...emailContext, feedback: args.feedback },
          });
          break;
      }
      
      // Create notification record
      if (result?.success) {
        const notificationType = 
          args.status === "received" ? "submission_received" :
          args.status === "accepted" ? "submission_accepted" :
          "submission_rejected";
        
        // Find or create user for the DJ
        let djUserId: Id<"users"> | undefined;
        const djUser = await ctx.runQuery(api.auth.getUserByEmail, {
          email: djEmail,
        });
        
        if (djUser) {
          djUserId = djUser._id;
        } else {
          // Create a placeholder user for notification tracking
          djUserId = await ctx.runMutation(api.auth.createPlaceholderUser, {
            email: djEmail,
            name: timeslot.djName,
          });
        }
        
        if (djUserId) {
          await ctx.runMutation(api.notifications.createNotification, {
            recipientId: djUserId,
            submissionId: args.submissionId,
            type: notificationType,
            emailSent: true,
            metadata: { emailId: result.emailId },
          });
        }
      }
      
      return { 
        success: true, 
        emailId: result?.emailId 
      };
    } catch (error) {
      console.error("Error sending notification:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  },
});

// Schedule event reminders
export const scheduleEventReminders = action({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; scheduledReminders: Array<{ days: number; scheduledFor: string }> }> => {
    const event = await ctx.runQuery(api.events.getEventById, {
      eventId: args.eventId,
    });
    
    if (!event) {
      throw new Error("Event not found");
    }
    
    const eventDate = new Date(event.date);
    const now = new Date();
    
    // Schedule reminders at 7 days, 3 days, and 1 day before event
    const reminderDays = [7, 3, 1];
    const scheduledReminders = [];
    
    for (const days of reminderDays) {
      const reminderDate = new Date(eventDate);
      reminderDate.setDate(reminderDate.getDate() - days);
      
      // Only schedule if reminder date is in the future
      if (reminderDate > now) {
        const delayMs = reminderDate.getTime() - now.getTime();
        
        await ctx.scheduler.runAfter(delayMs, internal.notifications.sendEventReminder, {
          eventId: args.eventId,
          daysUntilEvent: days,
        });
        
        scheduledReminders.push({
          days,
          scheduledFor: reminderDate.toISOString(),
        });
      }
    }
    
    return {
      success: true,
      scheduledReminders,
    };
  },
});

// Internal function to send event reminders
export const sendEventReminder = internalAction({
  args: {
    eventId: v.id("events"),
    daysUntilEvent: v.number(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; emailsSent: Array<{ djName: string; email: string; emailId: any }> }> => {
    const event = await ctx.runQuery(api.events.getEventById, {
      eventId: args.eventId,
    });
    
    if (!event) {
      throw new Error("Event not found");
    }
    
    const organizer = await ctx.runQuery(api.auth.getUserById, {
      userId: event.organizerId as Id<"users">,
    });
    
    // Get all submissions for this event
    const submissions = await ctx.runQuery(api.submissions.getSubmissionsByEventId, {
      eventId: args.eventId,
    });
    
    const emailsSent = [];
    
    // Send reminder to each DJ
    for (const submission of submissions) {
      // Only send to accepted submissions or all if no status
      if (submission.status && submission.status !== "accepted") {
        continue;
      }
      
      const timeslot = await ctx.runQuery(api.timeslots.getTimeslot, {
        id: submission.timeslotId,
      });
      
      if (!timeslot) continue;
      
      const djEmail = submission.djContact?.email;
      if (!djEmail) continue;
      
      const eventDate = new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      const result = await ctx.runAction(internal.emails.sendEventReminderEmail, {
        to: djEmail,
        context: {
          djName: timeslot.djName,
          eventName: event.name,
          eventDate,
          venue: event.venue.name,
          timeslot: `${timeslot.startTime} - ${timeslot.endTime}`,
          daysUntilEvent: args.daysUntilEvent,
          organizerName: organizer?.name || "Event Organizer",
          organizerEmail: organizer?.email,
        },
      });
      
      if (result?.success) {
        emailsSent.push({
          djName: timeslot.djName,
          email: djEmail,
          emailId: result.emailId,
        });
      }
    }
    
    return {
      success: true,
      emailsSent,
    };
  },
});