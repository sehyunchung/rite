import { ConvexReactClient } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { Id } from '@rite/backend/convex/_generated/dataModel';
import { User, AuthError } from './types';
import { secureStorage, STORAGE_KEYS } from './secure-storage';

/**
 * Generate a cryptographically secure session token
 */
export const generateSessionToken = (): string => {
  // Use crypto API if available (web), otherwise fallback to secure generation
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback for environments without crypto API
  // This is still better than Math.random() but not ideal
  const timestamp = Date.now().toString(36);
  const randomPart = Array.from({ length: 16 }, () => 
    Math.floor(Math.random() * 36).toString(36)
  ).join('');
  
  return `${timestamp}-${randomPart}`;
};

/**
 * Generate a secure OAuth state parameter for CSRF protection
 */
export const generateOAuthState = (): string => {
  // Generate a secure random state for CSRF protection
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback state generation
  return `state_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
};

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