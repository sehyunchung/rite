import React from 'react';
import { View, Text, Platform } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import '@rite/ui/types/nativewind';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5',
  {
    variants: {
      variant: {
        default: 'bg-gray-900',
        secondary: 'bg-gray-100',
        destructive: 'bg-red-500',
        outline: 'border border-gray-300 bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const badgeTextVariants = cva(
  'text-xs font-semibold',
  {
    variants: {
      variant: {
        default: 'text-white',
        secondary: 'text-gray-900',
        destructive: 'text-white',
        outline: 'text-gray-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ className = '', variant, children, ...props }: BadgeProps) {
  const badgeClass = `${badgeVariants({ variant })} ${className}`;
  const textClass = badgeTextVariants({ variant });
  
  // Use SUIT font with semibold weight for badges
  const fontFamily = Platform.select({
    ios: 'SUIT-SemiBold',
    android: 'SUIT-SemiBold',
    default: 'System',
  });
  
  return (
    <View className={badgeClass} {...props}>
      {typeof children === 'string' ? (
        <Text className={textClass} style={{ fontFamily }}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { badgeVariants };