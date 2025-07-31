import { View, Text, ScrollView, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { typography } from '../../constants/Typography';
import { riteColors } from '../../constants/Colors';
import { shadows } from '../../utils/shadow';

export default function EventsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Events</Text>
          <Text style={styles.subtitle}>Discover upcoming events</Text>
          
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No events available</Text>
            <Text style={styles.emptySubtext}>Check back later for upcoming events</Text>
          </View>
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
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: riteColors.functional.textSecondary,
    marginBottom: 32,
  },
  emptyCard: {
    backgroundColor: riteColors.neutral[700],
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    ...shadows.md,
  },
  emptyText: {
    ...typography.body,
    color: riteColors.neutral[0],
    textAlign: 'center',
    marginBottom: 4,
  },
  emptySubtext: {
    ...typography.caption,
    color: riteColors.functional.textSecondary,
    textAlign: 'center',
  },
});
