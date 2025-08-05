'use client'

import * as React from 'react'
import { TamaguiProvider, Theme } from '@tamagui/core'
import { YStack, XStack } from '@tamagui/stacks'
import config from '@rite/ui/tamagui.config'
import { ButtonV2 } from '@rite/ui/components/tamagui-button'

export default function ButtonTestPage() {
  return (
    <div className="font-sans p-8">
      <TamaguiProvider config={config} disableInjectCSS>
        <Theme name="dark">
          <YStack space="$6">
            <h1 className="text-2xl font-bold text-white">Button Test Page</h1>
            
            {/* Size Test */}
            <YStack space="$4">
              <h2 className="text-lg font-semibold text-white">Size Variants</h2>
              <XStack space="$3" alignItems="center">
                <ButtonV2 size="sm">
                  <ButtonV2.Text>Small</ButtonV2.Text>
                </ButtonV2>
                <ButtonV2 size="md">
                  <ButtonV2.Text>Medium</ButtonV2.Text>
                </ButtonV2>
                <ButtonV2 size="lg">
                  <ButtonV2.Text>Large</ButtonV2.Text>
                </ButtonV2>
              </XStack>
            </YStack>
            
            {/* Color Variant Test */}
            <YStack space="$4">
              <h2 className="text-lg font-semibold text-white">Color Variants</h2>
              <XStack space="$3" alignItems="center">
                <ButtonV2 variant="primary">
                  <ButtonV2.Text>Primary</ButtonV2.Text>
                </ButtonV2>
                <ButtonV2 variant="secondary">
                  <ButtonV2.Text>Secondary</ButtonV2.Text>
                </ButtonV2>
                <ButtonV2 variant="outline">
                  <ButtonV2.Text>Outline</ButtonV2.Text>
                </ButtonV2>
                <ButtonV2 variant="ghost">
                  <ButtonV2.Text>Ghost</ButtonV2.Text>
                </ButtonV2>
              </XStack>
            </YStack>
            
            {/* Debug Info */}
            <YStack space="$2">
              <h2 className="text-lg font-semibold text-white">Debug Info</h2>
              <div className="text-sm text-gray-300">
                <p>Check console for any Tamagui warnings</p>
                <p>Expected: Small, Medium, Large buttons should have different sizes</p>
                <p>Expected: Primary should be purple, Secondary/Outline/Ghost should use theme colors</p>
              </div>
            </YStack>
          </YStack>
        </Theme>
      </TamaguiProvider>
    </div>
  )
}