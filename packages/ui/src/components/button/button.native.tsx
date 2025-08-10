import * as React from 'react';
import { Pressable, Text, View } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import '@rite/ui/types/nativewind';
import { cn } from '../../lib/utils';
import { getFontFamily } from '../../lib/font-mapping.native';

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

const textVariants = cva(
  'text-center font-medium',
  {
    variants: {
      variant: {
        default: 'text-neutral-0',
        destructive: 'text-neutral-0',
        outline: 'text-neutral-0',
        secondary: 'text-neutral-0',
        ghost: 'text-neutral-0',
      },
      size: {
        default: 'text-base',
        sm: 'text-sm',
        lg: 'text-lg',
        icon: 'text-base',
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
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export const Button = React.forwardRef<View, ButtonProps>(({
  variant,
  size,
  className = '',
  onPress,
  disabled,
  children,
  accessibilityLabel,
  accessibilityHint,
  testID,
  ...props
}: ButtonProps, _ref) => {
  const buttonClass = cn(buttonVariants({ variant, size }), className);
  const textClass = textVariants({ variant, size });
  
  // Get the font family based on the weight (buttons use font-medium)
  const fontFamily = getFontFamily('font-medium');
  
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={buttonClass}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : 'Button')}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      testID={testID}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text 
          className={textClass}
          style={{ fontFamily }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
})

Button.displayName = 'Button'