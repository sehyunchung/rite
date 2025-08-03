import * as React from 'react';
import { View, ScrollView, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Typography, Card } from '@rite/ui';

export default function HomeScreen() {
  const router = useRouter();
  
  return (
    <SafeAreaView className="flex-1 bg-neutral-800">
      <ScrollView className="flex-1">
        <View 
          className="p-6" 
          style={{ 
            paddingBottom: Platform.OS === 'ios' ? 124 : 104 
          }}
        >
          <Typography variant="h3" color="primary" className="mb-2">
            RITE
          </Typography>
          <Typography variant="body" color="secondary" className="mb-6">
            DJ Event Management
          </Typography>
          
          {/* Create Event Button */}
          <Button 
            onPress={() => router.push('/(tabs)/create')}
            className="flex-row items-center justify-center mt-4 mb-8"
          >
            <Ionicons name="add-circle" size={24} color="hsl(210, 10%, 90%)" />
            <Typography variant="button" className="text-white ml-2">
              Create New Event
            </Typography>
          </Button>
          
          {/* Your Events Section */}
          <View className="mb-6">
            <Typography variant="h5" className="text-white mb-4">
              Your Events
            </Typography>
            
            <Card className="bg-neutral-700 p-6">
              <Typography variant="body" className="text-white text-center mb-1">
                No events yet
              </Typography>
              <Typography variant="caption" color="secondary" className="text-center">
                Create your first event to get started
              </Typography>
            </Card>
          </View>
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

