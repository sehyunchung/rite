import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    organizerId: v.string(),
    name: v.string(),
    date: v.string(),
    venue: v.object({
      name: v.string(),
      address: v.string(),
    }),
    description: v.optional(v.string()),
    hashtags: v.array(v.string()),
    paymentAmount: v.number(),
    guestLimitPerDj: v.number(),
    deadlines: v.object({
      guestList: v.string(),
      promoMaterial: v.string(),
      paymentInfo: v.string(),
    }),
    createdAt: v.string(),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("completed")),
  }),

  timeslots: defineTable({
    eventId: v.id("events"),
    startTime: v.string(),
    endTime: v.string(),
    djName: v.string(),
    djInstagram: v.string(),
    submissionId: v.optional(v.id("submissions")),
  }),

  submissions: defineTable({
    eventId: v.id("events"),
    timeslotId: v.id("timeslots"),
    uniqueLink: v.string(),
    promoMaterials: v.object({
      files: v.array(
        v.object({
          fileName: v.string(),
          fileType: v.string(),
          fileSize: v.number(),
          convexFileId: v.id("_storage"),
          uploadedAt: v.string(),
        })
      ),
      description: v.string(),
    }),
    guestList: v.array(
      v.object({
        name: v.string(),
        phone: v.optional(v.string()),
      })
    ),
    paymentInfo: v.object({
      accountHolder: v.string(),
      bankName: v.string(),
      accountNumber: v.string(), // encrypted
      residentNumber: v.string(), // encrypted
      preferDirectContact: v.boolean(),
    }),
    submittedAt: v.optional(v.string()),
    lastUpdatedAt: v.optional(v.string()),
  }),

  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    lastLoginAt: v.optional(v.string()),
  }),
});
