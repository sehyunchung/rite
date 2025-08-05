import * as React from 'react';
import { View, ScrollView, SafeAreaView, Platform, ActivityIndicator, Pressable } from 'react-native';
import { Typography, Card, CardHeader, CardContent, CardTitle, Button } from '../../lib/ui-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
// Design system colors via Tailwind CSS variables
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { riteColors } from '../../constants/Colors';
import { validateEventId } from '../../lib/validation';

export default function EventDetailScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  
  const validatedEventId = validateEventId(eventId);
  const event = useQuery(api.events.getEventWithCapabilities, 
    validatedEventId && user ? { eventId: validatedEventId, userId: user._id } : "skip"
  );

  if (!eventId) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-800">
        <View className="p-6">
          <Typography variant="body" color="secondary">
            No event ID provided
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  if (event === undefined) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-800">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={riteColors.brand.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-800">
        <View className="p-6">
          <Typography variant="body" color="secondary">
            Event not found
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString: string | number) => {
    if (!dateString) return 'No date set';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string | number) => {
    if (!timeString) return 'No time set';
    
    const date = new Date(timeString);
    if (isNaN(date.getTime())) {
      return 'Invalid time';
    }
    
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-800">
      <ScrollView className="flex-1">
        <View 
          className="p-6" 
          style={{ 
            paddingBottom: Platform.OS === 'ios' ? 80 : 60 
          }}
        >
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <Pressable 
              onPress={() => router.back()}
              className="mr-3"
            >
              <Ionicons name="arrow-back" size={24} color="#E0E0E6" />
            </Pressable>
            <Typography variant="h4" color="default" className="flex-1">
              Event Details
            </Typography>
          </View>

          {/* Event Info */}
          <Card className="mb-6 bg-neutral-700 border-neutral-600 rounded-2xl">
            <CardHeader className="p-6">
              <View className="flex-row items-center justify-between">
                <CardTitle className="text-white text-2xl font-bold">
                  {event.name}
                </CardTitle>
                <View className={`rounded-full px-3 py-1 ${
                  event.status === 'active' 
                    ? 'bg-green-500/20' 
                    : 'bg-neutral-600'
                }`}>
                  <Typography 
                    variant="caption" 
                    color={event.status === 'active' ? 'success' : 'secondary'}
                    className="text-xs font-medium"
                  >
                    {event.status === 'active' ? 'Published' : 'Draft'}
                  </Typography>
                </View>
              </View>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <View className="gap-3">
                <View className="flex-row items-center">
                  <Ionicons name="location" size={20} color="#8C8CA3" />
                  <Typography variant="body" color="secondary" className="ml-2">
                    {event.venue.name}
                  </Typography>
                </View>
                
                <View className="flex-row items-center">
                  <Ionicons name="calendar" size={20} color="#8C8CA3" />
                  <Typography variant="body" color="secondary" className="ml-2">
                    {formatDate(event.date)}
                  </Typography>
                </View>
                
                {event.description && (
                  <Typography variant="body" color="secondary" className="mt-2">
                    {event.description}
                  </Typography>
                )}
              </View>
            </CardContent>
          </Card>

          {/* Timeslots */}
          <Typography variant="h5" color="default" className="mb-4">
            DJ Lineup ({event.timeslots.length})
          </Typography>
          
          <View className="gap-3 mb-6">
            {event.timeslots.map((slot, index) => (
              <Card key={slot._id} className="bg-neutral-700 border-neutral-600 rounded-2xl">
                <CardContent className="p-6">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Typography variant="body" color="default" className="font-medium">
                        {slot.djName}
                      </Typography>
                      <Typography variant="caption" color="primary">
                        @{slot.djInstagram}
                      </Typography>
                    </View>
                    <Typography variant="caption" color="secondary">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </Typography>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>

          {/* Event Information */}
          <Typography variant="h5" color="default" className="mb-4">
            Event Information
          </Typography>
          
          <Card className="bg-neutral-700 border-neutral-600 rounded-2xl mb-6">
            <CardContent className="p-6">
              <View className="gap-4">
                <View>
                  <Typography variant="caption" color="secondary" className="mb-1">
                    Guest List Deadline
                  </Typography>
                  <Typography variant="body" color="default">
                    {formatDate(event.deadlines.guestList)}
                  </Typography>
                </View>
                
                <View>
                  <Typography variant="caption" color="secondary" className="mb-1">
                    Promo Materials Deadline
                  </Typography>
                  <Typography variant="body" color="default">
                    {formatDate(event.deadlines.promoMaterials)}
                  </Typography>
                </View>
                
                <View>
                  <Typography variant="caption" color="secondary" className="mb-1">
                    Payment
                  </Typography>
                  <Typography variant="body" color="default">
                    {event.payment.currency} {event.payment.perDJ} per DJ
                  </Typography>
                </View>
                
                <View>
                  <Typography variant="caption" color="secondary" className="mb-1">
                    Guest Limit
                  </Typography>
                  <Typography variant="body" color="default">
                    {event.guestLimitPerDJ} guests per DJ
                  </Typography>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Actions */}
          {event.capabilities.canEdit && (
            <View className="gap-3">
              <Button 
                onPress={() => router.push(`/events/${eventId}/edit`)}
                variant="default"
                size="default"
                className="rounded-lg"
              >
                Edit Event
              </Button>
              
              {event.capabilities.canPublish && event.status === 'draft' && (
                <Button 
                  onPress={() => {
                    // TODO: Implement publish functionality
                  }}
                  variant="secondary"
                  size="default"
                  className="rounded-lg"
                >
                  Publish Event
                </Button>
              )}
              
              <Button 
                onPress={() => router.push(`/events/${eventId}/submissions`)}
                variant="outline"
                size="default"
                className="rounded-lg border-neutral-600"
              >
                {`View Submissions (${event.submissionCount || 0})`}
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}