import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'flex items-center justify-center rounded-md font-medium disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-gray-900 text-white active:bg-gray-700',
        outline: 'border border-gray-300 bg-white text-gray-900 active:bg-gray-100',
        ghost: 'text-gray-900 active:bg-gray-100',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps extends VariantProps<typeof buttonVariants> {
  onPress?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function Button({
  variant,
  size,
  className = '',
  onPress,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const buttonClass = `${buttonVariants({ variant, size })} ${className}`;
  
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      // @ts-ignore - NativeWind className support
      className={buttonClass}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text 
          // @ts-ignore - NativeWind className support
          className="text-center font-medium"
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}