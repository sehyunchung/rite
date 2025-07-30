import { type } from 'arktype';

// Define validation schemas using ArkType
export const TimeslotValidation = type({
  id: 'string',
  startTime: 'string',
  endTime: 'string',
  djName: 'string',
  djInstagram: 'string',
});

export const EventValidation = type({
  name: 'string>0',
  date: 'string',
  description: 'string',
  hashtags: 'string', // Instagram hashtags for event promotion
  venue: {
    name: 'string>0',
    address: 'string>0',
  },
  deadlines: {
    guestList: 'string',
    promoMaterials: 'string',
  },
  payment: {
    amount: 'number>0',
    perDJ: 'number>0', // Payment amount per DJ
    currency: '"KRW" | "USD" | "EUR"',
    dueDate: 'string',
  },
  guestLimitPerDJ: 'number>0', // Maximum guests each DJ can add
});

export const TimeslotsValidation = type(TimeslotValidation.array());

export const EventWithTimeslotsValidation = type({
  event: EventValidation,
  timeslots: TimeslotsValidation,
});

// Infer TypeScript types from ArkType schemas
export type EventFormData = typeof EventValidation.infer;
export type Timeslot = typeof TimeslotValidation.infer;
export type EventWithTimeslots = typeof EventWithTimeslotsValidation.infer;

// Validation functions
export function validateEvent(data: unknown) {
  return EventValidation(data);
}

export function validateTimeslot(data: unknown) {
  return TimeslotValidation(data);
}

export function validateEventWithTimeslots(data: unknown) {
  return EventWithTimeslotsValidation(data);
}

// Custom validation helpers
export function validateTimeRange(startTime: string, endTime: string): string | null {
  if (!startTime || !endTime) {
    return 'Both start and end times are required';
  }
  
  const start = new Date(`2000-01-01T${startTime}:00`);
  let end = new Date(`2000-01-01T${endTime}:00`);
  
  // Handle cross-midnight timeslots (e.g., 11:00 PM - 1:00 AM)
  // If end time appears to be "before" start time, assume it's next day
  if (end <= start) {
    end = new Date(`2000-01-02T${endTime}:00`);
  }
  
  return null;
}

export function validateInstagramHandle(handle: string): string | null {
  // If handle is empty, it's valid (optional field)
  if (!handle || handle.trim() === '') {
    return null;
  }
  
  if (!handle.startsWith('@')) {
    return 'Instagram handle must start with @';
  }
  
  if (handle.length < 2) {
    return 'Instagram handle is too short';
  }
  
  if (!/^@[a-zA-Z0-9_.]+$/.test(handle)) {
    return 'Instagram handle contains invalid characters';
  }
  
  return null;
}

export function validateDate(date: string, minDate?: string): string | null {
  if (!date) {
    return 'Date is required';
  }
  
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    return 'Date cannot be in the past';
  }
  
  if (minDate) {
    const minimum = new Date(minDate);
    if (selectedDate < minimum) {
      return `Date must be after ${minDate}`;
    }
  }
  
  return null;
}

export function validateDeadlineDate(date: string, eventDate?: string): string | null {
  if (!date) {
    return 'Date is required';
  }
  
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    return 'Date cannot be in the past';
  }
  
  if (eventDate) {
    const event = new Date(eventDate);
    if (selectedDate >= event) {
      return `Deadline must be before the event date (${eventDate})`;
    }
  }
  
  return null;
}

export function validateDeadlineOrder(guestListDeadline: string, promoDeadline: string): string | null {
  if (!guestListDeadline || !promoDeadline) {
    return null; // Skip validation if dates are not provided
  }
  
  const guestDate = new Date(guestListDeadline);
  const promoDate = new Date(promoDeadline);
  
  // Promo materials deadline should be BEFORE guest list deadline
  // (Promo: 3 weeks before event, Guest list: 1 day before event)
  if (promoDate >= guestDate) {
    return 'Promo materials deadline must be before guest list deadline';
  }
  
  return null;
}

export function validateTimeslotDuration(startTime: string, endTime: string, _minMinutes: number = 30): string | null {
  // No duration restrictions for DJ timeslots - organizers know their event needs best
  return null;
}

// Smart defaults and business rule helpers
export function getDefaultGuestListDeadline(eventDate: string): string {
  if (!eventDate) return '';
  
  const event = new Date(eventDate);
  const guestDeadline = new Date(event);
  guestDeadline.setDate(event.getDate() - 1); // Day before event
  
  return guestDeadline.toISOString().split('T')[0];
}

export function getDefaultPromoDeadline(eventDate: string): string {
  if (!eventDate) return '';
  
  const event = new Date(eventDate);
  const promoDeadline = new Date(event);
  promoDeadline.setDate(event.getDate() - 21); // 3 weeks (21 days) before event
  
  return promoDeadline.toISOString().split('T')[0];
}

export function getDefaultStartTime(): string {
  return '22:00'; // 10 PM default
}

export function getDefaultEndTime(startTime: string): string {
  if (!startTime) return '23:00';
  
  const [hours, minutes] = startTime.split(':').map(Number);
  const start = new Date(2000, 0, 1, hours, minutes);
  start.setHours(start.getHours() + 1); // Default 1-hour slot
  
  return start.toTimeString().slice(0, 5);
}

// Helper function to format timeslot for display with proper cross-midnight handling
export function formatTimeslotDisplay(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return '';
  
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  
  // Check if it's a cross-midnight timeslot
  const isCrossMidnight = end <= start;
  
  const startFormatted = start.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
  
  const endFormatted = end.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
  
  if (isCrossMidnight) {
    return `${startFormatted} - ${endFormatted} (+1 day)`;
  }
  
  return `${startFormatted} - ${endFormatted}`;
}

// Helper function to calculate timeslot duration in minutes (handles cross-midnight)
export function getTimeslotDurationMinutes(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  
  const start = new Date(`2000-01-01T${startTime}:00`);
  let end = new Date(`2000-01-01T${endTime}:00`);
  
  // Handle cross-midnight timeslots
  if (end <= start) {
    end = new Date(`2000-01-02T${endTime}:00`);
  }
  
  return (end.getTime() - start.getTime()) / (1000 * 60);
}

// Enhanced validation with business rule suggestions
export function validateGuestListDeadline(guestDate: string, eventDate: string): {
  isValid: boolean;
  error?: string;
  suggestion?: string;
} {
  const dateError = validateDeadlineDate(guestDate, eventDate);
  if (dateError) {
    return { isValid: false, error: dateError };
  }
  
  const suggestedDate = getDefaultGuestListDeadline(eventDate);
  const guest = new Date(guestDate);
  const event = new Date(eventDate);
  const daysDiff = Math.ceil((event.getTime() - guest.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 1) {
    return {
      isValid: false,
      error: 'Guest list deadline should be at least 1 day before the event',
      suggestion: `Consider ${suggestedDate} (day before event)`
    };
  }
  
  if (daysDiff > 7) {
    return {
      isValid: true,
      suggestion: `Suggested: ${suggestedDate} (day before event)`
    };
  }
  
  return { isValid: true };
}

export function validatePromoDeadline(promoDate: string, eventDate: string): {
  isValid: boolean;
  error?: string;
  suggestion?: string;
} {
  const dateError = validateDeadlineDate(promoDate, eventDate);
  if (dateError) {
    return { isValid: false, error: dateError };
  }
  
  const suggestedDate = getDefaultPromoDeadline(eventDate);
  const promo = new Date(promoDate);
  const event = new Date(eventDate);
  const daysDiff = Math.ceil((event.getTime() - promo.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 7) {
    return {
      isValid: true,
      suggestion: `Consider ${suggestedDate} (3 weeks before) for better DJ preparation time`
    };
  }
  
  if (daysDiff < 14) {
    return {
      isValid: true,
      suggestion: `Good timing! Suggested: ${suggestedDate} (3 weeks before)`
    };
  }
  
  return { isValid: true };
}