import * as React from 'react'
import { Text, TextProps, Platform } from 'react-native'
import '@rite/ui/types/nativewind';

// Map font weights to specific font files for React Native
const getFontFamily = (weight: string) => {
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

export interface TypographyProps extends Omit<TextProps, 'className'> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'body-lg' | 'body-sm' | 'caption' | 'label' | 'button'
  color?: 'default' | 'secondary' | 'muted' | 'primary' | 'error' | 'success'
  className?: string
  children: React.ReactNode
}

const variantStyles = {
  h1: 'text-5xl font-bold',
  h2: 'text-4xl font-bold',
  h3: 'text-3xl font-semibold',
  h4: 'text-2xl font-semibold',
  h5: 'text-xl font-medium',
  h6: 'text-lg font-medium',
  body: 'text-base font-normal',
  'body-lg': 'text-lg font-normal',
  'body-sm': 'text-sm font-normal',
  caption: 'text-xs font-normal',
  label: 'text-sm font-medium',
  button: 'text-base font-medium',
}

const colorStyles = {
  default: 'text-white',
  secondary: 'text-neutral-400',
  muted: 'text-neutral-500',
  primary: 'text-brand-primary',
  error: 'text-error',
  success: 'text-success',
}

export function Typography({
  variant = 'body',
  color = 'default',
  className = '',
  children,
  style,
  ...props
}: TypographyProps) {
  // Extract font weight from variant styles
  const variantClass = variantStyles[variant];
  const fontWeightMatch = variantClass.match(/font-(thin|light|normal|medium|semibold|bold|black)/);
  const fontWeightClass = fontWeightMatch ? `font-${fontWeightMatch[1]}` : 'font-normal';
  const fontFamily = getFontFamily(fontWeightClass);
  
  // Remove font-suit and font-weight classes from className since we handle them with fontFamily
  const cleanedVariantClass = variantClass.replace(/font-\w+/g, '').trim();
  const cleanedClassName = className.replace(/font-\w+/g, '').trim();
  
  return (
    <Text
      className={`${cleanedVariantClass} ${colorStyles[color]} ${cleanedClassName}`}
      style={[{ fontFamily }, style]}
      {...props}
    >
      {children}
    </Text>
  )
}