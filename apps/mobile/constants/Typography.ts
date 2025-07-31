/**
 * RITE Typography System for Mobile
 * Based on SUIT Variable font
 */

import { TextStyle, Platform } from 'react-native';

// Map font weights to specific font files
export const getFontFamily = (weight: keyof typeof fontWeight = 'normal') => {
  const weightMap = {
    thin: 'SUIT-Regular',
    extralight: 'SUIT-Regular',
    light: 'SUIT-Regular',
    normal: 'SUIT-Regular',
    medium: 'SUIT-Medium',
    semibold: 'SUIT-SemiBold',
    bold: 'SUIT-Bold',
    extrabold: 'SUIT-Bold',
    black: 'SUIT-Bold',
  };
  
  return Platform.select({
    ios: weightMap[weight],
    android: weightMap[weight],
    default: 'System',
  });
};

export const fontFamily = {
  suit: 'SUIT-Regular',
  mono: 'SpaceMono',
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

export const fontWeight = {
  thin: '100' as TextStyle['fontWeight'],
  extralight: '200' as TextStyle['fontWeight'],
  light: '300' as TextStyle['fontWeight'],
  normal: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extrabold: '800' as TextStyle['fontWeight'],
  black: '900' as TextStyle['fontWeight'],
} as const;

export const lineHeight = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

// Typography variants matching web app
export const typography = {
  h1: {
    fontFamily: 'SUIT-Bold',
    fontSize: fontSize['5xl'],
    lineHeight: fontSize['5xl'] * lineHeight.tight,
  },
  h2: {
    fontFamily: 'SUIT-Bold',
    fontSize: fontSize['4xl'],
    lineHeight: fontSize['4xl'] * lineHeight.tight,
  },
  h3: {
    fontFamily: 'SUIT-SemiBold',
    fontSize: fontSize['3xl'],
    lineHeight: fontSize['3xl'] * lineHeight.tight,
  },
  h4: {
    fontFamily: 'SUIT-SemiBold',
    fontSize: fontSize['2xl'],
    lineHeight: fontSize['2xl'] * lineHeight.tight,
  },
  h5: {
    fontFamily: 'SUIT-Medium',
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * lineHeight.tight,
  },
  h6: {
    fontFamily: 'SUIT-Medium',
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * lineHeight.tight,
  },
  body: {
    fontFamily: 'SUIT-Regular',
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
  },
  bodySmall: {
    fontFamily: 'SUIT-Regular',
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  button: {
    fontFamily: 'SUIT-Medium',
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.tight,
  },
  label: {
    fontFamily: 'SUIT-Medium',
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.tight,
  },
  caption: {
    fontFamily: 'SUIT-Regular',
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.normal,
  },
  code: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
} as const;

export type TypographyVariant = keyof typeof typography;