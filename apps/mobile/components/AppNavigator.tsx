import React from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import AuthScreen from '../app/auth';
import { View, Text } from 'react-native';
import { riteColors } from '../constants/Colors';

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: riteColors.neutral[800] 
      }}>
        <Text style={{ color: riteColors.brand.primary, fontSize: 24 }}>
          Loading...
        </Text>
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="settings" 
        options={{ 
          headerShown: true,
          title: 'Settings',
          headerStyle: {
            backgroundColor: '#2A1F3F',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontFamily: 'SUIT-SemiBold',
          },
        }} 
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}