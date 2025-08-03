// Import secure random values for React Native cross-platform crypto
import 'react-native-get-random-values';
import { ConvexReactClient } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { Id } from '@rite/backend/convex/_generated/dataModel';
import { User, AuthError } from './types';
import { secureStorage, STORAGE_KEYS } from './secure-storage';

/**
 * Generate a cryptographically secure session token
 * Uses react-native-get-random-values for cross-platform security
 */
export const generateSessionToken = (): string => {
  // react-native-get-random-values polyfills crypto.getRandomValues
  // This works across all platforms (web, iOS, Android)
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Note: OAuth state/CSRF protection is handled automatically by expo-auth-session
// No manual state generation or validation needed - expo-auth-session provides built-in PKCE and state management

/**
 * Check and restore existing session if valid
 */
export const checkExistingSession = async (convex: ConvexReactClient): Promise<User | null> => {
  try {
    const sessionToken = await secureStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    if (!sessionToken) {
      return null;
    }

    // Verify session with Convex
    const session = await convex.query(api.auth.getSession, { sessionToken });
    if (!session || session.expires <= Date.now()) {
      // Session expired, clean up
      await secureStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
      return null;
    }

    // Get user data
    const userData = await convex.query(api.auth.getUser, { userId: session.userId });
    return userData || null;
  } catch (error) {
    throw new AuthError(
      'Failed to check existing session',
      'SESSION_CHECK_ERROR',
      error
    );
  }
};

/**
 * Create a new session for the user
 */
export const createUserSession = async (
  convex: ConvexReactClient,
  userId: Id<"users">
): Promise<string> => {
  try {
    const sessionToken = generateSessionToken();
    const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days

    await convex.mutation(api.auth.createSession, {
      sessionToken,
      userId,
      expires: expiresAt,
    });

    await secureStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, sessionToken);
    return sessionToken;
  } catch (error) {
    throw new AuthError(
      'Failed to create user session',
      'SESSION_CREATE_ERROR',
      error
    );
  }
};

/**
 * Clear current session
 */
export const clearUserSession = async (convex: ConvexReactClient): Promise<void> => {
  try {
    const sessionToken = await secureStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    if (sessionToken) {
      // Delete session from Convex
      await convex.mutation(api.auth.deleteSession, { sessionToken });
      // Remove from secure storage
      await secureStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
    }
  } catch (error) {
    throw new AuthError(
      'Failed to clear user session',
      'SESSION_CLEAR_ERROR',
      error
    );
  }
};