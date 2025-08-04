import * as React from 'react';
import { View, ScrollView, SafeAreaView, Platform, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Card, CardContent, EventCard } from '@rite/ui';
import { useQuery } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@rite/ui';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const events = useQuery(api.events.listEvents, 
    user ? { userId: user._id } : "skip"
  );
  
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
            Create New Event
          </Button>
          
          {/* Your Events Section */}
          <View className="mb-6">
            <Typography variant="h5" className="mb-4 text-white">
              Your Events
            </Typography>
            
            {events === undefined ? (
              <View className="p-8">
                <ActivityIndicator size="large" color="var(--brand-primary)" />
              </View>
            ) : events.length === 0 ? (
              <Card className="bg-neutral-700 border-neutral-600">
                <CardContent>
                  <Typography variant="body" className="text-center mb-1 text-white">
                    No events yet
                  </Typography>
                  <Typography variant="caption" className="text-center text-neutral-400">
                    Create your first event to get started
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <View className="gap-4">
                {events.map((event) => (
                  <EventCard
                    key={event._id}
                    eventName={event.name}
                    venueName={event.venue.name}
                    date={event.date}
                    djCount={event.timeslots?.length || 0}
                    dueDate={event.deadlines?.guestList || ''}
                    status={event.status === 'active' ? 'published' : 'draft'}
                    onViewDetails={() => {
                      router.push(`/events/${event._id}`);
                    }}
                    onShare={() => {
                      // TODO: Implement share functionality
                    }}
                  />
                ))}
              </View>
            )}
          </View>
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

