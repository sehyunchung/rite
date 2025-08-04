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

export function CrossPlatformButton({ 
  onAction, 
  children, 
  variant,
  size,
  className,
  disabled
}: CrossPlatformButtonProps) {
  if (Platform.OS === 'web') {
    // On web, only pass web-compatible props
    return (
      <Button
        {...{ onClick: onAction } as { onClick?: () => void }}
        variant={variant}
        size={size}
        className={className}
        disabled={disabled}
      >
        {children}
      </Button>
    );
  }
  
  // On native, use onPress
  return (
    <Button
      {...{ onPress: onAction } as { onPress?: () => void }}
      variant={variant}
      size={size}
      className={className}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}