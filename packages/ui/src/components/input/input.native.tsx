import React from 'react';
import { TextInput, View, Platform } from 'react-native';
import type { TextInputProps } from 'react-native';
import '@rite/ui/types/nativewind';

export interface InputProps extends Omit<TextInputProps, 'className'> {
  className?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  accessibilityRequired?: boolean;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  ({ className = '', type, style, accessibilityRequired, ...props }, ref) => {
    // Map HTML input types to React Native TextInput props
    const keyboardType = type === 'email' ? 'email-address' : type === 'number' ? 'numeric' : 'default';
    const secureTextEntry = type === 'password';
    
    // Use SUIT font
    const fontFamily = Platform.select({
      ios: 'SUIT-Regular',
      android: 'SUIT-Regular',
      default: 'System',
    });
    
    return (
      <TextInput
        ref={ref}
        className={`h-12 w-full rounded-lg bg-neutral-700 px-4 py-3 text-base text-white placeholder:text-neutral-400 disabled:opacity-50 ${className}`}
        placeholderTextColor="#7A7A88"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        style={[{ fontFamily }, style]}
        accessible={true}
        accessibilityRole="text"
        // Pass through accessibility props, with defaults
        accessibilityLabel={props.accessibilityLabel}
        accessibilityHint={props.accessibilityHint}
        accessibilityRequired={accessibilityRequired}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';