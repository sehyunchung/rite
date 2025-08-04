import * as React from 'react';
import { Platform, TextInputProps } from 'react-native';
import { Input } from '@rite/ui';

// Common props that work across all platforms
interface BaseInputProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Web-specific props extending HTML input attributes
interface WebInputProps extends BaseInputProps {
  platform?: 'web';
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  required?: boolean;
  readOnly?: boolean;
}

// Native-specific props from React Native TextInput
interface NativeInputProps extends BaseInputProps {
  platform?: 'native';
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoCorrect?: TextInputProps['autoCorrect'];
  numberOfLines?: TextInputProps['numberOfLines'];
  multiline?: TextInputProps['multiline'];
  secureTextEntry?: TextInputProps['secureTextEntry'];
  returnKeyType?: TextInputProps['returnKeyType'];
  maxLength?: TextInputProps['maxLength'];
}

// Discriminated union for platform-specific props
export type CrossPlatformInputProps = WebInputProps | NativeInputProps;

// Type guards for runtime platform detection
const isWebProps = (props: CrossPlatformInputProps): props is WebInputProps => {
  return Platform.OS === 'web' || props.platform === 'web';
};

const isNativeProps = (props: CrossPlatformInputProps): props is NativeInputProps => {
  return Platform.OS !== 'web' || props.platform === 'native';
};

// Helper function to create web-specific props
const createWebInputProps = (props: WebInputProps) => {
  const {
    value,
    onValueChange,
    placeholder,
    className,
    disabled,
    platform: _platform,
    type,
    autoComplete,
    maxLength,
    minLength,
    pattern,
    required,
    readOnly,
  } = props;
  
  return {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onValueChange(e.target.value),
    placeholder,
    className,
    disabled,
    type,
    autoComplete,
    maxLength,
    minLength,
    pattern,
    required,
    readOnly,
  };
};

// Helper function to create native-specific props
const createNativeInputProps = (props: NativeInputProps) => {
  const {
    value,
    onValueChange,
    placeholder,
    className,
    disabled,
    platform: _platform,
    keyboardType,
    autoCapitalize,
    autoCorrect,
    numberOfLines,
    multiline,
    secureTextEntry,
    returnKeyType,
    maxLength,
  } = props;
  
  return {
    value,
    onChangeText: onValueChange,
    placeholder,
    className,
    editable: !disabled,
    keyboardType,
    autoCapitalize,
    numberOfLines,
    multiline,
    secureTextEntry,
    returnKeyType,
    maxLength,
    // Skip autoCorrect as it has type conflicts
  };
};

// Development-time validation (removed in production builds)
const validateProps = (props: CrossPlatformInputProps) => {
  if (process.env.NODE_ENV === 'development') {
    const webProps = ['type', 'autoComplete', 'pattern', 'required', 'readOnly'];
    const nativeProps = ['keyboardType', 'autoCapitalize', 'numberOfLines', 'multiline', 'returnKeyType'];
    
    if (Platform.OS === 'web') {
      // Warn if native-specific props are used on web
      const invalidProps = nativeProps.filter(prop => prop in props);
      if (invalidProps.length > 0) {
        console.warn(
          `CrossPlatformInput: Native-specific props [${invalidProps.join(', ')}] ` +
          'are ignored on web platform. Consider using platform-specific props.'
        );
      }
    } else {
      // Warn if web-specific props are used on native
      const invalidProps = webProps.filter(prop => prop in props);
      if (invalidProps.length > 0) {
        console.warn(
          `CrossPlatformInput: Web-specific props [${invalidProps.join(', ')}] ` +
          'are ignored on native platform. Consider using platform-specific props.'
        );
      }
    }
  }
};

export function CrossPlatformInput(props: CrossPlatformInputProps) {
  validateProps(props);
  
  if (isWebProps(props)) {
    const webProps = createWebInputProps(props);
    return <Input {...webProps} />;
  }
  
  if (isNativeProps(props)) {
    const nativeProps = createNativeInputProps(props);
    return <Input {...nativeProps} />;
  }
  
  throw new Error('Invalid platform configuration for CrossPlatformInput');
}

// Convenience components for better developer experience
export function WebInput(props: Omit<WebInputProps, 'platform'>) {
  return <CrossPlatformInput {...props} platform="web" />;
}

export function NativeInput(props: Omit<NativeInputProps, 'platform'>) {
  return <CrossPlatformInput {...props} platform="native" />;
}