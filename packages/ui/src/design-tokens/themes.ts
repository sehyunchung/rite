// RITE Design System - Theme Collection
// Josh Comeau inspired dark and light themes

export const themes = {

  // Josh Comeau Inspired (dark)
  joshComeau: {
    name: 'Josh Comeau',
    description: 'Sophisticated dark theme with atmospheric gradients and vibrant accents',
    type: 'dark' as const,
    brand: {
      primary: 'hsl(225, 100, 75)',      // #7C7CFF
      primaryDark: 'hsl(225, 100, 60)',  // #5C5CFF
      primaryLight: 'hsl(225, 100, 85)', // #9C9CFF
    },
    neutral: {
      0: 'hsl(210, 25, 96)',     // #F5F5F8
      50: 'hsl(210, 25, 88)',    // #DDDDE5
      100: 'hsl(210, 20, 77)',   // #C4C4D1
      200: 'hsl(210, 14, 66)',   // #A8A8BD
      300: 'hsl(210, 12, 55)',   // #8C8CA3
      400: 'hsl(210, 8, 50)',    // #70707F
      500: 'hsl(210, 9, 40)',    // #616166
      600: 'hsl(210, 10, 30)',   // #47474D
      700: 'hsl(210, 15, 18)',   // #26262E
      800: 'hsl(210, 15, 12)',   // #1A1A1F
      900: 'hsl(210, 15, 6)',    // #0F0F10
    },
    semantic: {
      success: 'hsl(160, 100, 40)',  // #00CC66
      warning: 'hsl(40, 100, 50)',   // #FFCC00
      error: 'hsl(340, 95, 60)',     // #FF3366
      info: 'hsl(225, 100, 80)',     // #9999FF
    },
    functional: {
      textPrimary: 'hsl(210, 10, 90)',     // #E0E0E6
      textSecondary: 'hsl(210, 12, 55)',   // #8C8CA3
      textMuted: 'hsl(210, 8, 50)',        // #70707F
      textDisabled: 'hsl(210, 10, 30)',    // #47474D
      textInverse: 'hsl(210, 15, 6)',      // #0F0F10
      
      border: 'hsl(210, 15, 18)',          // #26262E
      borderStrong: 'hsl(210, 10, 30)',    // #47474D
      borderSubtle: 'hsl(210, 15, 12)',    // #1A1A1F
      
      divider: 'hsl(210, 15, 18)',         // #26262E
      overlay: 'hsl(210, 15, 6 / 0.75)',   // #0F0F10BF
      
      backgroundElevated: 'hsl(210, 25, 25)', // #383845 - Lighter than bg-primary for elevation
      backgroundSubtle: 'hsl(210, 15, 6)',    // #0F0F10
    },
    interactive: {
      hover: 'hsl(225, 100, 75 / 0.1)',
      active: 'hsl(225, 100, 75 / 0.15)',
      focus: 'hsl(225, 100, 75)',
      disabled: 'hsl(210, 10, 30)',
    },
    accent: 'hsl(333, 100, 55)',        // #FF0088
    tertiary: 'hsl(280, 100, 85)',      // #E6B3FF
    decorative: 'hsl(200, 50, 60)',     // #66AACC
    action: 'hsl(240, 95, 62)',         // #4D4DFF
    atmospheric: {
      skyFrom: 'hsl(214, 40, 11)',      // #1A1A26
      skyTo: 'hsl(200, 50, 30)',        // #4D6680
      skySubtle: 'hsl(210, 40, 16)',    // #262633
      cloudLight: 'hsl(212, 40, 9)',    // #14141A
      cloudMedium: 'hsl(213, 40, 10)',  // #16161C
      cloudDark: 'hsl(213, 40, 12)',    // #1A1A20
    },
  },

  // Josh Comeau Light
  joshComeauLight: {
    name: 'Josh Comeau Light',
    description: 'Sophisticated light theme with atmospheric gradients and vibrant accents',
    type: 'light' as const,
    brand: {
      primary: 'hsl(225, 100, 65)',      // #6666FF - Slightly darker for better contrast on light bg
      primaryDark: 'hsl(225, 100, 50)',  // #4C4CFF
      primaryLight: 'hsl(225, 100, 75)', // #7C7CFF
    },
    neutral: {
      0: 'hsl(210, 15, 6)',      // #0F0F10 - Inverted for inverse text
      50: 'hsl(210, 15, 12)',    // #1A1A1F
      100: 'hsl(210, 15, 18)',   // #26262E
      200: 'hsl(210, 10, 30)',   // #47474D
      300: 'hsl(210, 9, 40)',    // #616166
      400: 'hsl(210, 8, 50)',    // #70707F
      500: 'hsl(210, 12, 55)',   // #8C8CA3
      600: 'hsl(210, 14, 66)',   // #A8A8BD
      700: 'hsl(210, 20, 77)',   // #C4C4D1
      800: 'hsl(210, 25, 88)',   // #DDDDE5
      900: 'hsl(210, 25, 96)',   // #F5F5F8
    },
    semantic: {
      success: 'hsl(160, 100, 30)',  // #009950 - Darker for light mode
      warning: 'hsl(40, 100, 40)',   // #CC9900
      error: 'hsl(340, 95, 50)',     // #FF1A4D
      info: 'hsl(225, 100, 60)',     // #5C5CFF
    },
    functional: {
      textPrimary: 'hsl(210, 15, 12)',     // #1A1A1F - Dark text for light mode
      textSecondary: 'hsl(210, 10, 30)',   // #47474D
      textMuted: 'hsl(210, 8, 50)',        // #70707F
      textDisabled: 'hsl(210, 12, 55)',    // #8C8CA3
      textInverse: 'hsl(210, 25, 96)',     // #F5F5F8 - Light text for dark backgrounds
      
      border: 'hsl(210, 20, 77)',          // #C4C4D1 - Light borders
      borderStrong: 'hsl(210, 14, 66)',    // #A8A8BD
      borderSubtle: 'hsl(210, 25, 88)',    // #DDDDE5
      
      divider: 'hsl(210, 20, 77)',         // #C4C4D1
      overlay: 'hsl(210, 15, 12 / 0.75)',  // #1A1A1FBF - Dark overlay
      
      backgroundElevated: 'hsl(210, 25, 88)', // #DDDDE5 - Cards/elevated surfaces
      backgroundSubtle: 'hsl(210, 25, 96)',   // #F5F5F8 - Page background
    },
    interactive: {
      hover: 'hsl(225, 100, 65 / 0.1)',
      active: 'hsl(225, 100, 65 / 0.15)',
      focus: 'hsl(225, 100, 65)',
      disabled: 'hsl(210, 14, 66)',
    },
    accent: 'hsl(333, 100, 45)',        // #E6007A - Slightly darker for light mode
    tertiary: 'hsl(280, 100, 75)',      // #CC99FF
    decorative: 'hsl(200, 50, 50)',     // #5599AA
    action: 'hsl(240, 95, 52)',         // #3D3DFF
    atmospheric: {
      skyFrom: 'hsl(214, 40, 89)',      // #E0E0F0 - Light sky
      skyTo: 'hsl(200, 50, 70)',        // #8CBBD9
      skySubtle: 'hsl(210, 40, 84)',    // #D9D9E6
      cloudLight: 'hsl(212, 40, 91)',   // #E8E8F0
      cloudMedium: 'hsl(213, 40, 90)',  // #E5E5ED
      cloudDark: 'hsl(213, 40, 88)',    // #DFDFEA
    },
  },
};

// Helper to get theme by key
export const getTheme = (themeKey: keyof typeof themes) => {
  return themes[themeKey];
};

// Get all themes of a specific type
export const getThemesByType = (type: 'light' | 'dark') => {
  return Object.entries(themes)
    .filter(([_, theme]) => theme.type === type)
    .reduce((acc, [key, theme]) => {
      (acc as any)[key] = theme;
      return acc;
    }, {} as Partial<typeof themes>);
};

// Theme type definitions
export type ThemeKey = keyof typeof themes;
export type ThemeType = 'light' | 'dark';

// Backward compatibility exports
export const alternativeThemes = themes;
export type AlternativeThemeKey = ThemeKey;

// CSS Variable generator for any theme
export const generateThemeCSS = (theme: typeof themes[ThemeKey]) => {
  return `
/* ${theme.name} - ${theme.type} theme */
:root {
  /* Brand Colors */
  --brand-primary: ${theme.brand.primary};
  --brand-primary-dark: ${theme.brand.primaryDark};
  --brand-primary-light: ${theme.brand.primaryLight};
  --brand-accent: ${theme.accent};
  
  /* Background Colors */
  --bg-primary: ${theme.type === 'dark' ? theme.neutral[800] : theme.functional.backgroundSubtle};
  --bg-secondary: ${theme.type === 'dark' ? theme.neutral[700] : theme.functional.backgroundElevated};
  --bg-tertiary: ${theme.type === 'dark' ? theme.neutral[600] : theme.functional.border};
  --bg-elevated: ${theme.functional.backgroundElevated};
  
  /* Text Colors */
  --text-primary: ${theme.functional.textPrimary};
  --text-secondary: ${theme.functional.textSecondary};
  --text-muted: ${theme.functional.textMuted};
  --text-disabled: ${theme.functional.textDisabled};
  --text-inverse: ${theme.functional.textInverse};
  
  /* Border Colors */
  --border-default: ${theme.functional.border};
  --border: ${theme.functional.border};
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
  
  /* Button Colors */
  --button-primary-text: ${theme.type === 'light' ? theme.neutral[900] : theme.neutral[0]};
  
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