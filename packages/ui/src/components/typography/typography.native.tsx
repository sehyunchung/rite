import React from 'react'
import { Text, TextProps } from 'react-native'
import '../../types/nativewind'

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
  return (
    <Text
      className={`font-suit ${variantStyles[variant]} ${colorStyles[color]} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </Text>
  )
}