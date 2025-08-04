import * as React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Card } from '@rite/ui';
import { Button } from '@rite/ui';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}

const SettingItem: React.FC<SettingItemProps> = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Card className="bg-neutral-700 border-neutral-600 p-6 flex-row items-center mb-4">
      <View className="w-10 h-10 rounded-full bg-neutral-600 items-center justify-center mr-4">
        <Ionicons name={icon} size={24} color="var(--neutral-400)" />
      </View>
      <View className="flex-1">
        <Typography variant="body" className="text-white mb-1">
          {title}
        </Typography>
        <Typography variant="caption" className="text-neutral-400">
          {subtitle}
        </Typography>
      </View>
      <Ionicons name="chevron-forward" size={20} color="var(--neutral-500)" />
    </Card>
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
            backgroundColor: 'var(--neutral-800)',
          },
          headerTintColor: 'var(--text-primary)',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="var(--text-primary)" />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView className="flex-1 bg-neutral-800">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Account Section */}
          <View className="mt-8 px-6">
            <Typography variant="h5" className="text-white mb-4">
              Account
            </Typography>
            
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
          <View className="mt-8 px-6">
            <Typography variant="h5" className="text-white mb-4">
              Preferences
            </Typography>
            
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
          <View className="mt-8 px-6">
            <Typography variant="h5" className="text-white mb-4">
              Support
            </Typography>
            
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
          <View className="mt-12 mb-8 px-6">
            <Button 
              variant="outline" 
              onPress={handleLogout}
              className="border-2 border-neutral-600"
            >
              Log Out
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

