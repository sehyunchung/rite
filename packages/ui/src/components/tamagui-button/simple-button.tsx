import * as React from 'react'
import { styled, Stack, Text, GetProps } from '@tamagui/core'

// Extremely simple button for debugging
export const SimpleButton = styled(Stack, {
  name: 'SimpleButton',
  
  // Use direct pixel values for testing
  height: 40,
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 8,
  
  // Direct color values
  backgroundColor: 'hsl(225, 100%, 75%)', // Light blue
  borderWidth: 1,
  borderColor: 'hsl(225, 100%, 75%)',
  
  // Layout
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  cursor: 'pointer',
  
  // Hover/press states with direct colors
  hoverStyle: {
    backgroundColor: 'hsl(225, 100%, 65%)',
    borderColor: 'hsl(225, 100%, 65%)',
  },
  
  pressStyle: {
    backgroundColor: 'hsl(225, 100%, 55%)',
    borderColor: 'hsl(225, 100%, 55%)',
    scale: 0.98,
  },
  
  variants: {
    size: {
      sm: {
        height: 32,
        paddingHorizontal: 12,
        paddingVertical: 6,
      },
      md: {
        height: 40,
        paddingHorizontal: 16,
        paddingVertical: 8,
      },
      lg: {
        height: 48,
        paddingHorizontal: 24,
        paddingVertical: 12,
      },
    },
    
    variant: {
      primary: {
        backgroundColor: 'hsl(225, 100%, 75%)',
        borderColor: 'hsl(225, 100%, 75%)',
      },
      secondary: {
        backgroundColor: 'hsl(210, 15%, 18%)',
        borderColor: 'hsl(210, 15%, 18%)',
      },
    },
  },
  
  defaultVariants: {
    size: 'md',
    variant: 'primary',
  },
})

// Simple text component
export const SimpleButtonText = styled(Text, {
  name: 'SimpleButtonText',
  color: 'white',
  fontSize: 16,
  fontWeight: '600',
  fontFamily: '$body',
})

// Convenience component
export function SimpleButtonWithText({ 
  children, 
  size = 'md', 
  variant = 'primary',
  onPress,
  ...props 
}: GetProps<typeof SimpleButton> & { children: React.ReactNode, onPress?: () => void }) {
  return (
    <SimpleButton 
      size={size} 
      variant={variant} 
      onPress={onPress}
      {...props}
    >
      <SimpleButtonText>
        {children}
      </SimpleButtonText>
    </SimpleButton>
  )
}

export type SimpleButtonProps = GetProps<typeof SimpleButton>