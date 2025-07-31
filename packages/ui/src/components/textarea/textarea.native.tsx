import React from 'react';
import { TextInput } from 'react-native';
import type { TextInputProps } from 'react-native';
import '../../types/nativewind';

export interface TextareaProps extends Omit<TextInputProps, 'className'> {
  className?: string;
}

export const Textarea = React.forwardRef<TextInput, TextareaProps>(
  ({ className = '', style, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        multiline
        textAlignVertical="top"
        className={`min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-400 disabled:opacity-50 ${className}`}
        placeholderTextColor="#9ca3af"
        style={style}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';