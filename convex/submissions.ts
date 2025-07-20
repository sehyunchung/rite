import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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

// Get submission by timeslot ID
export const getSubmissionByTimeslot = query({
  args: { timeslotId: v.id("timeslots") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("submissions")
      .filter((q) => q.eq(q.field("timeslotId"), args.timeslotId))
      .first();
  },
});

// Get submission status for an event
export const getEventSubmissionStatus = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
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

// Get file URL for viewing
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});