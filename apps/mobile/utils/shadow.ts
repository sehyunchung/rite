import { Platform } from 'react-native';

export function createShadow(shadowProps: {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
}) {
  if (Platform.OS === 'web') {
    const { shadowColor = '#000', shadowOffset = { width: 0, height: 1 }, shadowOpacity = 0.05, shadowRadius = 2 } = shadowProps;
    return {
      boxShadow: `${shadowOffset.width}px ${shadowOffset.height}px ${shadowRadius * 2}px rgba(0, 0, 0, ${shadowOpacity})`,
    };
  }
  
  return shadowProps;
}

export const shadows = {
  sm: createShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  }),
  md: createShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }),
  lg: createShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  }),
};