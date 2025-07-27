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
    hashtags: v.optional(v.string()), // Instagram hashtags for event promotion
    deadlines: v.object({
      guestList: v.string(),
      promoMaterials: v.string(),
    }),
    payment: v.object({
      amount: v.number(), // Total payment amount (for backward compatibility)
      perDJ: v.optional(v.number()), // Payment amount per DJ (optional for backward compatibility)
      currency: v.string(),
      dueDate: v.string(),
    }),
    guestLimitPerDJ: v.optional(v.number()), // Maximum guests each DJ can add (optional for backward compatibility)
    createdAt: v.string(),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("completed")),
  }),

  timeslots: defineTable({
    eventId: v.id("events"),
    startTime: v.string(),
    endTime: v.string(),
    djName: v.string(),
    djInstagram: v.string(),
    submissionToken: v.optional(v.string()),
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
    clerkId: v.optional(v.string()), // Legacy Clerk support
    nextAuthId: v.optional(v.string()), // NextAuth user ID
    organizerProfile: v.object({
      companyName: v.optional(v.string()),
      phone: v.optional(v.string()),
    }),
    createdAt: v.string(),
    lastLoginAt: v.optional(v.string()),
    emailVerified: v.optional(v.number()),
    image: v.optional(v.string()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_nextauth_id", ["nextAuthId"])
    .index("by_email", ["email"]),

  // NextAuth.js required tables
  accounts: defineTable({
    userId: v.id("users"),
    type: v.string(),
    provider: v.string(),
    providerAccountId: v.string(),
    refresh_token: v.optional(v.string()),
    access_token: v.optional(v.string()),
    expires_at: v.optional(v.number()),
    token_type: v.optional(v.string()),
    scope: v.optional(v.string()),
    id_token: v.optional(v.string()),
    session_state: v.optional(v.string()),
  })
    .index("by_provider_and_account_id", ["provider", "providerAccountId"])
    .index("by_user_id", ["userId"]),

  sessions: defineTable({
    sessionToken: v.string(),
    userId: v.id("users"),
    expires: v.number(),
  })
    .index("by_session_token", ["sessionToken"])
    .index("by_user_id", ["userId"]),

  verificationTokens: defineTable({
    identifier: v.string(),
    token: v.string(),
    expires: v.number(),
  }).index("by_identifier", ["identifier"]),

  // Instagram integration tables
  instagramConnections: defineTable({
    userId: v.id("users"),
    instagramUserId: v.string(),
    username: v.string(),
    accessToken: v.string(), // Encrypted by Convex
    tokenExpiresAt: v.optional(v.string()),
    connectedAt: v.string(),
    isActive: v.boolean(),
    accountType: v.optional(v.string()), // "business" or "creator"
  }).index("by_user_id", ["userId"]),

  generatedPosts: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    templateType: v.union(v.literal("announcement"), v.literal("lineup"), v.literal("countdown")),
    imageId: v.id("_storage"),
    caption: v.string(),
    hashtags: v.array(v.string()),
    generatedAt: v.string(),
    downloaded: v.boolean(),
  }).index("by_event_id", ["eventId"]).index("by_user_id", ["userId"]),

  scheduledPosts: defineTable({
    generatedPostId: v.id("generatedPosts"),
    userId: v.id("users"),
    scheduledTime: v.string(), // KST timezone
    status: v.union(v.literal("pending"), v.literal("published"), v.literal("failed")),
    retryCount: v.number(),
    instagramPostId: v.optional(v.string()),
    error: v.optional(v.string()),
    publishedAt: v.optional(v.string()),
  }).index("by_user_id", ["userId"]).index("by_status", ["status"]),
});
