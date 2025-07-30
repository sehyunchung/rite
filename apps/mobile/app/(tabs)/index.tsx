import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';

export default function HomeScreen() {
  const events = useQuery(api.events.list);
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>RITE</Text>
        <Text style={styles.subtitle}>DJ Event Management</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Events</Text>
          
          {events === undefined ? (
            <ActivityIndicator size="large" color="#000" />
          ) : events.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No events yet</Text>
            </View>
          ) : (
            <View>
              {events.map((event) => (
                <View key={event._id} style={styles.eventCard}>
                  <Text style={styles.eventName}>{event.eventName}</Text>
                  <Text style={styles.eventDetail}>Venue: {event.venueName}</Text>
                  <Text style={styles.eventDetail}>
                    Date: {new Date(event.eventDate).toLocaleDateString()}
                  </Text>
                  <Text style={styles.eventDetail}>
                    Slots: {event.timeslots?.length || 0}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
        
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Mobile App Status</Text>
          <Text style={styles.statusItem}>✅ Convex connected</Text>
          <Text style={styles.statusItem}>✅ Shared backend package</Text>
          <Text style={styles.statusItem}>✅ NativeWind styling</Text>
          <Text style={styles.statusItem}>🚧 Authentication pending</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  eventName: {
    fontWeight: '600',
    fontSize: 18,
    color: '#111827',
    marginBottom: 4,
  },
  eventDetail: {
    color: '#6b7280',
    marginBottom: 2,
  },
  statusCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    padding: 16,
  },
  statusTitle: {
    color: '#1e3a8a',
    fontWeight: '500',
    marginBottom: 8,
  },
  statusItem: {
    color: '#1d4ed8',
    marginBottom: 4,
  },
});