# TanStack Router Migration Plan

## Overview

Migration plan to replace the current state-based routing system with TanStack Router for improved URL management, type safety, and data loading patterns in the DJ Event Booking System.

## Current State Analysis

### Existing Routing Architecture
- **File**: `src/App.tsx`
- **Method**: State-based navigation with `currentPage` state
- **Pages**: `dashboard`, `create-event`, `dj-submission`
- **Token Handling**: Manual URL parameter parsing for DJ submission tokens
- **Navigation**: Button clicks update state, causing re-renders

### Pain Points to Solve
1. Form data lost on browser refresh
2. Manual token extraction from URL parameters
3. No URL state persistence
4. Loading states scattered across components
5. No route-level error boundaries
6. Difficult to implement protected routes (needed for Phase 3)

## Migration Strategy

### Phase 1: Foundation Setup (2-3 hours)

#### 1.1 Install Dependencies
```bash
npm install @tanstack/react-router
npm install -D @tanstack/router-vite-plugin @tanstack/router-devtools
```

#### 1.2 Configure Vite Plugin
- Update `vite.config.ts` to include TanStack Router plugin
- Enable route generation and type safety

#### 1.3 Create Route Tree Structure
```
src/routes/
├── __root.tsx          # Root layout with navigation
├── index.tsx           # Dashboard route (/)
├── events/
│   └── create.tsx      # Event creation (/events/create)
└── dj-submission.tsx   # DJ submission with token search param
```

#### 1.4 Create Root Route
- Move common layout elements from App.tsx
- Include error boundaries and loading states
- Set up Convex provider context

#### 1.5 Create Router Instance
- Set up router with route tree
- Configure history management
- Add development tools integration

### Phase 2: Basic Route Migration (1-2 hours)

#### 2.1 Dashboard Route (`/`)
- Migrate current dashboard page logic
- Keep existing hero section and action buttons
- Update navigation to use TanStack Router's `Link` component

#### 2.2 Event Creation Route (`/events/create`)
- Move `EventCreationForm` component to route
- Add route-level navigation guards
- Implement proper back navigation

#### 2.3 Update Navigation Components
- Replace state-based navigation in components
- Use `useNavigate` hook instead of `setCurrentPage`
- Update all button click handlers

### Phase 3: Advanced Token Handling (1-2 hours)

#### 3.1 DJ Submission Route (`/dj-submission`)
- Implement search parameter validation for token
- Add route-level data loader for token validation
- Create error component for invalid tokens

#### 3.2 Token Flow Enhancement
```typescript
// Route definition with validation
const djSubmissionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dj-submission',
  validateSearch: (search: Record<string, unknown>) => ({
    token: search.token as string
  }),
  loader: async ({ search, context }) => {
    const { token } = search
    if (!token) throw new Error('Submission token required')
    
    const timeslot = await context.convex.query(
      api.timeslots.getTimeslotByToken, 
      { token }
    )
    
    if (!timeslot) throw new Error('Invalid submission token')
    return timeslot
  },
  errorComponent: InvalidTokenError,
})
```

#### 3.3 Remove Manual Token Parsing
- Delete URL parameter parsing logic from App.tsx
- Update DJSubmissionForm to use route data
- Clean up useEffect dependencies

### Phase 4: Enhanced User Experience (1 hour)

#### 4.1 Loading States
- Implement route-level loading components
- Remove component-level loading states where appropriate
- Add skeleton loading for better UX

#### 4.2 Error Boundaries
- Create route-specific error components
- Handle network errors gracefully
- Provide recovery actions for users

#### 4.3 URL State Management
- Persist form state in URL search parameters where appropriate
- Enable browser back/forward navigation
- Maintain deep linking capability

### Phase 5: Future-Proofing (30 minutes)

#### 5.1 Authentication Structure
- Set up route groups for protected routes
- Create authentication context
- Prepare middleware hooks for auth checks

#### 5.2 Nested Routes Preparation
```
src/routes/
├── __root.tsx
├── index.tsx
├── events/
│   ├── index.tsx       # Event listing (future)
│   ├── create.tsx      # Event creation
│   └── $eventId/       # Individual event management (future)
│       ├── index.tsx
│       └── edit.tsx
├── admin/              # Protected admin routes (future)
│   ├── _layout.tsx
│   └── dashboard.tsx
└── dj-submission.tsx
```

## Implementation Details

### File Structure Changes

#### New Files to Create
```
src/routes/
├── __root.tsx
├── index.tsx
├── events/
│   └── create.tsx
└── dj-submission.tsx

src/components/
├── layouts/
│   └── RootLayout.tsx
└── errors/
    ├── InvalidTokenError.tsx
    └── GeneralError.tsx

src/lib/
└── router.ts
```

#### Files to Modify
- `src/App.tsx` - Remove routing logic, keep providers
- `src/main.tsx` - Update to use RouterProvider
- `vite.config.ts` - Add TanStack Router plugin
- `src/components/EventCreationForm.tsx` - Update navigation calls
- `src/components/DJSubmissionForm.tsx` - Use route data instead of props

#### Files to Delete
- None (existing components will be reused)

### Type Safety Improvements

#### Route Parameters
```typescript
// Instead of manual parsing
const token = new URLSearchParams(window.location.search).get('token')

// Type-safe route params
const { token } = Route.useSearch() // fully typed
```

#### Navigation
```typescript
// Instead of state updates
setCurrentPage('create-event')

// Type-safe navigation
navigate({ to: '/events/create' })
```

### Data Loading Strategy

#### Current Pattern
```typescript
// Component-level loading
useEffect(() => {
  if (token) {
    setLoading(true)
    convex.query(api.timeslots.getTimeslotByToken, { token })
      .then(setData)
      .finally(() => setLoading(false))
  }
}, [token])
```

#### New Pattern
```typescript
// Route-level loading
const data = Route.useLoaderData() // automatically loaded and typed
```

## Testing Strategy

### Phase 1 Testing
- Verify all routes render correctly
- Test navigation between routes
- Confirm Convex integration works

### Phase 2 Testing
- Test form submissions still work
- Verify error boundaries catch errors
- Test browser back/forward navigation

### Phase 3 Testing
- Test token-based URLs thoroughly
- Verify invalid token handling
- Test direct URL access to submission forms

### Phase 4 Testing
- Test loading states across all routes
- Verify error recovery flows
- Test URL state persistence

## Risk Mitigation

### Backup Strategy
- Create feature branch for migration
- Keep current routing as fallback
- Incremental deployment approach

### Rollback Plan
- Git branch with working state-based routing
- Feature flag to switch between routing systems
- Database operations remain unchanged

### Testing Checklist
- [ ] All existing user flows work identically
- [ ] Token-based submission URLs function correctly
- [ ] Form data validation remains intact
- [ ] Convex integration operates properly
- [ ] Error handling provides good UX
- [ ] Loading states appear consistently
- [ ] Browser navigation works as expected

## Success Metrics

### User Experience
- ✅ URLs reflect application state
- ✅ Browser back/forward navigation works
- ✅ Direct links to submission forms work
- ✅ Form data persists during navigation
- ✅ Loading states improve perceived performance

### Developer Experience
- ✅ Type-safe routing throughout application
- ✅ Centralized route configuration
- ✅ Better error debugging with route-level boundaries
- ✅ Simplified data loading patterns
- ✅ Foundation for authentication system

### Technical Benefits
- ✅ Reduced component complexity
- ✅ Better separation of concerns
- ✅ Improved bundle splitting opportunities
- ✅ Enhanced SEO potential (future)
- ✅ Professional URL structure for demos

## Timeline

### Week 1: Foundation
- Day 1-2: Phase 1 (Setup and basic structure)
- Day 3: Phase 2 (Route migration)

### Week 2: Enhancement
- Day 1: Phase 3 (Token handling)
- Day 2: Phase 4 (UX improvements)
- Day 3: Phase 5 (Future-proofing) + Testing

### Total Estimated Effort: 6-8 hours of development time

## Next Steps

1. Review and approve this migration plan
2. Create feature branch: `feature/tanstack-router-migration`
3. Begin Phase 1 implementation
4. Test thoroughly at each phase
5. Deploy incrementally with feature flags if needed

## Notes

- This migration enhances the foundation for Phase 3 features
- Authentication and protected routes will be much easier to implement
- URL structure becomes professional and shareable
- Developer experience improves significantly
- No breaking changes to existing database schema or API functions