'use client'

import * as React from 'react'
import { TamaguiProvider, Theme, Stack, Text, getTokens } from '@tamagui/core'
import { YStack } from '@tamagui/stacks'
import config from '@rite/ui/tamagui.config'
import { SimpleButtonWithText, ButtonV2 } from '@rite/ui/components/tamagui-button'

export default function StepByStepDebug() {
  const tokens = getTokens()
  
  // Log all available tokens for debugging
  React.useEffect(() => {
    console.log('=== TAMAGUI DEBUG ===')
    console.log('Font size tokens:', Object.keys(tokens.size || {}))
    console.log('Font tokens in config:', 'Checking font config...')
    console.log('Color tokens:', Object.keys(tokens.color || {}))
    console.log('Brand primary:', tokens.color?.brandPrimary)
    console.log('Size tokens:', {
      '$8': tokens.size?.[8],
      '$10': tokens.size?.[10], 
      '$12': tokens.size?.[12]
    })
    console.log('=== END DEBUG ===')
  }, [tokens])

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <TamaguiProvider config={config} disableInjectCSS>
        <Theme name="dark">
          <YStack space="$6">
            <h1 className="text-2xl font-bold text-white mb-4">Step by Step Debug</h1>
            
            {/* Step 1: Basic HTML button for comparison */}
            <YStack space="$3">
              <h2 className="text-lg text-white">1. HTML Button (Should Work)</h2>
              <button 
                style={{
                  backgroundColor: 'hsl(225, 100%, 75%)',
                  color: 'white',
                  border: '1px solid hsl(225, 100%, 75%)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  height: '40px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                HTML Button
              </button>
            </YStack>

            {/* Step 2: Basic Tamagui Stack with direct values */}
            <YStack space="$3">
              <h2 className="text-lg text-white">2. Tamagui Stack with Direct Values</h2>
              <Stack
                backgroundColor="hsl(225, 100%, 75%)"
                borderColor="hsl(225, 100%, 75%)"
                borderWidth={1}
                borderRadius={8}
                height={40}
                paddingHorizontal={16}
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
              >
                <Text color="white" fontSize={16} fontWeight="600">
                  Direct Values Stack
                </Text>
              </Stack>
            </YStack>

            {/* Step 3: Tamagui Stack with tokens */}
            <YStack space="$3">
              <h2 className="text-lg text-white">3. Tamagui Stack with Tokens</h2>
              <Stack
                backgroundColor="$brandPrimary"
                borderColor="$brandPrimary"
                borderWidth={1}
                borderRadius="$4"
                height="$10"
                paddingHorizontal="$4"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
              >
                <Text color="white" fontSize="$4" fontWeight="600">
                  Token Stack
                </Text>
              </Stack>
            </YStack>

            {/* Step 4: Simple Button Component */}
            <YStack space="$3">
              <h2 className="text-lg text-white">4. Simple Button Component</h2>
              <SimpleButtonWithText>
                Simple Button
              </SimpleButtonWithText>
            </YStack>

            {/* Step 5: ButtonV2 with Fixed Tokens */}
            <YStack space="$3">
              <h2 className="text-lg text-white">5. ButtonV2 with Fixed Tokens</h2>
              <ButtonV2 size="md" variant="primary">
                <ButtonV2.Text>Fixed ButtonV2</ButtonV2.Text>
              </ButtonV2>
            </YStack>

            {/* Debug Information */}
            <YStack space="$3">
              <h2 className="text-lg text-white">Debug Info</h2>
              <div className="text-sm text-gray-300 bg-gray-800 p-4 rounded font-mono">
                <p>Config loaded: {config ? 'Yes' : 'No'}</p>
                <p>Tokens available: {Object.keys(tokens).length}</p>
                <p>Font size tokens available: {Object.keys(tokens.size || {}).length > 0 ? 'Yes' : 'None'}</p>
                <p>Size tokens: {Object.keys(tokens.size || {}).join(', ')}</p>
                <p>Color tokens count: {Object.keys(tokens.color || {}).length}</p>
                <p>Brand primary: {tokens.color?.brandPrimary?.toString() || 'undefined'}</p>
              </div>
            </YStack>
          </YStack>
        </Theme>
      </TamaguiProvider>
    </div>
  )
}