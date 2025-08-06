import { Platform } from 'react-native';

/**
 * Maps font weight classes to specific SUIT font files for React Native platforms.
 * Provides graceful fallback to system fonts on unsupported platforms.
 */
export const getFontFamily = (weight: string): string => {
  const weightMap: Record<string, string> = {
    'font-thin': 'SUIT-Regular',
    'font-light': 'SUIT-Regular', 
    'font-normal': 'SUIT-Regular',
    'font-medium': 'SUIT-Medium',
    'font-semibold': 'SUIT-SemiBold',
    'font-bold': 'SUIT-Bold',
    'font-black': 'SUIT-Bold',
  };
  
  return Platform.select({
    ios: weightMap[weight] || 'SUIT-Regular',
    android: weightMap[weight] || 'SUIT-Regular',
    default: 'System',
  });
};