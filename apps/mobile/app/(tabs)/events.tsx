import * as React from 'react';
import { View, ScrollView, SafeAreaView, Platform } from 'react-native';
import { Typography, Card } from '@rite/ui';

export default function EventsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-neutral-800">
      <ScrollView className="flex-1">
        <View 
          className="p-6" 
          style={{ 
            paddingBottom: Platform.OS === 'ios' ? 124 : 104 
          }}
        >
          <Typography variant="h3" className="text-white mb-2">
            Events
          </Typography>
          <Typography variant="body" color="secondary" className="mb-8">
            Discover upcoming events
          </Typography>
          
          <Card className="bg-neutral-700 p-6 items-center">
            <Typography variant="body" className="text-white text-center mb-1">
              No events available
            </Typography>
            <Typography variant="caption" color="secondary" className="text-center">
              Check back later for upcoming events
            </Typography>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

