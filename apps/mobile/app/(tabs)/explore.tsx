import * as React from 'react';
import { View, ScrollView, SafeAreaView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Typography, Card } from '@rite/ui';
import { ThemeSwitcher } from '../../components/ThemeSwitcher';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-neutral-800">
      <ScrollView className="flex-1">
        <View 
          className="p-6" 
          style={{ 
            paddingBottom: Platform.OS === 'ios' ? 124 : 104 
          }}
        >
          {/* Profile Header */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-full bg-neutral-700 border-2 border-brand-primary items-center justify-center mb-4">
              <Ionicons name="person" size={40} color="var(--neutral-400)" />
            </View>
            <Typography variant="h5" className="text-white mb-1">
              {user?.name || 'Anonymous User'}
            </Typography>
            <Typography variant="body" color="secondary">
              {user?.email || 'No email'}
            </Typography>
          </View>

          {/* Quick Actions */}
          <View className="mb-6">
            <TouchableOpacity 
              onPress={() => router.push('/settings')}
            >
              <Card className="bg-neutral-700 border-neutral-600 p-6 flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center mr-4">
                  <Ionicons name="settings-outline" size={24} color="var(--brand-primary)" />
                </View>
                <Typography variant="body" className="text-white flex-1">
                  Settings
                </Typography>
                <Ionicons name="chevron-forward" size={20} color="var(--neutral-400)" />
              </Card>
            </TouchableOpacity>

            <TouchableOpacity>
              <Card className="bg-neutral-700 border-neutral-600 p-6 flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center mr-4">
                  <Ionicons name="calendar-outline" size={24} color="var(--brand-primary)" />
                </View>
                <Typography variant="body" className="text-white flex-1">
                  My Events
                </Typography>
                <Ionicons name="chevron-forward" size={20} color="var(--neutral-400)" />
              </Card>
            </TouchableOpacity>

            <TouchableOpacity>
              <Card className="bg-neutral-700 border-neutral-600 p-6 flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center mr-4">
                  <Ionicons name="musical-notes-outline" size={24} color="var(--brand-primary)" />
                </View>
                <Typography variant="body" className="text-white flex-1">
                  DJ Applications
                </Typography>
                <Ionicons name="chevron-forward" size={20} color="var(--neutral-400)" />
              </Card>
            </TouchableOpacity>
          </View>

          {/* Theme Switcher Section */}
          <View className="mb-6">
            <Typography variant="h6" color="default" className="mb-4">
              Appearance
            </Typography>
            <ThemeSwitcher 
              showLabels={true}
              orientation="vertical"
            />
          </View>

          {/* Stats */}
          <View className="flex-row gap-3 mb-6">
            <Card className="flex-1 bg-neutral-700 border-neutral-600 p-6 items-center">
              <Typography variant="h3" color="primary" className="mb-1">
                0
              </Typography>
              <Typography variant="caption" color="secondary">
                Events
              </Typography>
            </Card>
            <Card className="flex-1 bg-neutral-700 border-neutral-600 p-6 items-center">
              <Typography variant="h3" color="primary" className="mb-1">
                0
              </Typography>
              <Typography variant="caption" color="secondary">
                DJ Sets
              </Typography>
            </Card>
          </View>

          {/* Sign Out */}
          <TouchableOpacity 
            onPress={signOut}
          >
            <Card className="bg-neutral-700 border-error p-6 flex-row items-center justify-center">
              <Ionicons name="log-out-outline" size={24} color="var(--color-error)" />
              <Typography variant="button" className="text-error ml-3">
                Sign Out
              </Typography>
            </Card>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

