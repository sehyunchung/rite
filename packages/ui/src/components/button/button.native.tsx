import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import '../../types/nativewind';

const buttonVariants = cva(
  'flex items-center justify-center rounded-lg font-medium disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-brand-primary active:bg-brand-primary-dark',
        destructive: 'bg-error active:bg-error/90',
        outline: 'border-2 border-neutral-600 bg-transparent active:bg-neutral-700',
        secondary: 'bg-neutral-700 active:bg-neutral-600',
        ghost: 'active:bg-neutral-700/50',
      },
      size: {
        default: 'h-12 px-6',
        sm: 'h-10 px-4 rounded-md',
        lg: 'h-14 px-8 rounded-xl',
        icon: 'w-12 h-12',
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
      className={buttonClass}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text className={`text-center font-medium ${
          variant === 'default' || variant === 'destructive' || variant === 'secondary' 
            ? 'text-white' 
            : variant === 'outline' 
            ? 'text-white'
            : variant === 'ghost'
            ? 'text-white'
            : 'text-brand-primary'
        } ${
          size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
        }`}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}