import * as React from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { Id } from '@rite/backend/convex/_generated/dataModel';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Typography, Card , Input, Button } from '../../lib/ui-native';
import { useAuth } from '../../contexts/AuthContext';
import { themeColors } from '../../lib/theme-colors';

export default function CreateTab() {
  const router = useRouter();
  const { user } = useAuth();
  const createEvent = useMutation(api.events.createEvent);
  
  const [eventName, setEventName] = React.useState('');
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [venueName, setVenueName] = React.useState('');
  const [venueAddress, setVenueAddress] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [hashtags, setHashtags] = React.useState('');
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const [djSlots, setDjSlots] = React.useState([
    { id: 1, djName: '', djInstagram: '', startTime: '22:00', endTime: '23:00' },
    { id: 2, djName: '', djInstagram: '', startTime: '23:00', endTime: '00:00' },
  ]);

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

  const handleCreateEvent = async () => {
    if (!user?._id) {
      Alert.alert('Error', 'You must be logged in to create an event');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const eventDate = selectedDate.toISOString().split('T')[0];
      
      // Default deadlines: promo materials 7 days before, guest list 3 days before
      const eventDateObj = new Date(selectedDate);
      const promoDeadline = new Date(eventDateObj);
      promoDeadline.setDate(promoDeadline.getDate() - 7);
      const guestDeadline = new Date(eventDateObj);
      guestDeadline.setDate(guestDeadline.getDate() - 3);

      const eventData = {
        userId: user._id as Id<"users">,
        name: eventName.trim(),
        date: eventDate,
        venue: {
          name: venueName.trim(),
          address: venueAddress.trim(),
        },
        description: description.trim(),
        hashtags: hashtags.trim(),
        deadlines: {
          guestList: guestDeadline.toISOString().split('T')[0],
          promoMaterials: promoDeadline.toISOString().split('T')[0],
        },
        payment: {
          amount: 0,
          perDJ: 0,
          currency: 'KRW',
          dueDate: eventDate,
        },
        guestLimitPerDJ: 2,
        timeslots: djSlots.map(slot => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          djName: slot.djName.trim(),
          djInstagram: slot.djInstagram.trim(),
        })),
      };

      await createEvent(eventData);
      
      Alert.alert('Success', 'Event created successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)/events'),
        },
      ]);
      
    } catch (error) {
      console.error('Failed to create event:', error);
      Alert.alert('Error', 'Failed to create event. Please try again.');
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

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
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
          <Typography variant="h3" color="default" className="mb-8">
            Create Event
          </Typography>
          
          {/* Event Name */}
          <View className="mb-6">
            <Typography 
              variant="label" 
              color="default" 
              className="mb-2"
              accessibilityRole="text"
            >
              Event Name
            </Typography>
            <Input
              placeholder="Enter event name"
              value={eventName}
              onChangeText={setEventName}
              autoCapitalize="words"
              className="bg-neutral-700 border-neutral-600"
              accessible={true}
              accessibilityLabel="Event name input field"
              accessibilityHint="Enter the name for your event"
              accessibilityRequired={true}
            />
          </View>

          {/* Date */}
          <View className="mb-6">
            <Typography 
              variant="label" 
              color="default" 
              className="mb-2"
              accessibilityRole="text"
            >
              Date
            </Typography>
            <TouchableOpacity 
              className="bg-neutral-700 border border-neutral-600 rounded-xl h-12 flex-row items-center px-4"
              onPress={() => setShowDatePicker(true)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Event date selector. Currently selected: ${formatDate(selectedDate)}`}
              accessibilityHint="Tap to change the event date"
            >
              <Typography variant="body" color="default" className="flex-1">
                {formatDate(selectedDate)}
              </Typography>
              <Ionicons 
                name="calendar-outline" 
                size={20} 
                color="#8C8CA3" 
                accessibilityElementsHidden={true}
              />
            </TouchableOpacity>
          </View>

          {/* Venue */}
          <View className="mb-6">
            <Typography variant="label" color="default" className="mb-2">
              Venue Name
            </Typography>
            <Input
              placeholder="Enter venue name"
              value={venueName}
              onChangeText={setVenueName}
              autoCapitalize="words"
              className="bg-neutral-700 border-neutral-600"
              accessibilityLabel="Venue name input field"
              accessibilityHint="Enter the name of the venue where the event will be held"
            />
          </View>

          <View className="mb-6">
            <Typography variant="label" color="default" className="mb-2">
              Venue Address
            </Typography>
            <Input
              placeholder="Enter venue address"
              value={venueAddress}
              onChangeText={setVenueAddress}
              autoCapitalize="words"
              className="bg-neutral-700 border-neutral-600"
              accessibilityLabel="Venue address input field"
              accessibilityHint="Enter the address of the venue"
            />
          </View>

          {/* Description */}
          <View className="mb-6">
            <Typography variant="label" color="default" className="mb-2">
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
            <Typography variant="label" color="default" className="mb-2">
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
              <Typography variant="label" color="default">
                DJ Lineup
              </Typography>
              <TouchableOpacity className="flex-row items-center" onPress={addDjSlot}>
                <Ionicons name="add" size={20} color={themeColors.brand.primary} />
                <Typography variant="button" color="primary" className="ml-1">
                  Add Slot
                </Typography>
              </TouchableOpacity>
            </View>
            
            <View 
              accessibilityRole="list"
              accessibilityLabel="DJ lineup slots"
            >
            {djSlots.map((slot, index) => (
              <Card 
                key={slot.id} 
                className="bg-neutral-700 border-neutral-600 p-4 mb-3"
                accessibilityRole="group"
                accessibilityLabel={`DJ slot ${index + 1} form`}
                accessibilityHint="Configure DJ performance details for this time slot"
              >
                <View className="flex-row justify-between items-center mb-3">
                  <Typography variant="body" color="default">
                    Slot {index + 1}
                  </Typography>
                  {djSlots.length > 1 && (
                    <TouchableOpacity 
                      onPress={() => removeDjSlot(slot.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove DJ slot ${index + 1}`}
                      accessibilityHint="Double tap to delete this DJ slot"
                    >
                      <Ionicons 
                        name="trash-outline" 
                        size={20} 
                        color="#FF3366" 
                        accessibilityElementsHidden={true}
                      />
                    </TouchableOpacity>
                  )}
                </View>
                
                <View className="flex gap-3">
                  {/* Time Range */}
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <Typography variant="caption" color="secondary" className="mb-1">
                        Start Time
                      </Typography>
                      <Input
                        value={slot.startTime}
                        onChangeText={(value: string) => updateDjSlot(slot.id, 'startTime', value)}
                        placeholder="22:00"
                        className="bg-neutral-800 border-neutral-600 text-xs"
                        accessibilityLabel={`Start time for slot ${index + 1}`}
                        accessibilityHint="Enter the start time in HH:MM format"
                      />
                    </View>
                    <View className="flex-1">
                      <Typography variant="caption" color="secondary" className="mb-1">
                        End Time
                      </Typography>
                      <Input
                        value={slot.endTime}
                        onChangeText={(value: string) => updateDjSlot(slot.id, 'endTime', value)}
                        placeholder="23:00"
                        className="bg-neutral-800 border-neutral-600 text-xs"
                        accessibilityLabel={`End time for slot ${index + 1}`}
                        accessibilityHint="Enter the end time in HH:MM format"
                      />
                    </View>
                  </View>
                  
                  {/* DJ Name */}
                  <View>
                    <Typography variant="caption" color="secondary" className="mb-1">
                      DJ Name (optional)
                    </Typography>
                    <Input
                      value={slot.djName}
                      onChangeText={(value: string) => updateDjSlot(slot.id, 'djName', value)}
                      placeholder="DJ Name"
                      className="bg-neutral-800 border-neutral-600"
                      accessibilityLabel={`DJ name for slot ${index + 1} (optional)`}
                      accessibilityHint="Enter the DJ's name or stage name"
                    />
                  </View>
                  
                  {/* Instagram Handle */}
                  <View>
                    <Typography variant="caption" color="secondary" className="mb-1">
                      Instagram Handle *
                    </Typography>
                    <Input
                      value={slot.djInstagram}
                      onChangeText={(value: string) => updateDjSlot(slot.id, 'djInstagram', value)}
                      placeholder="@username"
                      className="bg-neutral-800 border-neutral-600"
                      accessibilityLabel={`Instagram handle for slot ${index + 1} (required)`}
                      accessibilityHint="Enter the DJ's Instagram handle including the @ symbol"
                    />
                  </View>
                </View>
              </Card>
            ))}
            </View>
          </View>

          {/* Create Button */}
          <View
            accessibilityLiveRegion="polite"
            accessibilityLabel={isSubmitting ? 'Creating event in progress' : 'Ready to create event'}
          >
          <Button 
            onPress={handleCreateEvent}
            className="mt-4"
            disabled={isSubmitting}
            accessibilityLabel={isSubmitting ? 'Creating event, please wait' : 'Create Event'}
            accessibilityHint="Tap to submit the event form and create your event"
            accessibilityState={{ 
              disabled: isSubmitting,
              busy: isSubmitting 
            }}
            testID="submit-create-event-button"
          >
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </Button>
          </View>
        </View>
      </ScrollView>
      
      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          textColor="white"
          themeVariant="dark"
        />
      )}
      
    </SafeAreaView>
  );
}

