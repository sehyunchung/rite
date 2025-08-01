import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { shadows } from '../../utils/shadow';
import { typography } from '../../constants/Typography';

export default function HomeScreen() {
  const pingResult = useQuery(api.test.ping);
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>RITE</Text>
        <Text style={styles.subtitle}>DJ Event Management</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Convex Connection Test</Text>
          
          {pingResult === undefined ? (
            <ActivityIndicator size="large" color="#E946FF" />
          ) : (
            <View style={styles.eventCard}>
              <Text style={styles.eventName}>✅ {pingResult.message}</Text>
              <Text style={styles.eventDetail}>Timestamp: {new Date(pingResult.timestamp).toLocaleTimeString()}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Mobile App Status</Text>
          <Text style={styles.statusItem}>{pingResult ? '✅' : '⏳'} Convex {pingResult ? 'connected' : 'connecting...'}</Text>
          <Text style={styles.statusItem}>✅ Shared backend package</Text>
          <Text style={styles.statusItem}>✅ NativeWind styling</Text>
          <Text style={styles.statusItem}>✅ Design token integration</Text>
          <Text style={styles.statusItem}>✅ Dark theme applied</Text>
          <Text style={styles.statusItem}>✅ SUIT fonts configured</Text>
          <Text style={styles.statusItem}>✅ Navigation aligned with Next.js</Text>
          <Text style={styles.statusItem}>🚧 Authentication pending</Text>
          <Text style={styles.statusItem}>🚧 @rite/ui components pending</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A0F2F', // neutral.800
  },
  content: {
    padding: 24,
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
    borderRadius: 8,
    padding: 16,
    ...shadows.sm,
  },
  emptyText: {
    ...typography.body,
    color: '#A8A8B3', // neutral.300
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: '#2A1F3F', // neutral.700
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A3A4A', // neutral.600
    ...shadows.sm,
  },
  eventName: {
    ...typography.h6,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  eventDetail: {
    ...typography.bodySmall,
    color: '#A8A8B3', // neutral.300
    marginBottom: 2,
  },
  statusCard: {
    backgroundColor: '#2A1F3F', // neutral.700
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E946FF', // brand.primary
  },
  statusTitle: {
    ...typography.label,
    color: '#E946FF', // brand.primary
    marginBottom: 8,
  },
  statusItem: {
    ...typography.caption,
    color: '#A8A8B3', // neutral.300
    marginBottom: 4,
  },
});