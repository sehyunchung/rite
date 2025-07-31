import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { typography } from '../constants/Typography';
import { riteColors } from '../constants/Colors';
import { shadows } from '../utils/shadow';

export default function AuthScreen() {
  const { signIn, isLoading } = useAuth();
  
  // Check if Google OAuth is configured
  const hasGoogleConfig = Boolean(
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Title */}
        <View style={styles.header}>
          <Text style={styles.title}>RITE</Text>
          <Text style={styles.subtitle}>DJ Event Management</Text>
          <Text style={styles.description}>
            Sign in to create events, manage DJ lineups, and connect with the music community
          </Text>
        </View>

        {/* Auth Buttons */}
        <View style={styles.authSection}>
          <TouchableOpacity 
            style={[styles.googleButton, !hasGoogleConfig && styles.disabledButton]}
            onPress={signIn}
            disabled={isLoading || !hasGoogleConfig}
          >
            <Ionicons name="logo-google" size={20} color={riteColors.neutral[800]} />
            <Text style={styles.googleButtonText}>
              {!hasGoogleConfig 
                ? 'Google OAuth Not Configured' 
                : isLoading 
                  ? 'Signing in...' 
                  : 'Continue with Google'
              }
            </Text>
          </TouchableOpacity>

          {!hasGoogleConfig && (
            <Text style={styles.configText}>
              Add Google OAuth credentials to .env file to enable authentication
            </Text>
          )}

          {/* Instagram OAuth - Coming Soon */}
          <TouchableOpacity 
            style={[styles.instagramButton, styles.comingSoon]}
            disabled={true}
          >
            <Ionicons name="logo-instagram" size={20} color={riteColors.functional.textMuted} />
            <Text style={styles.instagramButtonText}>
              Continue with Instagram (Coming Soon)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: riteColors.neutral[800],
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 64,
  },
  title: {
    ...typography.h1,
    color: riteColors.brand.primary,
    marginBottom: 8,
    fontSize: 48,
    fontFamily: 'SUIT-Bold',
  },
  subtitle: {
    ...typography.h5,
    color: riteColors.neutral[0],
    marginBottom: 16,
  },
  description: {
    ...typography.body,
    color: riteColors.functional.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  authSection: {
    gap: 16,
    marginBottom: 48,
  },
  googleButton: {
    backgroundColor: riteColors.neutral[0],
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    ...shadows.md,
  },
  googleButtonText: {
    ...typography.button,
    color: riteColors.neutral[800],
    fontSize: 16,
  },
  instagramButton: {
    backgroundColor: riteColors.neutral[700],
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: riteColors.functional.border,
  },
  comingSoon: {
    opacity: 0.5,
  },
  instagramButtonText: {
    ...typography.button,
    color: riteColors.functional.textMuted,
    fontSize: 16,
  },
  termsSection: {
    alignItems: 'center',
  },
  termsText: {
    ...typography.caption,
    color: riteColors.functional.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  disabledButton: {
    opacity: 0.5,
  },
  configText: {
    ...typography.caption,
    color: riteColors.functional.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: -8,
  },
});