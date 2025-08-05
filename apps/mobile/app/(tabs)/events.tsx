import * as React from 'react';
import { View, ScrollView, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { Typography, Card, CardContent, EventCard } from '@rite/ui';
import { useQuery } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { riteColors } from '../../constants/Colors';

export default function EventsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  // For now, show user's events. In the future, this could show all public events
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
          <Typography variant="h3" color="default" className="mb-2">
            Events
          </Typography>
          <Typography variant="body" color="secondary" className="mb-8">
            Discover upcoming events
          </Typography>
          
          {events === undefined ? (
            <View className="p-8 items-center">
              <ActivityIndicator size="large" color={riteColors.brand.primary} />
            </View>
          ) : events.length === 0 ? (
            <Card className="bg-neutral-700 border-neutral-600">
              <CardContent className="items-center">
                <Typography variant="body" color="default" className="text-center mb-1">
                  No events available
                </Typography>
                <Typography variant="caption" color="secondary" className="text-center">
                  Check back later for upcoming events
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
      </ScrollView>
    </SafeAreaView>
  );
}

