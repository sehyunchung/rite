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
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("completed")), // Legacy - will be migrated to phase
    
    // New flexible status system
    phase: v.optional(v.string()), // 'draft', 'planning', 'finalized', 'day_of', 'completed', 'cancelled'
    phaseMetadata: v.optional(v.object({
      enteredAt: v.string(),
      enteredBy: v.id("users"),
      reason: v.optional(v.string()),
    })),
    
    // UI capabilities
    capabilities: v.optional(v.object({
      canEdit: v.boolean(),
      canPublish: v.boolean(),
      canAcceptSubmissions: v.boolean(),
      canGenerateContent: v.boolean(),
      canFinalize: v.boolean(),
      showUrgentBanner: v.boolean(),
      showDayOfFeatures: v.boolean(),
    })),
    
    // Event milestones
    milestones: v.optional(v.object({
      createdAt: v.string(),
      publishedAt: v.optional(v.string()),
      finalizedAt: v.optional(v.string()),
      dayOfStartedAt: v.optional(v.string()),
      completedAt: v.optional(v.string()),
      cancelledAt: v.optional(v.string()),
    })),
    
    // Version for migrations
    stateVersion: v.optional(v.number()),
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
    // DJ contact information for notifications
    djContact: v.object({
      email: v.string(),
      phone: v.optional(v.string()),
      preferredContactMethod: v.optional(v.union(v.literal("email"), v.literal("phone"), v.literal("both"))),
    }),
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
    status: v.optional(v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected"))),
    submittedAt: v.optional(v.string()),
    lastUpdatedAt: v.optional(v.string()),
  }),

  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    organizerProfile: v.object({
      companyName: v.optional(v.string()),
      phone: v.optional(v.string()),
    }),
    createdAt: v.string(),
    lastLoginAt: v.optional(v.string()),
    emailVerified: v.optional(v.number()),
    image: v.optional(v.string()),
  })
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
    .index("by_provider", ["provider", "providerAccountId"])
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
  })
    .index("by_identifier", ["identifier"])
    .index("by_identifier_token", ["identifier", "token"]),

  // Instagram integration tables
  instagramConnections: defineTable({
    userId: v.id("users"),
    instagramUserId: v.string(),
    username: v.string(),
    accessToken: v.string(), // Encrypted by Convex
    profilePictureUrl: v.optional(v.string()),
    displayName: v.optional(v.string()),
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

  // Email notification system
  notifications: defineTable({
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
    createdAt: v.string(),
  })
    .index("by_submission_id", ["submissionId"])
    .index("by_status", ["status"])
    .index("by_scheduled", ["scheduledFor"]),
});
