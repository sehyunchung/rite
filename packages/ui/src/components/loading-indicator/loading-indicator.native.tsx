import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import '../../types/nativewind';

interface LoadingIndicatorProps {
  className?: string;
}

export function LoadingIndicator({ 
  className = '' 
}: LoadingIndicatorProps) {
  return (
    <View className={`items-center ${className}`}>
      <Text className="font-medium text-gray-300 text-4xl">
        RITE
      </Text>
      <ActivityIndicator 
        size="small" 
        color="#d1d5db" 
        style={{ marginTop: 8 }}
      />
    </View>
  );
}

export function FullScreenLoading() {
  return (
    <View className="flex-1 bg-gray-50 items-center justify-center">
      <LoadingIndicator />
    </View>
  );
}