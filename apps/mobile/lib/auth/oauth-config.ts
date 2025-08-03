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

// Cache the redirect URI to prevent multiple calculations
let cachedRedirectUri: string | null = null;
let cachedPlatformInfo: ReturnType<typeof getPlatformInfo> | null = null;

/**
 * Generate platform-specific redirect URI with caching to prevent multiple calculations
 */
export const getRedirectUri = () => {
  // Use cached value if platform hasn't changed
  const currentPlatformInfo = getPlatformInfo();
  if (cachedRedirectUri && cachedPlatformInfo && 
      JSON.stringify(cachedPlatformInfo) === JSON.stringify(currentPlatformInfo)) {
    return cachedRedirectUri;
  }

  const { platform, isExpoGo, isWeb } = currentPlatformInfo;
  cachedPlatformInfo = currentPlatformInfo;
  
  let redirectUri: string;
  
  if (isWeb) {
    redirectUri = 'http://localhost:8081';
  } else if (isExpoGo || platform === 'ios') {
    try {
      const scheme = getGoogleIOSScheme();
      redirectUri = `${scheme}://`;
    } catch (error) {
      console.error('Failed to generate iOS OAuth scheme:', error);
      // Fallback to the working hardcoded scheme
      redirectUri = 'com.googleusercontent.apps.420827108032-bksn0r122euuio8gfg8pa5ei50kjlkj4://';
    }
  } else {
    redirectUri = AuthSession.makeRedirectUri({ scheme: 'com.rite.mobile' });
  }
  
  // Cache the result and log only once
  cachedRedirectUri = redirectUri;
  console.log(`OAuth Redirect URI (${platform}):`, redirectUri);
  
  return redirectUri;
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