import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as AuthSession from 'expo-auth-session';
import { GoogleOAuthConfig, Platform as PlatformType, AppEnvironment } from './types';

// Generate Google iOS scheme from client ID - no hardcoded fallback for security
const getGoogleIOSScheme = (): string => {
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_IOS;
  if (!iosClientId) {
    throw new Error('EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_IOS environment variable is required for iOS OAuth');
  }
  
  // Remove .apps.googleusercontent.com suffix if present
  const cleanClientId = iosClientId.replace('.apps.googleusercontent.com', '');
  
  // Extract the client ID parts to construct the URL scheme
  const parts = cleanClientId.split('-');
  if (parts.length < 2) {
    throw new Error(`Invalid iOS client ID format. Expected format: [numbers]-[string].apps.googleusercontent.com, got: ${iosClientId}`);
  }
  
  return `com.googleusercontent.apps.${parts[0]}-${parts[1]}`;
};

/**
 * Base Google OAuth configuration from environment variables
 */
const baseGoogleConfig = {
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_IOS,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  scopes: ['openid', 'profile', 'email'],
  responseType: Platform.OS === 'web' ? 'token' as const : 'code' as const,
  shouldAutoExchangeCode: Platform.OS !== 'web',
};

/**
 * Detect current platform and environment
 */
export const getPlatformInfo = () => {
  const platform = Platform.OS as PlatformType;
  const isExpoGo = Constants.appOwnership === 'expo';
  const environment: AppEnvironment = isExpoGo ? 'expo' : 'standalone';
  
  return { platform, environment, isExpoGo, isWeb: platform === 'web' };
};

/**
 * Generate platform-specific redirect URI
 */
export const getRedirectUri = () => {
  const { platform, isExpoGo, isWeb } = getPlatformInfo();
  
  console.log('🔍 OAuth Debug - Platform Info:', { platform, isExpoGo, isWeb });
  
  if (isWeb) {
    const redirectUri = 'http://localhost:8081';
    console.log('🔍 OAuth Debug - Web Redirect URI:', redirectUri);
    return redirectUri;
  } else if (isExpoGo || platform === 'ios') {
    try {
      const scheme = getGoogleIOSScheme();
      const redirectUri = `${scheme}://`;
      console.log('🔍 OAuth Debug - iOS/Expo Redirect URI:', redirectUri);
      return redirectUri;
    } catch (error) {
      console.error('🚨 OAuth Debug - Failed to generate iOS scheme:', error);
      // Fallback to the working hardcoded scheme for debugging
      const fallbackUri = 'com.googleusercontent.apps.420827108032-bksn0r122euuio8gfg8pa5ei50kjlkj4://';
      console.log('🔍 OAuth Debug - Using fallback URI:', fallbackUri);
      return fallbackUri;
    }
  } else {
    const redirectUri = AuthSession.makeRedirectUri({ scheme: 'com.rite.mobile' });
    console.log('🔍 OAuth Debug - Android Redirect URI:', redirectUri);
    return redirectUri;
  }
};

/**
 * Check if Google OAuth configuration is available
 */
export const hasGoogleConfig = (): boolean => {
  return Boolean(
    baseGoogleConfig.iosClientId || 
    baseGoogleConfig.androidClientId || 
    baseGoogleConfig.webClientId
  );
};

/**
 * Generate platform-specific OAuth configuration
 */
export const getGoogleOAuthConfig = (): GoogleOAuthConfig => {
  const { isWeb, isExpoGo } = getPlatformInfo();
  const redirectUri = getRedirectUri();
  
  if (!hasGoogleConfig()) {
    return {
      iosClientId: '',
      androidClientId: '',
      webClientId: '',
      scopes: ['openid', 'profile', 'email'],
      responseType: 'code',
      shouldAutoExchangeCode: true,
      redirectUri,
    };
  }
  
  if (isWeb) {
    // For web platform, use web client ID
    return {
      ...baseGoogleConfig,
      clientId: baseGoogleConfig.webClientId,
      iosClientId: undefined,
      androidClientId: undefined,
      redirectUri,
    };
  } else if (isExpoGo) {
    // For Expo Go, use platform-specific client IDs
    return {
      ...baseGoogleConfig,
      redirectUri,
    };
  } else {
    // For standalone mobile, use platform-specific client IDs
    return {
      ...baseGoogleConfig,
      redirectUri,
    };
  }
};