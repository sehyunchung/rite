import * as React from 'react'
import { Pressable, type PressableProps, Text, ActivityIndicator } from 'react-native'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md transition-colors disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-brand-primary',
        secondary: 'bg-neutral-200 dark:bg-neutral-700',
        outline: 'border border-neutral-300 dark:border-neutral-600 bg-transparent',
        ghost: 'bg-transparent',
        destructive: 'bg-red-600 dark:bg-red-700',
      },
      size: {
        sm: 'h-8 px-3 py-1.5',
        md: 'h-10 px-4 py-2.5',
        lg: 'h-12 px-6 py-3',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

const buttonTextVariants = cva('font-semibold', {
  variants: {
    variant: {
      default: 'text-white',
      secondary: 'text-neutral-900 dark:text-neutral-100',
      outline: 'text-neutral-900 dark:text-neutral-100',
      ghost: 'text-neutral-900 dark:text-neutral-100',
      destructive: 'text-white',
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      icon: 'text-base',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

export interface ButtonProps 
  extends Omit<PressableProps, 'className'>, 
    VariantProps<typeof buttonVariants> {
  className?: string
  textClassName?: string
  children?: React.ReactNode
  loading?: boolean
}

const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  ({ 
    className, 
    textClassName,
    variant, 
    size, 
    fullWidth,
    disabled,
    loading,
    children, 
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading
    
    return (
      <Pressable
        ref={ref}
        className={cn(
          buttonVariants({ variant, size, fullWidth }),
          isDisabled && 'opacity-50',
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {({ pressed }) => (
          <>
            {loading ? (
              <ActivityIndicator 
                size="small" 
                color={variant === 'default' || variant === 'destructive' ? 'white' : undefined}
              />
            ) : typeof children === 'string' ? (
              <Text 
                className={cn(
                  buttonTextVariants({ variant, size }),
                  pressed && 'opacity-70',
                  textClassName
                )}
              >
                {children}
              </Text>
            ) : (
              children
            )}
          </>
        )}
      </Pressable>
    )
  }
)
Button.displayName = 'Button'

// Convenience component that accepts string children
export const ButtonWithText = React.forwardRef<
  React.ElementRef<typeof Pressable>, 
  ButtonProps & { children: string }
>(({ children, ...props }, ref) => {
  return (
    <Button ref={ref} {...props}>
      {children}
    </Button>
  )
})
ButtonWithText.displayName = 'ButtonWithText'

export { Button, buttonVariants, buttonTextVariants }