import * as React from 'react';
import { Platform, TextInputProps } from 'react-native';
import { Textarea } from '@rite/ui';

interface CrossPlatformTextareaProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  // Native-specific props
  numberOfLines?: TextInputProps['numberOfLines'];
}

export function CrossPlatformTextarea({ 
  value, 
  onValueChange, 
  numberOfLines,
  placeholder,
  className,
  disabled
}: CrossPlatformTextareaProps) {
  if (Platform.OS === 'web') {
    // On web, only pass web-compatible props
    return (
      <Textarea
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onValueChange(e.target.value)}
        rows={numberOfLines}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />
    );
  }
  
  // On native, use all props including native-specific ones
  return (
    <Textarea
      value={value}
      {...{ onChangeText: onValueChange } as { onChangeText?: (text: string) => void }}
      {...{ numberOfLines } as { numberOfLines?: number }}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
    />
  );
}