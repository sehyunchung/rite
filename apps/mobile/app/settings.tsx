import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../constants/Typography';
import { riteColors } from '../constants/Colors';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}

const SettingItem: React.FC<SettingItemProps> = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={24} color={riteColors.functional.textSecondary} />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.settingTitle}>{title}</Text>
      <Text style={styles.settingSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={riteColors.functional.textMuted} />
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const router = useRouter();

  const handleLogout = () => {
    // TODO: Implement logout
    console.log('Logging out...');
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Settings',
          headerStyle: {
            backgroundColor: riteColors.neutral[800],
          },
          headerTintColor: riteColors.neutral[0],
          headerTitleStyle: typography.h5,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={riteColors.neutral[0]} />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <SettingItem
              icon="person-outline"
              title="Profile"
              subtitle="Manage your profile information"
              onPress={() => console.log('Profile')}
            />
            
            <SettingItem
              icon="lock-closed-outline"
              title="Password"
              subtitle="Change your password"
              onPress={() => console.log('Password')}
            />
            
            <SettingItem
              icon="card-outline"
              title="Payment Methods"
              subtitle="Manage your payment methods"
              onPress={() => console.log('Payment Methods')}
            />
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            
            <SettingItem
              icon="globe-outline"
              title="Language"
              subtitle="Choose your preferred language"
              onPress={() => console.log('Language')}
            />
            
            <SettingItem
              icon="notifications-outline"
              title="Notifications"
              subtitle="Adjust notification settings"
              onPress={() => console.log('Notifications')}
            />
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            
            <SettingItem
              icon="mail-outline"
              title="Contact Us"
              subtitle="Contact us for assistance"
              onPress={() => console.log('Contact Us')}
            />
            
            <SettingItem
              icon="megaphone-outline"
              title="Feedback"
              subtitle="Provide feedback about the app"
              onPress={() => console.log('Feedback')}
            />
            
            <SettingItem
              icon="information-circle-outline"
              title="About"
              subtitle="Learn more about the app"
              onPress={() => console.log('About')}
            />
          </View>

          {/* Log Out Button */}
          <View style={styles.logoutSection}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  section: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    ...typography.h5,
    color: riteColors.neutral[0],
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: riteColors.neutral[700],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: riteColors.functional.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: riteColors.neutral[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    ...typography.body,
    color: riteColors.neutral[0],
    marginBottom: 2,
  },
  settingSubtitle: {
    ...typography.caption,
    color: riteColors.functional.textSecondary,
  },
  logoutSection: {
    marginTop: 48,
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: riteColors.brand.primary,
  },
  logoutText: {
    ...typography.button,
    color: riteColors.brand.primary,
  },
});