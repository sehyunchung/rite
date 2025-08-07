import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Email notification system for DJ status updates

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface NotificationContext {
  djName: string;
  eventName: string;
  eventDate: string;
  venue: string;
  organizerName: string;
  organizerEmail: string;
  timeslot: string;
  submissionLink?: string;
  eventDetailsLink?: string;
}

// Email templates for different DJ status updates
export const emailTemplates = {
  submissionReceived: (context: NotificationContext): EmailTemplate => ({
    subject: `✅ Submission received for ${context.eventName}`,
    htmlContent: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #E946FF;">🎵 Submission Received!</h2>
        
        <p>Hi ${context.djName},</p>
        
        <p>We've received your submission for <strong>${context.eventName}</strong>!</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Event Details:</h3>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${context.eventDate}</p>
          <p style="margin: 5px 0;"><strong>Venue:</strong> ${context.venue}</p>
          <p style="margin: 5px 0;"><strong>Your Slot:</strong> ${context.timeslot}</p>
        </div>
        
        <p>Your submission is now being reviewed by ${context.organizerName}. We'll notify you as soon as there's an update!</p>
        
        <p style="color: #666; font-size: 14px;">
          Questions? Reply to this email to contact the organizer directly.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          This email was sent from RITE Event Management Platform<br>
          <a href="https://rite.party" style="color: #E946FF;">rite.party</a>
        </p>
      </div>
    `,
    textContent: `
🎵 Submission Received!

Hi ${context.djName},

We've received your submission for ${context.eventName}!

Event Details:
- Date: ${context.eventDate}
- Venue: ${context.venue}
- Your Slot: ${context.timeslot}

Your submission is now being reviewed by ${context.organizerName}. We'll notify you as soon as there's an update!

Questions? Reply to this email to contact the organizer directly.

This email was sent from RITE Event Management Platform
https://rite.party
    `
  }),

  submissionAccepted: (context: NotificationContext): EmailTemplate => ({
    subject: `🎉 Congratulations! You're selected for ${context.eventName}`,
    htmlContent: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #E946FF;">🎉 Congratulations!</h2>
        
        <p>Hi ${context.djName},</p>
        
        <p><strong>Great news!</strong> You've been selected to perform at <strong>${context.eventName}</strong>!</p>
        
        <div style="background: linear-gradient(135deg, #E946FF 0%, #9333EA 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">Your Performance Details:</h3>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${context.eventDate}</p>
          <p style="margin: 5px 0;"><strong>Venue:</strong> ${context.venue}</p>
          <p style="margin: 5px 0;"><strong>Your Time Slot:</strong> ${context.timeslot}</p>
        </div>
        
        <h3 style="color: #333;">Next Steps:</h3>
        <ul style="color: #555;">
          <li>Confirm your attendance by replying to this email</li>
          <li>Prepare your set according to the event requirements</li>
          <li>Arrive 30 minutes before your slot for sound check</li>
          <li>Promote the event on your social media!</li>
        </ul>
        
        <p>The organizer (${context.organizerName}) will be in touch with additional details soon.</p>
        
        <p><strong>We can't wait to see you rock the dance floor! 🎧</strong></p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          This email was sent from RITE Event Management Platform<br>
          <a href="https://rite.party" style="color: #E946FF;">rite.party</a>
        </p>
      </div>
    `,
    textContent: `
🎉 Congratulations!

Hi ${context.djName},

Great news! You've been selected to perform at ${context.eventName}!

Your Performance Details:
- Date: ${context.eventDate}
- Venue: ${context.venue}
- Your Time Slot: ${context.timeslot}

Next Steps:
- Confirm your attendance by replying to this email
- Prepare your set according to the event requirements
- Arrive 30 minutes before your slot for sound check
- Promote the event on your social media!

The organizer (${context.organizerName}) will be in touch with additional details soon.

We can't wait to see you rock the dance floor! 🎧

This email was sent from RITE Event Management Platform
https://rite.party
    `
  }),

  submissionRejected: (context: NotificationContext): EmailTemplate => ({
    subject: `Update on your submission for ${context.eventName}`,
    htmlContent: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #E946FF;">Thank you for your submission</h2>
        
        <p>Hi ${context.djName},</p>
        
        <p>Thank you for your interest in performing at <strong>${context.eventName}</strong>.</p>
        
        <p>After careful consideration, we've decided to go with a different lineup for this event. This decision was not easy, as we received many talented submissions.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #555;">
            <strong>This doesn't reflect on your talent or potential.</strong> Event lineups often depend on factors like timing, musical style fit, and overall event flow.
          </p>
        </div>
        
        <p>We encourage you to:</p>
        <ul style="color: #555;">
          <li>Keep creating and performing - your music matters</li>
          <li>Follow RITE for future event opportunities</li>
          <li>Connect with other organizers in your scene</li>
        </ul>
        
        <p>Thank you again for your submission, and we hope to see you at future events!</p>
        
        <p>Best regards,<br>${context.organizerName}</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          This email was sent from RITE Event Management Platform<br>
          <a href="https://rite.party" style="color: #E946FF;">rite.party</a>
        </p>
      </div>
    `,
    textContent: `
Thank you for your submission

Hi ${context.djName},

Thank you for your interest in performing at ${context.eventName}.

After careful consideration, we've decided to go with a different lineup for this event. This decision was not easy, as we received many talented submissions.

This doesn't reflect on your talent or potential. Event lineups often depend on factors like timing, musical style fit, and overall event flow.

We encourage you to:
- Keep creating and performing - your music matters
- Follow RITE for future event opportunities
- Connect with other organizers in your scene

Thank you again for your submission, and we hope to see you at future events!

Best regards,
${context.organizerName}

This email was sent from RITE Event Management Platform
https://rite.party
    `
  }),

  eventReminder: (context: NotificationContext): EmailTemplate => ({
    subject: `🎵 Reminder: You're performing tonight at ${context.eventName}!`,
    htmlContent: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #E946FF;">🎵 Big Night Tonight!</h2>
        
        <p>Hi ${context.djName},</p>
        
        <p><strong>This is your friendly reminder that you're performing tonight!</strong></p>
        
        <div style="background: linear-gradient(135deg, #E946FF 0%, #9333EA 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">Tonight's Performance:</h3>
          <p style="margin: 5px 0;"><strong>Event:</strong> ${context.eventName}</p>
          <p style="margin: 5px 0;"><strong>Venue:</strong> ${context.venue}</p>
          <p style="margin: 5px 0;"><strong>Your Time:</strong> ${context.timeslot}</p>
        </div>
        
        <h3 style="color: #333;">Pre-Show Checklist:</h3>
        <ul style="color: #555;">
          <li>✅ Arrive 30 minutes early for sound check</li>
          <li>✅ Bring your headphones and any special equipment</li>
          <li>✅ Have your music ready (USB/laptop backup)</li>
          <li>✅ Post a story to build excitement!</li>
        </ul>
        
        <p><strong>Break a leg tonight! The crowd is going to love your set! 🔥</strong></p>
        
        <p>Questions? Contact ${context.organizerName} at ${context.organizerEmail}</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          This email was sent from RITE Event Management Platform<br>
          <a href="https://rite.party" style="color: #E946FF;">rite.party</a>
        </p>
      </div>
    `,
    textContent: `
🎵 Big Night Tonight!

Hi ${context.djName},

This is your friendly reminder that you're performing tonight!

Tonight's Performance:
- Event: ${context.eventName}
- Venue: ${context.venue}
- Your Time: ${context.timeslot}

Pre-Show Checklist:
✅ Arrive 30 minutes early for sound check
✅ Bring your headphones and any special equipment
✅ Have your music ready (USB/laptop backup)
✅ Post a story to build excitement!

Break a leg tonight! The crowd is going to love your set! 🔥

Questions? Contact ${context.organizerName} at ${context.organizerEmail}

This email was sent from RITE Event Management Platform
https://rite.party
    `
  })
};

// Store notification in database for tracking
export const createNotification = mutation({
  args: {
    submissionId: v.id("submissions"),
    type: v.union(
      v.literal("submission_received"), 
      v.literal("submission_accepted"), 
      v.literal("submission_rejected"),
      v.literal("event_reminder")
    ),
    recipientEmail: v.string(),
    recipientName: v.string(),
    status: v.union(v.literal("pending"), v.literal("sent"), v.literal("failed")),
    emailContent: v.object({
      subject: v.string(),
      htmlContent: v.string(),
      textContent: v.string(),
    }),
    scheduledFor: v.optional(v.string()),
    sentAt: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      ...args,
      createdAt: new Date().toISOString(),
    });
  },
});

// Get notifications for a submission
export const getNotificationsForSubmission = query({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("submissionId"), args.submissionId))
      .order("desc")
      .collect();
  },
});

// Send email notification action (calls external email service)
export const sendEmailNotification = action({
  args: {
    to: v.string(),
    subject: v.string(),
    htmlContent: v.string(),
    textContent: v.string(),
    notificationId: v.optional(v.id("notifications")),
  },
  handler: async (ctx, args) => {
    try {
      // In a real implementation, you would integrate with an email service
      // like SendGrid, AWS SES, Resend, or similar
      
      // For now, we'll simulate the email sending
      console.log("Sending email notification:", {
        to: args.to,
        subject: args.subject,
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update notification status if provided
      if (args.notificationId) {
        await ctx.runMutation(api.notifications.updateNotificationStatus, {
          notificationId: args.notificationId,
          status: "sent",
          sentAt: new Date().toISOString(),
        });
      }
      
      return { success: true, messageId: `sim_${Date.now()}` };
      
    } catch (error) {
      console.error("Failed to send email:", error);
      
      if (args.notificationId) {
        await ctx.runMutation(api.notifications.updateNotificationStatus, {
          notificationId: args.notificationId,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
      
      throw new Error(`Failed to send email: ${error}`);
    }
  },
});

// Update notification status
export const updateNotificationStatus = mutation({
  args: {
    notificationId: v.id("notifications"),
    status: v.union(v.literal("pending"), v.literal("sent"), v.literal("failed")),
    sentAt: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { notificationId, ...updates } = args;
    await ctx.db.patch(notificationId, updates);
  },
});

// Trigger DJ status notification
export const triggerDJStatusNotification = action({
  args: {
    submissionId: v.id("submissions"),
    status: v.union(
      v.literal("received"), 
      v.literal("accepted"), 
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    // Get submission details
    const submission = await ctx.runQuery(api.submissions.getSubmission, {
      id: args.submissionId,
    });
    
    if (!submission) {
      throw new Error("Submission not found");
    }
    
    // Get event and organizer details
    const event = await ctx.runQuery(api.events.getEvent, {
      id: submission.eventId,
    });
    
    if (!event) {
      throw new Error("Event not found");
    }
    
    const organizer = await ctx.runQuery(api.users.getUser, {
      id: event.organizerId,
    });
    
    // Get timeslot details
    const timeslot = await ctx.runQuery(api.timeslots.getTimeslot, {
      id: submission.timeslotId,
    });
    
    if (!timeslot || !organizer) {
      throw new Error("Missing required data for notification");
    }
    
    // Build context for email template
    const context: NotificationContext = {
      djName: timeslot.djName,
      eventName: event.name,
      eventDate: event.date,
      venue: `${event.venue.name}, ${event.venue.address}`,
      organizerName: organizer.name || organizer.email,
      organizerEmail: organizer.email,
      timeslot: `${timeslot.startTime} - ${timeslot.endTime}`,
    };
    
    // Select appropriate email template
    let template: EmailTemplate;
    let notificationType: "submission_received" | "submission_accepted" | "submission_rejected";
    
    switch (args.status) {
      case "received":
        template = emailTemplates.submissionReceived(context);
        notificationType = "submission_received";
        break;
      case "accepted":
        template = emailTemplates.submissionAccepted(context);
        notificationType = "submission_accepted";
        break;
      case "rejected":
        template = emailTemplates.submissionRejected(context);
        notificationType = "submission_rejected";
        break;
      default:
        throw new Error(`Unsupported notification status: ${args.status}`);
    }
    
    // Get DJ email from submission
    const djEmail = submission.djContact?.email;
    if (!djEmail) {
      throw new Error("DJ email not found in submission. Unable to send notification.");
    }

    // Create notification record
    const notificationId = await ctx.runMutation(api.notifications.createNotification, {
      submissionId: args.submissionId,
      type: notificationType,
      recipientEmail: djEmail,
      recipientName: timeslot.djName,
      status: "pending",
      emailContent: template,
    });
    
    // Send the email
    await ctx.runAction(api.notifications.sendEmailNotification, {
      to: djEmail,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      notificationId,
    });
    
    return { success: true, notificationId };
  },
});

// Schedule event reminder notifications
export const scheduleEventReminders = action({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    // Get event and all accepted submissions
    const event = await ctx.runQuery(api.events.getEvent, {
      id: args.eventId,
    });
    
    if (!event) {
      throw new Error("Event not found");
    }
    
    const organizer = await ctx.runQuery(api.users.getUser, {
      id: event.organizerId,
    });
    
    const submissions = await ctx.runQuery(api.submissions.getSubmissionsForEvent, {
      eventId: args.eventId,
    });
    
    // Filter for accepted submissions
    const acceptedSubmissions = submissions.filter(s => s.status === "accepted");
    
    const eventDate = new Date(event.date);
    const reminderTime = new Date(eventDate);
    reminderTime.setHours(12, 0, 0, 0); // Send reminder at noon on event day
    
    const results = [];
    
    for (const submission of acceptedSubmissions) {
      const timeslot = await ctx.runQuery(api.timeslots.getTimeslot, {
        id: submission.timeslotId,
      });
      
      if (!timeslot || !organizer) continue;
      
      const context: NotificationContext = {
        djName: timeslot.djName,
        eventName: event.name,
        eventDate: event.date,
        venue: `${event.venue.name}, ${event.venue.address}`,
        organizerName: organizer.name || organizer.email,
        organizerEmail: organizer.email,
        timeslot: `${timeslot.startTime} - ${timeslot.endTime}`,
      };
      
      const template = emailTemplates.eventReminder(context);
      
      // Get DJ email from submission
      const djEmail = submission.djContact?.email;
      if (!djEmail) {
        console.warn(`Skipping reminder for submission ${submission._id}: DJ email not found`);
        continue;
      }

      const notificationId = await ctx.runMutation(api.notifications.createNotification, {
        submissionId: submission._id,
        type: "event_reminder",
        recipientEmail: djEmail,
        recipientName: timeslot.djName,
        status: "pending",
        emailContent: template,
        scheduledFor: reminderTime.toISOString(),
      });
      
      results.push({ submissionId: submission._id, notificationId, scheduledFor: reminderTime.toISOString() });
    }
    
    return { success: true, scheduledNotifications: results };
  },
});