import { styled, GetProps, Text as TamaguiText } from '@tamagui/core'

// Base Text component
export const Text = styled(TamaguiText, {
  name: 'Text',
  color: '$color',
  fontFamily: '$body',
  fontSize: '$4', // Default font size
  
  variants: {
    // Color variants based on RITE design system
    color: {
      default: {
        color: '$color',
      },
      primary: {
        color: '$brandPrimary',
      },
      secondary: {
        color: '$colorPress',
      },
      muted: {
        color: '$colorPress',
      },
      success: {
        color: '$successBg',
      },
      error: {
        color: '$errorBg',
      },
      warning: {
        color: '$warningBg',
      },
      info: {
        color: '$infoBg',
      },
    },
    
    // Font weight variants
    weight: {
      normal: { fontWeight: '400' },
      medium: { fontWeight: '500' },
      semibold: { fontWeight: '600' },
      bold: { fontWeight: '700' },
    },
    
    // Text alignment
    align: {
      left: { textAlign: 'left' },
      center: { textAlign: 'center' },
      right: { textAlign: 'right' },
    },
  } as const,
  
  defaultVariants: {
    color: 'default',
  },
})

// Heading components with predefined styles
export const H1 = styled(Text, {
  name: 'H1',
  fontSize: '$14', // 64px
  lineHeight: '$14',
  fontWeight: '700',
  letterSpacing: '$1',
})

export const H2 = styled(Text, {
  name: 'H2',
  fontSize: '$12', // 48px
  lineHeight: '$12',
  fontWeight: '700',
  letterSpacing: '$1',
})

export const H3 = styled(Text, {
  name: 'H3',
  fontSize: '$10', // 36px
  lineHeight: '$10',
  fontWeight: '600',
  letterSpacing: '$2',
})

export const H4 = styled(Text, {
  name: 'H4',
  fontSize: '$8', // 28px
  lineHeight: '$8',
  fontWeight: '600',
  letterSpacing: '$2',
})

export const H5 = styled(Text, {
  name: 'H5',
  fontSize: '$7', // 24px
  lineHeight: '$7',
  fontWeight: '600',
})

export const H6 = styled(Text, {
  name: 'H6',
  fontSize: '$6', // 20px
  lineHeight: '$6',
  fontWeight: '600',
})

// Body text variants
export const Body = styled(Text, {
  name: 'Body',
  fontSize: '$4', // 16px
  lineHeight: '$5',
  fontWeight: '400',
})

export const BodyLarge = styled(Text, {
  name: 'BodyLarge',
  fontSize: '$5', // 18px
  lineHeight: '$6',
  fontWeight: '400',
})

export const BodySmall = styled(Text, {
  name: 'BodySmall',
  fontSize: '$3', // 14px
  lineHeight: '$3',
  fontWeight: '400',
})

export const Caption = styled(Text, {
  name: 'Caption',
  fontSize: '$2', // 12px
  lineHeight: '$2',
  fontWeight: '400',
  opacity: 0.7,  // Make it slightly muted
})

export const Label = styled(Text, {
  name: 'Label',
  fontSize: '$3', // 14px
  lineHeight: '$3',
  fontWeight: '600',
  letterSpacing: '$3',
})

// Export types
export type TextProps = GetProps<typeof Text>
export type H1Props = GetProps<typeof H1>
export type H2Props = GetProps<typeof H2>
export type H3Props = GetProps<typeof H3>
export type H4Props = GetProps<typeof H4>
export type H5Props = GetProps<typeof H5>
export type H6Props = GetProps<typeof H6>
export type BodyProps = GetProps<typeof Body>
export type CaptionProps = GetProps<typeof Caption>
export type LabelProps = GetProps<typeof Label>