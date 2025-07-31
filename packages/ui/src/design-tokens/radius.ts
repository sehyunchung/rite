// RITE Design System - Border Radius Tokens
// Platform-agnostic border radius definitions

export const radius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const

export type RadiusToken = keyof typeof radius
export type RadiusValue = typeof radius[RadiusToken]

// Component-specific radius patterns
export const radiusPatterns = {
  // Buttons
  button: radius.md,
  buttonSmall: radius.sm,
  buttonLarge: radius.lg,
  
  // Cards
  card: radius.xl,
  cardSmall: radius.lg,
  
  // Inputs
  input: radius.lg,
  inputSmall: radius.md,
  
  // Modals/Dialogs
  modal: radius['2xl'],
  
  // Pills/Badges
  pill: radius.full,
  badge: radius.md,
  
  // Bottom sheets
  bottomSheet: radius['2xl'],
} as const