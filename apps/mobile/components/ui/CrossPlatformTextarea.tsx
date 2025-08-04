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

// Helper function to create platform-specific props with proper typing
const createTextareaProps = (props: CrossPlatformTextareaProps) => {
  const {
    value,
    onValueChange,
    numberOfLines,
    placeholder,
    className,
    disabled,
  } = props;

  if (Platform.OS === 'web') {
    // Return web-specific props (numberOfLines becomes rows for web)
    return {
      value,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => onValueChange(e.target.value),
      rows: numberOfLines,
      placeholder,
      className,
      disabled,
    } as const;
  }

  // Return native-specific props
  return {
    value,
    onChangeText: onValueChange,
    numberOfLines,
    placeholder,
    className,
    disabled,
  } as const;
};

export function CrossPlatformTextarea(props: CrossPlatformTextareaProps) {
  const textareaProps = createTextareaProps(props);
  return <Textarea {...textareaProps} />;
}