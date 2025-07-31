import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useConvex } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { Id } from '@rite/backend/convex/_generated/dataModel';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

interface User {
  _id: Id<"users">;
  email: string;
  name?: string;
  image?: string;
  createdAt: string;
  organizerProfile?: {
    companyName?: string;
    phone?: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Platform-specific secure storage helpers
const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      // Use AsyncStorage for web
      return await AsyncStorage.getItem(key);
    } else {
      // Use SecureStore for mobile
      return await SecureStore.getItemAsync(key);
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }
};

// Google OAuth configuration
const googleConfig = {
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_IOS,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  scopes: ['openid', 'profile', 'email'],
  responseType: 'code',
  shouldAutoExchangeCode: true,
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const convex = useConvex();

  // Debug: Log the OAuth configuration being used
  const isExpoGo = Constants.appOwnership === 'expo';
  const isWeb = Platform.OS === 'web';
  
  // Set redirect URI based on platform - prioritize web over Expo Go
  const redirectUri = isWeb
    ? 'http://localhost:8081'
    : isExpoGo 
    ? `https://auth.expo.io/@sehyun_chung/rite`
    : AuthSession.makeRedirectUri();
  
  console.log('Google OAuth Config:', {
    platform: Platform.OS,
    appOwnership: Constants.appOwnership,
    isExpoGo,
    isWeb,
    iosClientId: googleConfig.iosClientId ? 'Set' : 'Not set',
    androidClientId: googleConfig.androidClientId ? 'Set' : 'Not set', 
    webClientId: googleConfig.webClientId ? 'Set' : 'Not set',
    redirectUri,
    usingClientId: (isWeb || isExpoGo) ? 'webClientId' : 'platform-specific',
  });

  // Only initialize Google auth if client IDs are available
  const hasGoogleConfig = Boolean(
    googleConfig.iosClientId || 
    googleConfig.androidClientId || 
    googleConfig.webClientId
  );

  // For Expo Go on iOS/Android, we need to use webClientId
  // Only use platform-specific IDs for standalone builds
  
  const authConfig = hasGoogleConfig ? {
    ...googleConfig,
    // Use webClientId for web platform or Expo Go
    ...((isWeb || isExpoGo) && googleConfig.webClientId ? {
      clientId: googleConfig.webClientId,
      iosClientId: undefined,
      androidClientId: undefined,
    } : {}),
    // Add explicit redirect URI
    redirectUri: redirectUri,
  } : {
    iosClientId: '',
    androidClientId: '',
    webClientId: '',
    scopes: ['openid', 'profile', 'email'],
    redirectUri: redirectUri,
  };

  const checkExistingSession = useCallback(async () => {
    try {
      const sessionToken = await secureStorage.getItem('sessionToken');
      if (sessionToken) {
        // Verify session with Convex
        const session = await convex.query(api.auth.getSession, { sessionToken });
        if (session && session.expires > Date.now()) {
          const userData = await convex.query(api.auth.getUser, { userId: session.userId });
          if (userData) {
            setUser(userData);
          }
        } else {
          // Session expired, clean up
          await secureStorage.removeItem('sessionToken');
        }
      }
    } catch (error) {
      console.error('Error checking existing session:', error);
    } finally {
      setIsLoading(false);
    }
  }, [convex]);

  const handleGoogleAuth = useCallback(async (accessToken?: string) => {
    console.log('handleGoogleAuth called with token:', accessToken ? 'Present' : 'Missing');
    if (!accessToken) {
      console.error('No access token provided to handleGoogleAuth');
      return;
    }

    try {
      setIsLoading(true);

      // Get user info from Google
      console.log('Fetching user info from Google...');
      const userInfoResponse = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
      );
      
      if (!userInfoResponse.ok) {
        console.error('Google API response not ok:', userInfoResponse.status, userInfoResponse.statusText);
        return;
      }
      
      const googleUser = await userInfoResponse.json();
      console.log('Google user info received:', { email: googleUser.email, name: googleUser.name });

      // Check if user exists in Convex
      console.log('Checking if user exists in Convex...');
      let userData = await convex.query(api.auth.getUserByEmail, { 
        email: googleUser.email 
      });

      // Create user if doesn't exist
      if (!userData) {
        console.log('User not found, creating new user...');
        const userId = await convex.mutation(api.auth.createUser, {
          email: googleUser.email,
          name: googleUser.name,
          image: googleUser.picture,
          emailVerified: Date.now(),
        });
        console.log('New user created with ID:', userId);
        userData = await convex.query(api.auth.getUser, { userId });
      } else {
        console.log('Existing user found:', userData._id);
      }

      if (userData) {
        // Create session
        const sessionToken = generateSessionToken();
        const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days

        await convex.mutation(api.auth.createSession, {
          sessionToken,
          userId: userData._id,
          expires: expiresAt,
        });

        // Store session securely
        console.log('Storing session and setting user...');
        await secureStorage.setItem('sessionToken', sessionToken);
        setUser(userData);
        console.log('Authentication completed successfully!');
      }
    } catch (error) {
      console.error('Error during Google authentication:', error);
    } finally {
      setIsLoading(false);
    }
  }, [convex]);

  console.log('Final authConfig:', {
    clientId: 'clientId' in authConfig ? authConfig.clientId : 'Not set',
    iosClientId: authConfig.iosClientId,
    webClientId: authConfig.webClientId,
    redirectUri: authConfig.redirectUri,
  });

  const [request, response, promptAsync] = Google.useAuthRequest(authConfig);

  console.log('Google auth request state:', {
    requestReady: !!request,
    hasResponse: !!response,
    promptAsyncReady: !!promptAsync,
  });

  // Handle authentication response
  useEffect(() => {
    if (!response) return;
    
    console.log('OAuth Response:', response);
    console.log('Response Type:', response.type);
    
    if (response.type === 'success') {
      console.log('OAuth Success - Full Response:', response);
      const accessToken = response.authentication?.accessToken;
      console.log('OAuth Success - Access Token:', accessToken ? 'Present' : 'Missing');
      
      if (accessToken) {
        handleGoogleAuth(accessToken);
      } else {
        console.error('No access token received in OAuth response');
      }
    } else if (response.type === 'error') {
      console.error('OAuth Error:', response.error);
    } else if (response.type === 'cancel') {
      console.log('OAuth was cancelled by user');
    }
  }, [response, handleGoogleAuth]);

  // Check for existing session on app start
  useEffect(() => {
    checkExistingSession();
  }, [checkExistingSession]);

  const signIn = async () => {
    console.log('signIn called');
    if (!hasGoogleConfig) {
      console.warn('Google OAuth not configured. Please add Google client IDs to your .env file.');
      return;
    }
    
    console.log('Initiating OAuth flow with promptAsync...');
    try {
      const result = await promptAsync();
      console.log('promptAsync result:', result);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Get current session token
      const sessionToken = await secureStorage.getItem('sessionToken');
      if (sessionToken) {
        // Delete session from Convex
        await convex.mutation(api.auth.deleteSession, { sessionToken });
        // Remove from secure storage
        await secureStorage.removeItem('sessionToken');
      }
      
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSessionToken = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}