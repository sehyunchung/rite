// RITE Design System - All Alternative Themes Collection
// Consolidates all theme options in one place

// Import existing theme systems
import { colorsRefined } from './colors-refined';
import { lightThemes } from './light-themes';

export const alternativeThemes = {
  // Original RITE refined (dark)
  riteRefined: {
    name: 'RITE Refined',
    description: 'Improved readability version of original RITE theme',
    type: 'dark' as const,
    brand: {
      primary: 'hsl(293deg 100% 66%)',      // #F055FF
      primaryDark: 'hsl(293deg 100% 58%)',  // #E030F5
      primaryLight: 'hsl(293deg 100% 72%)', // #F570FF
    },
    neutral: {
      0: 'hsl(235deg 60% 98%)',     // #FAFAFC
      50: 'hsl(235deg 60% 97%)',    // #FAFAFC
      100: 'hsl(235deg 25% 93%)',   // #EDEDF2
      200: 'hsl(235deg 20% 86%)',   // #DCDCE4
      300: 'hsl(235deg 15% 75%)',   // #B8B8C6
      400: 'hsl(235deg 12% 63%)',   // #9090A3
      500: 'hsl(235deg 10% 50%)',   // #6B6B80
      600: 'hsl(235deg 12% 37%)',   // #48485E
      700: 'hsl(254deg 25% 25%)',   // #32284A
      800: 'hsl(254deg 35% 15%)',   // #1A1230
      900: 'hsl(254deg 40% 8%)',    // #0D0818
    },
    semantic: {
      success: 'hsl(152deg 68% 62%)',  // #52E896
      warning: 'hsl(45deg 100% 62%)',  // #FFD23F
      error: 'hsl(0deg 75% 67%)',      // #FF5B5B
      info: 'hsl(218deg 100% 69%)',    // #5B9EFF
    },
    functional: {
      textPrimary: 'hsl(0deg 0% 100%)',       // #FFFFFF
      textSecondary: 'hsl(235deg 15% 75%)',   // #B8B8C6
      textMuted: 'hsl(235deg 12% 63%)',       // #9090A3
      textDisabled: 'hsl(235deg 10% 50%)',    // #6B6B80
      textInverse: 'hsl(254deg 40% 8%)',      // #0D0818
      
      border: 'hsl(254deg 25% 25%)',          // #32284A
      borderStrong: 'hsl(235deg 12% 37%)',    // #48485E
      borderSubtle: 'hsl(254deg 25% 25%)',    // #32284A
      
      divider: 'hsl(235deg 12% 37%)',         // #48485E
      overlay: 'hsl(254deg 40% 8% / 0.8)',    // #0D0818CC
      
      backgroundElevated: 'hsl(235deg 12% 37%)', // #48485E
      backgroundSubtle: 'hsl(254deg 30% 20%)',   // #251D3D
    },
    interactive: {
      hover: 'hsl(293deg 100% 66% / 0.1)',
      active: 'hsl(293deg 100% 66% / 0.15)',
      focus: 'hsl(293deg 100% 66%)',
      disabled: 'hsl(235deg 12% 37%)',
    },
    accent: 'hsl(293deg 100% 72%)',  // #F570FF
  },

  // Deep Ocean (dark)
  oceanDepth: {
    name: 'Deep Ocean',
    description: 'Mysterious deep sea palette with bioluminescent accents',
    type: 'dark' as const,
    brand: {
      primary: 'hsl(201deg 100% 30%)',      // #006994
      primaryDark: 'hsl(201deg 100% 22%)',  // #004D70
      primaryLight: 'hsl(201deg 100% 37%)', // #0088BB
    },
    neutral: {
      0: 'hsl(195deg 100% 98%)',     // #F8FDFF
      50: 'hsl(195deg 100% 95%)',    // #E6F7FF
      100: 'hsl(195deg 78% 91%)',    // #D1EDFA
      200: 'hsl(195deg 64% 82%)',    // #B3DCF0
      300: 'hsl(195deg 58% 69%)',    // #7FC3E3
      400: 'hsl(195deg 47% 56%)',    // #4BA3CF
      500: 'hsl(195deg 60% 44%)',    // #2B7FB3
      600: 'hsl(201deg 65% 32%)',    // #1A5E8A
      700: 'hsl(201deg 73% 22%)',    // #0F3F5F
      800: 'hsl(201deg 63% 13%)',    // #082436
      900: 'hsl(201deg 63% 6%)',     // #04141F
    },
    semantic: {
      success: 'hsl(158deg 64% 52%)',  // #10B981
      warning: 'hsl(43deg 96% 56%)',   // #FBBF24
      error: 'hsl(0deg 84% 69%)',      // #F87171
      info: 'hsl(199deg 89% 64%)',     // #38BDF8
    },
    functional: {
      textPrimary: 'hsl(195deg 100% 98%)',    // #F8FDFF
      textSecondary: 'hsl(195deg 58% 69%)',   // #7FC3E3
      textMuted: 'hsl(195deg 47% 56%)',       // #4BA3CF
      textDisabled: 'hsl(195deg 60% 44%)',    // #2B7FB3
      textInverse: 'hsl(201deg 63% 6%)',      // #04141F
      
      border: 'hsl(201deg 65% 32%)',          // #1A5E8A
      borderStrong: 'hsl(195deg 60% 44%)',    // #2B7FB3
      borderSubtle: 'hsl(201deg 73% 22%)',    // #0F3F5F
      
      divider: 'hsl(201deg 65% 32%)',         // #1A5E8A
      overlay: 'hsl(201deg 63% 6% / 0.8)',    // #04141FCC
      
      backgroundElevated: 'hsl(201deg 65% 32%)', // #1A5E8A
      backgroundSubtle: 'hsl(201deg 73% 22%)',   // #0F3F5F
    },
    interactive: {
      hover: 'hsl(201deg 100% 30% / 0.1)',
      active: 'hsl(201deg 100% 30% / 0.15)',
      focus: 'hsl(201deg 100% 30%)',
      disabled: 'hsl(201deg 65% 32%)',
    },
    accent: 'hsl(187deg 100% 44%)',  // #06B6D4
  },

  // Josh Comeau Inspired (dark)
  joshComeau: {
    name: 'Josh Comeau Inspired',
    description: 'Sophisticated dark theme with atmospheric gradients and vibrant accents',
    type: 'dark' as const,
    brand: {
      primary: 'hsl(225deg 100% 75%)',      // #7C7CFF
      primaryDark: 'hsl(225deg 100% 60%)',  // #5C5CFF
      primaryLight: 'hsl(225deg 100% 85%)', // #9C9CFF
    },
    neutral: {
      0: 'hsl(210deg 25% 96%)',     // #F5F5F8
      50: 'hsl(210deg 25% 88%)',    // #DDDDE5
      100: 'hsl(210deg 20% 77%)',   // #C4C4D1
      200: 'hsl(210deg 14% 66%)',   // #A8A8BD
      300: 'hsl(210deg 12% 55%)',   // #8C8CA3
      400: 'hsl(210deg 8% 50%)',    // #70707F
      500: 'hsl(210deg 9% 40%)',    // #616166
      600: 'hsl(210deg 10% 30%)',   // #47474D
      700: 'hsl(210deg 15% 18%)',   // #26262E
      800: 'hsl(210deg 15% 12%)',   // #1A1A1F
      900: 'hsl(210deg 15% 6%)',    // #0F0F10
    },
    semantic: {
      success: 'hsl(160deg 100% 40%)',  // #00CC66
      warning: 'hsl(40deg 100% 50%)',   // #FFCC00
      error: 'hsl(340deg 95% 60%)',     // #FF3366
      info: 'hsl(225deg 100% 80%)',     // #9999FF
    },
    functional: {
      textPrimary: 'hsl(210deg 10% 90%)',     // #E0E0E6
      textSecondary: 'hsl(210deg 12% 55%)',   // #8C8CA3
      textMuted: 'hsl(210deg 8% 50%)',        // #70707F
      textDisabled: 'hsl(210deg 10% 30%)',    // #47474D
      textInverse: 'hsl(210deg 15% 6%)',      // #0F0F10
      
      border: 'hsl(210deg 15% 18%)',          // #26262E
      borderStrong: 'hsl(210deg 10% 30%)',    // #47474D
      borderSubtle: 'hsl(210deg 15% 12%)',    // #1A1A1F
      
      divider: 'hsl(210deg 15% 18%)',         // #26262E
      overlay: 'hsl(210deg 15% 6% / 0.75)',   // #0F0F10BF
      
      backgroundElevated: 'hsl(210deg 15% 12%)', // #1A1A1F
      backgroundSubtle: 'hsl(210deg 15% 6%)',    // #0F0F10
    },
    interactive: {
      hover: 'hsl(225deg 100% 75% / 0.1)',
      active: 'hsl(225deg 100% 75% / 0.15)',
      focus: 'hsl(225deg 100% 75%)',
      disabled: 'hsl(210deg 10% 30%)',
    },
    accent: 'hsl(333deg 100% 55%)',        // #FF0088
    tertiary: 'hsl(280deg 100% 85%)',      // #E6B3FF
    decorative: 'hsl(200deg 50% 60%)',     // #66AACC
    action: 'hsl(240deg 95% 62%)',         // #4D4DFF
    atmospheric: {
      skyFrom: 'hsl(214deg 40% 11%)',      // #1A1A26
      skyTo: 'hsl(200deg 50% 30%)',        // #4D6680
      skySubtle: 'hsl(210deg 40% 16%)',    // #262633
      cloudLight: 'hsl(212deg 40% 9%)',    // #14141A
      cloudMedium: 'hsl(213deg 40% 10%)',  // #16161C
      cloudDark: 'hsl(213deg 40% 12%)',    // #1A1A20
    },
  },

  // Pure Monochrome Light
  monochromeLight: {
    name: 'Pure Monochrome Light',
    description: 'Clean and minimal light grayscale theme',
    type: 'light' as const,
    brand: {
      primary: 'hsl(0deg 0% 0%)',       // #000000
      primaryDark: 'hsl(0deg 0% 7%)',   // #111111
      primaryLight: 'hsl(0deg 0% 20%)', // #333333
    },
    neutral: {
      0: 'hsl(0deg 0% 100%)',    // #FFFFFF
      50: 'hsl(0deg 0% 98%)',    // #FAFAFA
      100: 'hsl(0deg 0% 96%)',   // #F5F5F5
      200: 'hsl(0deg 0% 90%)',   // #E5E5E5
      300: 'hsl(0deg 0% 83%)',   // #D4D4D4
      400: 'hsl(0deg 0% 64%)',   // #A3A3A3
      500: 'hsl(0deg 0% 45%)',   // #737373
      600: 'hsl(0deg 0% 32%)',   // #525252
      700: 'hsl(0deg 0% 25%)',   // #404040
      800: 'hsl(0deg 0% 15%)',   // #262626
      900: 'hsl(0deg 0% 9%)',    // #171717
    },
    semantic: {
      success: 'hsl(0deg 0% 32%)',  // #525252
      warning: 'hsl(0deg 0% 45%)',  // #737373
      error: 'hsl(0deg 0% 0%)',     // #000000
      info: 'hsl(0deg 0% 25%)',     // #404040
    },
    functional: {
      textPrimary: 'hsl(0deg 0% 9%)',      // #171717
      textSecondary: 'hsl(0deg 0% 25%)',   // #404040
      textMuted: 'hsl(0deg 0% 45%)',       // #737373
      textDisabled: 'hsl(0deg 0% 64%)',    // #A3A3A3
      textInverse: 'hsl(0deg 0% 100%)',    // #FFFFFF
      
      border: 'hsl(0deg 0% 90%)',          // #E5E5E5
      borderStrong: 'hsl(0deg 0% 83%)',    // #D4D4D4
      borderSubtle: 'hsl(0deg 0% 96%)',    // #F5F5F5
      
      divider: 'hsl(0deg 0% 90%)',         // #E5E5E5
      overlay: 'hsl(0deg 0% 9% / 0.5)',    // #17171780
      
      backgroundElevated: 'hsl(0deg 0% 98%)', // #FAFAFA
      backgroundSubtle: 'hsl(0deg 0% 98%)',   // #FAFAFA
    },
    interactive: {
      hover: 'hsl(0deg 0% 0% / 0.1)',
      active: 'hsl(0deg 0% 0% / 0.15)',
      focus: 'hsl(0deg 0% 0%)',
      disabled: 'hsl(0deg 0% 83%)',
    },
    accent: 'hsl(0deg 0% 53%)',  // #888888
  },

  // Pure Monochrome Dark
  monochromeDark: {
    name: 'Pure Monochrome Dark',
    description: 'Clean and minimal dark grayscale theme',
    type: 'dark' as const,
    brand: {
      primary: 'hsl(0deg 0% 100%)',     // #FFFFFF
      primaryDark: 'hsl(0deg 0% 93%)',  // #EDEDED
      primaryLight: 'hsl(0deg 0% 100%)', // #FFFFFF
    },
    neutral: {
      0: 'hsl(0deg 0% 100%)',    // #FFFFFF - for inverse text
      50: 'hsl(0deg 0% 96%)',    // #F5F5F5
      100: 'hsl(0deg 0% 90%)',   // #E5E5E5
      200: 'hsl(0deg 0% 83%)',   // #D4D4D4
      300: 'hsl(0deg 0% 70%)',   // #B3B3B3
      400: 'hsl(0deg 0% 55%)',   // #8C8C8C
      500: 'hsl(0deg 0% 45%)',   // #737373
      600: 'hsl(0deg 0% 35%)',   // #595959
      700: 'hsl(0deg 0% 25%)',   // #404040
      800: 'hsl(0deg 0% 15%)',   // #262626
      900: 'hsl(0deg 0% 8%)',    // #141414
    },
    semantic: {
      success: 'hsl(0deg 0% 70%)',  // #B3B3B3
      warning: 'hsl(0deg 0% 85%)',  // #D9D9D9
      error: 'hsl(0deg 0% 100%)',   // #FFFFFF
      info: 'hsl(0deg 0% 80%)',     // #CCCCCC
    },
    functional: {
      textPrimary: 'hsl(0deg 0% 96%)',     // #F5F5F5
      textSecondary: 'hsl(0deg 0% 70%)',   // #B3B3B3
      textMuted: 'hsl(0deg 0% 55%)',       // #8C8C8C
      textDisabled: 'hsl(0deg 0% 45%)',    // #737373
      textInverse: 'hsl(0deg 0% 8%)',      // #141414
      
      border: 'hsl(0deg 0% 25%)',          // #404040
      borderStrong: 'hsl(0deg 0% 35%)',    // #595959
      borderSubtle: 'hsl(0deg 0% 15%)',    // #262626
      
      divider: 'hsl(0deg 0% 25%)',         // #404040
      overlay: 'hsl(0deg 0% 8% / 0.8)',    // #141414CC
      
      backgroundElevated: 'hsl(0deg 0% 25%)', // #404040
      backgroundSubtle: 'hsl(0deg 0% 12%)',   // #1F1F1F
    },
    interactive: {
      hover: 'hsl(0deg 0% 100% / 0.1)',
      active: 'hsl(0deg 0% 100% / 0.15)',
      focus: 'hsl(0deg 0% 100%)',
      disabled: 'hsl(0deg 0% 35%)',
    },
    accent: 'hsl(0deg 0% 60%)',  // #999999
  },
};

// Helper to get theme by key
export const getTheme = (themeKey: keyof typeof alternativeThemes) => {
  return alternativeThemes[themeKey];
};

// Get all themes of a specific type
export const getThemesByType = (type: 'light' | 'dark') => {
  return Object.entries(alternativeThemes)
    .filter(([_, theme]) => theme.type === type)
    .reduce((acc, [key, theme]) => {
      (acc as any)[key] = theme;
      return acc;
    }, {} as Partial<typeof alternativeThemes>);
};

// Theme type definitions
export type AlternativeThemeKey = keyof typeof alternativeThemes;
export type ThemeType = 'light' | 'dark';

// CSS Variable generator for any theme
export const generateThemeCSS = (theme: typeof alternativeThemes[AlternativeThemeKey]) => {
  return `
/* ${theme.name} - ${theme.type} theme */
:root {
  /* Brand Colors */
  --brand-primary: ${theme.brand.primary};
  --brand-primary-dark: ${theme.brand.primaryDark};
  --brand-primary-light: ${theme.brand.primaryLight};
  --brand-accent: ${theme.accent};
  
  /* Background Colors */
  --bg-primary: ${theme.type === 'dark' ? theme.neutral[800] : theme.neutral[0]};
  --bg-secondary: ${theme.type === 'dark' ? theme.neutral[700] : theme.neutral[50]};
  --bg-tertiary: ${theme.type === 'dark' ? theme.neutral[600] : theme.neutral[100]};
  --bg-elevated: ${theme.functional.backgroundElevated};
  
  /* Text Colors */
  --text-primary: ${theme.functional.textPrimary};
  --text-secondary: ${theme.functional.textSecondary};
  --text-muted: ${theme.functional.textMuted};
  --text-disabled: ${theme.functional.textDisabled};
  --text-inverse: ${theme.functional.textInverse};
  
  /* Border Colors */
  --border-default: ${theme.functional.border};
  --border-strong: ${theme.functional.borderStrong};
  --border-subtle: ${theme.functional.borderSubtle};
  
  /* Interactive States */
  --interactive-hover: ${theme.interactive.hover};
  --interactive-active: ${theme.interactive.active};
  --interactive-focus: ${theme.interactive.focus};
  --interactive-disabled: ${theme.interactive.disabled};
  
  /* Semantic Colors */
  --color-success: ${theme.semantic.success};
  --color-warning: ${theme.semantic.warning};
  --color-error: ${theme.semantic.error};
  --color-info: ${theme.semantic.info};
  
  /* Neutral Scale */
  --neutral-0: ${theme.neutral[0]};
  --neutral-50: ${theme.neutral[50]};
  --neutral-100: ${theme.neutral[100]};
  --neutral-200: ${theme.neutral[200]};
  --neutral-300: ${theme.neutral[300]};
  --neutral-400: ${theme.neutral[400]};
  --neutral-500: ${theme.neutral[500]};
  --neutral-600: ${theme.neutral[600]};
  --neutral-700: ${theme.neutral[700]};
  --neutral-800: ${theme.neutral[800]};
  --neutral-900: ${theme.neutral[900]};
}`.trim();
};