import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get the current authenticated user from Clerk
export async function getAuthUserId(ctx: QueryCtx | MutationCtx): Promise<Id<"users"> | null> {
  // Get the Clerk user ID from the authenticated context
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  
  const clerkId = identity.subject;

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

// Create or update user from Clerk authentication (called automatically)
export const upsertUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const clerkId = identity.subject;
    const email = typeof identity.email === 'string' ? identity.email : 
                  (typeof identity.emailVerified === 'string' ? identity.emailVerified : "");
    const name = identity.name;

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    const userData = {
      clerkId,
      email,
      name,
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

// NextAuth.js adapter functions
export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerified: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists with this email
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existingUser) {
      // Return existing user ID if user already exists
      return existingUser._id;
    }
    
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      image: args.image,
      emailVerified: args.emailVerified,
      organizerProfile: {},
      createdAt: new Date().toISOString(),
    });
    
    return userId;
  },
});

export const getUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId as any);
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
  },
});

export const getUserByNextAuthId = query({
  args: { nextAuthId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_nextauth_id", (q) => q.eq("nextAuthId", args.nextAuthId))
      .first();
  },
});

export const updateUser = mutation({
  args: {
    userId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerified: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    await ctx.db.patch(userId as any, updates);
    return await ctx.db.get(userId as any);
  },
});

// Account management
export const linkAccount = mutation({
  args: {
    userId: v.string(),
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("accounts", {
      userId: args.userId as any,
      type: args.type,
      provider: args.provider,
      providerAccountId: args.providerAccountId,
      refresh_token: args.refresh_token,
      access_token: args.access_token,
      expires_at: args.expires_at,
      token_type: args.token_type,
      scope: args.scope,
      id_token: args.id_token,
      session_state: args.session_state,
    });
  },
});

export const getAccountByProvider = query({
  args: {
    provider: v.string(),
    providerAccountId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("accounts")
      .filter((q) =>
        q.and(
          q.eq(q.field("provider"), args.provider),
          q.eq(q.field("providerAccountId"), args.providerAccountId)
        )
      )
      .first();
  },
});

export const unlinkAccount = mutation({
  args: {
    provider: v.string(),
    providerAccountId: v.string(),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query("accounts")
      .filter((q) =>
        q.and(
          q.eq(q.field("provider"), args.provider),
          q.eq(q.field("providerAccountId"), args.providerAccountId)
        )
      )
      .first();
    
    if (account) {
      await ctx.db.delete(account._id);
    }
  },
});

// Session management
export const createSession = mutation({
  args: {
    sessionToken: v.string(),
    userId: v.string(),
    expires: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sessions", {
      sessionToken: args.sessionToken,
      userId: args.userId as any,
      expires: args.expires,
    });
  },
});

export const getSession = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("sessionToken"), args.sessionToken))
      .first();
  },
});

export const updateSession = mutation({
  args: {
    sessionToken: v.string(),
    expires: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("sessionToken"), args.sessionToken))
      .first();
    
    if (session && args.expires) {
      await ctx.db.patch(session._id, { expires: args.expires });
      return await ctx.db.get(session._id);
    }
    
    return session;
  },
});

export const deleteSession = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("sessionToken"), args.sessionToken))
      .first();
    
    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

// Verification token management
export const createVerificationToken = mutation({
  args: {
    identifier: v.string(),
    token: v.string(),
    expires: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("verificationTokens", {
      identifier: args.identifier,
      token: args.token,
      expires: args.expires,
    });
  },
});

export const useVerificationToken = mutation({
  args: {
    identifier: v.string(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const verificationToken = await ctx.db
      .query("verificationTokens")
      .filter((q) =>
        q.and(
          q.eq(q.field("identifier"), args.identifier),
          q.eq(q.field("token"), args.token)
        )
      )
      .first();
    
    if (verificationToken) {
      await ctx.db.delete(verificationToken._id);
      return verificationToken;
    }
    
    return null;
  },
});