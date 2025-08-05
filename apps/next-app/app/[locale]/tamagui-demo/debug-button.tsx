'use client'

import * as React from 'react'
import { TamaguiProvider, Theme, Stack, getTokens } from '@tamagui/core'
import { YStack, XStack } from '@tamagui/stacks'
import config from '../../../../../packages/ui/src/tamagui.config'
import { ButtonV2 } from '../../../../../packages/ui/src/components/tamagui-button/button-v2'

export default function DebugButtonPage() {
  const tokens = getTokens()
  
  console.log('Debug tokens:', {
    brandPrimary: tokens.color?.brandPrimary,
    size8: tokens.size?.[8],
    size10: tokens.size?.[10],
    size12: tokens.size?.[12],
    space3: tokens.space?.[3],
    space4: tokens.space?.[4],
    space6: tokens.space?.[6]
  })
  
  return (
    <div className="font-sans p-8">
      <TamaguiProvider config={config} disableInjectCSS>
        <Theme name="dark">
          <YStack space="$6">
            <h1 className="text-2xl font-bold text-white">Debug Button Test</h1>
            
            {/* Test basic Stack with direct values */}
            <YStack space="$4">
              <h2 className="text-lg font-semibold text-white">1. Basic Stack Test</h2>
              <Stack 
                backgroundColor="hsl(225, 100%, 75%)" 
                height={40}
                paddingHorizontal={16}
                alignItems="center"
                justifyContent="center"
                borderRadius={8}
              >
                <span style={{ color: 'white' }}>Direct Values Stack</span>
              </Stack>
            </YStack>
            
            {/* Test Stack with tokens */}
            <YStack space="$4">
              <h2 className="text-lg font-semibold text-white">2. Token Stack Test</h2>
              <Stack 
                backgroundColor="$brandPrimary" 
                height="$10"
                paddingHorizontal="$4"
                alignItems="center"
                justifyContent="center"
                borderRadius="$4"
              >
                <span style={{ color: 'white' }}>Token Stack</span>
              </Stack>
            </YStack>
            
            {/* Test ButtonV2 */}
            <YStack space="$4">
              <h2 className="text-lg font-semibold text-white">3. ButtonV2 Test</h2>
              <XStack space="$3">
                <ButtonV2 size="sm" variant="primary">
                  <ButtonV2.Text>Small</ButtonV2.Text>
                </ButtonV2>
                <ButtonV2 size="md" variant="primary">
                  <ButtonV2.Text>Medium</ButtonV2.Text>
                </ButtonV2>
                <ButtonV2 size="lg" variant="primary">
                  <ButtonV2.Text>Large</ButtonV2.Text>
                </ButtonV2>
              </XStack>
            </YStack>
            
            {/* Debug info */}
            <YStack space="$2">
              <h2 className="text-lg font-semibold text-white">Debug Token Info</h2>
              <div className="text-sm text-gray-300 font-mono">
                <p>brandPrimary: {JSON.stringify(tokens.color?.brandPrimary)}</p>
                <p>size.$8: {JSON.stringify(tokens.size?.[8])}</p>
                <p>size.$10: {JSON.stringify(tokens.size?.[10])}</p>
                <p>size.$12: {JSON.stringify(tokens.size?.[12])}</p>
                <p>space.$3: {JSON.stringify(tokens.space?.[3])}</p>
                <p>space.$4: {JSON.stringify(tokens.space?.[4])}</p>
                <p>space.$6: {JSON.stringify(tokens.space?.[6])}</p>
              </div>
            </YStack>
          </YStack>
        </Theme>
      </TamaguiProvider>
    </div>
  )
}