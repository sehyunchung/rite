// RITE Design System - Tamagui Compatible Theme Collection
// Josh Comeau inspired dark and light themes with Tamagui HSL format

// Helper function to convert CSS HSL to Tamagui HSL format
function convertHSL(cssHsl: string): string {
  // Convert "hsl(225deg 100% 75%)" to "hsl(225, 100%, 75%)"
  return cssHsl
    .replace(/deg/g, '')
    .replace(/(\d+)\s+(\d+%)\s+(\d+%)/g, '$1, $2, $3')
}

export const tamaguiThemes = {

  // Josh Comeau Inspired (dark)
  joshComeau: {
    name: 'Josh Comeau',
    description: 'Sophisticated dark theme with atmospheric gradients and vibrant accents',
    type: 'dark' as const,
    brand: {
      primary: 'hsl(225, 100%, 75%)',      // #7C7CFF
      primaryDark: 'hsl(225, 100%, 60%)',  // #5C5CFF
      primaryLight: 'hsl(225, 100%, 85%)', // #9C9CFF
    },
    neutral: {
      0: 'hsl(210, 25%, 96%)',     // #F5F5F8
      50: 'hsl(210, 25%, 88%)',    // #DDDDE5
      100: 'hsl(210, 20%, 77%)',   // #C4C4D1
      200: 'hsl(210, 14%, 66%)',   // #A8A8BD
      300: 'hsl(210, 12%, 55%)',   // #8C8CA3
      400: 'hsl(210, 8%, 50%)',    // #70707F
      500: 'hsl(210, 9%, 40%)',    // #616166
      600: 'hsl(210, 10%, 30%)',   // #47474D
      700: 'hsl(210, 15%, 18%)',   // #26262E
      800: 'hsl(210, 15%, 12%)',   // #1A1A1F
      900: 'hsl(210, 15%, 6%)',    // #0F0F10
    },
    semantic: {
      success: 'hsl(160, 100%, 40%)',  // #00CC66
      warning: 'hsl(40, 100%, 50%)',   // #FFCC00
      error: 'hsl(340, 95%, 60%)',     // #FF3366
      info: 'hsl(225, 100%, 80%)',     // #9999FF
    },
    functional: {
      textPrimary: 'hsl(210, 10%, 90%)',     // #E0E0E6
      textSecondary: 'hsl(210, 12%, 55%)',   // #8C8CA3
      textMuted: 'hsl(210, 8%, 50%)',        // #70707F
      textDisabled: 'hsl(210, 10%, 30%)',    // #47474D
      textInverse: 'hsl(210, 15%, 6%)',      // #0F0F10
      
      border: 'hsl(210, 15%, 18%)',          // #26262E
      borderStrong: 'hsl(210, 10%, 30%)',    // #47474D
      borderSubtle: 'hsl(210, 15%, 12%)',    // #1A1A1F
      
      divider: 'hsl(210, 15%, 18%)',         // #26262E
      overlay: 'hsla(210, 15%, 6%, 0.75)',   // #0F0F10BF
      
      backgroundElevated: 'hsl(210, 25%, 25%)', // #383845 - Lighter than bg-primary for elevation
      backgroundSubtle: 'hsl(210, 15%, 6%)',    // #0F0F10
    },
    interactive: {
      hover: 'hsla(225, 100%, 75%, 0.1)',
      active: 'hsla(225, 100%, 75%, 0.15)',
      focus: 'hsl(225, 100%, 75%)',
      disabled: 'hsl(210, 10%, 30%)',
    },
    accent: 'hsl(333, 100%, 55%)',        // #FF0088
    tertiary: 'hsl(280, 100%, 85%)',      // #E6B3FF
    decorative: 'hsl(200, 50%, 60%)',     // #66AACC
    action: 'hsl(240, 95%, 62%)',         // #4D4DFF
    atmospheric: {
      skyFrom: 'hsl(214, 40%, 11%)',      // #1A1A26
      skyTo: 'hsl(200, 50%, 30%)',        // #4D6680
      skySubtle: 'hsl(210, 40%, 16%)',    // #262633
      cloudLight: 'hsl(212, 40%, 9%)',    // #14141A
      cloudMedium: 'hsl(213, 40%, 10%)',  // #16161C
      cloudDark: 'hsl(213, 40%, 12%)',    // #1A1A20
    },
  },

  // Josh Comeau Light
  joshComeauLight: {
    name: 'Josh Comeau Light',
    description: 'Sophisticated light theme with atmospheric gradients and vibrant accents',
    type: 'light' as const,
    brand: {
      primary: 'hsl(225, 100%, 65%)',      // #6666FF - Slightly darker for better contrast on light bg
      primaryDark: 'hsl(225, 100%, 50%)',  // #4C4CFF
      primaryLight: 'hsl(225, 100%, 75%)', // #7C7CFF
    },
    neutral: {
      0: 'hsl(210, 15%, 6%)',      // #0F0F10 - Inverted for inverse text
      50: 'hsl(210, 15%, 12%)',    // #1A1A1F
      100: 'hsl(210, 15%, 18%)',   // #26262E
      200: 'hsl(210, 10%, 30%)',   // #47474D
      300: 'hsl(210, 9%, 40%)',    // #616166
      400: 'hsl(210, 8%, 50%)',    // #70707F
      500: 'hsl(210, 12%, 55%)',   // #8C8CA3
      600: 'hsl(210, 14%, 66%)',   // #A8A8BD
      700: 'hsl(210, 20%, 77%)',   // #C4C4D1
      800: 'hsl(210, 25%, 88%)',   // #DDDDE5
      900: 'hsl(210, 25%, 96%)',   // #F5F5F8
    },
    semantic: {
      success: 'hsl(160, 100%, 30%)',  // #009950 - Darker for light mode
      warning: 'hsl(40, 100%, 40%)',   // #CC9900
      error: 'hsl(340, 95%, 50%)',     // #FF1A4D
      info: 'hsl(225, 100%, 60%)',     // #5C5CFF
    },
    functional: {
      textPrimary: 'hsl(210, 15%, 6%)',      // #0F0F10 - Dark text on light bg
      textSecondary: 'hsl(210, 12%, 55%)',   // #8C8CA3
      textMuted: 'hsl(210, 8%, 50%)',        // #70707F
      textDisabled: 'hsl(210, 14%, 66%)',    // #A8A8BD
      textInverse: 'hsl(210, 10%, 90%)',     // #E0E0E6 - For dark backgrounds
      
      border: 'hsl(210, 20%, 77%)',          // #C4C4D1
      borderStrong: 'hsl(210, 14%, 66%)',    // #A8A8BD
      borderSubtle: 'hsl(210, 25%, 88%)',    // #DDDDE5
      
      divider: 'hsl(210, 20%, 77%)',         // #C4C4D1
      overlay: 'hsla(210, 25%, 96%, 0.75)',  // #F5F5F8BF
      
      backgroundElevated: 'hsl(210, 25%, 96%)', // #F5F5F8 - White-ish elevated background
      backgroundSubtle: 'hsl(210, 25%, 88%)',   // #DDDDE5 - Subtle background variation
    },
    interactive: {
      hover: 'hsla(225, 100%, 65%, 0.1)',
      active: 'hsla(225, 100%, 65%, 0.15)',
      focus: 'hsl(225, 100%, 65%)',
      disabled: 'hsl(210, 14%, 66%)',
    },
    accent: 'hsl(333, 100%, 55%)',        // #FF0088
    tertiary: 'hsl(280, 100%, 85%)',      // #E6B3FF
    decorative: 'hsl(200, 50%, 60%)',     // #66AACC
    action: 'hsl(240, 95%, 62%)',         // #4D4DFF
    atmospheric: {
      skyFrom: 'hsl(214, 40%, 89%)',      // Light sky gradient start
      skyTo: 'hsl(200, 50%, 70%)',        // Light sky gradient end
      skySubtle: 'hsl(210, 40%, 84%)',    // Subtle sky variation
      cloudLight: 'hsl(212, 40%, 91%)',   // Light cloud
      cloudMedium: 'hsl(213, 40%, 90%)',  // Medium cloud
      cloudDark: 'hsl(213, 40%, 88%)',    // Dark cloud
    },
  },
}