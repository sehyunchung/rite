/**
 * RITE Design System Colors
 * Dark-first color palette for mobile app
 */

import { colors } from '@rite/ui/design-tokens/colors';

// RITE is dark-first, so we use dark colors for both themes
export const Colors = {
  light: {
    text: colors.neutral[800],
    background: colors.neutral[50],
    tint: colors.brand.primary,
    icon: colors.neutral[600],
    tabIconDefault: colors.neutral[600],
    tabIconSelected: colors.brand.primary,
  },
  dark: {
    text: colors.functional.textPrimary,
    background: colors.neutral[800],
    surface: colors.neutral[700],
    tint: colors.brand.primary,
    icon: colors.functional.textSecondary,
    tabIconDefault: colors.functional.textSecondary,
    tabIconSelected: colors.brand.primary,
    border: colors.functional.border,
  },
};

// Export individual colors for easy access
export const riteColors = colors;
