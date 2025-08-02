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
  responseType: Platform.OS === 'web' ? 'token' : 'code', // Use implicit flow for web to avoid PKCE
  shouldAutoExchangeCode: Platform.OS !== 'web', // Enable auto exchange for mobile, disable for web
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
  
  // Set redirect URI based on platform
  // For iOS, use the Google-generated URL scheme from the iOS client configuration
  // The scheme should be exactly: com.googleusercontent.apps.420827108032-bksn0r122euuio8gfg8pa5ei50kjlkj4
  const googleIOSScheme = 'com.googleusercontent.apps.420827108032-bksn0r122euuio8gfg8pa5ei50kjlkj4';
  
  // Let's try different redirect URI approaches
  let redirectUri;
  if (isWeb) {
    redirectUri = 'http://localhost:8081';
  } else if (isExpoGo) {
    // For Expo Go, use the Google URL scheme without path - simpler format
    redirectUri = `${googleIOSScheme}://`;
  } else if (Platform.OS === 'ios') {
    // For iOS, try the exact scheme from Google Console with just ://
    redirectUri = `${googleIOSScheme}://`;
  } else {
    redirectUri = AuthSession.makeRedirectUri({ scheme: 'com.rite.mobile' });
  }
  

  // Only initialize Google auth if client IDs are available
  const hasGoogleConfig = Boolean(
    googleConfig.iosClientId || 
    googleConfig.androidClientId || 
    googleConfig.webClientId
  );

  // Configure OAuth based on platform
  let authConfig;
  if (!hasGoogleConfig) {
    authConfig = {
      iosClientId: '',
      androidClientId: '',
      webClientId: '',
      scopes: ['openid', 'profile', 'email'],
      redirectUri: redirectUri,
    };
  } else if (isWeb) {
    // For web platform, use web client ID
    authConfig = {
      ...googleConfig,
      clientId: googleConfig.webClientId,
      iosClientId: undefined,
      androidClientId: undefined,
      redirectUri: redirectUri,
    };
  } else if (isExpoGo) {
    // For Expo Go, use platform-specific client IDs with expo development scheme
    // This works better with Expo's development server
    authConfig = {
      ...googleConfig,
      redirectUri: redirectUri,
    };
  } else {
    // For standalone mobile, use platform-specific client IDs
    authConfig = {
      ...googleConfig,
      redirectUri: redirectUri,
    };
  }

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
    } catch {
      // Session check failed, continue without auth
    } finally {
      setIsLoading(false);
    }
  }, [convex]);

  const handleGoogleAuth = useCallback(async (accessToken?: string) => {
    if (!accessToken) {
      return;
    }

    try {
      setIsLoading(true);

      // Get user info from Google
      const userInfoResponse = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
      );
      
      if (!userInfoResponse.ok) {
        return;
      }
      
      const googleUser = await userInfoResponse.json();

      // Check if user exists in Convex
      let userData = await convex.query(api.auth.getUserByEmail, { 
        email: googleUser.email 
      });

      // Create user if doesn't exist
      if (!userData) {
        const userId = await convex.mutation(api.auth.createUser, {
          email: googleUser.email,
          name: googleUser.name,
          image: googleUser.picture,
          emailVerified: Date.now(),
        });
        userData = await convex.query(api.auth.getUser, { userId });
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
        await secureStorage.setItem('sessionToken', sessionToken);
        setUser(userData);
      }
    } catch {
      // Authentication failed
    } finally {
      setIsLoading(false);
    }
  }, [convex]);


  const [request, response, promptAsync] = Google.useAuthRequest(authConfig);


  // Handle authentication response
  useEffect(() => {
    if (!response) {
      return;
    }
    
    if (response.type === 'success') {
      // With shouldAutoExchangeCode: true, we should get an access token directly
      if (response.authentication?.accessToken) {
        handleGoogleAuth(response.authentication.accessToken);
      }
    }
  }, [response, handleGoogleAuth]);

  // Check for existing session on app start
  useEffect(() => {
    checkExistingSession();
  }, [checkExistingSession]);

  // Handle web platform OAuth redirect on page load
  useEffect(() => {
    if (Platform.OS === 'web') {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      // Check for access token (implicit flow)
      const accessToken = hashParams.get('access_token');
      const state = hashParams.get('state') || urlParams.get('state');
      
      // Check for authorization code (code flow - fallback)
      const code = urlParams.get('code');
      
      if (accessToken && state) {
        // Process the access token directly (implicit flow)
        handleGoogleAuth(accessToken);
        
        // Clear URL parameters and hash to clean up the browser
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (code && state) {
        // Process the code manually (code flow - fallback)
        exchangeCodeForToken(code);
        
        // Clear URL parameters to clean up the browser
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const exchangeCodeForToken = async (code: string) => {
    try {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: googleConfig.webClientId!,
          client_secret: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_SECRET || '', 
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        return;
      }

      const tokenData = await tokenResponse.json();
      
      if (tokenData.access_token) {
        handleGoogleAuth(tokenData.access_token);
      }
    } catch {
      // Token exchange failed
    }
  };


  const signIn = async () => {
    if (!hasGoogleConfig || !request) {
      return;
    }
    
    try {
      await promptAsync();
    } catch {
      // OAuth failed
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
    } catch {
      // Sign out failed
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