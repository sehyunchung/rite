/**
 * RITE Layout Constants
 * Consistent spacing and sizing to match web design patterns
 */

export const layout = {
  // Screen padding
  screenPadding: 24, // matches web's p-6
  
  // Component heights
  inputHeight: 48, // matches web's h-12
  buttonHeight: 48, // matches web's h-12
  buttonHeightSmall: 40, // matches web's h-10
  buttonHeightLarge: 56, // matches web's h-14
  
  // Border radius (matches web's Tailwind classes)
  radiusXs: 2,   // rounded-xs
  radiusSm: 4,   // rounded-sm
  radiusMd: 8,   // rounded-md
  radiusLg: 12,  // rounded-lg
  radiusXl: 16,  // rounded-xl (cards)
  radius2xl: 24, // rounded-2xl
  radiusFull: 9999, // rounded-full
  
  // Common radius usage
  buttonRadius: 8,  // rounded-lg for buttons
  inputRadius: 12,  // rounded-lg for inputs
  cardRadius: 16,   // rounded-xl for cards
  
  // Spacing scale (4px base)
  spacing: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
  },
  
  // Component padding
  cardPadding: 24,      // p-6
  buttonPaddingX: 24,   // px-6
  buttonPaddingY: 12,   // py-3
  inputPaddingX: 16,    // px-4
  inputPaddingY: 12,    // py-3
  
  // Section spacing
  sectionSpacing: 32,    // space-y-8
  formFieldSpacing: 16,  // space-y-4
  cardItemSpacing: 16,   // space between cards
} as const;