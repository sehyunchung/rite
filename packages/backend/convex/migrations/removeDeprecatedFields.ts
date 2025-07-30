import { mutation } from "../_generated/server";

// Migration to remove deprecated fields from existing users
export const removeDeprecatedUserFields = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all users
    const users = await ctx.db.query("users").collect();
    
    let updatedCount = 0;
    
    for (const user of users) {
      // Check if user has deprecated fields
      const hasDeprecatedFields = 'clerkId' in user || 'nextAuthId' in user;
      
      if (hasDeprecatedFields) {
        // Create a clean user object without deprecated fields
        const { clerkId, nextAuthId, ...cleanUser } = user as any;
        
        // Update the user document with only the allowed fields
        await ctx.db.replace(user._id, {
          email: cleanUser.email,
          name: cleanUser.name,
          image: cleanUser.image,
          emailVerified: cleanUser.emailVerified,
          createdAt: cleanUser.createdAt,
          lastLoginAt: cleanUser.lastLoginAt,
          organizerProfile: cleanUser.organizerProfile || {
            companyName: undefined,
            phone: undefined,
          },
        });
        
        updatedCount++;
      }
    }
    
    return {
      message: `Migration completed. Updated ${updatedCount} users.`,
      totalUsers: users.length,
      updatedUsers: updatedCount,
    };
  },
});

// Check if any users still have deprecated fields
export const checkDeprecatedFields = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    const usersWithDeprecatedFields = users.filter(user => {
      const userAny = user as any;
      return 'clerkId' in userAny || 'nextAuthId' in userAny;
    });
    
    return {
      totalUsers: users.length,
      usersWithDeprecatedFields: usersWithDeprecatedFields.length,
      affectedUserIds: usersWithDeprecatedFields.map(u => u._id),
    };
  },
});