import { mutation } from "./_generated/server";

// Test function to create a sample event with timeslots for testing
export const createTestEvent = mutation({
  args: {},
  handler: async (ctx) => {
    // Create a test event
    const eventId = await ctx.db.insert("events", {
      organizerId: "test-organizer",
      name: "Test DJ Night",
      date: "2024-02-15",
      venue: {
        name: "Test Club",
        address: "123 Test Street, Seoul",
      },
      description: "Test event for submission system",
      hashtags: "#testdj #clubnight #seoul",
      deadlines: {
        guestList: "2024-02-10",
        promoMaterials: "2024-02-12",
      },
      payment: {
        amount: 1000000,
        perDJ: 200000,
        currency: "KRW",
        dueDate: "2024-02-20",
      },
      guestLimitPerDJ: 5,
      createdAt: new Date().toISOString(),
      status: "active",
    });

    // Create test timeslots
    const timeslot1Id = await ctx.db.insert("timeslots", {
      eventId,
      startTime: "22:00",
      endTime: "23:00",
      djName: "DJ Test",
      djInstagram: "@dj_test",
      submissionToken: "TEST123ABC456DEF",
    });

    const timeslot2Id = await ctx.db.insert("timeslots", {
      eventId,
      startTime: "23:00",
      endTime: "00:00",
      djName: "DJ Example",
      djInstagram: "@dj_example",
      submissionToken: "EXAMPLE789GHI012",
    });

    return {
      eventId,
      timeslots: [
        { id: timeslot1Id, token: "TEST123ABC456DEF" },
        { id: timeslot2Id, token: "EXAMPLE789GHI012" },
      ],
      testUrls: [
        `http://localhost:5173/dj-submission?token=TEST123ABC456DEF`,
        `http://localhost:5173/dj-submission?token=EXAMPLE789GHI012`,
      ],
    };
  },
});