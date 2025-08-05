import * as React from 'react'
import { ScrollView, SafeAreaView, useColorScheme } from 'react-native'
import { TamaguiProvider, Theme, Stack } from '@tamagui/core'
import { YStack, XStack } from '@tamagui/stacks'
import config from '../../../packages/ui/src/tamagui.config'
import { Button } from '../../../packages/ui/src/components/tamagui-button/button'
import { 
  H1, H2, H3, H4, H5, H6, 
  Body, BodyLarge, BodySmall, 
  Caption, Label,
  Text 
} from '../../../packages/ui/src/components/tamagui-text/text'

export default function TamaguiDemoScreen() {
  const systemTheme = useColorScheme()
  const [theme, setTheme] = React.useState<'light' | 'dark'>(systemTheme || 'dark')
  
  return (
    <TamaguiProvider config={config}>
      <Theme name={theme}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView>
            <YStack flex={1} backgroundColor="$background" padding="$6" space="$6">
              {/* Theme Switcher */}
              <XStack justifyContent="space-between" alignItems="center">
                <H3>Tamagui Mobile Demo</H3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? '☀️' : '🌙'}
                </Button>
              </XStack>
              
              {/* Typography Demo */}
              <YStack space="$3">
                <H4 color="primary">Typography</H4>
                <H1>Heading 1</H1>
                <H2>Heading 2</H2>
                <H3>Heading 3</H3>
                <H4>Heading 4</H4>
                <H5>Heading 5</H5>
                <H6>Heading 6</H6>
                
                <BodyLarge>Large body text</BodyLarge>
                <Body>Regular body text</Body>
                <BodySmall>Small body text</BodySmall>
                <Caption>Caption text</Caption>
                <Label>LABEL TEXT</Label>
              </YStack>
              
              {/* Button Variants */}
              <YStack space="$3">
                <H4 color="primary">Buttons</H4>
                
                {/* Size Variants */}
                <YStack space="$2">
                  <Label>Sizes</Label>
                  <XStack space="$2" flexWrap="wrap">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                  </XStack>
                </YStack>
                
                {/* Style Variants */}
                <YStack space="$2">
                  <Label>Variants</Label>
                  <YStack space="$2">
                    <Button variant="default" fullWidth>Default</Button>
                    <Button variant="secondary" fullWidth>Secondary</Button>
                    <Button variant="outline" fullWidth>Outline</Button>
                    <Button variant="ghost" fullWidth>Ghost</Button>
                    <Button variant="destructive" fullWidth>Destructive</Button>
                  </YStack>
                </YStack>
              </YStack>
              
              {/* Color Variants */}
              <YStack space="$3">
                <H4 color="primary">Text Colors</H4>
                <Text color="default">Default color</Text>
                <Text color="primary">Primary color</Text>
                <Text color="secondary">Secondary color</Text>
                <Text color="muted">Muted color</Text>
                <Text color="success">Success color</Text>
                <Text color="error">Error color</Text>
                <Text color="warning">Warning color</Text>
                <Text color="info">Info color</Text>
              </YStack>
              
              {/* Benefits */}
              <YStack space="$3" marginTop="$4">
                <H4 color="primary">Key Benefits</H4>
                <YStack space="$2" backgroundColor="$backgroundHover" padding="$4" borderRadius="$4">
                  <Body weight="semibold">✅ Unified Components</Body>
                  <BodySmall>Same code works on web and mobile</BodySmall>
                </YStack>
                <YStack space="$2" backgroundColor="$backgroundHover" padding="$4" borderRadius="$4">
                  <Body weight="semibold">✅ Dynamic Theming</Body>
                  <BodySmall>Real-time theme switching on mobile!</BodySmall>
                </YStack>
                <YStack space="$2" backgroundColor="$backgroundHover" padding="$4" borderRadius="$4">
                  <Body weight="semibold">✅ Performance</Body>
                  <BodySmall>Optimized for React Native</BodySmall>
                </YStack>
              </YStack>
            </YStack>
          </ScrollView>
        </SafeAreaView>
      </Theme>
    </TamaguiProvider>
  )
}