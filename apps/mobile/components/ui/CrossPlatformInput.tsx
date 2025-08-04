import * as React from 'react';
import { Platform, TextInputProps } from 'react-native';
import { Input } from '@rite/ui';

// Define cross-platform props that work on both web and native
interface CrossPlatformInputProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  // Add native-specific props that are commonly used
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  numberOfLines?: TextInputProps['numberOfLines'];
  multiline?: TextInputProps['multiline'];
}

export function CrossPlatformInput({ 
  value, 
  onValueChange, 
  keyboardType,
  autoCapitalize,
  numberOfLines,
  multiline,
  placeholder,
  className,
  disabled
}: CrossPlatformInputProps) {
  if (Platform.OS === 'web') {
    // On web, only pass web-compatible props
    return (
      <Input
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />
    );
  }
  
  // On native, use all props including native-specific ones
  return (
    <Input
      value={value}
      {...{ onChangeText: onValueChange } as { onChangeText?: (text: string) => void }}
      {...{ keyboardType } as { keyboardType?: TextInputProps['keyboardType'] }}
      {...{ autoCapitalize } as { autoCapitalize?: TextInputProps['autoCapitalize'] }}
      {...{ numberOfLines } as { numberOfLines?: number }}
      {...{ multiline } as { multiline?: boolean }}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
    />
  );
}