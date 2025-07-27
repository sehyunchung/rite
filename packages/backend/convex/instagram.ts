import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

// Instagram OAuth flow
export const exchangeCodeForToken = action({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
    if (!clientSecret) {
      throw new Error("Instagram client secret not configured");
    }

    try {
      // Exchange code for access token
      const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: "735938226061336",
          client_secret: clientSecret,
          grant_type: "authorization_code",
          redirect_uri: process.env.INSTAGRAM_REDIRECT_URI || "http://localhost:5173/auth/instagram/callback",
          code: args.code,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        throw new Error(`Instagram auth error: ${tokenData.error_description}`);
      }

      // Get user info
      const userResponse = await fetch(
        `https://graph.instagram.com/me?fields=id,username,account_type,name,profile_picture_url&access_token=${tokenData.access_token}`
      );
      const userData = await userResponse.json();

      if (userData.error) {
        throw new Error(`Instagram user data error: ${userData.error.message}`);
      }

      // Store the connection
      await ctx.runMutation(api.instagram.saveConnection, {
        instagramUserId: userData.id,
        username: userData.username,
        accessToken: tokenData.access_token,
        accountType: userData.account_type,
        profilePictureUrl: userData.profile_picture_url,
        displayName: userData.name,
      });

      return { 
        success: true, 
        username: userData.username,
        accountType: userData.account_type,
        profilePictureUrl: userData.profile_picture_url
      };
    } catch (error) {
      console.error("Instagram OAuth error:", error);
      throw new Error("Failed to connect Instagram account");
    }
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

// Save Instagram connection to database
export const saveConnection = mutation({
  args: {
    instagramUserId: v.string(),
    username: v.string(),
    accessToken: v.string(),
    accountType: v.optional(v.string()),
    profilePictureUrl: v.optional(v.string()),
    displayName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Find the user in our database
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if connection already exists
    const existingConnection = await ctx.db
      .query("instagramConnections")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (existingConnection) {
      // Update existing connection
      await ctx.db.patch(existingConnection._id, {
        instagramUserId: args.instagramUserId,
        username: args.username,
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
      const connectionId = await ctx.db.insert("instagramConnections", {
        userId: user._id,
        instagramUserId: args.instagramUserId,
        username: args.username,
        accessToken: args.accessToken,
        accountType: args.accountType,
        profilePictureUrl: args.profilePictureUrl,
        displayName: args.displayName,
        connectedAt: new Date().toISOString(),
        isActive: true,
      });
      return connectionId;
    }
  },
});

// Get user's Instagram connection
export const getConnection = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user) {
      return null;
    }

    const connection = await ctx.db
      .query("instagramConnections")
      .filter((q) => q.eq(q.field("userId"), user._id))
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

// Disconnect Instagram account
export const disconnectAccount = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const connection = await ctx.db
      .query("instagramConnections")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (connection) {
      await ctx.db.patch(connection._id, {
        isActive: false,
      });
    }

    return true;
  },
});

// Check if user has active Instagram connection
export const hasActiveConnection = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user) {
      return false;
    }

    const connection = await ctx.db
      .query("instagramConnections")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), user._id),
          q.eq(q.field("isActive"), true)
        )
      )
      .first();

    return !!connection;
  },
});