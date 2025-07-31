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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../../constants/Typography';
import { riteColors } from '../../constants/Colors';
import { shadows } from '../../utils/shadow';

export default function CreateTab() {
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
    // After successful creation, navigate to events tab
    router.replace('/(tabs)/events');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Event</Text>
          
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
                {selectedDate ? selectedDate.toDateString() : 'Select date'}
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
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>DJ Lineup</Text>
              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={20} color={riteColors.brand.primary} />
                <Text style={styles.addButtonText}>Add Slot</Text>
              </TouchableOpacity>
            </View>
            
            {djSlots.map((slot) => (
              <View key={slot.id} style={styles.djSlot}>
                <View style={styles.djSlotIcon}>
                  <Ionicons name="musical-notes" size={20} color={riteColors.brand.primary} />
                </View>
                <View style={styles.djSlotInfo}>
                  <Text style={styles.djSlotName}>{slot.name}</Text>
                  <Text style={styles.djSlotTime}>
                    {slot.startTime} - {slot.endTime}
                  </Text>
                </View>
                <TouchableOpacity>
                  <Ionicons name="ellipsis-horizontal" size={20} color={riteColors.functional.textMuted} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Create Button */}
          <TouchableOpacity 
            style={styles.createButton} 
            onPress={handleCreateEvent}
          >
            <Text style={styles.createButtonText}>Create Event</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: Platform.OS === 'ios' ? 100 : 80, // Account for tab bar
  },
  title: {
    ...typography.h3,
    color: riteColors.neutral[0],
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    ...typography.label,
    color: riteColors.neutral[0],
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: riteColors.neutral[700],
    borderRadius: 12, // matches web's rounded-xl for inputs
    height: 48, // standard height
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: riteColors.functional.border,
    ...shadows.sm,
  },
  input: {
    ...typography.body,
    color: riteColors.neutral[0],
    flex: 1,
    height: '100%',
    ...Platform.select({
      web: { outlineStyle: 'none' },
      default: {},
    }),
  },
  inputText: {
    paddingVertical: 0,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    ...typography.button,
    color: riteColors.brand.primary,
  },
  djSlot: {
    backgroundColor: riteColors.neutral[700],
    borderRadius: 16, // matches web's rounded-xl for cards
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: riteColors.functional.border,
    ...shadows.sm,
  },
  djSlotIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: riteColors.neutral[800],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  djSlotInfo: {
    flex: 1,
  },
  djSlotName: {
    ...typography.body,
    color: riteColors.neutral[0],
    marginBottom: 2,
  },
  djSlotTime: {
    ...typography.caption,
    color: riteColors.functional.textSecondary,
  },
  createButton: {
    backgroundColor: riteColors.brand.primary,
    borderRadius: 8, // matches web's rounded-lg for buttons
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    ...shadows.sm,
  },
  createButtonText: {
    ...typography.button,
    color: riteColors.neutral[0],
  },
});
