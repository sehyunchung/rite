/**
 * RITE Design System Colors
 * Dark-first color palette for mobile app
 * Using Josh Comeau theme static values
 */

// Josh Comeau theme static values for mobile
const joshComeauColors = {
  brand: {
    primary: 'hsl(225 100% 75%)',      // #7C7CFF
    primaryDark: 'hsl(225 100% 60%)',  // #5C5CFF
    primaryLight: 'hsl(225 100% 85%)', // #9C9CFF
  },
  neutral: {
    0: 'hsl(210 25% 96%)',     // #F5F5F8
    50: 'hsl(210 25% 88%)',    // #DDDDE5
    100: 'hsl(210 20% 77%)',   // #C4C4D1
    200: 'hsl(210 14% 66%)',   // #A8A8BD
    300: 'hsl(210 12% 55%)',   // #8C8CA3
    400: 'hsl(210 8% 50%)',    // #70707F
    500: 'hsl(210 9% 40%)',    // #616166
    600: 'hsl(210 10% 30%)',   // #47474D
    700: 'hsl(210 15% 18%)',   // #26262E
    800: 'hsl(210 15% 12%)',   // #1A1A1F
    900: 'hsl(210 15% 6%)',    // #0F0F10
  },
  semantic: {
    success: 'hsl(160 100% 40%)',  // #00CC66
    warning: 'hsl(40 100% 50%)',   // #FFCC00
    error: 'hsl(340 95% 60%)',     // #FF3366
    info: 'hsl(225 100% 80%)',     // #9999FF
  },
  functional: {
    textPrimary: 'hsl(210 10% 90%)',     // #E0E0E6
    textSecondary: 'hsl(210 12% 55%)',   // #8C8CA3
    textMuted: 'hsl(210 8% 50%)',        // #70707F
    border: 'hsl(210 15% 18%)',          // #26262E
  },
};

// RITE is dark-first, so we use dark colors for both themes
export const Colors = {
  light: {
    text: joshComeauColors.neutral[800],
    background: joshComeauColors.neutral[50],
    tint: joshComeauColors.brand.primary,
    icon: joshComeauColors.neutral[600],
    tabIconDefault: joshComeauColors.neutral[600],
    tabIconSelected: joshComeauColors.brand.primary,
  },
  dark: {
    text: joshComeauColors.functional.textPrimary,
    background: joshComeauColors.neutral[800],
    surface: joshComeauColors.neutral[700],
    tint: joshComeauColors.brand.primary,
    icon: joshComeauColors.functional.textSecondary,
    tabIconDefault: joshComeauColors.functional.textSecondary,
    tabIconSelected: joshComeauColors.brand.primary,
    border: joshComeauColors.functional.border,
  },
};

// Export individual colors for easy access
export const riteColors = joshComeauColors;
