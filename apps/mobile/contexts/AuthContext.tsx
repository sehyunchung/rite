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
  
  console.log('Google OAuth Config:', {
    platform: Platform.OS,
    appOwnership: Constants.appOwnership,
    isExpoGo,
    isWeb,
    iosClientId: googleConfig.iosClientId ? 'Set' : 'Not set',
    androidClientId: googleConfig.androidClientId ? 'Set' : 'Not set', 
    webClientId: googleConfig.webClientId ? 'Set' : 'Not set',
    redirectUri,
    googleIOSScheme,
    usingClientId: isWeb ? 'webClientId' : 'platform-specific',
    actualWebClientId: googleConfig.webClientId,
    appInfo: {
      applicationId: Constants.manifest?.ios?.bundleIdentifier || Constants.expoConfig?.ios?.bundleIdentifier,
      expoSlug: Constants.manifest?.slug || Constants.expoConfig?.slug,
      expoUsername: Constants.manifest?.owner || Constants.expoConfig?.owner,
    }
  });

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
    hasWebClientId: !!googleConfig.webClientId,
    isExpoGo,
    isWeb,
    shouldUseWebClient: (isWeb || isExpoGo) && googleConfig.webClientId,
  });

  const [request, response, promptAsync] = Google.useAuthRequest(authConfig);

  console.log('Google auth request state:', {
    requestReady: !!request,
    hasResponse: !!response,
    promptAsyncReady: !!promptAsync,
  });

  // Handle authentication response
  useEffect(() => {
    if (!response) {
      console.log('No OAuth response yet');
      return;
    }
    
    console.log('=== OAuth Response Received ===');
    console.log('OAuth Response:', response);
    console.log('Response Type:', response.type);
    console.log('Response Keys:', Object.keys(response));
    
    if (response.type === 'success') {
      console.log('OAuth Success - Full Response:', JSON.stringify(response, null, 2));
      
      // With shouldAutoExchangeCode: true, we should get an access token directly
      if (response.authentication?.accessToken) {
        console.log('OAuth Success - Access Token received via auto exchange');
        handleGoogleAuth(response.authentication.accessToken);
      } else {
        console.error('No access token received in OAuth response');
        console.error('Response authentication:', response.authentication);
        console.error('Response params:', response.params);
        console.error('Auto code exchange may have failed');
      }
    } else if (response.type === 'error') {
      console.error('OAuth Error:', response.error);
      console.error('OAuth Error Details:', response.params);
      console.error('OAuth Error Full Response:', JSON.stringify(response, null, 2));
      
      // Log specific error details for debugging
      if (response.params?.error_description) {
        console.error('Error Description:', response.params.error_description);
      }
      if (response.params?.error) {
        console.error('Error Type:', response.params.error);
      }
      
      // Check if it's a redirect URI mismatch error
      if (response.params?.error === 'redirect_uri_mismatch') {
        console.error('Redirect URI mismatch. Expected redirect URI:', redirectUri);
        console.error('Please add this redirect URI to your Google OAuth client configuration.');
      }
      
      // Handle other common errors
      if (response.params?.error === 'access_denied') {
        console.log('User denied access to the application');
      }
    } else if (response.type === 'cancel') {
      console.log('OAuth was cancelled by user');
    } else {
      console.warn('Unexpected OAuth response type:', response.type);
      console.warn('Full response:', JSON.stringify(response, null, 2));
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
        console.log('Web OAuth redirect detected with access token:', accessToken.substring(0, 20) + '...');
        console.log('State:', state);
        
        // Process the access token directly (implicit flow)
        handleGoogleAuth(accessToken);
        
        // Clear URL parameters and hash to clean up the browser
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (code && state) {
        console.log('Web OAuth redirect detected with code:', code.substring(0, 20) + '...');
        console.log('State:', state);
        
        // Process the code manually (code flow - fallback)
        exchangeCodeForToken(code);
        
        // Clear URL parameters to clean up the browser
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const exchangeCodeForToken = async (code: string) => {
    try {
      console.log('Exchanging authorization code for access token...');
      console.log('Using redirect URI for token exchange:', redirectUri);
      
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
          redirect_uri: redirectUri, // Use the same redirect URI as in the auth request
        }),
      });

      const responseText = await tokenResponse.text();
      console.log('Token exchange response status:', tokenResponse.status);
      console.log('Token exchange response:', responseText);

      if (!tokenResponse.ok) {
        console.error('Token exchange failed:', tokenResponse.status, tokenResponse.statusText);
        console.error('Token exchange error response:', responseText);
        return;
      }

      const tokenData = JSON.parse(responseText);
      console.log('Token exchange successful');
      
      if (tokenData.access_token) {
        handleGoogleAuth(tokenData.access_token);
      } else {
        console.error('No access token in response:', tokenData);
      }
    } catch (error) {
      console.error('Error exchanging code for token:', error);
    }
  };

  // Simple test function to open OAuth URL directly
  const testDirectOAuth = () => {
    const testUrl = isWeb 
      ? `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=http://localhost:8081&client_id=${googleConfig.webClientId}&response_type=code&scope=openid+profile+email&state=test123`
      : `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=https://auth.expo.io/@sehyun_chung/rite&client_id=${googleConfig.webClientId}&response_type=code&scope=openid+profile+email&state=test123`;
    
    console.log('Test OAuth URL:', testUrl);
    
    if (Platform.OS === 'web') {
      window.open(testUrl, '_blank');
    } else {
      // For mobile, we'd need to use Linking.openURL but let's just log it for now
      console.log('Copy this URL to test in browser:', testUrl);
    }
  };

  const signIn = async () => {
    console.log('=== signIn called ===');
    console.log('hasGoogleConfig:', hasGoogleConfig);
    console.log('request ready:', !!request);
    console.log('promptAsync ready:', !!promptAsync);
    console.log('Platform:', Platform.OS);
    console.log('isExpoGo:', isExpoGo);
    console.log('isWeb:', isWeb);
    
    if (!hasGoogleConfig) {
      console.warn('Google OAuth not configured. Please add Google client IDs to your .env file.');
      return;
    }
    
    if (!request) {
      console.error('OAuth request not ready. Please wait and try again.');
      return;
    }
    
    console.log('Initiating OAuth flow with promptAsync...');
    console.log('Final authConfig being used:', {
      ...authConfig,
      // Don't log sensitive client secrets, just indicate if set
      webClientId: authConfig.webClientId ? 'Set' : 'Not set',
      iosClientId: authConfig.iosClientId ? 'Set' : 'Not set',
      androidClientId: authConfig.androidClientId ? 'Set' : 'Not set',
      clientId: authConfig.clientId ? 'Set' : 'Not set',
    });
    
    // Log the actual request URL being generated (if available)
    if (request?.url) {
      console.log('OAuth request URL:', request.url);
    }
    
    try {
      console.log('Calling promptAsync...');
      
      // Add a timeout to detect if promptAsync hangs
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('promptAsync timeout after 30 seconds')), 30000)
      );
      
      const result = await Promise.race([promptAsync(), timeoutPromise]);
      console.log('promptAsync completed with result:', result);
      console.log('promptAsync result type:', result?.type);
      
      // If we get here but no response in useEffect, there might be a timing issue
      if (result?.type === 'success') {
        console.log('promptAsync returned success but checking if useEffect will handle it...');
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      if (error?.message?.includes('timeout')) {
        console.error('promptAsync appears to be hanging - this suggests the redirect is not returning to the app');
      }
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

  // Add test function to window for debugging
  if (typeof window !== 'undefined') {
    (window as any).testDirectOAuth = testDirectOAuth;
  }

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