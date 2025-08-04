import * as React from 'react';
import { View, ScrollView, SafeAreaView, Platform, ActivityIndicator, Pressable } from 'react-native';
import { Typography, Card, CardHeader, CardContent, CardTitle, Badge } from '@rite/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { Id } from '@rite/backend/convex/_generated/dataModel';
import { useAuth } from '../../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function SubmissionsScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  
  const event = useQuery(api.events.getEvent, 
    eventId && user ? { eventId: eventId as Id<"events">, userId: user._id } : "skip"
  );
  
  const submissions = useQuery(api.submissions.getSubmissionsByEvent,
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

  if (event === undefined || submissions === undefined) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-800">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="var(--brand-primary)" />
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
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
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

  // Group submissions by timeslot
  const submissionsByTimeslot = submissions.reduce((acc, submission) => {
    const timeslotId = submission.timeslotId;
    if (!acc[timeslotId]) {
      acc[timeslotId] = [];
    }
    acc[timeslotId].push(submission);
    return acc;
  }, {} as Record<string, typeof submissions>);

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
              <Ionicons name="arrow-back" size={24} color="var(--text-primary)" />
            </Pressable>
            <Typography variant="h4" className="flex-1 text-white">
              Submissions
            </Typography>
          </View>

          {/* Event Info */}
          <Card className="bg-neutral-700 border-neutral-600 mb-6">
            <CardHeader>
              <CardTitle className="text-white">
                {event.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Typography variant="body" className="text-neutral-400">
                Total Submissions: {submissions.length}
              </Typography>
            </CardContent>
          </Card>

          {/* Submissions by Timeslot */}
          {event.timeslots.length === 0 ? (
            <Card className="bg-neutral-700 border-neutral-600">
              <CardContent>
                <Typography variant="body" className="text-center text-neutral-400">
                  No timeslots configured for this event
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <View className="gap-6">
              {event.timeslots.map((timeslot) => {
                const slotSubmissions = submissionsByTimeslot[timeslot._id] || [];
                
                return (
                  <View key={timeslot._id}>
                    <View className="flex-row items-center justify-between mb-3">
                      <View>
                        <Typography variant="h6" className="text-white">
                          {formatTime(timeslot.startTime)} - {formatTime(timeslot.endTime)}
                        </Typography>
                        <Typography variant="caption" color="secondary">
                          {timeslot.djName || 'Open Slot'} 
                          {timeslot.djInstagram && ` • @${timeslot.djInstagram}`}
                        </Typography>
                      </View>
                      <Badge variant={slotSubmissions.length > 0 ? 'default' : 'outline'}>
                        {`${slotSubmissions.length} submission${slotSubmissions.length !== 1 ? 's' : ''}`}
                      </Badge>
                    </View>
                    
                    {slotSubmissions.length === 0 ? (
                      <Card className="bg-neutral-700 border-neutral-600">
                        <CardContent>
                          <Typography variant="body" className="text-center text-neutral-400">
                            No submissions yet
                          </Typography>
                        </CardContent>
                      </Card>
                    ) : (
                      <View className="gap-3">
                        {slotSubmissions.map((submission) => (
                          <Card key={submission._id} className="bg-neutral-700 border-neutral-600">
                            <CardHeader>
                              <View className="flex-row items-start justify-between">
                                <View className="flex-1">
                                  <CardTitle className="text-white text-base">
                                    {submission.guestList.length > 0 ? submission.guestList[0].name : 'Anonymous Submission'}
                                  </CardTitle>
                                  <Typography variant="caption" className="text-neutral-400">
                                    Submitted {formatDate(submission.submittedAt || new Date().toISOString())}
                                  </Typography>
                                </View>
                                <Badge variant="default">Submitted</Badge>
                              </View>
                            </CardHeader>
                            <CardContent>
                              {submission.guestList.length > 0 && (
                                <View className="mb-3">
                                  <Typography variant="caption" className="text-neutral-400 mb-1">
                                    Guests ({submission.guestList.length})
                                  </Typography>
                                  <Typography variant="body" className="text-neutral-300">
                                    {submission.guestList.map(guest => `${guest.name}${guest.phone ? ` (${guest.phone})` : ''}`).join(', ')}
                                  </Typography>
                                </View>
                              )}
                              
                              {submission.promoMaterials.description && (
                                <View className="mb-3">
                                  <Typography variant="caption" className="text-neutral-400 mb-1">
                                    Promo Description
                                  </Typography>
                                  <Typography variant="body" className="text-neutral-300">
                                    {submission.promoMaterials.description}
                                  </Typography>
                                </View>
                              )}
                              
                              {submission.promoMaterials.files.length > 0 && (
                                <View>
                                  <Typography variant="caption" className="text-brand-primary">
                                    {`📁 ${submission.promoMaterials.files.length} file${submission.promoMaterials.files.length !== 1 ? 's' : ''} uploaded`}
                                  </Typography>
                                </View>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}