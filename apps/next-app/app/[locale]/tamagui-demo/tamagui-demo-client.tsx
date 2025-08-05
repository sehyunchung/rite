'use client'

import * as React from 'react'
import { TamaguiProvider, Theme, Stack } from '@tamagui/core'
import { YStack, XStack } from '@tamagui/stacks'
import { useTheme } from 'next-themes'
import config from '../../../../../packages/ui/src/tamagui.config'
import { Button } from '../../../../../packages/ui/src/components/tamagui-button/button'
import { 
  H1, H2, H3, H4, H5, H6, 
  Body, BodyLarge, BodySmall, 
  Caption, Label,
  Text 
} from '../../../../../packages/ui/src/components/tamagui-text/text'

export function TamaguiDemoClient() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  
  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return null
  }
  
  const currentTheme = theme as 'light' | 'dark' || 'dark'
  
  return (
    <TamaguiProvider 
      config={config}
      disableInjectCSS
      defaultTheme={currentTheme}
    >
      <Theme name={currentTheme}>
        <YStack flex={1} backgroundColor="$background" padding="$8" space="$8">
          {/* Theme Switcher */}
          <XStack justifyContent="space-between" alignItems="center">
            <H1>Tamagui POC Demo</H1>
            <Button 
              variant="outline" 
              size="sm"
              onPress={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
            >
              Toggle Theme ({currentTheme})
            </Button>
          </XStack>
          
          {/* Typography Demo */}
          <YStack space="$4">
            <H2 color="primary">Typography Components</H2>
            <H1>Heading 1 - RITE Platform</H1>
            <H2>Heading 2 - Event Management</H2>
            <H3>Heading 3 - DJ Submissions</H3>
            <H4>Heading 4 - Settings</H4>
            <H5>Heading 5 - Profile</H5>
            <H6>Heading 6 - Details</H6>
            
            <BodyLarge>Large body text for important content</BodyLarge>
            <Body>Regular body text for general content</Body>
            <BodySmall>Small body text for secondary information</BodySmall>
            <Caption>Caption text for metadata and timestamps</Caption>
            <Label>LABEL TEXT FOR FORMS</Label>
          </YStack>
          
          {/* Button Variants */}
          <YStack space="$4">
            <H2 color="primary">Button Components</H2>
            
            {/* Size Variants */}
            <YStack space="$3">
              <H4>Sizes</H4>
              <XStack space="$3" flexWrap="wrap">
                <Button size="sm">Small Button</Button>
                <Button size="default">Default Button</Button>
                <Button size="lg">Large Button</Button>
                <Button size="icon">🎵</Button>
              </XStack>
            </YStack>
            
            {/* Style Variants */}
            <YStack space="$3">
              <H4>Variants</H4>
              <XStack space="$3" flexWrap="wrap">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </XStack>
            </YStack>
            
            {/* States */}
            <YStack space="$3">
              <H4>States</H4>
              <XStack space="$3" flexWrap="wrap">
                <Button>Normal</Button>
                <Button disabled>Disabled</Button>
                <Button fullWidth>Full Width Button</Button>
              </XStack>
            </YStack>
          </YStack>
          
          {/* Color Variants */}
          <YStack space="$4">
            <H2 color="primary">Text Color Variants</H2>
            <Text color="default">Default text color</Text>
            <Text color="primary">Primary brand color</Text>
            <Text color="secondary">Secondary text color</Text>
            <Text color="muted">Muted text color</Text>
            <Text color="success">Success state color</Text>
            <Text color="error">Error state color</Text>
            <Text color="warning">Warning state color</Text>
            <Text color="info">Info state color</Text>
          </YStack>
          
          {/* Responsive Demo */}
          <YStack space="$4">
            <H2 color="primary">Responsive Design</H2>
            <Stack
              flexDirection="column"
              $gtSm={{
                flexDirection: 'row',
              }}
              space="$4"
            >
              <YStack 
                flex={1} 
                backgroundColor="$backgroundHover" 
                padding="$4" 
                borderRadius="$4"
              >
                <H4>Card 1</H4>
                <Body>This layout changes from column to row on larger screens</Body>
              </YStack>
              <YStack 
                flex={1} 
                backgroundColor="$backgroundHover" 
                padding="$4" 
                borderRadius="$4"
              >
                <H4>Card 2</H4>
                <Body>Tamagui makes responsive design easy with $ prefixed props</Body>
              </YStack>
            </Stack>
          </YStack>
          
          {/* Benefits Summary */}
          <YStack space="$4" marginTop="$8">
            <H2 color="primary">Tamagui Benefits for RITE</H2>
            <YStack space="$2">
              <Body>✅ Single component definition works on both web and mobile</Body>
              <Body>✅ Real-time theme switching on all platforms</Body>
              <Body>✅ Type-safe design tokens with autocomplete</Body>
              <Body>✅ Built-in responsive design with $gtSm, $gtMd props</Body>
              <Body>✅ Optimizing compiler for better performance</Body>
              <Body>✅ Seamless integration with existing RITE design tokens</Body>
              <Body>✅ Theme persistence across page reloads</Body>
            </YStack>
          </YStack>
        </YStack>
      </Theme>
    </TamaguiProvider>
  )
}