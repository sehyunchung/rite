import * as React from 'react'
import { Text as RNText, type TextProps as RNTextProps } from 'react-native'
import { cn } from '../../lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const textVariants = cva('text-base', {
  variants: {
    variant: {
      h1: 'text-6xl font-bold tracking-tight',
      h2: 'text-5xl font-bold tracking-tight',
      h3: 'text-4xl font-semibold',
      h4: 'text-3xl font-semibold',
      h5: 'text-2xl font-semibold',
      h6: 'text-xl font-semibold',
      body: 'text-base font-normal',
      bodyLarge: 'text-lg font-normal',
      bodySmall: 'text-sm font-normal',
      caption: 'text-xs font-normal opacity-70',
      label: 'text-sm font-semibold tracking-wide uppercase',
    },
    color: {
      default: 'text-foreground',
      primary: 'text-brand-primary',
      secondary: 'text-muted-foreground',
      muted: 'text-muted-foreground',
      success: 'text-green-600 dark:text-green-400',
      error: 'text-red-600 dark:text-red-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      info: 'text-blue-600 dark:text-blue-400',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
  defaultVariants: {
    variant: 'body',
    color: 'default',
  },
})

export interface TextProps extends RNTextProps, VariantProps<typeof textVariants> {}

// Base Text component
export const Text = React.forwardRef<RNText, TextProps>(
  ({ className, variant, color, align, ...props }, ref) => {
    return (
      <RNText
        ref={ref}
        className={cn(textVariants({ variant, color, align }), className)}
        {...props}
      />
    )
  }
)
Text.displayName = 'Text'

// Convenience components
export const H1 = React.forwardRef<RNText, TextProps>(
  ({ className, ...props }, ref) => (
    <Text ref={ref} variant="h1" className={className} {...props} />
  )
)
H1.displayName = 'H1'

export const H2 = React.forwardRef<RNText, TextProps>(
  ({ className, ...props }, ref) => (
    <Text ref={ref} variant="h2" className={className} {...props} />
  )
)
H2.displayName = 'H2'

export const H3 = React.forwardRef<RNText, TextProps>(
  ({ className, ...props }, ref) => (
    <Text ref={ref} variant="h3" className={className} {...props} />
  )
)
H3.displayName = 'H3'

export const H4 = React.forwardRef<RNText, TextProps>(
  ({ className, ...props }, ref) => (
    <Text ref={ref} variant="h4" className={className} {...props} />
  )
)
H4.displayName = 'H4'

export const H5 = React.forwardRef<RNText, TextProps>(
  ({ className, ...props }, ref) => (
    <Text ref={ref} variant="h5" className={className} {...props} />
  )
)
H5.displayName = 'H5'

export const H6 = React.forwardRef<RNText, TextProps>(
  ({ className, ...props }, ref) => (
    <Text ref={ref} variant="h6" className={className} {...props} />
  )
)
H6.displayName = 'H6'

export const Body = React.forwardRef<RNText, TextProps>(
  ({ className, ...props }, ref) => (
    <Text ref={ref} variant="body" className={className} {...props} />
  )
)
Body.displayName = 'Body'

export const BodyLarge = React.forwardRef<RNText, TextProps>(
  ({ className, ...props }, ref) => (
    <Text ref={ref} variant="bodyLarge" className={className} {...props} />
  )
)
BodyLarge.displayName = 'BodyLarge'

export const BodySmall = React.forwardRef<RNText, TextProps>(
  ({ className, ...props }, ref) => (
    <Text ref={ref} variant="bodySmall" className={className} {...props} />
  )
)
BodySmall.displayName = 'BodySmall'

export const Caption = React.forwardRef<RNText, TextProps>(
  ({ className, ...props }, ref) => (
    <Text ref={ref} variant="caption" className={className} {...props} />
  )
)
Caption.displayName = 'Caption'

export const TextLabel = React.forwardRef<RNText, TextProps>(
  ({ className, ...props }, ref) => (
    <Text ref={ref} variant="label" className={className} {...props} />
  )
)
TextLabel.displayName = 'TextLabel'