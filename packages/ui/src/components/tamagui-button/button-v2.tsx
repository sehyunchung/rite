import * as React from 'react'
import { 
  styled, 
  createStyledContext,
  Stack, 
  Text, 
  GetProps, 
  withStaticProperties 
} from '@tamagui/core'

// Create styled context for sharing button configuration
const ButtonContext = createStyledContext({
  size: 'md' as any,
  variant: 'primary' as any,
})

// Button Frame - the main container
const ButtonFrame = styled(Stack, {
  name: 'Button',
  context: ButtonContext,
  
  // Base styles
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  cursor: 'pointer',
  userSelect: 'none',
  
  // Use working tokens directly
  backgroundColor: 'transparent',
  borderColor: '$brandPrimary',
  borderWidth: 1,
  borderRadius: '$4',
  
  // Interactive states with working tokens
  hoverStyle: {
    backgroundColor: '$brandPrimaryLight',
    opacity: 0.9,
  },
  
  pressStyle: {
    backgroundColor: '$brandPrimaryDark',
    scale: 0.975,
  },
  
  focusStyle: {
    borderColor: '$brandPrimary',
    outlineWidth: 2,
    outlineColor: '$brandPrimary',
    outlineStyle: 'solid',
  },
  
  disabledStyle: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  variants: {
    size: {
      sm: {
        height: '$8',
        minHeight: '$8',
        paddingHorizontal: '$3',
        paddingVertical: '$2',
        borderRadius: '$3',
      },
      md: {
        height: '$10',
        minHeight: '$10',
        paddingHorizontal: '$4',
        paddingVertical: '$2.5',
        borderRadius: '$4',
      },
      lg: {
        height: '$12',
        minHeight: '$12',
        paddingHorizontal: '$6',
        paddingVertical: '$3',
        borderRadius: '$5',
      },
    },
    
    variant: {
      primary: {
        backgroundColor: '$brandPrimary',
        borderColor: '$brandPrimary',
        hoverStyle: {
          backgroundColor: '$brandPrimaryDark',
          borderColor: '$brandPrimaryDark',
        },
        pressStyle: {
          backgroundColor: '$brandPrimaryDark',
          borderColor: '$brandPrimaryDark',
        },
      },
      secondary: {
        backgroundColor: '$neutral700Dark',
        borderColor: '$neutral600Dark',
        hoverStyle: {
          backgroundColor: '$neutral600Dark',
        },
        pressStyle: {
          backgroundColor: '$neutral500Dark',
        },
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: '$brandPrimary',
        hoverStyle: {
          backgroundColor: '$brandPrimaryLight',
          opacity: 0.1,
        },
        pressStyle: {
          backgroundColor: '$brandPrimaryDark',
          opacity: 0.2,
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        hoverStyle: {
          backgroundColor: '$brandPrimaryLight',
          opacity: 0.1,
        },
        pressStyle: {
          backgroundColor: '$brandPrimaryDark',
          opacity: 0.2,
        },
      },
    },
    
    fullWidth: {
      true: {
        width: '100%',
      },
    },
  } as const,

  defaultVariants: {
    size: 'md',
    variant: 'primary',
  },
})

// Button Text sub-component
const ButtonTextFrame = styled(Text, {
  name: 'ButtonText',
  context: ButtonContext,
  
  // Explicit font configuration to ensure proper rendering
  fontFamily: '$body',
  fontWeight: '600',
  fontSize: '$4', // Explicit default font size
  lineHeight: '$4', // Explicit default line height
  
  variants: {
    size: {
      sm: {
        fontSize: '$3',
        lineHeight: '$3',
      },
      md: {
        fontSize: '$4',
        lineHeight: '$4',
      },
      lg: {
        fontSize: '$5',
        lineHeight: '$5',
      },
    },
    variant: {
      primary: {
        color: 'white',
      },
      secondary: {
        color: 'white',
      },
      outline: {
        color: '$brandPrimary',
      },
      ghost: {
        color: '$brandPrimary',
      },
    },
  } as const,
})

// Export as compound component with static properties
export const ButtonV2 = withStaticProperties(ButtonFrame, {
  Text: ButtonTextFrame,
})

// Convenience wrapper component for backward compatibility
export function ButtonWithText({ 
  children, 
  size = 'md', 
  variant = 'primary',
  onPress,
  ...props 
}: GetProps<typeof ButtonFrame> & { children: React.ReactNode, onPress?: () => void }) {
  return (
    <ButtonV2 
      size={size} 
      variant={variant} 
      onPress={onPress}
      {...props}
    >
      <ButtonV2.Text size={size} variant={variant}>
        {children}
      </ButtonV2.Text>
    </ButtonV2>
  )
}

export type ButtonV2Props = GetProps<typeof ButtonFrame>
export type ButtonTextProps = GetProps<typeof ButtonTextFrame>