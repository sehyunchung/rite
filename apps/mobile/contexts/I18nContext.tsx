/**
 * I18n Context for managing locale and translations in mobile app
 * Replaces next-intl for cross-platform internationalization
 */
import * as React from 'react';
import {
  SupportedLocale,
  getBestLocale,
  setStoredLocale,
  interpolate,
  getTranslationValue,
  formatDate,
  pluralize,
  type TranslationKey,
  type TranslationValues,
} from '../lib/i18n';
import { getTranslations, type TranslationSchema } from '../lib/i18n/translations';

interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => Promise<void>;
  t: (key: TranslationKey, values?: TranslationValues) => string;
  formatDate: (date: Date) => string;
  pluralize: (count: number, singular: string, plural?: string) => string;
  isLoading: boolean;
}

const I18nContext = React.createContext<I18nContextType | null>(null);

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = React.useState<SupportedLocale>('en');
  const [isLoading, setIsLoading] = React.useState(true);
  const [translations, setTranslations] = React.useState<TranslationSchema | null>(null);

  // Initialize locale on mount
  React.useEffect(() => {
    async function initializeLocale() {
      try {
        const bestLocale = await getBestLocale();
        setLocaleState(bestLocale);
        setTranslations(getTranslations(bestLocale));
      } catch (error) {
        console.warn('Failed to initialize locale:', error);
        setLocaleState('en');
        setTranslations(getTranslations('en'));
      } finally {
        setIsLoading(false);
      }
    }

    initializeLocale();
  }, []);

  // Handle locale changes
  const setLocale = React.useCallback(async (newLocale: SupportedLocale) => {
    try {
      setLocaleState(newLocale);
      setTranslations(getTranslations(newLocale));
      await setStoredLocale(newLocale);
    } catch (error) {
      console.warn('Failed to set locale:', error);
    }
  }, []);

  // Translation function with interpolation
  const t = React.useCallback(
    (key: TranslationKey, values?: TranslationValues): string => {
      if (!translations) {
        // If translations not loaded, use English as fallback
        const fallbackTranslation = getTranslationValue(getTranslations('en'), key);
        if (fallbackTranslation) {
          return interpolate(fallbackTranslation, values);
        }
        
        console.warn(`Missing translation for key: ${key} (translations not loaded)`);
        return __DEV__ ? `[${key}]` : 'Translation missing';
      }
      
      const translation = getTranslationValue(translations, key);
      
      if (!translation) {
        // Fallback to English if translation not found
        const fallbackTranslation = getTranslationValue(getTranslations('en'), key);
        if (fallbackTranslation) {
          return interpolate(fallbackTranslation, values);
        }
        
        // Return key as fallback if no translation found
        console.warn(`Missing translation for key: ${key}`);
        return __DEV__ ? `[${key}]` : 'Translation missing';
      }
      
      return interpolate(translation, values);
    },
    [translations]
  );

  // Date formatting function
  const formatDateForLocale = React.useCallback(
    (date: Date): string => {
      return formatDate(date, locale);
    },
    [locale]
  );

  // Pluralization function
  const pluralizeForLocale = React.useCallback(
    (count: number, singular: string, plural?: string): string => {
      return pluralize(count, locale, singular, plural);
    },
    [locale]
  );

  const value = React.useMemo(
    () => ({
      locale,
      setLocale,
      t,
      formatDate: formatDateForLocale,
      pluralize: pluralizeForLocale,
      isLoading,
    }),
    [locale, setLocale, t, formatDateForLocale, pluralizeForLocale, isLoading]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Hook to access i18n context
 */
export function useI18n(): I18nContextType {
  const context = React.useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

/**
 * Hook specifically for translations (similar to next-intl's useTranslations)
 */
export function useTranslations(namespace?: string) {
  const { t } = useI18n();
  
  return React.useCallback(
    (key: string, values?: TranslationValues) => {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      return t(fullKey, values);
    },
    [t, namespace]
  );
}

/**
 * Simple language switcher component
 */
export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  const handleLocaleChange = (newLocale: SupportedLocale) => {
    setLocale(newLocale);
  };

  return null; // Implementation would depend on UI needs
}