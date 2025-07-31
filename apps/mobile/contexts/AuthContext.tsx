import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useConvex } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { Id } from '@rite/backend/convex/_generated/dataModel';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

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

// Google OAuth configuration
const googleConfig = {
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  scopes: ['openid', 'profile', 'email'],
  additionalParameters: {},
  customOAuthParameters: {},
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const convex = useConvex();

  // Only initialize Google auth if client IDs are available
  const hasGoogleConfig = Boolean(
    googleConfig.iosClientId || 
    googleConfig.androidClientId || 
    googleConfig.webClientId
  );

  const [request, response, promptAsync] = Google.useAuthRequest(
    hasGoogleConfig ? googleConfig : {
      iosClientId: '',
      androidClientId: '',
      webClientId: '',
      scopes: ['openid', 'profile', 'email'],
    }
  );

  // Handle authentication response
  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleAuth(response.authentication?.accessToken);
    }
  }, [response]);

  // Check for existing session on app start
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const sessionToken = await SecureStore.getItemAsync('sessionToken');
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
          await SecureStore.deleteItemAsync('sessionToken');
        }
      }
    } catch (error) {
      console.error('Error checking existing session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async (accessToken?: string) => {
    if (!accessToken) return;

    try {
      setIsLoading(true);

      // Get user info from Google
      const userInfoResponse = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
      );
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
        await SecureStore.setItemAsync('sessionToken', sessionToken);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error during Google authentication:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async () => {
    if (!hasGoogleConfig) {
      console.warn('Google OAuth not configured. Please add Google client IDs to your .env file.');
      return;
    }
    
    try {
      await promptAsync();
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Get current session token
      const sessionToken = await SecureStore.getItemAsync('sessionToken');
      if (sessionToken) {
        // Delete session from Convex
        await convex.mutation(api.auth.deleteSession, { sessionToken });
        // Remove from secure storage
        await SecureStore.deleteItemAsync('sessionToken');
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