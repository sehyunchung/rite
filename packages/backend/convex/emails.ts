import { components } from './_generated/api';
import { Resend } from '@convex-dev/resend';
import { internalMutation, internalAction } from './_generated/server';
import { v } from 'convex/values';
import { Id } from './_generated/dataModel';

// Initialize Resend with test mode for development
// Set testMode: false in production
export const resend: Resend = new Resend(components.resend, {
	testMode: process.env.NODE_ENV !== 'production',
});

// Type for email context
interface EmailContext {
	djName: string;
	eventName: string;
	eventDate: string;
	venue: string;
	timeslot: string;
	organizerName: string;
	organizerEmail?: string;
}

// Send submission received email
export const sendSubmissionReceivedEmail = internalAction({
	args: {
		to: v.string(),
		context: v.object({
			djName: v.string(),
			eventName: v.string(),
			eventDate: v.string(),
			venue: v.string(),
			timeslot: v.string(),
			organizerName: v.string(),
			organizerEmail: v.optional(v.string()),
		}),
	},
	handler: async (ctx, args) => {
		const { to, context } = args;

		const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #E946FF;">✅ Information Received!</h2>
        
        <p>Hi ${context.djName},</p>
        
        <p>Thank you for submitting your information for <strong>${context.eventName}</strong>!</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Your Performance Details:</h3>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${context.eventDate}</p>
          <p style="margin: 5px 0;"><strong>Venue:</strong> ${context.venue}</p>
          <p style="margin: 5px 0;"><strong>Your Slot:</strong> ${context.timeslot}</p>
        </div>
        
        <p>We've successfully received your guest list and promotional information. <strong>${context.organizerName}</strong> will review your details and may contact you if any additional information is needed.</p>
        
        <p style="color: #666; font-size: 14px;">
          Questions? Reply to this email to contact the organizer directly.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          This email was sent from RITE Event Management Platform<br>
          <a href="https://rite.party" style="color: #E946FF;">rite.party</a>
        </p>
      </div>
    `;

		const plainText = `
✅ Information Received!

Hi ${context.djName},

Thank you for submitting your information for ${context.eventName}!

Your Performance Details:
- Date: ${context.eventDate}
- Venue: ${context.venue}
- Your Slot: ${context.timeslot}

We've successfully received your guest list and promotional information. ${context.organizerName} will review your details and may contact you if any additional information is needed.

Questions? Reply to this email to contact the organizer directly.

This email was sent from RITE Event Management Platform
https://rite.party
    `;

		const emailId = await resend.sendEmail(ctx, {
			from: 'RITE Events <notifications@rite.party>',
			to,
			subject: `✅ Information received for ${context.eventName}`,
			html,
			text: plainText,
			replyTo: context.organizerEmail ? [context.organizerEmail] : undefined,
		});

		return { success: true, emailId };
	},
});

// Send information approved email
export const sendInformationApprovedEmail = internalAction({
	args: {
		to: v.string(),
		context: v.object({
			djName: v.string(),
			eventName: v.string(),
			eventDate: v.string(),
			venue: v.string(),
			timeslot: v.string(),
			organizerName: v.string(),
			organizerEmail: v.optional(v.string()),
		}),
	},
	handler: async (ctx, args) => {
		const { to, context } = args;

		const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #E946FF;">✅ Information Approved!</h2>
        
        <p>Hi ${context.djName},</p>
        
        <p><strong>Great news!</strong> Your submitted information has been approved for <strong>${context.eventName}</strong>!</p>
        
        <div style="background: linear-gradient(135deg, #E946FF 0%, #9333EA 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">Your Performance Details:</h3>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${context.eventDate}</p>
          <p style="margin: 5px 0;"><strong>Venue:</strong> ${context.venue}</p>
          <p style="margin: 5px 0;"><strong>Your Time Slot:</strong> ${context.timeslot}</p>
        </div>
        
        <h3 style="color: #333;">Next Steps:</h3>
        <ul style="color: #555;">
          <li>Your guest list has been confirmed</li>
          <li>Prepare your set according to your time slot</li>
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
    `;

		const plainText = `
✅ Information Approved!

Hi ${context.djName},

Great news! Your submitted information has been approved for ${context.eventName}!

Your Performance Details:
- Date: ${context.eventDate}
- Venue: ${context.venue}
- Your Time Slot: ${context.timeslot}

Next Steps:
- Your guest list has been confirmed
- Prepare your set according to your time slot
- Arrive 30 minutes before your slot for sound check
- Promote the event on your social media!

The organizer (${context.organizerName}) will be in touch with additional details soon.

We can't wait to see you rock the dance floor! 🎧

This email was sent from RITE Event Management Platform
https://rite.party
    `;

		const emailId = await resend.sendEmail(ctx, {
			from: 'RITE Events <notifications@rite.party>',
			to,
			subject: `✅ Your information has been approved for ${context.eventName}`,
			html,
			text: plainText,
			replyTo: context.organizerEmail ? [context.organizerEmail] : undefined,
		});

		return { success: true, emailId };
	},
});

// Send action required email (for revisions)
export const sendActionRequiredEmail = internalAction({
	args: {
		to: v.string(),
		context: v.object({
			djName: v.string(),
			eventName: v.string(),
			eventDate: v.string(),
			venue: v.string(),
			timeslot: v.string(),
			organizerName: v.string(),
			organizerEmail: v.optional(v.string()),
			feedback: v.optional(v.string()),
		}),
	},
	handler: async (ctx, args) => {
		const { to, context } = args;

		const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #E946FF;">⚠️ Information Review</h2>
        
        <p>Hi ${context.djName},</p>
        
        <p>Thank you for submitting your information for <strong>${context.eventName}</strong>.</p>
        
        <p>After reviewing your submission, we need you to update or revise some information. This could be related to your guest list, promotional materials, or contact details.</p>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="margin: 0; color: #555;">
            <strong>Your performance slot is still confirmed.</strong> We just need some adjustments to the information you submitted.
          </p>
        </div>
        
        ${
			context.feedback
				? `
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #333;">Organizer Feedback:</h4>
          <p style="margin: 0; color: #555;">${context.feedback}</p>
        </div>
        `
				: ''
		}
        
        <p>Please:</p>
        <ul style="color: #555;">
          <li>Review the organizer's feedback carefully</li>
          <li>Update your submission with the requested changes</li>
          <li>Reply to this email if you have any questions</li>
        </ul>
        
        <p>Please update your information as soon as possible to ensure everything is ready for the event.</p>
        
        <p>Best regards,<br>${context.organizerName}</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          This email was sent from RITE Event Management Platform<br>
          <a href="https://rite.party" style="color: #E946FF;">rite.party</a>
        </p>
      </div>
    `;

		const plainText = `
⚠️ Action Required

Hi ${context.djName},

Thank you for submitting your information for ${context.eventName}.

After reviewing your submission, we need you to update or revise some information. This could be related to your guest list, promotional materials, or contact details.

Your performance slot is still confirmed. We just need some adjustments to the information you submitted.

${
	context.feedback
		? `Organizer Feedback:
${context.feedback}

`
		: ''
}Please:
- Review the organizer's feedback carefully
- Update your submission with the requested changes
- Reply to this email if you have any questions

Please update your information as soon as possible to ensure everything is ready for the event.

Best regards,
${context.organizerName}

This email was sent from RITE Event Management Platform
https://rite.party
    `;

		const emailId = await resend.sendEmail(ctx, {
			from: 'RITE Events <notifications@rite.party>',
			to,
			subject: `⚠️ Action required for ${context.eventName}`,
			html,
			text: plainText,
			replyTo: context.organizerEmail ? [context.organizerEmail] : undefined,
		});

		return { success: true, emailId };
	},
});

// Send event reminder email
export const sendEventReminderEmail = internalAction({
	args: {
		to: v.string(),
		context: v.object({
			djName: v.string(),
			eventName: v.string(),
			eventDate: v.string(),
			venue: v.string(),
			timeslot: v.string(),
			daysUntilEvent: v.number(),
			organizerName: v.string(),
			organizerEmail: v.optional(v.string()),
		}),
	},
	handler: async (ctx, args) => {
		const { to, context } = args;

		const subject =
			context.daysUntilEvent === 1
				? `🎵 Tomorrow: ${context.eventName}!`
				: `🎵 Reminder: ${context.eventName} in ${context.daysUntilEvent} days`;

		const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #E946FF;">🎵 Event Reminder</h2>
        
        <p>Hi ${context.djName},</p>
        
        <p>${
			context.daysUntilEvent === 1
				? `<strong>Your performance is tomorrow!</strong>`
				: `This is a reminder that you're performing at <strong>${context.eventName}</strong> in ${context.daysUntilEvent} days!`
		}</p>
        
        <div style="background: linear-gradient(135deg, #E946FF 0%, #9333EA 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">Performance Details:</h3>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${context.eventDate}</p>
          <p style="margin: 5px 0;"><strong>Venue:</strong> ${context.venue}</p>
          <p style="margin: 5px 0;"><strong>Your Time Slot:</strong> ${context.timeslot}</p>
        </div>
        
        <h3 style="color: #333;">Don't Forget:</h3>
        <ul style="color: #555;">
          <li>Arrive 30 minutes early for sound check</li>
          <li>Bring your DJ equipment and backup music</li>
          <li>Review the guest list you submitted</li>
          <li>Get ready to rock the dance floor! 🎧</li>
        </ul>
        
        <p>If you have any questions, please contact ${context.organizerName} immediately.</p>
        
        <p><strong>See you soon!</strong></p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          This email was sent from RITE Event Management Platform<br>
          <a href="https://rite.party" style="color: #E946FF;">rite.party</a>
        </p>
      </div>
    `;

		const plainText = `
🎵 Event Reminder

Hi ${context.djName},

${
	context.daysUntilEvent === 1
		? `Your performance is tomorrow!`
		: `This is a reminder that you're performing at ${context.eventName} in ${context.daysUntilEvent} days!`
}

Performance Details:
- Date: ${context.eventDate}
- Venue: ${context.venue}
- Your Time Slot: ${context.timeslot}

Don't Forget:
- Arrive 30 minutes early for sound check
- Bring your DJ equipment and backup music
- Review the guest list you submitted
- Get ready to rock the dance floor! 🎧

If you have any questions, please contact ${context.organizerName} immediately.

See you soon!

This email was sent from RITE Event Management Platform
https://rite.party
    `;

		const emailId = await resend.sendEmail(ctx, {
			from: 'RITE Events <notifications@rite.party>',
			to,
			subject,
			html,
			text: plainText,
			replyTo: context.organizerEmail ? [context.organizerEmail] : undefined,
		});

		return { success: true, emailId };
	},
});
