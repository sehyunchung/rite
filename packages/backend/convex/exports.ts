import { v } from "convex/values";
import { query, internalQuery } from "./_generated/server";
import { requireAuth } from "./auth";
import type { Id, Doc } from "./_generated/dataModel";

// Internal function to get aggregated guest list data for export
const _getEventGuestListForExport = async (ctx: any, eventId: Id<"events">, userId: Id<"users">) => {
  // Verify the event belongs to the authenticated user
  const event = await ctx.db.get(eventId);
  if (!event) {
    throw new Error("Event not found");
  }
  if (event.organizerId !== userId) {
    throw new Error("Access denied: You don't own this event");
  }
  
  // Get all timeslots and submissions for this event
  const timeslots = await ctx.db
    .query("timeslots")
    .filter((q) => q.eq(q.field("eventId"), eventId))
    .collect();
  
  const submissions = await ctx.db
    .query("submissions")
    .filter((q) => q.eq(q.field("eventId"), eventId))
    .collect();
  
  // Create a map for quick lookup of submissions by timeslot ID
  const submissionMap = new Map(
    submissions.map((s) => [s.timeslotId, s])
  );
  
  // Prepare export data with aggregated guest lists
  return {
    event: {
      id: event._id,
      name: event.name,
      date: event.date,
      venue: event.venue,
      organizerId: event.organizerId,
      createdAt: event.createdAt,
      totalSlots: timeslots.length,
      submittedSlots: submissions.length,
    },
    timeslots: timeslots.map((slot) => {
      const submission = submissionMap.get(slot._id);
      return {
        timeslotId: slot._id,
        djName: slot.djName,
        djInstagram: slot.djInstagram,
        startTime: slot.startTime,
        endTime: slot.endTime,
        hasSubmission: !!submission,
        submittedAt: submission?.submittedAt,
        guestList: submission?.guestList || [],
        guestCount: submission?.guestList?.length || 0,
      };
    }),
    // Aggregate all guests across all timeslots
    allGuests: timeslots.reduce<Array<{
      name: string;
      phone?: string;
      djName: string;
      djInstagram: string;
      timeslot: string;
    }>>((acc, slot) => {
      const submission = submissionMap.get(slot._id);
      if (submission?.guestList) {
        const guestsWithDJ = submission.guestList.map(guest => ({
          name: guest.name,
          phone: guest.phone,
          djName: slot.djName,
          djInstagram: slot.djInstagram,
          timeslot: `${slot.startTime} - ${slot.endTime}`,
        }));
        acc.push(...guestsWithDJ);
      }
      return acc;
    }, []),
    summary: {
      totalGuests: timeslots.reduce((total, slot) => {
        const submission = submissionMap.get(slot._id);
        return total + (submission?.guestList?.length || 0);
      }, 0),
      totalDJs: timeslots.length,
      submittedDJs: submissions.length,
      pendingDJs: timeslots.length - submissions.length,
    },
    exportedAt: new Date().toISOString(),
  };
};

// Get aggregated guest list data for export
export const getEventGuestListForExport = query({
  args: { 
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    return await _getEventGuestListForExport(ctx, args.eventId, userId);
  },
});

// Get guest list data formatted specifically for CSV export
export const getEventGuestListCSV = query({
  args: { 
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const exportData = await _getEventGuestListForExport(ctx, args.eventId, userId);
    
    // Format data for CSV export
    const csvHeaders = [
      'Guest Name',
      'Phone Number',
      'DJ Name', 
      'DJ Instagram',
      'Time Slot',
      'Submission Date'
    ];
    
    const csvRows = exportData.allGuests.map(guest => {
      const timeslot = exportData.timeslots.find(t => t.djName === guest.djName);
      return [
        guest.name,
        guest.phone || '',
        guest.djName,
        guest.djInstagram,
        guest.timeslot,
        timeslot?.submittedAt ? new Date(timeslot.submittedAt).toLocaleDateString() : ''
      ];
    });
    
    return {
      headers: csvHeaders,
      rows: csvRows,
      filename: `${exportData.event.name.replace(/[^a-zA-Z0-9]/g, '_')}_guest_list_${new Date().toISOString().split('T')[0]}.csv`,
      eventInfo: {
        name: exportData.event.name,
        date: exportData.event.date,
        venue: exportData.event.venue.name,
        totalGuests: exportData.summary.totalGuests,
        totalDJs: exportData.summary.totalDJs,
      }
    };
  },
});

// Get guest list data formatted for Excel/Google Sheets export
export const getEventGuestListSpreadsheet = query({
  args: { 
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const exportData = await _getEventGuestListForExport(ctx, args.eventId, userId);
    
    // Format data for spreadsheet export with multiple sheets
    return {
      eventInfo: {
        name: exportData.event.name,
        date: exportData.event.date,
        venue: exportData.event.venue.name + ', ' + exportData.event.venue.address,
        totalGuests: exportData.summary.totalGuests,
        totalDJs: exportData.summary.totalDJs,
        submittedSlots: exportData.summary.submittedDJs,
        pendingSlots: exportData.summary.pendingDJs,
        exportedAt: exportData.exportedAt,
      },
      // Main guest list sheet
      guestListSheet: {
        name: 'Guest List',
        headers: [
          'Guest Name',
          'Phone Number', 
          'DJ Name',
          'DJ Instagram',
          'Time Slot',
          'Submission Date'
        ],
        data: exportData.allGuests.map(guest => {
          const timeslot = exportData.timeslots.find(t => t.djName === guest.djName);
          return [
            guest.name,
            guest.phone || '',
            guest.djName,
            guest.djInstagram,
            guest.timeslot,
            timeslot?.submittedAt ? new Date(timeslot.submittedAt).toLocaleDateString() : 'Pending'
          ];
        })
      },
      // Summary sheet grouped by DJ
      djSummarySheet: {
        name: 'DJ Summary',
        headers: [
          'DJ Name',
          'Instagram Handle',
          'Time Slot',
          'Guest Count',
          'Submission Status',
          'Submitted Date'
        ],
        data: exportData.timeslots.map(slot => [
          slot.djName,
          slot.djInstagram,
          `${slot.startTime} - ${slot.endTime}`,
          slot.guestCount.toString(),
          slot.hasSubmission ? 'Submitted' : 'Pending',
          slot.submittedAt ? new Date(slot.submittedAt).toLocaleDateString() : ''
        ])
      },
      // Event summary sheet
      eventSummarySheet: {
        name: 'Event Summary',
        headers: ['Metric', 'Value'],
        data: [
          ['Event Name', exportData.event.name],
          ['Event Date', exportData.event.date],
          ['Venue', exportData.event.venue.name],
          ['Venue Address', exportData.event.venue.address],
          ['Total DJs', exportData.summary.totalDJs.toString()],
          ['Submitted Slots', exportData.summary.submittedDJs.toString()],
          ['Pending Slots', exportData.summary.pendingDJs.toString()],
          ['Total Guests', exportData.summary.totalGuests.toString()],
          ['Export Date', new Date(exportData.exportedAt).toLocaleDateString()],
        ]
      },
      filename: `${exportData.event.name.replace(/[^a-zA-Z0-9]/g, '_')}_guest_list_${new Date().toISOString().split('T')[0]}`,
    };
  },
});

// Get guest list data formatted for PDF export
export const getEventGuestListPDF = query({
  args: { 
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const exportData = await _getEventGuestListForExport(ctx, args.eventId, userId);
    
    return {
      title: `Guest List - ${exportData.event.name}`,
      eventInfo: {
        name: exportData.event.name,
        date: exportData.event.date,
        venue: `${exportData.event.venue.name}, ${exportData.event.venue.address}`,
        totalGuests: exportData.summary.totalGuests,
        totalDJs: exportData.summary.totalDJs,
        submittedSlots: exportData.summary.submittedDJs,
        pendingSlots: exportData.summary.pendingDJs,
      },
      // Group guests by DJ for better PDF formatting
      guestsByDJ: exportData.timeslots.map(slot => ({
        djName: slot.djName,
        djInstagram: slot.djInstagram,
        timeSlot: `${slot.startTime} - ${slot.endTime}`,
        guestCount: slot.guestCount,
        hasSubmission: slot.hasSubmission,
        submittedAt: slot.submittedAt,
        guests: slot.guestList,
      })),
      // Summary section for PDF
      summary: exportData.summary,
      exportedAt: exportData.exportedAt,
      filename: `${exportData.event.name.replace(/[^a-zA-Z0-9]/g, '_')}_guest_list_${new Date().toISOString().split('T')[0]}.pdf`,
    };
  },
});