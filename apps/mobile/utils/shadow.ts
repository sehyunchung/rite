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
    shadowRadius: 3,
    elevation: 2,
  }),
  md: createShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 4,
  }),
  lg: createShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  }),
};

// Brand glow effects for special elements
export const glowShadows = {
  sm: createShadow({
    shadowColor: 'hsl(225deg 100% 75%)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 0,
  }),
  md: createShadow({
    shadowColor: 'hsl(225deg 100% 75%)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 0,
  }),
  lg: createShadow({
    shadowColor: 'hsl(225deg 100% 75%)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 0,
  }),
};