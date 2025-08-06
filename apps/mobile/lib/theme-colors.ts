/**
 * Theme color values for React Native components that require explicit colors
 * These are the resolved color values from the design system
 * Use these only when Tailwind classes cannot be used (e.g., ActivityIndicator)
 */

// Josh Comeau theme colors from the design system
export const themeColors = {
  brand: {
    primary: 'hsl(225, 100%, 75%)',      // #7C7CFF
    primaryDark: 'hsl(225, 100%, 60%)',  // #5C5CFF
    primaryLight: 'hsl(225, 100%, 85%)', // #9C9CFF
  },
  neutral: {
    800: 'hsl(210, 15%, 12%)',   // #1A1A1F
    700: 'hsl(210, 15%, 18%)',   // #26262E
    600: 'hsl(210, 10%, 30%)',   // #47474D
    400: 'hsl(210, 8%, 50%)',    // #70707F
    300: 'hsl(210, 12%, 55%)',   // #8C8CA3
  },
  text: {
    primary: 'hsl(210, 10%, 90%)',      // #E0E0E6
    secondary: 'hsl(210, 12%, 55%)',    // #8C8CA3
  },
  semantic: {
    error: 'hsl(340, 95%, 60%)',     // #FF3366
  }
} as const;

// Helper to convert HSL to hex if needed by some components
export function hslToHex(hsl: string): string {
  // For now, return the known hex values
  const hslToHexMap: Record<string, string> = {
    'hsl(225, 100%, 75%)': '#7C7CFF',
    'hsl(225, 100%, 60%)': '#5C5CFF',
    'hsl(225, 100%, 85%)': '#9C9CFF',
    'hsl(210, 10%, 90%)': '#E0E0E6',
    'hsl(210, 12%, 55%)': '#8C8CA3',
    'hsl(340, 95%, 60%)': '#FF3366',
  };
  return hslToHexMap[hsl] || hsl;
}