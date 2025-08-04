import * as React from 'react';
import { View, ScrollView, SafeAreaView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Typography, Card } from '@rite/ui';
import { CrossPlatformButton, CrossPlatformInput, CrossPlatformTextarea } from '../../components/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { riteColors as colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function DJSubmissionScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const createSubmission = useMutation(api.submissions.saveSubmission);
  
  // Form state
  const [djName, setDjName] = React.useState('');
  const [guestNames, setGuestNames] = React.useState('');
  const [guestNamesLineup, setGuestNamesLineup] = React.useState('');
  const [promoVideoUrl, setPromoVideoUrl] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Get event and timeslot data
  const submissionData = useQuery(api.timeslots.getTimeslotByToken, 
    token ? { submissionToken: token } : "skip"
  );

  // Check if already submitted
  const existingSubmission = useQuery(api.submissions.getSubmissionByToken,
    token ? { submissionToken: token } : "skip"
  );

  if (!token) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-800">
        <View className="p-6">
          <Typography variant="body" color="secondary">
            No submission token provided
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  if (submissionData === undefined || existingSubmission === undefined) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-800">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.brand.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!submissionData) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-800">
        <View className="p-6">
          <Typography variant="h4" className="mb-4" style={{ color: colors.functional.textPrimary }}>
            Invalid Token
          </Typography>
          <Typography variant="body" color="secondary">
            This submission link is invalid or has expired.
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  if (existingSubmission) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-800">
        <View className="p-6">
          <Typography variant="h4" className="mb-4" style={{ color: colors.functional.textPrimary }}>
            Already Submitted
          </Typography>
          <Card className="bg-neutral-700 p-6">
            <Typography variant="body" className="mb-2" style={{ color: colors.functional.textPrimary }}>
              You have already submitted for this slot.
            </Typography>
            <Typography variant="caption" color="secondary">
              Submitted on: {existingSubmission?.submittedAt ? new Date(existingSubmission.submittedAt).toLocaleDateString() : 'Unknown'}
            </Typography>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  const { event } = submissionData;
  const timeslot = submissionData;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
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

  const validateForm = () => {
    if (!djName.trim()) {
      Alert.alert('Error', 'Please enter your DJ name');
      return false;
    }
    
    const guestList = guestNames.split('\n').filter(name => name.trim());
    if (guestList.length > (event?.guestLimitPerDJ || 10)) {
      Alert.alert('Error', `Maximum ${event?.guestLimitPerDJ || 10} guests allowed`);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const guestList = guestNames.split('\n')
        .filter(name => name.trim())
        .map(name => ({ name: name.trim() }));
        
      await createSubmission({
        eventId: submissionData.eventId,
        timeslotId: submissionData._id,
        submissionToken: token,
        promoFiles: [], // Empty for now, files will be implemented later
        promoDescription: promoVideoUrl.trim() || '',
        guestList,
        paymentInfo: {
          accountHolder: djName.trim(),
          bankName: '',
          accountNumber: '',
          residentNumber: '',
          preferDirectContact: false,
        },
      });
      
      Alert.alert(
        'Success',
        'Your submission has been received!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/'),
          },
        ]
      );
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
          <Typography variant="h4" className="mb-6" style={{ color: colors.functional.textPrimary }}>
            DJ Submission
          </Typography>

          {/* Event Info */}
          <Card className="bg-neutral-700 p-6 mb-6">
            <Typography variant="h5" className="mb-3" style={{ color: colors.functional.textPrimary }}>
              {event?.name || 'Event'}
            </Typography>
            
            <View className="gap-2">
              <View className="flex-row items-center">
                <Ionicons name="location" size={20} color={colors.functional.textSecondary} />
                <Typography variant="body" className="ml-2" style={{ color: colors.functional.textSecondary }}>
                  {event?.venue?.name || 'TBD'}
                </Typography>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={20} color={colors.functional.textSecondary} />
                <Typography variant="body" className="ml-2" style={{ color: colors.functional.textSecondary }}>
                  {event?.date ? formatDate(event.date) : 'TBD'}
                </Typography>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="time" size={20} color={colors.functional.textSecondary} />
                <Typography variant="body" className="ml-2" style={{ color: colors.functional.textSecondary }}>
                  {formatTime(timeslot.startTime)} - {formatTime(timeslot.endTime)}
                </Typography>
              </View>
            </View>
          </Card>

          {/* Submission Form */}
          <View className="gap-6">
            {/* DJ Name */}
            <View>
              <Typography variant="label" className="mb-2" style={{ color: colors.functional.textPrimary }}>
                DJ Name *
              </Typography>
              <CrossPlatformInput
                placeholder="Enter your DJ name"
                value={djName}
                onValueChange={setDjName}
                className="bg-neutral-700 border-neutral-600"
              />
            </View>

            {/* Guest Names */}
            <View>
              <Typography variant="label" className="mb-2" style={{ color: colors.functional.textPrimary }}>
                Guest Names (Max {event?.guestLimitPerDJ || 10})
              </Typography>
              <CrossPlatformTextarea
                placeholder="Enter one name per line"
                value={guestNames}
                onValueChange={setGuestNames}
                className="bg-neutral-700 border-neutral-600"
              />
              <Typography variant="caption" color="secondary" className="mt-1">
                {guestNames.split('\n').filter(name => name.trim()).length} / {event?.guestLimitPerDJ || 10} guests
              </Typography>
            </View>

            {/* Guest Names for Lineup */}
            <View>
              <Typography variant="label" className="mb-2" style={{ color: colors.functional.textPrimary }}>
                Guest Names for Lineup (Optional)
              </Typography>
              <CrossPlatformInput
                placeholder="Names to display on lineup"
                value={guestNamesLineup}
                onValueChange={setGuestNamesLineup}
                className="bg-neutral-700 border-neutral-600"
              />
            </View>

            {/* Promo Video URL */}
            <View>
              <Typography variant="label" className="mb-2" style={{ color: colors.functional.textPrimary }}>
                Promo Video URL (Optional)
              </Typography>
              <CrossPlatformInput
                placeholder="https://..."
                value={promoVideoUrl}
                onValueChange={setPromoVideoUrl}
                className="bg-neutral-700 border-neutral-600"
              />
            </View>

            {/* Important Dates */}
            <Card className="bg-neutral-700 p-4">
              <Typography variant="h6" className="mb-3" style={{ color: colors.functional.textPrimary }}>
                Important Dates
              </Typography>
              <View className="gap-2">
                <View>
                  <Typography variant="caption" color="secondary">
                    Guest List Deadline
                  </Typography>
                  <Typography variant="body" style={{ color: colors.functional.textPrimary }}>
                    {event?.deadlines?.guestList ? formatDate(event.deadlines.guestList) : 'TBD'}
                  </Typography>
                </View>
                <View>
                  <Typography variant="caption" color="secondary">
                    Promo Materials Deadline
                  </Typography>
                  <Typography variant="body" style={{ color: colors.functional.textPrimary }}>
                    {event?.deadlines?.promoMaterials ? formatDate(event.deadlines.promoMaterials) : 'TBD'}
                  </Typography>
                </View>
              </View>
            </Card>

            {/* Submit Button */}
            <CrossPlatformButton 
              onAction={handleSubmit}
              disabled={isSubmitting}
              className="mt-4"
            >
              <Typography variant="button" style={{ color: colors.functional.textPrimary }}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Typography>
            </CrossPlatformButton>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}