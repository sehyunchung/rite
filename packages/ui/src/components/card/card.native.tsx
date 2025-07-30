import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '../../utils';

interface CardProps {
  className?: string;
  children?: React.ReactNode;
}

interface CardHeaderProps {
  className?: string;
  children?: React.ReactNode;
}

interface CardContentProps {
  className?: string;
  children?: React.ReactNode;
}

interface CardFooterProps {
  className?: string;
  children?: React.ReactNode;
}

interface CardTitleProps {
  className?: string;
  children?: React.ReactNode;
}

interface CardDescriptionProps {
  className?: string;
  children?: React.ReactNode;
}

export const Card = React.forwardRef<View, CardProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      // @ts-ignore - NativeWind className support
      className={cn(
        "rounded-lg border border-gray-200 bg-white shadow-sm",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<View, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      // @ts-ignore - NativeWind className support
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<Text, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <Text
      ref={ref}
      // @ts-ignore - NativeWind className support
      className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<Text, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <Text
      ref={ref}
      // @ts-ignore - NativeWind className support
      className={cn("text-sm text-gray-500", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<View, CardContentProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      // @ts-ignore - NativeWind className support
      className={cn("p-6 pt-0", className)}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<View, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      // @ts-ignore - NativeWind className support
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";