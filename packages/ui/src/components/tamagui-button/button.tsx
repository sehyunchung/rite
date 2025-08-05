import { styled, GetProps } from '@tamagui/core'
import { Button as TamaguiButton } from '@tamagui/button'

export const Button = styled(TamaguiButton, {
  name: 'Button',
  
  // Base styles
  backgroundColor: '$buttonPrimaryBg',
  color: '$buttonPrimaryText',
  borderRadius: '$3',
  borderWidth: 0,
  cursor: 'pointer',
  fontFamily: '$body',
  fontSize: '$4',
  fontWeight: '600',
  paddingHorizontal: '$6',
  paddingVertical: '$3',
  
  // Hover styles
  hoverStyle: {
    backgroundColor: '$buttonPrimaryBgHover',
    transform: [{ scale: 1.02 }],
  },
  
  // Press styles
  pressStyle: {
    backgroundColor: '$buttonPrimaryBgHover',
    transform: [{ scale: 0.98 }],
  },
  
  // Focus styles
  focusStyle: {
    outlineColor: '$buttonPrimaryBg',
    outlineWidth: 2,
    outlineStyle: 'solid',
    outlineOffset: 2,
  },
  
  // Disabled styles
  disabledStyle: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  variants: {
    // Size variants
    size: {
      sm: {
        paddingHorizontal: '$4',
        paddingVertical: '$2',
        fontSize: '$3',
        borderRadius: '$2',
      },
      default: {
        paddingHorizontal: '$6',
        paddingVertical: '$3',
        fontSize: '$4',
      },
      lg: {
        paddingHorizontal: '$8',
        paddingVertical: '$4',
        fontSize: '$5',
        borderRadius: '$4',
      },
      icon: {
        width: '$12',
        height: '$12',
        padding: 0,
      },
    },
    
    // Variant styles
    variant: {
      default: {
        backgroundColor: '$buttonPrimaryBg',
        color: '$buttonPrimaryText',
        
        hoverStyle: {
          backgroundColor: '$buttonPrimaryBgHover',
        },
      },
      
      secondary: {
        backgroundColor: '$neutral700Dark',
        color: '$color',
        
        hoverStyle: {
          backgroundColor: '$neutral600Dark',
        },
        
        pressStyle: {
          backgroundColor: '$neutral800Dark',
        },
      },
      
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '$borderColor',
        color: '$color',
        
        hoverStyle: {
          backgroundColor: '$backgroundHover',
          borderColor: '$borderColorHover',
        },
        
        pressStyle: {
          backgroundColor: '$backgroundPress',
        },
      },
      
      ghost: {
        backgroundColor: 'transparent',
        color: '$color',
        
        hoverStyle: {
          backgroundColor: '$backgroundHover',
        },
        
        pressStyle: {
          backgroundColor: '$backgroundPress',
        },
      },
      
      destructive: {
        backgroundColor: '$errorBg',
        color: 'white',
        
        hoverStyle: {
          backgroundColor: '$error',
          opacity: 0.9,
        },
        
        pressStyle: {
          backgroundColor: '$error',
          opacity: 0.8,
        },
      },
    },
    
    // Full width variant
    fullWidth: {
      true: {
        width: '100%',
      },
    },
  } as const,

  defaultVariants: {
    size: 'default',
    variant: 'default',
  },
})

export type ButtonProps = GetProps<typeof Button>

// Export a more convenient wrapper if needed
export const TamaguiButtonDemo = Button