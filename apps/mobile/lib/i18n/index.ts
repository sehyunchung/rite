/**
 * Custom i18n implementation for Expo mobile app
 * Replaces next-intl dependency for cross-platform internationalization
 */
import { getLocales } from 'expo-localization';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Supported locales
export const SUPPORTED_LOCALES = ['en', 'ko'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

// Storage key for persisted locale preference
const LOCALE_STORAGE_KEY = 'user-locale';

// Translation type definition
export type TranslationKey = string;
export type TranslationValues = Record<string, string | number>;

/**
 * Get device locale or fallback to English
 */
export function getDeviceLocale(): SupportedLocale {
  const locales = getLocales();
  const deviceLocale = locales[0]?.languageCode;
  
  // Check if device locale is supported
  if (deviceLocale && SUPPORTED_LOCALES.includes(deviceLocale as SupportedLocale)) {
    return deviceLocale as SupportedLocale;
  }
  
  return 'en'; // Default fallback
}

/**
 * Get stored locale preference
 */
export async function getStoredLocale(): Promise<SupportedLocale | null> {
  try {
    const storedLocale = await SecureStore.getItemAsync(LOCALE_STORAGE_KEY);
    if (storedLocale && SUPPORTED_LOCALES.includes(storedLocale as SupportedLocale)) {
      return storedLocale as SupportedLocale;
    }
  } catch (error) {
    console.warn('Failed to get stored locale:', error);
  }
  return null;
}

/**
 * Store locale preference
 */
export async function setStoredLocale(locale: SupportedLocale): Promise<void> {
  try {
    await SecureStore.setItemAsync(LOCALE_STORAGE_KEY, locale);
  } catch (error) {
    console.warn('Failed to store locale:', error);
  }
}

/**
 * Determine the best locale to use
 */
export async function getBestLocale(): Promise<SupportedLocale> {
  // Check stored preference first
  const storedLocale = await getStoredLocale();
  if (storedLocale) {
    return storedLocale;
  }
  
  // Fall back to device locale
  return getDeviceLocale();
}

/**
 * Simple interpolation function
 * Replaces {key} placeholders with values
 */
export function interpolate(template: string, values?: TranslationValues): string {
  if (!values) return template;
  
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key]?.toString() ?? match;
  });
}

/**
 * Get nested translation value from object
 */
export function getTranslationValue(translations: any, key: TranslationKey): string | undefined {
  const keys = key.split('.');
  let value = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return undefined;
    }
  }
  
  return typeof value === 'string' ? value : undefined;
}

/**
 * Format date according to locale
 */
export function formatDate(date: Date, locale: SupportedLocale): string {
  try {
    return date.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    // Fallback to English formatting
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}

/**
 * Simple pluralization for English and Korean
 */
export function pluralize(
  count: number,
  locale: SupportedLocale,
  singular: string,
  plural?: string
): string {
  if (locale === 'ko') {
    // Korean doesn't have plural forms like English
    return singular;
  }
  
  // English pluralization
  if (count === 1) {
    return singular;
  }
  
  return plural || `${singular}s`;
}