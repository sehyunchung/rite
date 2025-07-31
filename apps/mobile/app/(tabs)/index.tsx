import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { shadows } from '../../utils/shadow';
import { typography } from '../../constants/Typography';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
      <View style={styles.content}>
        <Text style={styles.title}>RITE</Text>
        <Text style={styles.subtitle}>DJ Event Management</Text>
        
        {/* Create Event Button */}
        <TouchableOpacity 
          style={styles.createEventButton} 
          onPress={() => router.push('/(tabs)/create')}
        >
          <Ionicons name="add-circle" size={24} color="#FFFFFF" />
          <Text style={styles.createEventText}>Create New Event</Text>
        </TouchableOpacity>
        
        {/* Your Events Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Events</Text>
          
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No events yet</Text>
            <Text style={styles.emptySubtext}>Create your first event to get started</Text>
          </View>
        </View>
        
        {/* Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Mobile App Status</Text>
          <Text style={styles.statusItem}>✅ Shared backend package</Text>
          <Text style={styles.statusItem}>✅ NativeWind styling</Text>
          <Text style={styles.statusItem}>✅ Design token integration</Text>
          <Text style={styles.statusItem}>✅ Dark theme applied</Text>
          <Text style={styles.statusItem}>✅ SUIT fonts configured</Text>
          <Text style={styles.statusItem}>✅ Navigation aligned with Next.js</Text>
          <Text style={styles.statusItem}>✅ Authentication implemented</Text>
          <Text style={styles.statusItem}>🚧 @rite/ui components pending</Text>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A0F2F', // neutral.800
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
    color: '#E946FF', // brand.primary
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: '#A8A8B3', // neutral.300
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.h5,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: '#2A1F3F', // neutral.700
    borderRadius: 16, // matches web's rounded-xl for cards
    padding: 24, // matches web's p-6
    ...shadows.md, // matches web's shadow-md for cards
  },
  emptyText: {
    ...typography.body,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptySubtext: {
    ...typography.caption,
    color: '#A8A8B3', // neutral.300
    textAlign: 'center',
  },
  createEventButton: {
    backgroundColor: '#E946FF', // brand.primary
    borderRadius: 8, // matches web's rounded-lg
    paddingHorizontal: 24,
    paddingVertical: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 32, // increased spacing between sections
    ...shadows.sm,
  },
  createEventText: {
    ...typography.button,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  statusCard: {
    backgroundColor: '#2A1F3F', // neutral.700
    borderRadius: 8,
    padding: 16,
    ...shadows.sm,
  },
  statusTitle: {
    ...typography.h5,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  statusItem: {
    ...typography.body,
    color: '#A8A8B3', // neutral.300
    marginBottom: 4,
  },
});