import * as React from 'react';
import { Platform } from 'react-native';
import { Button } from '@rite/ui';

interface CrossPlatformButtonProps {
  onAction?: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
}

// Helper function to create platform-specific props with proper typing
const createButtonProps = (
  onAction: (() => void) | undefined,
  commonProps: Omit<CrossPlatformButtonProps, 'onAction'>
) => {
  const { children, variant, size, className, disabled } = commonProps;
  
  if (Platform.OS === 'web') {
    // Return web-specific props
    return {
      onClick: onAction,
      variant,
      size,
      className,
      disabled,
      children,
    } as const;
  }
  
  // Return native-specific props
  return {
    onPress: onAction,
    variant,
    size,
    className,
    disabled,
    children,
  } as const;
};

export function CrossPlatformButton(props: CrossPlatformButtonProps) {
  const { onAction, ...commonProps } = props;
  const buttonProps = createButtonProps(onAction, commonProps);
  
  return <Button {...buttonProps} />;
}