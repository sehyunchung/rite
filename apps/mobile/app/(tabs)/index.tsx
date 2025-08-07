import * as React from 'react';
import { View, ScrollView, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography, Card, CardContent, EventCard , Button } from '../../lib/ui-native';
import { useQuery } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { useAuth } from '../../contexts/AuthContext';
import { themeColors } from '../../lib/theme-colors';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const events = useQuery(api.events.listEvents, 
    user ? { userId: user._id } : "skip"
  );
  
  return (
    <SafeAreaView className="flex-1 bg-neutral-800">
      <ScrollView 
        className="flex-1"
        accessible={true}
        accessibilityLabel="Dashboard content"
      >
        <View 
          className="p-6" 
          style={{ 
            paddingBottom: Platform.OS === 'ios' ? 124 : 104 
          }}
          accessibilityRole="main"
        >
          <View accessibilityRole="header">
            <Typography 
              variant="h3" 
              color="primary" 
              className="mb-2"
              accessibilityRole="text"
              accessibilityLabel="RITE - DJ Event Management Platform"
            >
              RITE
            </Typography>
            <Typography 
              variant="body" 
              color="secondary" 
              className="mb-6"
              accessibilityRole="text"
            >
              DJ Event Management
            </Typography>
          </View>
          
          {/* Create Event Button */}
          <Button 
            onPress={() => router.push('/(tabs)/create')}
            variant="default"
            size="default"
            className="flex-row items-center justify-center mt-4 mb-8 rounded-lg"
            accessibilityLabel="Create New Event"
            accessibilityHint="Navigate to create event form"
            testID="create-event-button"
          >
            Create New Event
          </Button>
          
          {/* Your Events Section */}
          <View className="mb-6" accessibilityRole="region" accessibilityLabel="Your events section">
            <Typography 
              variant="h5" 
              color="default" 
              className="mb-4"
              accessibilityRole="text"
            >
              Your Events
            </Typography>
            
            {events === undefined ? (
              <View 
                className="p-8"
                accessible={true}
                accessibilityLabel="Loading your events"
                accessibilityRole="progressbar"
              >
                <ActivityIndicator size="large" color={themeColors.brand.primary} />
              </View>
            ) : events.length === 0 ? (
              <Card 
                className="bg-neutral-700 border-neutral-600 rounded-2xl"
                accessible={true}
                accessibilityRole="text"
                accessibilityLabel="No events yet. Create your first event to get started."
              >
                <CardContent className="p-6">
                  <Typography variant="body" color="default" className="text-center mb-1">
                    No events yet
                  </Typography>
                  <Typography variant="caption" color="secondary" className="text-center">
                    Create your first event to get started
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <View 
                className="gap-4"
                accessible={true}
                accessibilityRole="list"
                accessibilityLabel={`${events.length} events available`}
              >
                {events.map((event, index) => (
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
                    // Add accessibility for EventCard as list item
                    accessible={true}
                    accessibilityRole="listitem"
                    accessibilityLabel={`Event ${index + 1} of ${events.length}: ${event.name} at ${event.venue.name}`}
                    accessibilityHint="Double tap to view event details"
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

