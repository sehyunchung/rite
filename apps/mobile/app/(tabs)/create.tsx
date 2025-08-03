import * as React from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Typography, Button, Input, Card } from '@rite/ui';

export default function CreateTab() {
  const router = useRouter();
  const [eventName, setEventName] = React.useState('');
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [startTime, setStartTime] = React.useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [showTimePicker, setShowTimePicker] = React.useState(false);
  const [djSlots, setDjSlots] = React.useState([
    { id: 1, name: 'DJ 1', startTime: '8:00 PM', endTime: '9:00 PM' },
    { id: 2, name: 'DJ 2', startTime: '9:00 PM', endTime: '10:00 PM' },
    { id: 3, name: 'DJ 3', startTime: '10:00 PM', endTime: '11:00 PM' },
    { id: 4, name: 'DJ 4', startTime: '11:00 PM', endTime: '12:00 AM' },
  ]);

  const handleCreateEvent = () => {
    // TODO: Implement event creation with Convex
    console.log('Creating event:', {
      eventName,
      selectedDate,
      startTime,
      djSlots,
    });
    // After successful creation, navigate to events tab
    router.replace('/(tabs)/events');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowTimePicker(false);
    if (date) {
      setStartTime(date);
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
          <Typography variant="h3" className="text-white mb-8">
            Create Event
          </Typography>
          
          {/* Event Name */}
          <View className="mb-6">
            <Typography variant="label" className="text-white mb-2">
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
          <View className="mb-6">
            <Typography variant="label" className="text-white mb-2">
              Date
            </Typography>
            <TouchableOpacity 
              className="bg-neutral-700 border border-neutral-600 rounded-xl h-12 flex-row items-center px-4"
              onPress={() => setShowDatePicker(true)}
            >
              <Typography variant="body" className="text-white flex-1">
                {formatDate(selectedDate)}
              </Typography>
              <Ionicons name="calendar-outline" size={20} color="#A8A8B3" />
            </TouchableOpacity>
          </View>

          {/* Start Time */}
          <View className="mb-6">
            <Typography variant="label" className="text-white mb-2">
              Start Time
            </Typography>
            <TouchableOpacity 
              className="bg-neutral-700 border border-neutral-600 rounded-xl h-12 flex-row items-center px-4"
              onPress={() => setShowTimePicker(true)}
            >
              <Typography variant="body" className="text-white flex-1">
                {formatTime(startTime)}
              </Typography>
              <Ionicons name="time-outline" size={20} color="#A8A8B3" />
            </TouchableOpacity>
          </View>

          {/* DJ Lineup */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Typography variant="label" className="text-white">
                DJ Lineup
              </Typography>
              <TouchableOpacity className="flex-row items-center">
                <Ionicons name="add" size={20} color="#E946FF" />
                <Typography variant="button" color="primary" className="ml-1">
                  Add Slot
                </Typography>
              </TouchableOpacity>
            </View>
            
            {djSlots.map((slot) => (
              <Card key={slot.id} className="bg-neutral-700 border-neutral-600 p-4 flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center mr-3">
                  <Ionicons name="musical-notes" size={20} color="#E946FF" />
                </View>
                <View className="flex-1">
                  <Typography variant="body" className="text-white mb-1">
                    {slot.name}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    {slot.startTime} - {slot.endTime}
                  </Typography>
                </View>
                <TouchableOpacity>
                  <Ionicons name="ellipsis-horizontal" size={20} color="#A8A8B3" />
                </TouchableOpacity>
              </Card>
            ))}
          </View>

          {/* Create Button */}
          <Button 
            onPress={handleCreateEvent}
            className="mt-4"
          >
            Create Event
          </Button>
        </View>
      </ScrollView>
      
      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          textColor="#FFFFFF"
          themeVariant="dark"
        />
      )}
      
      {/* Time Picker Modal */}
      {showTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
          textColor="#FFFFFF"
          themeVariant="dark"
        />
      )}
    </SafeAreaView>
  );
}

