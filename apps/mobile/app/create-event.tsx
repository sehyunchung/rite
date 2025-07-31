import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../constants/Typography';
import { riteColors } from '../constants/Colors';
import { shadows } from '../utils/shadow';

export default function CreateEventScreen() {
  const router = useRouter();
  const [eventName, setEventName] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [djSlots, setDjSlots] = useState([
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
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Create Event',
          headerStyle: {
            backgroundColor: riteColors.neutral[800],
          },
          headerTintColor: riteColors.neutral[0],
          headerTitleStyle: typography.h5,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={riteColors.neutral[0]} />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Event Name */}
            <View style={styles.section}>
              <Text style={styles.label}>Event Name</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter event name"
                  placeholderTextColor={riteColors.functional.textMuted}
                  value={eventName}
                  onChangeText={setEventName}
                />
              </View>
            </View>

            {/* Date */}
            <View style={styles.section}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity style={styles.inputContainer}>
                <Text style={[styles.input, styles.inputText]}>
                  {selectedDate ? selectedDate.toLocaleDateString() : 'Select date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={riteColors.functional.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Start Time */}
            <View style={styles.section}>
              <Text style={styles.label}>Start Time</Text>
              <TouchableOpacity style={styles.inputContainer}>
                <Text style={[styles.input, styles.inputText]}>
                  {startTime ? startTime.toLocaleTimeString() : 'Select time'}
                </Text>
                <Ionicons name="time-outline" size={20} color={riteColors.functional.textMuted} />
              </TouchableOpacity>
            </View>

            {/* DJ Lineup */}
            <View style={styles.section}>
              <Text style={styles.label}>DJ Lineup</Text>
              <TouchableOpacity style={styles.inputContainer}>
                <Text style={[styles.input, styles.inputText]}>Add DJs</Text>
                <Ionicons name="add" size={20} color={riteColors.functional.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Schedule */}
            <View style={styles.scheduleSection}>
              <Text style={styles.scheduleTitle}>Schedule</Text>
              <View style={styles.divider} />
              
              <View style={styles.slotsGrid}>
                {djSlots.map((slot, index) => (
                  <View key={slot.id} style={styles.slotItem}>
                    <Text style={styles.slotName}>{slot.name}</Text>
                    <Text style={styles.slotTime}>
                      {slot.startTime} - {slot.endTime}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Create Event Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateEvent}>
            <Text style={styles.createButtonText}>Create Event</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: riteColors.neutral[800],
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    ...typography.body,
    color: riteColors.neutral[0],
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: riteColors.neutral[700],
    borderRadius: 12, // matches web's rounded-lg for inputs
    paddingHorizontal: 16,
    paddingVertical: 12, // matches web's px-4 py-3
    height: 48, // matches web's h-12
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: riteColors.functional.border,
    ...shadows.sm, // matches web's shadow-sm on inputs
  },
  input: {
    ...typography.body,
    color: riteColors.neutral[0],
    flex: 1,
  },
  inputText: {
    color: riteColors.functional.textMuted,
  },
  scheduleSection: {
    marginTop: 32,
  },
  scheduleTitle: {
    ...typography.h4,
    color: riteColors.neutral[0],
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: riteColors.functional.divider,
    marginBottom: 24,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  slotItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  slotName: {
    ...typography.label,
    color: riteColors.neutral[0],
    marginBottom: 4,
  },
  slotTime: {
    ...typography.caption,
    color: riteColors.functional.textSecondary,
  },
  buttonContainer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  createButton: {
    backgroundColor: riteColors.brand.primary,
    borderRadius: 8, // matches web's rounded-lg for buttons
    paddingHorizontal: 24, // matches web's px-6
    paddingVertical: 12, // matches web's py-3
    height: 48, // matches web's h-12
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm, // matches web's shadow-sm on primary buttons
  },
  createButtonText: {
    ...typography.button,
    color: riteColors.neutral[0],
  },
});