// RITE Design System - Spacing Tokens
// Platform-agnostic spacing scale

export const spacing = {
  0: 0,
  px: 1,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
  72: 288,
  80: 320,
  96: 384,
} as const

export type SpacingToken = keyof typeof spacing
export type SpacingValue = typeof spacing[SpacingToken]

// Common spacing patterns
export const spacingPatterns = {
  // Component padding
  componentPaddingSmall: spacing[2],
  componentPaddingMedium: spacing[4],
  componentPaddingLarge: spacing[6],
  
  // Layout spacing
  layoutSpacingSmall: spacing[4],
  layoutSpacingMedium: spacing[8],
  layoutSpacingLarge: spacing[12],
  
  // Screen padding
  screenPaddingSmall: spacing[4],
  screenPaddingMedium: spacing[6],
  screenPaddingLarge: spacing[8],
  
  // List item spacing
  listItemGap: spacing[3],
  listSectionGap: spacing[8],
  
  // Form spacing
  formFieldGap: spacing[6],
  formSectionGap: spacing[10],
  
  // Card spacing
  cardPadding: spacing[6],
  cardGap: spacing[4],
} as const