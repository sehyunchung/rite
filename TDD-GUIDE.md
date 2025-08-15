# Test-Driven Development (TDD) Guide for RITE

## Core Principle: Red → Green → Refactor

This repository follows strict TDD practices. **Write tests first, then implementation, then refactor.**

## The TDD Cycle

### 1. RED Phase - Write a Failing Test

```typescript
// ❌ Start with a test that fails
it('should calculate event duration correctly', () => {
  const duration = calculateEventDuration('2025-01-01T18:00', '2025-01-02T04:00');
  expect(duration).toBe('10 hours');
});
```

### 2. GREEN Phase - Make It Pass (Minimal Code)

```typescript
// ✅ Write just enough code to pass
export function calculateEventDuration(start: string, end: string): string {
  const hours = (new Date(end).getTime() - new Date(start).getTime()) / 3600000;
  return `${hours} hours`;
}
```

### 3. REFACTOR Phase - Improve Without Breaking

```typescript
// ♻️ Refactor for clarity and maintainability
export function calculateEventDuration(startTime: string | Date, endTime: string | Date): string {
  const start = startTime instanceof Date ? startTime : new Date(startTime);
  const end = endTime instanceof Date ? endTime : new Date(endTime);

  const durationMs = end.getTime() - start.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));

  return hours === 1 ? '1 hour' : `${hours} hours`;
}
```

## Project-Specific TDD Practices

### 1. Component Development (React/Next.js)

**ALWAYS start with a test file:**

```typescript
// apps/next-app/__tests__/components/EventCard.test.tsx
import { render, screen } from '@testing-library/react'
import { EventCard } from '@/components/EventCard'

describe('EventCard', () => {
  it('should display event name', () => {
    render(<EventCard event={{ name: 'Summer Rave' }} />)
    expect(screen.getByText('Summer Rave')).toBeInTheDocument()
  })
})
```

### 2. Convex Functions (Backend)

**Test database operations first:**

```typescript
// packages/backend/__tests__/events.test.ts
import { test, expect } from 'vitest';
import { ConvexTestingHelper } from '@convex-dev/testing';
import schema from '../convex/schema';

test('should create event with timeslots', async () => {
  const t = new ConvexTestingHelper(schema);

  const eventId = await t.mutation('events.create', {
    name: 'Test Event',
    date: '2025-02-01',
    slots: 3,
  });

  const event = await t.query('events.get', { id: eventId });
  expect(event.timeslots).toHaveLength(3);
});
```

### 3. Mobile Components (React Native)

**Test behavior, not implementation:**

```typescript
// apps/mobile/__tests__/screens/Login.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { LoginScreen } from '@/screens/LoginScreen'

describe('LoginScreen', () => {
  it('should show error for invalid credentials', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />)

    fireEvent.changeText(getByPlaceholderText('Email'), 'invalid')
    fireEvent.press(getByText('Sign In'))

    await waitFor(() => {
      expect(getByText('Invalid email format')).toBeTruthy()
    })
  })
})
```

## TDD Commands

### Running Tests

```bash
# Run all tests once
pnpm test

# Watch mode (recommended during development)
pnpm test:watch

# Coverage report
pnpm test:coverage

# Interactive UI
pnpm test:ui

# Specific workspace
pnpm --filter=next-app test:watch
pnpm --filter=@rite/backend test:watch
pnpm --filter=mobile test:watch
```

### Test File Naming Conventions

- Unit tests: `*.test.ts(x)`
- Integration tests: `*.spec.ts(x)`
- E2E tests: `*.e2e.ts(x)`
- Visual tests: `*.visual.ts(x)`

## TDD Workflow Examples

### Example 1: Adding a New Feature

```bash
# 1. Create test file first
touch apps/next-app/__tests__/features/GuestListExport.test.tsx

# 2. Write failing tests
# 3. Run tests to see them fail
pnpm test:watch

# 4. Implement feature
# 5. Tests turn green
# 6. Refactor if needed
```

### Example 2: Fixing a Bug

```bash
# 1. Write a test that reproduces the bug
# 2. Run test - it should fail
# 3. Fix the bug
# 4. Test passes
# 5. Add edge case tests
```

### Example 3: Refactoring Existing Code

```bash
# 1. Ensure existing tests pass
pnpm test

# 2. Add missing test coverage if needed
# 3. Refactor code
# 4. Tests should still pass
# 5. Commit with confidence
```

## Testing Utilities

### Custom Test Helpers

```typescript
// test-utils/render.tsx
import { render as rtlRender } from '@testing-library/react'
import { ConvexProvider } from 'convex/react'
import { mockConvex } from './mock-convex'

export function renderWithProviders(ui: React.ReactElement) {
  return rtlRender(
    <ConvexProvider client={mockConvex}>
      {ui}
    </ConvexProvider>
  )
}
```

### Test Data Factories

```typescript
// test-utils/factories.ts
export const createMockEvent = (overrides = {}) => ({
  _id: 'event_123',
  name: 'Test Event',
  date: '2025-02-01',
  venue: 'Test Venue',
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  _id: 'user_123',
  email: 'test@example.com',
  name: 'Test User',
  ...overrides,
});
```

## Test Categories

### 1. Unit Tests

- Single function/component
- No external dependencies
- Fast execution
- Run frequently

### 2. Integration Tests

- Multiple components together
- May use test database
- Medium speed
- Run before commits

### 3. E2E Tests

- Full user flows
- Real browser/app
- Slower execution
- Run before releases

### 4. Visual Regression Tests

- UI consistency
- Screenshot comparisons
- Theme testing
- Run on UI changes

## Best Practices

### DO ✅

1. **Write test first** - No exceptions
2. **Test behavior, not implementation**
3. **Keep tests simple and readable**
4. **Use descriptive test names**
5. **Follow AAA pattern** (Arrange, Act, Assert)
6. **Test edge cases and errors**
7. **Maintain test independence**
8. **Use data-testid for reliable queries**

### DON'T ❌

1. **Don't write code without tests**
2. **Don't test implementation details**
3. **Don't use random/time-dependent data**
4. **Don't skip tests** (use .skip sparingly)
5. **Don't mock everything**
6. **Don't write brittle selectors**
7. **Don't ignore failing tests**
8. **Don't commit with broken tests**

## Coverage Requirements

### Minimum Coverage Targets

- **Overall**: 80%
- **New code**: 90%
- **Critical paths**: 95%
- **UI Components**: 70%
- **Business logic**: 90%
- **Utilities**: 100%

### Coverage Reports

```bash
# Generate coverage report
pnpm test:coverage

# View HTML report
open coverage/index.html
```

## TDD for Different Scenarios

### API Endpoints

```typescript
// Test first
describe('POST /api/events', () => {
  it('should validate required fields', async () => {
    const response = await request(app).post('/api/events').send({ name: '' });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Name is required');
  });
});
```

### Form Validation

```typescript
// Test first
describe('EventForm validation', () => {
  it('should require future date', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const result = validateEventDate(yesterday);
    expect(result.error).toBe('Event date must be in the future');
  });
});
```

### State Management

```typescript
// Test first
describe('AuthContext', () => {
  it('should persist session across refreshes', async () => {
    const { result, rerender } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
    });

    rerender();
    expect(result.current.user).toBeDefined();
  });
});
```

## Continuous Integration

### Pre-commit Hook (Coming Soon)

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "pnpm test:affected"
    }
  }
}
```

### GitHub Actions Integration

```yaml
- name: Run Tests
  run: |
    pnpm test
    pnpm test:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

## Resources

### Internal

- [Example TDD Implementation](/docs/examples/tdd-example.md)
- [Testing Best Practices](/docs/testing-best-practices.md)
- [Mock Data Guide](/docs/mock-data.md)

### External

- [Testing Library Docs](https://testing-library.com/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [TDD by Example - Kent Beck](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)

## Getting Help

- Check existing tests for patterns
- Run `pnpm test:ui` for interactive debugging
- Ask in team chat with #tdd tag
- Review failed CI test logs

---

**Remember: If you're not doing TDD, you're doing it wrong. Red → Green → Refactor.**
