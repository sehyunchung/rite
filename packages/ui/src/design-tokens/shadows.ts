// RITE Design System - Shadow/Elevation Tokens
// Platform-specific shadow definitions

// Web shadows (box-shadow)
export const webShadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  
  // Dark theme specific shadows with brand color glow
  glow: {
    sm: `0 0 10px rgba(233, 70, 255, 0.3)`,
    md: `0 0 20px rgba(233, 70, 255, 0.4)`,
    lg: `0 0 30px rgba(233, 70, 255, 0.5)`,
  },
} as const

// React Native shadows (iOS style)
export const iosShadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
} as const

// Android elevation levels
export const androidElevation = {
  none: 0,
  xs: 1,
  sm: 2,
  md: 4,
  lg: 8,
  xl: 16,
} as const

// Combined mobile shadows (iOS + Android)
export const mobileShadows = {
  none: {
    ...iosShadows.none,
    elevation: androidElevation.none,
  },
  xs: {
    ...iosShadows.xs,
    elevation: androidElevation.xs,
  },
  sm: {
    ...iosShadows.sm,
    elevation: androidElevation.sm,
  },
  md: {
    ...iosShadows.md,
    elevation: androidElevation.md,
  },
  lg: {
    ...iosShadows.lg,
    elevation: androidElevation.lg,
  },
  xl: {
    ...iosShadows.xl,
    elevation: androidElevation.xl,
  },
} as const

export type ShadowLevel = keyof typeof webShadows