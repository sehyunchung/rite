import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { Link2 } from 'lucide-react-native'
import '../../types/nativewind'

export interface EventCardProps {
  eventName: string
  venueName: string
  date: string
  djCount: number
  dueDate: string
  status: 'draft' | 'published' | 'completed'
  onViewDetails?: () => void
  onShare?: () => void
  className?: string
}

export function EventCard({
  eventName,
  venueName,
  date,
  djCount,
  dueDate,
  status,
  onViewDetails,
  onShare,
  className = '',
}: EventCardProps) {
  const statusStyles = {
    draft: 'bg-neutral-600 text-neutral-200',
    published: 'bg-brand-primary/20 text-brand-primary',
    completed: 'bg-green-500/20 text-green-400'
  }

  return (
    <View className={`overflow-hidden rounded-2xl bg-neutral-700 p-6 shadow-lg ${className}`}>
      {/* Status badge */}
      <View className="absolute right-4 top-4 z-10">
        <View className={`rounded-full px-3 py-1 ${statusStyles[status]}`}>
          <Text className="text-xs font-medium">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View>
        <Text className="text-2xl font-bold text-white">{eventName}</Text>
        <Text className="mt-1 text-sm text-neutral-300">{venueName}</Text>
        
        <View className="mt-6 space-y-2">
          <Text className="text-lg text-white">{date}</Text>
          <Text className="text-sm text-brand-primary font-medium">{djCount} DJs</Text>
        </View>
        
        <View className="mt-4 border-t border-neutral-600 pt-4">
          <Text className="text-sm text-neutral-400">Guest list due: {dueDate}</Text>
        </View>
        
        {/* Actions */}
        <View className="mt-6 flex-row gap-3">
          <Pressable
            onPress={onViewDetails}
            className="flex-1 rounded-lg border border-neutral-600 bg-transparent px-4 py-2.5 active:bg-neutral-700"
          >
            <Text className="text-center text-sm font-medium text-white">View Details</Text>
          </Pressable>
          {onShare && (
            <Pressable
              onPress={onShare}
              className="h-10 w-10 items-center justify-center rounded-lg border border-neutral-600 bg-transparent active:bg-neutral-700"
            >
              <Link2 size={16} color="#FFFFFF" />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  )
}