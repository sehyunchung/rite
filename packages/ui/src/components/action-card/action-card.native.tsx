import React from 'react'
import { Pressable, Text, View } from 'react-native'
import '@rite/ui/types/nativewind';

export interface ActionCardProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  variant?: 'default' | 'primary' | 'secondary'
  onPress?: () => void
  className?: string
}

export function ActionCard({
  icon,
  title,
  subtitle,
  variant = 'default',
  onPress,
  className = '',
}: ActionCardProps) {
  const iconColors = {
    default: 'bg-blue-100',
    primary: 'bg-purple-100',
    secondary: 'bg-green-100'
  }

  return (
    <Pressable
      onPress={onPress}
      className={`w-full rounded-2xl border-2 border-dashed border-neutral-600 bg-neutral-700/50 p-8 active:bg-neutral-700 active:scale-[0.98] ${className}`}
    >
      <View className="items-center space-y-4">
        <View className={`h-16 w-16 items-center justify-center rounded-full ${iconColors[variant]}`}>
          {icon}
        </View>
        
        <View className="items-center">
          <Text className="text-lg font-semibold text-white">{title}</Text>
          <Text className="mt-1 text-sm text-neutral-400">{subtitle}</Text>
        </View>
      </View>
    </Pressable>
  )
}