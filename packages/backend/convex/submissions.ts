import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth } from "./auth";
import { computeEventCapabilities } from "./eventStatus";

// Generate upload URL for file storage
export const generateUploadUrl = mutation(async (ctx) => {
  // Generate a short-lived upload URL for file upload
  return await ctx.storage.generateUploadUrl();
});

// Create or update a submission
export const saveSubmission = mutation({
  args: {
    eventId: v.id("events"),
    timeslotId: v.id("timeslots"),
    submissionToken: v.string(),
    promoFiles: v.array(
      v.object({
        fileName: v.string(),
        fileType: v.string(),
        fileSize: v.number(),
        storageId: v.id("_storage"),
      })
    ),
    promoDescription: v.string(),
    guestList: v.array(
      v.object({
        name: v.string(),
        phone: v.optional(v.string()),
      })
    ),
    paymentInfo: v.object({
      accountHolder: v.string(),
      bankName: v.string(),
      accountNumber: v.string(),
      residentNumber: v.string(),
      preferDirectContact: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    // Verify the submission token matches the timeslot
    const timeslot = await ctx.db.get(args.timeslotId);
    if (!timeslot || timeslot.submissionToken !== args.submissionToken) {
      throw new Error("Invalid submission token");
    }

    // Check if submission already exists
    const existingSubmission = await ctx.db
      .query("submissions")
      .filter((q) => q.eq(q.field("timeslotId"), args.timeslotId))
      .first();

    const submissionData = {
      eventId: args.eventId,
      timeslotId: args.timeslotId,
      uniqueLink: args.submissionToken,
      promoMaterials: {
        files: args.promoFiles.map((file) => ({
          fileName: file.fileName,
          fileType: file.fileType,
          fileSize: file.fileSize,
          convexFileId: file.storageId,
          uploadedAt: new Date().toISOString(),
        })),
        description: args.promoDescription,
      },
      guestList: args.guestList,
      paymentInfo: {
        accountHolder: args.paymentInfo.accountHolder,
        bankName: args.paymentInfo.bankName,
        // In production, these should be encrypted
        accountNumber: args.paymentInfo.accountNumber,
        residentNumber: args.paymentInfo.residentNumber,
        preferDirectContact: args.paymentInfo.preferDirectContact,
      },
      submittedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    };

    let submissionId;
    if (existingSubmission) {
      // Update existing submission
      await ctx.db.patch(existingSubmission._id, submissionData);
      submissionId = existingSubmission._id;
    } else {
      // Create new submission
      submissionId = await ctx.db.insert("submissions", submissionData);
      
      // Update timeslot with submission reference
      await ctx.db.patch(args.timeslotId, {
        submissionId: submissionId,
      });
    }

    return { success: true, submissionId };
  },
});

// Get submission by timeslot ID (requires authentication)
export const getSubmissionByTimeslot = query({
  args: { 
    timeslotId: v.id("timeslots"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify the timeslot belongs to an event owned by the user
    const timeslot = await ctx.db.get(args.timeslotId);
    if (!timeslot) {
      throw new Error("Timeslot not found");
    }
    
    const event = await ctx.db.get(timeslot.eventId);
    if (!event || event.organizerId !== args.userId) {
      throw new Error("Access denied");
    }
    
    return await ctx.db
      .query("submissions")
      .filter((q) => q.eq(q.field("timeslotId"), args.timeslotId))
      .first();
  },
});

// Get submission status for an event (must be owned by authenticated user)
export const getEventSubmissionStatus = query({
  args: { eventId: v.id("events") },
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
    const timeslots = await ctx.db
      .query("timeslots")
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .collect();

    const submissions = await ctx.db
      .query("submissions")
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .collect();

    const submissionMap = new Map(
      submissions.map((s) => [s.timeslotId, s])
    );

    return timeslots.map((timeslot) => ({
      timeslotId: timeslot._id,
      djName: timeslot.djName,
      djInstagram: timeslot.djInstagram,
      startTime: timeslot.startTime,
      endTime: timeslot.endTime,
      hasSubmitted: submissionMap.has(timeslot._id),
      submittedAt: submissionMap.get(timeslot._id)?.submittedAt,
      guestCount: submissionMap.get(timeslot._id)?.guestList.length || 0,
      fileCount: submissionMap.get(timeslot._id)?.promoMaterials.files.length || 0,
    }));
  },
});

// Get file URL for viewing (requires authentication)
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await requireAuth(ctx); // Ensure user is authenticated to view files
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Mutation to update an existing submission
export const updateSubmission = mutation({
  args: {
    submissionId: v.id("submissions"),
    submissionToken: v.string(),
    promoFiles: v.optional(v.array(
      v.object({
        fileName: v.string(),
        fileType: v.string(),
        fileSize: v.number(),
        storageId: v.id("_storage"),
      })
    )),
    promoDescription: v.optional(v.string()),
    guestList: v.optional(v.array(
      v.object({
        name: v.string(),
        phone: v.optional(v.string()),
      })
    )),
    paymentInfo: v.optional(v.object({
      accountHolder: v.string(),
      bankName: v.string(),
      accountNumber: v.string(),
      residentNumber: v.string(),
      preferDirectContact: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    // Get the existing submission
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    // Verify the submission token matches
    if (submission.uniqueLink !== args.submissionToken) {
      throw new Error("Invalid submission token");
    }

    // Check if the event allows editing submissions
    const event = await ctx.db.get(submission.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Get event capabilities to check if submissions can be edited
    const timeslots = await ctx.db
      .query("timeslots")
      .filter((q) => q.eq(q.field("eventId"), submission.eventId))
      .collect();
    const submissions = await ctx.db
      .query("submissions")
      .filter((q) => q.eq(q.field("eventId"), submission.eventId))
      .collect();
    
    const capabilities = computeEventCapabilities(event, timeslots, submissions);
    if (!capabilities.canAcceptSubmissions) {
      throw new Error("Submissions can no longer be edited for this event");
    }

    // Build update object with only provided fields
    const updateData: any = {
      lastUpdatedAt: new Date().toISOString(),
    };

    if (args.promoFiles !== undefined) {
      updateData.promoMaterials = {
        files: args.promoFiles.map((file) => ({
          fileName: file.fileName,
          fileType: file.fileType,
          fileSize: file.fileSize,
          convexFileId: file.storageId,
          uploadedAt: new Date().toISOString(),
        })),
        description: args.promoDescription || submission.promoMaterials.description,
      };
    } else if (args.promoDescription !== undefined) {
      updateData.promoMaterials = {
        ...submission.promoMaterials,
        description: args.promoDescription,
      };
    }

    if (args.guestList !== undefined) {
      updateData.guestList = args.guestList;
    }

    if (args.paymentInfo !== undefined) {
      updateData.paymentInfo = {
        accountHolder: args.paymentInfo.accountHolder,
        bankName: args.paymentInfo.bankName,
        // In production, these should be encrypted
        accountNumber: args.paymentInfo.accountNumber,
        residentNumber: args.paymentInfo.residentNumber,
        preferDirectContact: args.paymentInfo.preferDirectContact,
      };
    }

    await ctx.db.patch(args.submissionId, updateData);

    return { success: true };
  },
});

// Mutation to delete a submission
export const deleteSubmission = mutation({
  args: {
    submissionId: v.id("submissions"),
    submissionToken: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the existing submission
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    // Verify the submission token matches
    if (submission.uniqueLink !== args.submissionToken) {
      throw new Error("Invalid submission token");
    }

    // Check if the event allows editing submissions
    const event = await ctx.db.get(submission.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Get event capabilities to check if submissions can be deleted
    const timeslots = await ctx.db
      .query("timeslots")
      .filter((q) => q.eq(q.field("eventId"), submission.eventId))
      .collect();
    const submissions = await ctx.db
      .query("submissions")
      .filter((q) => q.eq(q.field("eventId"), submission.eventId))
      .collect();
    
    const capabilities = computeEventCapabilities(event, timeslots, submissions);
    if (!capabilities.canAcceptSubmissions) {
      throw new Error("Submissions can no longer be deleted for this event");
    }

    // Remove submission reference from timeslot
    const timeslot = await ctx.db.get(submission.timeslotId);
    if (timeslot && timeslot.submissionId === submission._id) {
      await ctx.db.patch(submission.timeslotId, {
        submissionId: undefined,
      });
    }

    // Delete the submission
    await ctx.db.delete(args.submissionId);

    return { success: true };
  },
});

// Query to get submission by token (for editing)
export const getSubmissionByToken = query({
  args: { 
    submissionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db
      .query("submissions")
      .filter((q) => q.eq(q.field("uniqueLink"), args.submissionToken))
      .first();
    
    if (!submission) {
      return null;
    }

    // Also get the related timeslot and event info
    const timeslot = await ctx.db.get(submission.timeslotId);
    const event = await ctx.db.get(submission.eventId);
    
    return {
      ...submission,
      timeslot,
      event,
    };
  },
});

// Query to get all submissions for an event (for event organizer)
export const getSubmissionsByEvent = query({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // First, verify the user owns this event
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    
    if (event.organizerId !== args.userId) {
      throw new Error("Access denied: You don't own this event");
    }
    
    // Get all submissions for this event
    const submissions = await ctx.db
      .query("submissions")
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .collect();

    return submissions;
  },
});