import { query } from "./_generated/server";

export const ping = query({
  args: {},
  handler: async () => {
    return {
      message: "Pong! Convex is connected.",
      timestamp: new Date().toISOString(),
    };
  },
});