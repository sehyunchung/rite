import * as React from 'react';
import { View, ScrollView, SafeAreaView, Platform, ActivityIndicator, Pressable } from 'react-native';
import { Typography, Card, CardHeader, CardContent, CardTitle } from '../../../lib/ui-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { useAuth } from '../../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { riteColors } from '../../../constants/Colors';
import { validateEventId } from '../../../lib/validation';

export default function SubmissionsScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  
  const validatedEventId = validateEventId(eventId);
  const event = useQuery(api.events.getEvent, 
    validatedEventId && user ? { eventId: validatedEventId, userId: user._id } : "skip"
  );
  
  const submissions = useQuery(api.submissions.getSubmissionsByEvent,
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

  if (event === undefined || submissions === undefined) {
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
              <Ionicons name="arrow-back" size={24} color="#E0E0E6" />
            </Pressable>
            <Typography variant="h4" color="default" className="flex-1">
              Submissions
            </Typography>
          </View>

          {/* Event Info */}
          <Card className="bg-neutral-700 border-neutral-600 rounded-2xl mb-6">
            <CardHeader className="p-6">
              <CardTitle className="text-white text-2xl font-bold">
                {event.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <Typography variant="body" color="secondary">
                Total Submissions: {submissions.length}
              </Typography>
            </CardContent>
          </Card>

          {/* Submissions by Timeslot */}
          {event.timeslots.length === 0 ? (
            <Card className="bg-neutral-700 border-neutral-600 rounded-2xl">
              <CardContent className="p-6">
                <Typography variant="body" color="secondary" className="text-center">
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
                        <Typography variant="h6" color="default">
                          {formatTime(timeslot.startTime)} - {formatTime(timeslot.endTime)}
                        </Typography>
                        <Typography variant="caption" color="secondary">
                          {timeslot.djName || 'Open Slot'} 
                          {timeslot.djInstagram && ` • @${timeslot.djInstagram}`}
                        </Typography>
                      </View>
                      <View className={`rounded-full px-3 py-1 ${slotSubmissions.length > 0 ? 'bg-green-500/20' : 'bg-neutral-600'}`}>
                        <Typography 
                          variant="caption" 
                          color={slotSubmissions.length > 0 ? 'success' : 'secondary'}
                          className="text-xs font-medium"
                        >
                          {`${slotSubmissions.length} submission${slotSubmissions.length !== 1 ? 's' : ''}`}
                        </Typography>
                      </View>
                    </View>
                    
                    {slotSubmissions.length === 0 ? (
                      <Card className="bg-neutral-700 border-neutral-600 rounded-2xl">
                        <CardContent className="p-6">
                          <Typography variant="body" color="secondary" className="text-center">
                            No submissions yet
                          </Typography>
                        </CardContent>
                      </Card>
                    ) : (
                      <View className="gap-3">
                        {slotSubmissions.map((submission) => (
                          <Card key={submission._id} className="bg-neutral-700 border-neutral-600 rounded-2xl">
                            <CardHeader className="p-6">
                              <View className="flex-row items-start justify-between">
                                <View className="flex-1">
                                  <CardTitle className="text-white text-base">
                                    {submission.guestList.length > 0 ? submission.guestList[0].name : 'Anonymous Submission'}
                                  </CardTitle>
                                  <Typography variant="caption" color="secondary">
                                    Submitted {formatDate(submission.submittedAt || new Date().toISOString())}
                                  </Typography>
                                </View>
                                <View className="rounded-full px-3 py-1 bg-green-500/20">
                                  <Typography variant="caption" color="success" className="text-xs font-medium">
                                    Submitted
                                  </Typography>
                                </View>
                              </View>
                            </CardHeader>
                            <CardContent className="p-6 pt-0">
                              {submission.guestList.length > 0 && (
                                <View className="mb-3">
                                  <Typography variant="caption" color="secondary" className="mb-1">
                                    Guests ({submission.guestList.length})
                                  </Typography>
                                  <Typography variant="body" color="default">
                                    {submission.guestList.map(guest => `${guest.name}${guest.phone ? ` (${guest.phone})` : ''}`).join(', ')}
                                  </Typography>
                                </View>
                              )}
                              
                              {submission.promoMaterials.description && (
                                <View className="mb-3">
                                  <Typography variant="caption" color="secondary" className="mb-1">
                                    Promo Description
                                  </Typography>
                                  <Typography variant="body" color="default">
                                    {submission.promoMaterials.description}
                                  </Typography>
                                </View>
                              )}
                              
                              {submission.promoMaterials.files.length > 0 && (
                                <View>
                                  <Typography variant="caption" color="primary">
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