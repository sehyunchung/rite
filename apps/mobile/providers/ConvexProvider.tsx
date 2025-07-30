import React, { useState, useEffect } from 'react';
import { ConvexProvider as ConvexReactProvider, ConvexReactClient } from 'convex/react';
import Constants from 'expo-constants';
import { View, Text, ActivityIndicator } from 'react-native';

// Create a singleton Convex client
let convexClient: ConvexReactClient | null = null;

function getConvexClient(): ConvexReactClient | null {
  // Only create client on client-side
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!convexClient) {
    // Use the same Convex URL as the web apps for now
    // In production, this would come from expo-constants
    const convexUrl = Constants.expoConfig?.extra?.convexUrl || 
                      'https://creative-gazelle-271.convex.cloud';
    
    if (!convexUrl) {
      console.warn('Missing Convex URL. Set EXPO_PUBLIC_CONVEX_URL in your environment.');
      return null;
    }
    
    convexClient = new ConvexReactClient(convexUrl);
  }
  
  return convexClient;
}

export function ConvexProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<ConvexReactClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize client only on client-side
    const convexClient = getConvexClient();
    setClient(convexClient);
    setIsLoading(false);
  }, []);

  // Show loading state during SSR and initial client render
  if (isLoading || !client) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 16, fontSize: 24, fontWeight: 'bold' }}>RITE</Text>
      </View>
    );
  }
  
  return (
    <ConvexReactProvider client={client}>
      {children}
    </ConvexReactProvider>
  );
}