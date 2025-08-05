'use client'

import * as React from 'react'
import { 
  H1, H2, H3, H4, H5, H6, 
  Body, BodyLarge, BodySmall, 
  Caption, TextLabel, Text,
  Button 
} from '@rite/ui'

export default function NativeWindDemo() {
  const [count, setCount] = React.useState(0)
  
  return (
    <div className="min-h-screen bg-neutral-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <H1 className="text-white">NativeWind Component Demo</H1>
          <Body className="text-neutral-400">Typography and Button components powered by NativeWind</Body>
        </div>
        
        {/* Typography Demo */}
        <div className="space-y-6 bg-neutral-800 rounded-lg p-6">
          <H2 color="primary">Typography Components</H2>
          
          <div className="space-y-4">
            <H1>Heading 1 - RITE Platform (64px)</H1>
            <H2>Heading 2 - Event Management (48px)</H2>
            <H3>Heading 3 - DJ Submissions (36px)</H3>
            <H4>Heading 4 - Settings (28px)</H4>
            <H5>Heading 5 - Profile (24px)</H5>
            <H6>Heading 6 - Details (20px)</H6>
            
            <div className="mt-6 space-y-2">
              <BodyLarge>Large body text for important content (18px)</BodyLarge>
              <Body>Regular body text for general content (16px)</Body>
              <BodySmall>Small body text for secondary information (14px)</BodySmall>
              <Caption>Caption text for metadata and timestamps (12px)</Caption>
              <TextLabel>LABEL TEXT FOR FORMS</TextLabel>
            </div>
          </div>
        </div>
        
        {/* Button Demo */}
        <div className="space-y-6 bg-neutral-800 rounded-lg p-6">
          <H2 color="primary">Button Components</H2>
          
          {/* Size Variants */}
          <div className="space-y-4">
            <H4>Button Sizes</H4>
            <div className="flex flex-wrap gap-3">
              <Button size="sm">Small Button</Button>
              <Button size="default">Default Button</Button>
              <Button size="lg">Large Button</Button>
              <Button size="icon">🎵</Button>
            </div>
          </div>
          
          {/* Variant Styles */}
          <div className="space-y-4">
            <H4>Button Variants</H4>
            <div className="flex flex-wrap gap-3">
              <Button variant="default">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </div>
          
          {/* States */}
          <div className="space-y-4">
            <H4>Button States</H4>
            <div className="flex flex-wrap gap-3">
              <Button>Normal</Button>
              <Button disabled>Disabled</Button>
              <Button className="w-24">Full Width</Button>
            </div>
          </div>
          
          {/* Interactive Example */}
          <div className="space-y-4">
            <H4>Interactive Example</H4>
            <div className="flex items-center gap-4">
              <Button onClick={() => setCount(count + 1)}>
                Clicked {count} times
              </Button>
              <Button variant="outline" onClick={() => setCount(0)}>
                Reset
              </Button>
            </div>
          </div>
        </div>
        
        {/* Color Variants */}
        <div className="space-y-6 bg-neutral-800 rounded-lg p-6">
          <H2 color="primary">Text Color Variants</H2>
          <div className="space-y-2">
            <Text color="default">Default text color</Text>
            <Text color="primary">Primary brand color</Text>
            <Text color="secondary">Secondary text color</Text>
            <Text color="muted">Muted text color</Text>
            <Text color="success">Success state color</Text>
            <Text color="error">Error state color</Text>
            <Text color="warning">Warning state color</Text>
            <Text color="info">Info state color</Text>
          </div>
        </div>
        
        {/* Benefits Summary */}
        <div className="space-y-4 bg-neutral-800 rounded-lg p-6">
          <H2 color="primary">NativeWind Benefits for RITE</H2>
          <div className="space-y-2">
            <Body>✅ Proper font sizing and weights working correctly</Body>
            <Body>✅ Consistent styling across web and mobile</Body>
            <Body>✅ Familiar Tailwind CSS classes</Body>
            <Body>✅ Better performance than Tamagui</Body>
            <Body>✅ Simpler configuration and setup</Body>
            <Body>✅ React Native Reusables integration ready</Body>
          </div>
        </div>
      </div>
    </div>
  )
}