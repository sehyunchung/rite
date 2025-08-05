'use client'

import * as React from 'react'
import { TamaguiProvider, Theme, Stack, getTokens } from '@tamagui/core'
import { YStack, XStack } from '@tamagui/stacks'
import { Button as TamaguiButton } from '@tamagui/button'
import config from '../../../../../packages/ui/src/tamagui.config'
import { Button } from '../../../../../packages/ui/src/components/tamagui-button/button'
import { Body, H3 } from '../../../../../packages/ui/src/components/tamagui-text/text'

export default function TamaguiDebugPage() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('dark')
  const tokens = getTokens()
  
  return (
    <div className="font-sans p-8">
      <TamaguiProvider 
        config={config}
        disableInjectCSS
        defaultTheme={theme}
      >
        <Theme name={theme}>
          <YStack space="$8">
            {/* Debug Token Values */}
            <YStack space="$4">
              <H3>Debug: Token Values</H3>
              <Body>$brandPrimary: {JSON.stringify(tokens.color?.brandPrimary)}</Body>
              <Body>$brand-primary: {JSON.stringify(tokens.color?.brandPrimary)}</Body>
              <Body>Current theme: {theme}</Body>
            </YStack>

            {/* Test Native Tamagui Button */}
            <YStack space="$4">
              <H3>Native Tamagui Button (from @tamagui/button)</H3>
              <XStack space="$2">
                <TamaguiButton size="$2">Small</TamaguiButton>
                <TamaguiButton size="$4">Medium</TamaguiButton>
                <TamaguiButton size="$6">Large</TamaguiButton>
              </XStack>
            </YStack>

            {/* Test Our Custom Button */}
            <YStack space="$4">
              <H3>Our Custom Styled Button</H3>
              <XStack space="$2">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </XStack>
              
              <XStack space="$2">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
              </XStack>
            </YStack>

            {/* Test Basic Stack with Theme Colors */}
            <YStack space="$4">
              <H3>Basic Stack with Theme Colors</H3>
              <Stack backgroundColor="$brandPrimary" padding="$4" borderRadius="$3">
                <Body>This should have primary brand color</Body>
              </Stack>
              <Stack backgroundColor="$brandPrimary" padding="$4" borderRadius="$3">
                <Body>This should have brand primary color</Body>
              </Stack>
            </YStack>

            {/* Theme Toggle */}
            <TamaguiButton onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              Toggle Theme ({theme})
            </TamaguiButton>
          </YStack>
        </Theme>
      </TamaguiProvider>
    </div>
  )
}