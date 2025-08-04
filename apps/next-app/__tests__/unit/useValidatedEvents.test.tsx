import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useValidatedEvents, useValidatedEvent } from '@/app/hooks/useValidatedEvents'

// Mock the Convex client
const mockUseQuery = vi.fn()

vi.mock('convex/react', () => ({
  useQuery: mockUseQuery,
}))

// Mock the API
vi.mock('@rite/backend/convex/_generated/api', () => ({
  api: {
    events: {
      listEvents: 'listEvents',
      getEvent: 'getEvent',
    },
  },
}))

// Mock data types
const mockEvent = {
  _id: 'event1',
  _creationTime: Date.now(),
  name: 'Test Event',
  date: '2025-12-31',
  venue: {
    name: 'Test Venue',
    address: '123 Test St',
  },
  description: 'Test Description',
  hashtags: '#test #event',
  deadlines: {
    guestList: '2025-12-30',
    promoMaterials: '2025-12-29',
  },
  payment: {
    amount: 100,
    perDJ: 50,
    currency: 'KRW',
    dueDate: '2025-12-31',
  },
  guestLimitPerDJ: 2,
  timeslots: [
    {
      _id: 'slot1',
      _creationTime: Date.now(),
      startTime: '22:00',
      endTime: '23:00',
      djName: 'DJ Test',
      djInstagram: '@djtest',
    },
  ],
}

const mockEvents = [mockEvent]

describe('useValidatedEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useValidatedEvents hook', () => {
    it('should return empty array when events is undefined (loading)', () => {
      mockUseQuery.mockReturnValue(undefined)
      
      const { result } = renderHook(() => useValidatedEvents('user123'))
      
      expect(result.current.events).toEqual([])
      expect(result.current.isLoading).toBe(true)
      expect(result.current.isEmpty).toBe(false)
    })

    it('should return events when data is loaded', () => {
      mockUseQuery.mockReturnValue(mockEvents)
      
      const { result } = renderHook(() => useValidatedEvents('user123'))
      
      expect(result.current.events).toEqual(mockEvents)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isEmpty).toBe(false)
    })

    it('should return empty array and isEmpty true when no events', () => {
      mockUseQuery.mockReturnValue([])
      
      const { result } = renderHook(() => useValidatedEvents('user123'))
      
      expect(result.current.events).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isEmpty).toBe(true)
    })

    it('should skip query when userId is empty', () => {
      mockUseQuery.mockReturnValue(undefined)
      
      renderHook(() => useValidatedEvents(''))
      
      expect(mockUseQuery).toHaveBeenCalledWith('listEvents', 'skip')
    })

    it('should call query with correct parameters when userId is provided', () => {
      mockUseQuery.mockReturnValue(mockEvents)
      
      renderHook(() => useValidatedEvents('user123'))
      
      expect(mockUseQuery).toHaveBeenCalledWith('listEvents', { userId: 'user123' })
    })

    it('should handle guaranteed type safety with fallback', () => {
      // Simulate edge case where query returns null or undefined
      mockUseQuery.mockReturnValue(null)
      
      const { result } = renderHook(() => useValidatedEvents('user123'))
      
      // Should never be null/undefined due to ?? [] fallback
      expect(result.current.events).toEqual([])
      expect(Array.isArray(result.current.events)).toBe(true)
    })
  })

  describe('useValidatedEvent hook', () => {
    it('should return undefined event when loading', () => {
      mockUseQuery.mockReturnValue(undefined)
      
      const { result } = renderHook(() => useValidatedEvent('event1', 'user123'))
      
      expect(result.current.event).toBe(undefined)
      expect(result.current.isLoading).toBe(true)
      expect(result.current.exists).toBe(false)
    })

    it('should return event when data is loaded', () => {
      mockUseQuery.mockReturnValue(mockEvent)
      
      const { result } = renderHook(() => useValidatedEvent('event1', 'user123'))
      
      expect(result.current.event).toEqual(mockEvent)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.exists).toBe(true)
    })

    it('should return null event when not found', () => {
      mockUseQuery.mockReturnValue(null)
      
      const { result } = renderHook(() => useValidatedEvent('event1', 'user123'))
      
      expect(result.current.event).toBe(null)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.exists).toBe(false)
    })

    it('should skip query when eventId is empty', () => {
      mockUseQuery.mockReturnValue(undefined)
      
      renderHook(() => useValidatedEvent('', 'user123'))
      
      expect(mockUseQuery).toHaveBeenCalledWith('getEvent', 'skip')
    })

    it('should skip query when userId is empty', () => {
      mockUseQuery.mockReturnValue(undefined)
      
      renderHook(() => useValidatedEvent('event1', ''))
      
      expect(mockUseQuery).toHaveBeenCalledWith('getEvent', 'skip')
    })

    it('should call query with correct parameters when both IDs provided', () => {
      mockUseQuery.mockReturnValue(mockEvent)
      
      renderHook(() => useValidatedEvent('event1', 'user123'))
      
      expect(mockUseQuery).toHaveBeenCalledWith('getEvent', {
        eventId: 'event1',
        userId: 'user123',
      })
    })
  })

  describe('type safety validation', () => {
    it('should ensure ValidatedEvent type has all required fields', () => {
      mockUseQuery.mockReturnValue(mockEvents)
      
      const { result } = renderHook(() => useValidatedEvents('user123'))
      
      const event = result.current.events[0]
      
      // Type safety checks - these would fail at compile time if types are wrong
      expect(event).toHaveProperty('_id')
      expect(event).toHaveProperty('name')
      expect(event).toHaveProperty('date')
      expect(event).toHaveProperty('venue')
      expect(event).toHaveProperty('timeslots')
      expect(event).toHaveProperty('guestLimitPerDJ')
      expect(event).toHaveProperty('hashtags')
      expect(event).toHaveProperty('payment')
      
      // Validate nested structures
      expect(event.venue).toHaveProperty('name')
      expect(event.venue).toHaveProperty('address')
      expect(event.payment).toHaveProperty('amount')
      expect(event.payment).toHaveProperty('perDJ')
      expect(event.payment).toHaveProperty('currency')
      expect(event.payment).toHaveProperty('dueDate')
      
      // Validate array types
      expect(Array.isArray(event.timeslots)).toBe(true)
      if (event.timeslots.length > 0) {
        expect(event.timeslots[0]).toHaveProperty('startTime')
        expect(event.timeslots[0]).toHaveProperty('endTime')
      }
    })

    it('should guarantee empty array fallback prevents undefined errors', () => {
      // Test edge cases that could cause "Cannot read properties of undefined" errors
      mockUseQuery.mockReturnValue(undefined)
      
      const { result } = renderHook(() => useValidatedEvents('user123'))
      
      // These operations should never throw because of the guaranteed fallback
      expect(() => result.current.events.length).not.toThrow()
      expect(() => result.current.events.map(e => e.name)).not.toThrow()
      expect(() => result.current.events.filter(e => e.name)).not.toThrow()
      
      // Verify the actual fallback values
      expect(result.current.events).toEqual([])
      expect(result.current.events.length).toBe(0)
    })
  })
})