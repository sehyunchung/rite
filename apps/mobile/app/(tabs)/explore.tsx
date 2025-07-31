import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../../constants/Typography';
import { riteColors } from '../../constants/Colors';
import { shadows } from '../../utils/shadow';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
      <View style={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color={riteColors.functional.textSecondary} />
          </View>
          <Text style={styles.userName}>User Name</Text>
          <Text style={styles.userEmail}>user@example.com</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/settings')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="settings-outline" size={24} color={riteColors.brand.primary} />
            </View>
            <Text style={styles.actionText}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={riteColors.functional.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Ionicons name="calendar-outline" size={24} color={riteColors.brand.primary} />
            </View>
            <Text style={styles.actionText}>My Events</Text>
            <Ionicons name="chevron-forward" size={20} color={riteColors.functional.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Ionicons name="musical-notes-outline" size={24} color={riteColors.brand.primary} />
            </View>
            <Text style={styles.actionText}>DJ Applications</Text>
            <Ionicons name="chevron-forward" size={20} color={riteColors.functional.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>DJ Sets</Text>
          </View>
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
  content: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 124 : 104, // Account for tab bar + extra spacing
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: riteColors.neutral[700],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: riteColors.brand.primary,
  },
  userName: {
    ...typography.h5,
    color: riteColors.neutral[0],
    marginBottom: 4,
  },
  userEmail: {
    ...typography.body,
    color: riteColors.functional.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  actionCard: {
    backgroundColor: riteColors.neutral[700],
    borderRadius: 16, // matches web's rounded-xl for cards
    padding: 24, // matches web's p-6
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, // consistent spacing
    borderWidth: 1,
    borderColor: riteColors.functional.border,
    ...shadows.md, // matches web's shadow-md for cards
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: riteColors.neutral[800],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionText: {
    ...typography.body,
    color: riteColors.neutral[0],
    flex: 1,
  },
  statsSection: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: riteColors.neutral[700],
    borderRadius: 16, // matches web's rounded-xl for cards
    padding: 24, // matches web's p-6
    alignItems: 'center',
    borderWidth: 1,
    borderColor: riteColors.functional.border,
    ...shadows.md, // matches web's shadow-md for cards
  },
  statNumber: {
    ...typography.h3,
    color: riteColors.brand.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    color: riteColors.functional.textSecondary,
  },
});
