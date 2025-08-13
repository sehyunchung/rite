# RITE Design System

A comprehensive design system for the RITE platform, supporting both web and mobile applications.

## Overview

The RITE Design System provides a unified visual language and component library for building consistent user interfaces across all RITE applications. It's built with platform-agnostic design tokens that adapt to web (React) and mobile (React Native) environments.

## Design Principles

1. **Dark-First**: Optimized for dark environments where DJs typically work
2. **Vibrant Accents**: Using bold pink/magenta (#E946FF) as primary brand color
3. **Clear Hierarchy**: Strong contrast between text levels for easy scanning
4. **Platform Adaptive**: Components that feel native on each platform
5. **Accessibility**: WCAG AA compliant color contrasts

## Color System

### Brand Colors

- **Primary**: `#E946FF` - Vibrant pink/magenta for CTAs and key actions
- **Primary Dark**: `#D01FFF` - Hover/pressed states
- **Primary Light**: `#F26FFF` - Highlights and accents

### Neutral Palette

A purple-tinted grayscale for sophisticated dark themes:

- **Background**: `#1A0F2F` - Deep purple-black
- **Surface**: `#2A1F3F` - Elevated surfaces (cards, inputs)
- **Border**: `#3A3A4A` - Subtle borders
- **Text Primary**: `#FFFFFF` - High contrast for readability
- **Text Secondary**: `#A8A8B3` - Muted text for descriptions

### Semantic Colors

- **Success**: `#4ADE80` - Positive actions/states
- **Warning**: `#FBBF24` - Caution/attention needed
- **Error**: `#EF4444` - Errors/destructive actions
- **Info**: `#3B82F6` - Informational messages

## Typography

### Font Family

- **Primary**: SUIT Variable (Korean/English support)
- **Weights**: 100-900 (variable font)
- **Fallback**: System fonts

### Type Scale

```
5xl: 48px - Display Large
4xl: 36px - Display Medium
3xl: 30px - Display Small / H1
2xl: 24px - H2
xl:  20px - H3
lg:  18px - H4 / Body Large
base: 16px - Body
sm:  14px - Body Small / Labels
xs:  12px - Captions
```

## Spacing System

Based on 4px unit with consistent scale:

```
0:   0px
1:   4px
2:   8px
3:   12px
4:   16px
5:   20px
6:   24px
8:   32px
10:  40px
12:  48px
16:  64px
20:  80px
```

### Common Patterns

- **Screen Padding**: 16-32px
- **Card Padding**: 24px
- **Component Padding**: 8-24px
- **List Item Gap**: 12px
- **Form Field Gap**: 24px

## Border Radius

```
xs:  2px  - Subtle rounding
sm:  4px  - Small elements
md:  8px  - Buttons, badges
lg:  12px - Inputs, small cards
xl:  16px - Cards
2xl: 24px - Modals, large cards
full: 9999px - Pills, circular elements
```

## Elevation (Shadows)

### Web Shadows

- **xs**: Subtle elevation for interactive elements
- **sm-md**: Cards and raised surfaces
- **lg-xl**: Modals and overlays
- **glow**: Brand color glow effects for focus states

### Mobile Shadows

Combined iOS shadow + Android elevation for cross-platform consistency.

## Component Guidelines

### Buttons

- **Primary**: Pink background for main CTAs
- **Secondary**: Dark gray for secondary actions
- **Ghost**: Transparent with hover states
- **Sizes**: sm (32px), default (36px), lg (40px)
- **Border Radius**: 16px (xl) - Standardized across all components

### Inputs

- **Background**: Surface color (#2A1F3F)
- **Border**: 1px solid border color on focus
- **Border Radius**: 16px (xl) - Standardized with cards and buttons
- **Padding**: 16px horizontal
- **Height**: 48px

### Cards

- **Background**: Surface color (#2A1F3F)
- **Border Radius**: 16px (xl)
- **Padding**: 24px
- **Shadow**: sm-md elevation

### Lists

- **Item Height**: 56-72px
- **Icon Size**: 24px
- **Padding**: 16px horizontal
- **Dividers**: Optional 1px borders

## Implementation

### Using Design Tokens

```typescript
import { tokens } from '@rite/ui';

// Colors
const primaryColor = tokens.colors.brand.primary;
const backgroundColor = tokens.colors.neutral[800];

// Typography
const headingStyle = tokens.patterns.typography.h1;

// Spacing
const padding = tokens.spacing[4]; // 16px

// Platform-specific
const webShadow = tokens.web.shadows.md;
const mobileShadow = tokens.mobile.shadows.md;
```

### Component Example

```typescript
// Web component
import { tokens } from '@rite/ui';

const StyledButton = styled.button`
  background-color: ${tokens.colors.brand.primary};
  padding: ${tokens.spacing[3]}px ${tokens.spacing[6]}px;
  border-radius: ${tokens.radius.md}px;
  font-size: ${tokens.typography.fontSize.base}px;
  font-weight: ${tokens.typography.fontWeight.medium};
  box-shadow: ${tokens.web.shadows.sm};
`;

// React Native component
import { tokens } from '@rite/ui';

const styles = StyleSheet.create({
  button: {
    backgroundColor: tokens.colors.brand.primary,
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[6],
    borderRadius: tokens.radius.md,
    ...tokens.mobile.shadows.sm,
  },
  buttonText: {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.neutral[0],
  },
});
```

## Migration Guide

For existing components:

1. Replace hardcoded colors with design tokens
2. Update spacing to use the spacing scale
3. Apply typography variants instead of custom styles
4. Use elevation tokens for shadows
5. Ensure border radius follows the system

## Accessibility

- All color combinations meet WCAG AA standards
- Interactive elements have minimum 44x44px touch targets
- Focus states use brand color glow
- Text scales appropriately for readability

## Future Enhancements

- [ ] Animation/transition tokens
- [ ] Icon system integration
- [ ] Component motion guidelines
- [ ] Light theme variant
- [ ] Expanded semantic color roles
