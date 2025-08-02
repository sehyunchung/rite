import React from 'react';
import { TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import '@rite/ui/types/nativewind';

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
        className={`h-12 w-full rounded-lg bg-neutral-700 px-4 py-3 text-base text-white placeholder:text-neutral-400 disabled:opacity-50 ${className}`}
        placeholderTextColor="#7A7A88"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        style={style}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';