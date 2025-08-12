/**
 * Test data factories for consistent test data generation
 * Following TDD principle: Use predictable, consistent test data
 */

import { Id } from 'convex/values'

// Event Factory
export const createMockEvent = (overrides: Partial<MockEvent> = {}): MockEvent => ({
  _id: 'event_123' as Id<'events'>,
  _creationTime: Date.now(),
  name: 'Test Event',
  date: '2025-02-01',
  startTime: '18:00',
  endTime: '04:00',
  venue: 'Test Venue',
  address: '123 Test St',
  description: 'Test event description',
  createdBy: 'user_123' as Id<'users'>,
  status: 'upcoming',
  capacity: 100,
  ...overrides
})

// User Factory
export const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
  _id: 'user_123' as Id<'users'>,
  _creationTime: Date.now(),
  email: 'test@example.com',
  name: 'Test User',
  role: 'dj',
  image: 'https://example.com/avatar.jpg',
  ...overrides
})

// Timeslot Factory
export const createMockTimeslot = (overrides: Partial<MockTimeslot> = {}): MockTimeslot => ({
  _id: 'timeslot_123' as Id<'timeslots'>,
  _creationTime: Date.now(),
  eventId: 'event_123' as Id<'events'>,
  djName: 'Test DJ',
  startTime: '22:00',
  endTime: '23:00',
  submissionToken: 'token_abc123',
  order: 1,
  ...overrides
})

// Submission Factory
export const createMockSubmission = (overrides: Partial<MockSubmission> = {}): MockSubmission => ({
  _id: 'submission_123' as Id<'submissions'>,
  _creationTime: Date.now(),
  timeslotId: 'timeslot_123' as Id<'timeslots'>,
  djName: 'Test DJ',
  email: 'dj@example.com',
  phone: '+1234567890',
  instagram: '@testdj',
  guestList: ['Guest 1', 'Guest 2'],
  notes: 'Test notes',
  submittedAt: Date.now(),
  ...overrides
})

// Instagram Connection Factory
export const createMockInstagramConnection = (
  overrides: Partial<MockInstagramConnection> = {}
): MockInstagramConnection => ({
  _id: 'ig_123' as Id<'instagramConnections'>,
  _creationTime: Date.now(),
  userId: 'user_123' as Id<'users'>,
  instagramId: 'ig_user_123',
  username: 'testuser',
  accessToken: 'token_xyz',
  profilePicture: 'https://instagram.com/pic.jpg',
  ...overrides
})

// Type Definitions
export interface MockEvent {
  _id: Id<'events'>
  _creationTime: number
  name: string
  date: string
  startTime: string
  endTime: string
  venue: string
  address: string
  description: string
  createdBy: Id<'users'>
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  capacity: number
}

export interface MockUser {
  _id: Id<'users'>
  _creationTime: number
  email: string
  name: string
  role: 'admin' | 'organizer' | 'dj' | 'guest'
  image?: string
}

export interface MockTimeslot {
  _id: Id<'timeslots'>
  _creationTime: number
  eventId: Id<'events'>
  djName: string
  startTime: string
  endTime: string
  submissionToken: string
  order: number
}

export interface MockSubmission {
  _id: Id<'submissions'>
  _creationTime: number
  timeslotId: Id<'timeslots'>
  djName: string
  email: string
  phone?: string
  instagram?: string
  guestList: string[]
  notes?: string
  submittedAt: number
}

export interface MockInstagramConnection {
  _id: Id<'instagramConnections'>
  _creationTime: number
  userId: Id<'users'>
  instagramId: string
  username: string
  accessToken: string
  profilePicture?: string
}

// Batch creation helpers
export const createMockEvents = (count: number, overrides: Partial<MockEvent> = {}): MockEvent[] => {
  return Array.from({ length: count }, (_, i) => 
    createMockEvent({
      _id: `event_${i}` as Id<'events'>,
      name: `Test Event ${i + 1}`,
      ...overrides
    })
  )
}

export const createMockTimeslots = (
  eventId: Id<'events'>,
  count: number
): MockTimeslot[] => {
  return Array.from({ length: count }, (_, i) => {
    const startHour = 20 + i
    return createMockTimeslot({
      _id: `timeslot_${i}` as Id<'timeslots'>,
      eventId,
      djName: `DJ ${i + 1}`,
      startTime: `${startHour}:00`,
      endTime: `${startHour + 1}:00`,
      order: i,
      submissionToken: `token_${i}`
    })
  })
}