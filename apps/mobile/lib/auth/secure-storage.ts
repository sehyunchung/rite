import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthError } from './types';

/**
 * Platform-agnostic secure storage abstraction
 * Uses SecureStore on mobile and AsyncStorage on web
 */
export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(key);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      throw new AuthError(
        `Failed to get item from secure storage: ${key}`,
        'STORAGE_GET_ERROR',
        error
      );
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      throw new AuthError(
        `Failed to set item in secure storage: ${key}`,
        'STORAGE_SET_ERROR',
        error
      );
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      throw new AuthError(
        `Failed to remove item from secure storage: ${key}`,
        'STORAGE_REMOVE_ERROR',
        error
      );
    }
  }
};

export const STORAGE_KEYS = {
  SESSION_TOKEN: 'sessionToken',
  // Note: OAuth state is handled automatically by expo-auth-session
  // No manual CSRF storage needed
} as const;