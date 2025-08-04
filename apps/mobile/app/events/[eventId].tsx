import * as React from 'react';
import { View, ScrollView, SafeAreaView, Platform, ActivityIndicator, Pressable } from 'react-native';
import { Typography, Card, Badge } from '@rite/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { Id } from '@rite/backend/convex/_generated/dataModel';
// Design system colors via Tailwind CSS variables
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { CrossPlatformButton as Button } from '../../components/ui';

export default function EventDetailScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  
  const event = useQuery(api.events.getEventWithCapabilities, 
    eventId && user ? { eventId: eventId as Id<"events">, userId: user._id } : "skip"
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
          <ActivityIndicator size="large" color="#E946FF" />
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
              <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>
            <Typography variant="h4" className="flex-1 text-white">
              Event Details
            </Typography>
          </View>

          {/* Event Info */}
          <Card className="bg-neutral-700 p-6 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Typography variant="h5" className="text-white">
                {event.name}
              </Typography>
              <Badge 
                variant={event.status === 'active' ? 'default' : 'outline'}
              >
                {event.status === 'active' ? 'Published' : 'Draft'}
              </Badge>
            </View>
            
            <View className="gap-3">
              <View className="flex-row items-center">
                <Ionicons name="location" size={20} color="#9CA3AF" />
                <Typography variant="body" className="ml-2 text-neutral-400">
                  {event.venue.name}
                </Typography>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={20} color="#9CA3AF" />
                <Typography variant="body" className="ml-2 text-neutral-400">
                  {formatDate(event.date)}
                </Typography>
              </View>
              
              {event.description && (
                <Typography variant="body" className="mt-2 text-neutral-400">
                  {event.description}
                </Typography>
              )}
            </View>
          </Card>

          {/* Timeslots */}
          <Typography variant="h5" className="mb-4 text-white">
            DJ Lineup ({event.timeslots.length})
          </Typography>
          
          <View className="gap-3 mb-6">
            {event.timeslots.map((slot, index) => (
              <Card key={slot._id} className="bg-neutral-700 p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Typography variant="body" className="text-white">
                      {slot.djName}
                    </Typography>
                    <Typography variant="caption" color="secondary">
                      @{slot.djInstagram}
                    </Typography>
                  </View>
                  <Typography variant="caption" color="secondary">
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </Typography>
                </View>
              </Card>
            ))}
          </View>

          {/* Event Details */}
          <Card className="bg-neutral-700 p-6 mb-6">
            <Typography variant="h6" className="mb-4 text-white">
              Event Details
            </Typography>
            
            <View className="gap-3">
              <View>
                <Typography variant="caption" color="secondary">
                  Guest List Deadline
                </Typography>
                <Typography variant="body" className="text-white">
                  {formatDate(event.deadlines.guestList)}
                </Typography>
              </View>
              
              <View>
                <Typography variant="caption" color="secondary">
                  Promo Materials Deadline
                </Typography>
                <Typography variant="body" className="text-white">
                  {formatDate(event.deadlines.promoMaterials)}
                </Typography>
              </View>
              
              <View>
                <Typography variant="caption" color="secondary">
                  Payment
                </Typography>
                <Typography variant="body" className="text-white">
                  {event.payment.currency} {event.payment.perDJ} per DJ
                </Typography>
              </View>
              
              <View>
                <Typography variant="caption" color="secondary">
                  Guest Limit
                </Typography>
                <Typography variant="body" className="text-white">
                  {event.guestLimitPerDJ} guests per DJ
                </Typography>
              </View>
            </View>
          </Card>

          {/* Actions */}
          {event.capabilities.canEdit && (
            <View className="gap-3">
              <Button 
                onAction={() => router.push(`/events/${eventId}/edit`)}
                variant="default"
              >
                Edit Event
              </Button>
              
              {event.capabilities.canPublish && event.status === 'draft' && (
                <Button 
                  onAction={() => {
                    // TODO: Implement publish functionality
                  }}
                  variant="secondary"
                >
                  Publish Event
                </Button>
              )}
              
              <Button 
                onAction={() => router.push(`/events/${eventId}/submissions`)}
                variant="outline"
              >
                View Submissions ({event.submissionCount || 0})
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}