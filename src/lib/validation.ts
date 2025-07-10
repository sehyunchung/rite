import { type } from 'arktype';

// Define validation schemas using ArkType
export const TimeslotValidation = type({
  id: 'string',
  startTime: 'string',
  endTime: 'string',
  djName: 'string>0',
  djInstagram: 'string>0',
});

export const EventValidation = type({
  name: 'string>0',
  date: 'string',
  description: 'string',
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
    currency: '"KRW" | "USD" | "EUR"',
    dueDate: 'string',
  },
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
  const end = new Date(`2000-01-01T${endTime}:00`);
  
  if (start >= end) {
    return 'End time must be after start time';
  }
  
  return null;
}

export function validateInstagramHandle(handle: string): string | null {
  if (!handle) {
    return 'Instagram handle is required';
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