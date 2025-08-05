'use client'

import * as React from 'react'
import { TamaguiProvider, Theme, Stack, Text, styled } from '@tamagui/core'
import { YStack, XStack } from '@tamagui/stacks'
import config from '../../../../../packages/ui/src/tamagui.config'

// Simple button using Stack
const SimpleButton = styled(Stack, {
  backgroundColor: 'hsl(225deg 100% 75%)',  // Direct HSL color
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  
  variants: {
    size: {
      small: {
        paddingHorizontal: 12,
        paddingVertical: 6,
      },
      large: {
        paddingHorizontal: 24,
        paddingVertical: 12,
      },
    },
  },
})

// Simple text
const ButtonText = styled(Text, {
  color: 'white',
  fontSize: 16,
  fontWeight: '600',
})

export default function SimpleTestPage() {
  return (
    <div className="font-sans p-8">
      <TamaguiProvider config={config} disableInjectCSS>
        <Theme name="dark">
          <YStack space={16}>
            <Text fontSize={24}>Simple Tamagui Test</Text>
            
            {/* Test direct colors */}
            <YStack space={8}>
              <Text>Direct Color Test:</Text>
              <Stack backgroundColor="hsl(225deg 100% 75%)" padding={16} borderRadius={8}>
                <Text color="white">This should be blue (brand primary)</Text>
              </Stack>
            </YStack>
            
            {/* Test simple buttons */}
            <YStack space={8}>
              <Text>Simple Button Test:</Text>
              <XStack space={8}>
                <SimpleButton size="small">
                  <ButtonText>Small</ButtonText>
                </SimpleButton>
                <SimpleButton>
                  <ButtonText>Default</ButtonText>
                </SimpleButton>
                <SimpleButton size="large">
                  <ButtonText>Large</ButtonText>
                </SimpleButton>
              </XStack>
            </YStack>
            
            {/* Test theme tokens */}
            <YStack space={8}>
              <Text>Theme Token Test:</Text>
              <Stack backgroundColor="$brandPrimary" padding={16} borderRadius={8}>
                <Text color="white">$brandPrimary token</Text>
              </Stack>
              <Stack backgroundColor="$background" padding={16} borderRadius={8} borderWidth={1} borderColor="$borderColor">
                <Text>$background with $borderColor</Text>
              </Stack>
            </YStack>
          </YStack>
        </Theme>
      </TamaguiProvider>
    </div>
  )
}