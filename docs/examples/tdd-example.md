# TDD Example: Event Duration Calculator

This example demonstrates the TDD process step-by-step for implementing an event duration calculator feature.

## Step 1: RED - Write Failing Tests First

Create the test file **before** implementing the feature:

```typescript
// apps/next-app/__tests__/utils/eventDuration.test.ts
import { describe, it, expect } from "vitest";
import {
  calculateEventDuration,
  formatDuration,
  isOvernightEvent,
  getEventTimeRange,
} from "@/utils/eventDuration";

describe("Event Duration Calculator", () => {
  describe("calculateEventDuration", () => {
    it("should calculate duration for same-day event", () => {
      const duration = calculateEventDuration("18:00", "23:00");
      expect(duration).toBe(5);
    });

    it("should calculate duration for overnight event", () => {
      const duration = calculateEventDuration("22:00", "04:00");
      expect(duration).toBe(6);
    });

    it("should handle midnight correctly", () => {
      const duration = calculateEventDuration("23:00", "00:00");
      expect(duration).toBe(1);
    });

    it("should throw error for invalid time format", () => {
      expect(() => calculateEventDuration("25:00", "26:00")).toThrow(
        "Invalid time format",
      );
    });
  });

  describe("formatDuration", () => {
    it("should format single hour correctly", () => {
      expect(formatDuration(1)).toBe("1 hour");
    });

    it("should format multiple hours correctly", () => {
      expect(formatDuration(5)).toBe("5 hours");
    });

    it("should include minutes when present", () => {
      expect(formatDuration(2.5)).toBe("2 hours 30 minutes");
    });

    it("should handle zero duration", () => {
      expect(formatDuration(0)).toBe("0 minutes");
    });
  });

  describe("isOvernightEvent", () => {
    it("should detect overnight event", () => {
      expect(isOvernightEvent("22:00", "04:00")).toBe(true);
    });

    it("should detect same-day event", () => {
      expect(isOvernightEvent("14:00", "18:00")).toBe(false);
    });

    it("should handle edge case at midnight", () => {
      expect(isOvernightEvent("23:00", "00:30")).toBe(true);
    });
  });

  describe("getEventTimeRange", () => {
    it("should format time range for same-day event", () => {
      const range = getEventTimeRange("2025-02-01", "18:00", "23:00");
      expect(range).toBe("Feb 1, 2025 • 6:00 PM - 11:00 PM");
    });

    it("should format time range for overnight event", () => {
      const range = getEventTimeRange("2025-02-01", "22:00", "04:00");
      expect(range).toBe("Feb 1, 2025 • 10:00 PM - Feb 2, 2025 • 4:00 AM");
    });
  });
});
```

## Step 2: Run Tests to Confirm They Fail

```bash
pnpm test eventDuration.test.ts
```

Output:

```
❌ All tests fail because the functions don't exist yet
```

## Step 3: GREEN - Implement Minimal Code to Pass

Create the implementation file:

```typescript
// apps/next-app/app/utils/eventDuration.ts

/**
 * Calculate event duration in hours
 */
export function calculateEventDuration(
  startTime: string,
  endTime: string,
): number {
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  // Validate time format
  if (startHour > 23 || endHour > 23 || startMin > 59 || endMin > 59) {
    throw new Error("Invalid time format");
  }

  let startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;

  // Handle overnight events
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60; // Add 24 hours
  }

  return (endMinutes - startMinutes) / 60;
}

/**
 * Format duration for display
 */
export function formatDuration(hours: number): string {
  if (hours === 0) return "0 minutes";

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (wholeHours === 0) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }

  if (minutes === 0) {
    return `${wholeHours} hour${wholeHours !== 1 ? "s" : ""}`;
  }

  return `${wholeHours} hour${wholeHours !== 1 ? "s" : ""} ${minutes} minute${minutes !== 1 ? "s" : ""}`;
}

/**
 * Check if event runs overnight
 */
export function isOvernightEvent(startTime: string, endTime: string): boolean {
  const [startHour] = startTime.split(":").map(Number);
  const [endHour] = endTime.split(":").map(Number);

  return endHour < startHour;
}

/**
 * Get formatted event time range
 */
export function getEventTimeRange(
  date: string,
  startTime: string,
  endTime: string,
): string {
  const eventDate = new Date(date);
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  const startDate = new Date(eventDate);
  startDate.setHours(startHour, startMin);

  const endDate = new Date(eventDate);
  endDate.setHours(endHour, endMin);

  // If overnight, add a day to end date
  if (isOvernightEvent(startTime, endTime)) {
    endDate.setDate(endDate.getDate() + 1);
  }

  const formatDate = (d: Date) => {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (formatDate(startDate) === formatDate(endDate)) {
    return `${formatDate(startDate)} • ${formatTime(startDate)} - ${formatTime(endDate)}`;
  }

  return `${formatDate(startDate)} • ${formatTime(startDate)} - ${formatDate(endDate)} • ${formatTime(endDate)}`;
}
```

## Step 4: Run Tests Again

```bash
pnpm test eventDuration.test.ts
```

Output:

```
✅ All tests pass!
```

## Step 5: REFACTOR - Improve Code Quality

Now that tests pass, refactor for better code quality:

```typescript
// apps/next-app/app/utils/eventDuration.ts (Refactored)

// Constants
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MAX_HOUR = 23;
const MAX_MINUTE = 59;

// Types
interface Time {
  hours: number;
  minutes: number;
}

/**
 * Parse time string into Time object
 */
function parseTime(timeString: string): Time {
  const [hours, minutes] = timeString.split(":").map(Number);

  if (hours > MAX_HOUR || minutes > MAX_MINUTE || hours < 0 || minutes < 0) {
    throw new Error("Invalid time format");
  }

  return { hours, minutes };
}

/**
 * Convert Time to total minutes
 */
function timeToMinutes(time: Time): number {
  return time.hours * MINUTES_PER_HOUR + time.minutes;
}

/**
 * Calculate event duration in hours
 */
export function calculateEventDuration(
  startTime: string,
  endTime: string,
): number {
  const start = parseTime(startTime);
  const end = parseTime(endTime);

  let startMinutes = timeToMinutes(start);
  let endMinutes = timeToMinutes(end);

  // Handle overnight events
  if (endMinutes < startMinutes) {
    endMinutes += HOURS_PER_DAY * MINUTES_PER_HOUR;
  }

  return (endMinutes - startMinutes) / MINUTES_PER_HOUR;
}

/**
 * Format duration for display
 */
export function formatDuration(hours: number): string {
  if (hours === 0) return "0 minutes";

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * MINUTES_PER_HOUR);

  const parts: string[] = [];

  if (wholeHours > 0) {
    parts.push(`${wholeHours} ${pluralize("hour", wholeHours)}`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} ${pluralize("minute", minutes)}`);
  }

  return parts.join(" ");
}

/**
 * Helper to pluralize words
 */
function pluralize(word: string, count: number): string {
  return count === 1 ? word : `${word}s`;
}

/**
 * Check if event runs overnight
 */
export function isOvernightEvent(startTime: string, endTime: string): boolean {
  const start = parseTime(startTime);
  const end = parseTime(endTime);

  return timeToMinutes(end) < timeToMinutes(start);
}

/**
 * Get formatted event time range
 */
export function getEventTimeRange(
  date: string,
  startTime: string,
  endTime: string,
): string {
  const eventDate = new Date(date);
  const start = parseTime(startTime);
  const end = parseTime(endTime);

  const startDateTime = createDateTime(eventDate, start);
  const endDateTime = createDateTime(
    eventDate,
    end,
    isOvernightEvent(startTime, endTime),
  );

  const startFormatted = formatDateTime(startDateTime);
  const endFormatted = formatDateTime(endDateTime);

  if (startFormatted.date === endFormatted.date) {
    return `${startFormatted.date} • ${startFormatted.time} - ${endFormatted.time}`;
  }

  return `${startFormatted.date} • ${startFormatted.time} - ${endFormatted.date} • ${endFormatted.time}`;
}

/**
 * Create DateTime from date and time
 */
function createDateTime(date: Date, time: Time, addDay = false): Date {
  const dateTime = new Date(date);
  dateTime.setHours(time.hours, time.minutes, 0, 0);

  if (addDay) {
    dateTime.setDate(dateTime.getDate() + 1);
  }

  return dateTime;
}

/**
 * Format DateTime for display
 */
function formatDateTime(dateTime: Date): { date: string; time: string } {
  return {
    date: dateTime.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: dateTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}
```

## Step 6: Run Tests After Refactoring

```bash
pnpm test eventDuration.test.ts
```

Output:

```
✅ All tests still pass after refactoring!
```

## Step 7: Add Edge Case Tests

After refactoring, add more edge case tests:

```typescript
// Additional tests to add
describe("Edge Cases", () => {
  it("should handle 24-hour event", () => {
    const duration = calculateEventDuration("00:00", "00:00");
    expect(duration).toBe(24);
  });

  it("should handle partial hours correctly", () => {
    const duration = calculateEventDuration("18:30", "21:15");
    expect(duration).toBeCloseTo(2.75, 2);
  });

  it("should format partial minutes correctly", () => {
    expect(formatDuration(1.25)).toBe("1 hour 15 minutes");
  });
});
```

## Integration with React Component

Once the utility functions are tested and working, use them in components:

```typescript
// apps/next-app/app/components/EventCard.tsx
import * as React from 'react'
import { Card } from '@rite/ui'
import { calculateEventDuration, formatDuration, getEventTimeRange } from '@/utils/eventDuration'

interface EventCardProps {
  event: {
    name: string
    date: string
    startTime: string
    endTime: string
    venue: string
  }
}

export function EventCard({ event }: EventCardProps) {
  const duration = calculateEventDuration(event.startTime, event.endTime)
  const timeRange = getEventTimeRange(event.date, event.startTime, event.endTime)

  return (
    <Card>
      <h3>{event.name}</h3>
      <p>{event.venue}</p>
      <p>{timeRange}</p>
      <p>Duration: {formatDuration(duration)}</p>
    </Card>
  )
}
```

## Component Test

Test the component using the tested utilities:

```typescript
// apps/next-app/__tests__/components/EventCard.test.tsx
import { render, screen } from '@testing-library/react'
import { EventCard } from '@/components/EventCard'

describe('EventCard', () => {
  const mockEvent = {
    name: 'Summer Rave',
    date: '2025-07-15',
    startTime: '22:00',
    endTime: '04:00',
    venue: 'Club Octagon'
  }

  it('should display event duration', () => {
    render(<EventCard event={mockEvent} />)
    expect(screen.getByText(/Duration: 6 hours/)).toBeInTheDocument()
  })

  it('should display overnight time range', () => {
    render(<EventCard event={mockEvent} />)
    expect(screen.getByText(/10:00 PM - Jul 16, 2025/)).toBeInTheDocument()
  })
})
```

## Key TDD Lessons

1. **Tests First**: Always write tests before implementation
2. **Small Steps**: Write one test, make it pass, then refactor
3. **Clear Names**: Test names should describe the behavior
4. **Edge Cases**: Add edge case tests after basic functionality works
5. **Refactor Safely**: Tests protect you during refactoring
6. **Component Testing**: Use tested utilities in components
7. **Coverage**: Aim for high coverage on business logic

## Benefits Observed

- ✅ Clear requirements before coding
- ✅ Confidence during refactoring
- ✅ Documentation through tests
- ✅ Catch edge cases early
- ✅ Better code design
- ✅ Regression prevention
