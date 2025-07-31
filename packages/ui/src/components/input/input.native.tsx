import React from 'react';
import { TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import '../../types/nativewind';

export interface InputProps extends Omit<TextInputProps, 'className'> {
  className?: string;
  type?: 'text' | 'email' | 'password' | 'number';
}

export const Input = React.forwardRef<TextInput, InputProps>(
  ({ className = '', type, style, ...props }, ref) => {
    // Map HTML input types to React Native TextInput props
    const keyboardType = type === 'email' ? 'email-address' : type === 'number' ? 'numeric' : 'default';
    const secureTextEntry = type === 'password';
    
    return (
      <TextInput
        ref={ref}
        className={`h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-400 disabled:opacity-50 ${className}`}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        style={style}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';