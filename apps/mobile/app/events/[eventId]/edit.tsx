import * as React from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  Alert,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { Id } from '@rite/backend/convex/_generated/dataModel';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Card , Button, Input } from '../../../lib/ui-native';
import { useAuth } from '../../../contexts/AuthContext';
import { validateEventId } from '../../../lib/validation';
import { DatePicker } from '../../../components/DatePicker';

export default function EditEventScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { user } = useAuth();
  const updateEvent = useMutation(api.events.updateEvent);
  
  // Fetch existing event data
  const validatedEventId = validateEventId(eventId);
  const event = useQuery(api.events.getEvent, 
    validatedEventId && user ? { eventId: validatedEventId, userId: user._id } : "skip"
  );
  
  // Form state
  const [eventName, setEventName] = React.useState('');
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [venueName, setVenueName] = React.useState('');
  const [venueAddress, setVenueAddress] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [hashtags, setHashtags] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [djSlots, setDjSlots] = React.useState<{
    id: number;
    _id?: string;
    djName: string;
    djInstagram: string;
    startTime: string;
    endTime: string;
  }[]>([]);

  // Initialize form with event data
  React.useEffect(() => {
    if (event) {
      setEventName(event.name);
      setSelectedDate(new Date(event.date));
      setVenueName(event.venue.name);
      setVenueAddress(event.venue.address);
      setDescription(event.description || '');
      setHashtags(event.hashtags || '');
      
      // Convert timeslots to form format
      const slots = event.timeslots.map((slot, index) => ({
        id: index + 1,
        _id: slot._id,
        djName: slot.djName || '',
        djInstagram: slot.djInstagram,
        startTime: typeof slot.startTime === 'string' ? slot.startTime : new Date(slot.startTime).toTimeString().slice(0, 5),
        endTime: typeof slot.endTime === 'string' ? slot.endTime : new Date(slot.endTime).toTimeString().slice(0, 5),
      }));
      setDjSlots(slots);
    }
  }, [event]);

  if (!eventId || !user) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-800">
        <View className="p-6">
          <Typography variant="body" color="secondary">
            Invalid request
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  if (event === undefined) {
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

  const validateForm = () => {
    if (!eventName.trim()) {
      Alert.alert('Error', 'Please enter an event name');
      return false;
    }
    
    if (!venueName.trim()) {
      Alert.alert('Error', 'Please enter a venue name');
      return false;
    }
    
    if (!venueAddress.trim()) {
      Alert.alert('Error', 'Please enter a venue address');
      return false;
    }

    const eventDate = selectedDate.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    if (eventDate < today) {
      Alert.alert('Error', 'Event date cannot be in the past');
      return false;
    }

    if (djSlots.length === 0) {
      Alert.alert('Error', 'At least one DJ slot is required');
      return false;
    }

    for (const slot of djSlots) {
      if (!slot.startTime || !slot.endTime) {
        Alert.alert('Error', 'All DJ slots must have start and end times');
        return false;
      }
      if (!slot.djInstagram.trim()) {
        Alert.alert('Error', 'All DJ slots must have an Instagram handle');
        return false;
      }
    }

    return true;
  };

  const handleUpdateEvent = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const eventDate = selectedDate.toISOString().split('T')[0];
      
      // Combine date with time strings
      const timeslots = djSlots.map(slot => ({
        id: slot._id as Id<"timeslots">,
        startTime: `${eventDate}T${slot.startTime}:00`,
        endTime: `${eventDate}T${slot.endTime}:00`,
        djName: slot.djName.trim(),
        djInstagram: slot.djInstagram.trim(),
      }));

      if (!validatedEventId) {
        Alert.alert('Error', 'Invalid event ID');
        return;
      }

      await updateEvent({
        eventId: validatedEventId,
        userId: user._id,
        name: eventName.trim(),
        date: eventDate,
        venue: {
          name: venueName.trim(),
          address: venueAddress.trim(),
        },
        description: description.trim() || undefined,
        hashtags: hashtags.trim() || undefined,
        timeslots,
      });
      
      Alert.alert('Success', 'Event updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
      
    } catch (error) {
      console.error('Failed to update event:', error);
      Alert.alert('Error', 'Failed to update event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addDjSlot = () => {
    const lastSlot = djSlots[djSlots.length - 1];
    const newId = Math.max(...djSlots.map(s => s.id)) + 1;
    
    // Next slot starts where the last one ended
    const newStartTime = lastSlot ? lastSlot.endTime : '22:00';
    const [hour, minute] = newStartTime.split(':');
    const nextHour = (parseInt(hour) + 1) % 24;
    const newEndTime = `${nextHour.toString().padStart(2, '0')}:${minute}`;
    
    setDjSlots([...djSlots, {
      id: newId,
      djName: '',
      djInstagram: '',
      startTime: newStartTime,
      endTime: newEndTime,
    }]);
  };

  const removeDjSlot = (id: number) => {
    if (djSlots.length > 1) {
      setDjSlots(djSlots.filter(slot => slot.id !== id));
    }
  };

  const updateDjSlot = (id: number, field: keyof typeof djSlots[0], value: string) => {
    setDjSlots(djSlots.map(slot => 
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-800">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View 
          className="p-6" 
          style={{ 
            paddingBottom: Platform.OS === 'ios' ? 124 : 104 
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
              Edit Event
            </Typography>
          </View>
          
          {/* Event Name */}
          <View className="mb-6">
            <Typography variant="label" className="mb-2 text-white">
              Event Name
            </Typography>
            <Input
              placeholder="Enter event name"
              value={eventName}
              onChangeText={setEventName}
              autoCapitalize="words"
              className="bg-neutral-700 border-neutral-600"
            />
          </View>

          {/* Date */}
          <DatePicker
            value={selectedDate}
            onChange={handleDateChange}
            label="Date"
            className="mb-6"
            minDate={new Date()}
            accessibilityLabel={`Event date selector. Currently selected: ${formatDate(selectedDate)}`}
            accessibilityHint="Select the event date"
          />

          {/* Venue */}
          <View className="mb-6">
            <Typography variant="label" className="mb-2 text-white">
              Venue Name
            </Typography>
            <Input
              placeholder="Enter venue name"
              value={venueName}
              onChangeText={setVenueName}
              autoCapitalize="words"
              className="bg-neutral-700 border-neutral-600"
            />
          </View>

          <View className="mb-6">
            <Typography variant="label" className="mb-2 text-white">
              Venue Address
            </Typography>
            <Input
              placeholder="Enter venue address"
              value={venueAddress}
              onChangeText={setVenueAddress}
              autoCapitalize="words"
              className="bg-neutral-700 border-neutral-600"
            />
          </View>

          {/* Description */}
          <View className="mb-6">
            <Typography variant="label" className="mb-2 text-white">
              Description (optional)
            </Typography>
            <Input
              placeholder="Event description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              className="bg-neutral-700 border-neutral-600"
            />
          </View>

          {/* Hashtags */}
          <View className="mb-6">
            <Typography variant="label" className="mb-2 text-white">
              Hashtags (optional)
            </Typography>
            <Input
              placeholder="#rave #techno #seoul"
              value={hashtags}
              onChangeText={setHashtags}
              className="bg-neutral-700 border-neutral-600"
            />
          </View>

          {/* DJ Lineup */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Typography variant="label" className="text-white">
                DJ Lineup
              </Typography>
              <TouchableOpacity className="flex-row items-center" onPress={addDjSlot}>
                <Ionicons name="add" size={20} color="var(--brand-primary)" />
                <Typography variant="button" color="primary" className="ml-1">
                  Add Slot
                </Typography>
              </TouchableOpacity>
            </View>
            
            {djSlots.map((slot, index) => (
              <Card key={slot.id} className="bg-neutral-700 border-neutral-600 p-4 mb-3">
                <View className="flex-row justify-between items-center mb-3">
                  <Typography variant="body" className="text-white">
                    Slot {index + 1}
                  </Typography>
                  {djSlots.length > 1 && (
                    <TouchableOpacity onPress={() => removeDjSlot(slot.id)}>
                      <Ionicons name="trash-outline" size={20} color="var(--color-error)" />
                    </TouchableOpacity>
                  )}
                </View>
                
                <View className="flex gap-3">
                  {/* Time Range */}
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <Typography variant="caption" className="mb-1 text-neutral-400">
                        Start Time
                      </Typography>
                      <Input
                        value={slot.startTime}
                        onChangeText={(value: string) => updateDjSlot(slot.id, 'startTime', value)}
                        placeholder="22:00"
                        className="bg-neutral-800 border-neutral-600 text-xs"
                      />
                    </View>
                    <View className="flex-1">
                      <Typography variant="caption" className="mb-1 text-neutral-400">
                        End Time
                      </Typography>
                      <Input
                        value={slot.endTime}
                        onChangeText={(value: string) => updateDjSlot(slot.id, 'endTime', value)}
                        placeholder="23:00"
                        className="bg-neutral-800 border-neutral-600 text-xs"
                      />
                    </View>
                  </View>
                  
                  {/* DJ Name */}
                  <View>
                    <Typography variant="caption" className="mb-1 text-neutral-400">
                      DJ Name (optional)
                    </Typography>
                    <Input
                      value={slot.djName}
                      onChangeText={(value: string) => updateDjSlot(slot.id, 'djName', value)}
                      placeholder="DJ Name"
                      className="bg-neutral-800 border-neutral-600"
                    />
                  </View>
                  
                  {/* Instagram Handle */}
                  <View>
                    <Typography variant="caption" className="mb-1 text-neutral-400">
                      Instagram Handle *
                    </Typography>
                    <Input
                      value={slot.djInstagram}
                      onChangeText={(value: string) => updateDjSlot(slot.id, 'djInstagram', value)}
                      placeholder="@username"
                      className="bg-neutral-800 border-neutral-600"
                    />
                  </View>
                </View>
              </Card>
            ))}
          </View>

          {/* Update Button */}
          <Button 
            onPress={handleUpdateEvent}
            className="mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Event'}
          </Button>
        </View>
      </ScrollView>
      
    </SafeAreaView>
  );
}