import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get the current authenticated user from Clerk
export async function getAuthUserId(ctx: QueryCtx | MutationCtx): Promise<Id<"users"> | null> {
  // In a real implementation, this would validate the Clerk JWT token
  // For now, we'll implement a simple version that checks for a clerk ID in headers
  // This is a placeholder - proper Clerk integration will replace this
  
  // TODO: Replace with actual Clerk JWT validation
  const clerkId = (ctx as any).auth?.userId; // This will be populated by Clerk
  if (!clerkId) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .first();

  return user?._id ?? null;
}

// Require authentication - throws if not authenticated
export async function requireAuth(ctx: QueryCtx | MutationCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Authentication required");
  }
  return userId;
}

// Get the full user object for the authenticated user
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    return null;
  }
  return await ctx.db.get(userId);
}

// Create or update user from Clerk webhook/authentication
export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    const userData = {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      organizerProfile: {
        companyName: undefined,
        phone: undefined,
      },
      lastLoginAt: new Date().toISOString(),
    };

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, userData);
      return existingUser._id;
    } else {
      // Create new user
      return await ctx.db.insert("users", {
        ...userData,
        createdAt: new Date().toISOString(),
      });
    }
  },
});

// Get current user profile
export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

// Update user profile
export const updateUserProfile = mutation({
  args: {
    name: v.optional(v.string()),
    organizerProfile: v.object({
      companyName: v.optional(v.string()),
      phone: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    
    await ctx.db.patch(userId, {
      name: args.name,
      organizerProfile: args.organizerProfile,
      lastLoginAt: new Date().toISOString(),
    });
    
    return await ctx.db.get(userId);
  },
});