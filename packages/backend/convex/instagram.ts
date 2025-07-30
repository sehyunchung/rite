import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Query to get Instagram connection for a user
export const getInstagramConnection = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const connection = await ctx.db
      .query("instagramConnections")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
      
    if (!connection) {
      return null;
    }
    
    // Return connection without access token for security
    return {
      _id: connection._id,
      userId: connection.userId,
      instagramUserId: connection.instagramUserId,
      username: connection.username,
      accountType: connection.accountType,
      connectedAt: connection.connectedAt,
      isActive: connection.isActive,
      profilePictureUrl: connection.profilePictureUrl,
      displayName: connection.displayName,
    };
  },
});

// Save Instagram connection from NextAuth (during auto-connection)
export const saveConnectionFromAuth = mutation({
  args: {
    userId: v.string(),
    instagramUserId: v.string(),
    username: v.optional(v.string()),
    accessToken: v.string(),
    accountType: v.optional(v.string()),
    profilePictureUrl: v.optional(v.string()),
    displayName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // args.userId is now a Convex ID passed directly from the signIn callback
    const userId = args.userId as Id<"users">;
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error(`User not found: ${args.userId}`);
    }

    // Check if connection already exists
    const existingConnection = await ctx.db
      .query("instagramConnections")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    // Use username if provided, otherwise generate fallback
    const username = args.username || `user_${args.instagramUserId.slice(-8)}`;

    if (existingConnection) {
      // Update existing connection
      await ctx.db.patch(existingConnection._id, {
        instagramUserId: args.instagramUserId,
        username: username,
        accessToken: args.accessToken,
        accountType: args.accountType,
        profilePictureUrl: args.profilePictureUrl,
        displayName: args.displayName,
        connectedAt: new Date().toISOString(),
        isActive: true,
      });
      return existingConnection._id;
    } else {
      // Create new connection
      return await ctx.db.insert("instagramConnections", {
        userId: userId,
        instagramUserId: args.instagramUserId,
        username: username,
        accessToken: args.accessToken,
        accountType: args.accountType,
        profilePictureUrl: args.profilePictureUrl,
        displayName: args.displayName,
        connectedAt: new Date().toISOString(),
        isActive: true,
      });
    }
  },
});

// Get Instagram connection by user ID (for server-side use)
export const getConnectionByUserId = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const connection = await ctx.db
      .query("instagramConnections")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!connection) {
      return null;
    }

    // Return connection without access token for security
    return {
      _id: connection._id,
      username: connection.username,
      instagramUserId: connection.instagramUserId,
      accountType: connection.accountType,
      profilePictureUrl: connection.profilePictureUrl,
      displayName: connection.displayName,
      connectedAt: connection.connectedAt,
      isActive: connection.isActive,
    };
  },
});