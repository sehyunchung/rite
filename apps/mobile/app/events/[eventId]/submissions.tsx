import * as React from 'react';
import { View, ScrollView, SafeAreaView, Platform, ActivityIndicator, Pressable } from 'react-native';
import { Typography, Card, Badge } from '@rite/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { riteColors as colors } from '../../../constants/Colors';
import { useAuth } from '../../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function SubmissionsScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  
  const event = useQuery(api.events.getEvent, 
    eventId && user ? { eventId: eventId as any, userId: user._id } : "skip"
  );
  
  const submissions = useQuery(api.submissions.getSubmissionsByEvent,
    eventId && user ? { eventId: eventId as any, userId: user._id } : "skip"
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
          <ActivityIndicator size="large" color={colors.brand.primary} />
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
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
              <Ionicons name="arrow-back" size={24} color={colors.functional.textPrimary} />
            </Pressable>
            <Typography variant="h4" className="flex-1" style={{ color: colors.functional.textPrimary }}>
              Submissions
            </Typography>
          </View>

          {/* Event Info */}
          <Card className="bg-neutral-700 p-4 mb-6">
            <Typography variant="h5" className="mb-1" style={{ color: colors.functional.textPrimary }}>
              {event.name}
            </Typography>
            <Typography variant="body" color="secondary">
              Total Submissions: {submissions.length}
            </Typography>
          </Card>

          {/* Submissions by Timeslot */}
          {event.timeslots.length === 0 ? (
            <Card className="bg-neutral-700 p-6">
              <Typography variant="body" className="text-center" style={{ color: colors.functional.textSecondary }}>
                No timeslots configured for this event
              </Typography>
            </Card>
          ) : (
            <View className="gap-6">
              {event.timeslots.map((timeslot) => {
                const slotSubmissions = submissionsByTimeslot[timeslot._id] || [];
                
                return (
                  <View key={timeslot._id}>
                    <View className="flex-row items-center justify-between mb-3">
                      <View>
                        <Typography variant="h6" style={{ color: colors.functional.textPrimary }}>
                          {formatTime(timeslot.startTime)} - {formatTime(timeslot.endTime)}
                        </Typography>
                        <Typography variant="caption" color="secondary">
                          {timeslot.djName || 'Open Slot'} 
                          {timeslot.djInstagram && ` • @${timeslot.djInstagram}`}
                        </Typography>
                      </View>
                      <Badge variant={slotSubmissions.length > 0 ? 'default' : 'outline'}>
                        {slotSubmissions.length} submission{slotSubmissions.length !== 1 ? 's' : ''}
                      </Badge>
                    </View>
                    
                    {slotSubmissions.length === 0 ? (
                      <Card className="bg-neutral-700 p-4">
                        <Typography variant="body" className="text-center" style={{ color: colors.functional.textSecondary }}>
                          No submissions yet
                        </Typography>
                      </Card>
                    ) : (
                      <View className="gap-3">
                        {slotSubmissions.map((submission) => (
                          <Card key={submission._id} className="bg-neutral-700 p-4">
                            <View className="flex-row items-start justify-between mb-2">
                              <View className="flex-1">
                                <Typography variant="body" style={{ color: colors.functional.textPrimary }}>
                                  {submission.guestList.length > 0 ? submission.guestList[0].name : 'Anonymous Submission'}
                                </Typography>
                                <Typography variant="caption" color="secondary">
                                  Submitted {formatDate(submission.submittedAt || new Date().toISOString())}
                                </Typography>
                              </View>
                              <Badge variant="default">Submitted</Badge>
                            </View>
                            
                            {submission.guestList.length > 0 && (
                              <View className="mt-3">
                                <Typography variant="caption" color="secondary" className="mb-1">
                                  Guests ({submission.guestList.length})
                                </Typography>
                                <Typography variant="body" style={{ color: colors.functional.textSecondary }}>
                                  {submission.guestList.map(guest => `${guest.name}${guest.phone ? ` (${guest.phone})` : ''}`).join(', ')}
                                </Typography>
                              </View>
                            )}
                            
                            {submission.promoMaterials.description && (
                              <View className="mt-2">
                                <Typography variant="caption" color="secondary" className="mb-1">
                                  Promo Description
                                </Typography>
                                <Typography variant="body" style={{ color: colors.functional.textSecondary }}>
                                  {submission.promoMaterials.description}
                                </Typography>
                              </View>
                            )}
                            
                            {submission.promoMaterials.files.length > 0 && (
                              <View className="mt-2">
                                <Typography variant="caption" color="secondary">
                                  📁 {submission.promoMaterials.files.length} file{submission.promoMaterials.files.length !== 1 ? 's' : ''} uploaded
                                </Typography>
                              </View>
                            )}
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