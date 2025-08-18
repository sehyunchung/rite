import * as React from 'react';
import { View, Text } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import '@rite/ui/types/nativewind';

const alertVariants = cva('relative w-full rounded-lg border px-4 py-3', {
	variants: {
		variant: {
			default: 'bg-white border-gray-300',
			destructive: 'bg-red-50 border-red-300',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

const alertTextVariants = cva('text-sm', {
	variants: {
		variant: {
			default: 'text-gray-900',
			destructive: 'text-red-800',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

export interface AlertProps extends VariantProps<typeof alertVariants> {
	children?: React.ReactNode;
	className?: string;
}

export const Alert = React.forwardRef<View, AlertProps>(
	({ variant, className = '', children, ...props }, ref) => {
		const alertClass = `${alertVariants({ variant })} ${className}`;

		return (
			<View ref={ref} className={alertClass} {...props}>
				{children}
			</View>
		);
	}
);
Alert.displayName = 'Alert';

export interface AlertTitleProps {
	children?: React.ReactNode;
	className?: string;
	variant?: 'default' | 'destructive';
}

export const AlertTitle = React.forwardRef<Text, AlertTitleProps>(
	({ className = '', children, variant = 'default', ...props }, ref) => {
		const textClass = `mb-1 font-medium ${alertTextVariants({ variant })} ${className}`;

		return (
			<Text ref={ref} className={textClass} {...props}>
				{children}
			</Text>
		);
	}
);
AlertTitle.displayName = 'AlertTitle';

export interface AlertDescriptionProps {
	children?: React.ReactNode;
	className?: string;
	variant?: 'default' | 'destructive';
}

export const AlertDescription = React.forwardRef<View, AlertDescriptionProps>(
	({ className = '', children, variant = 'default', ...props }, ref) => {
		const textClass = alertTextVariants({ variant });

		return (
			<View ref={ref} className={className} {...props}>
				{typeof children === 'string' ? <Text className={textClass}>{children}</Text> : children}
			</View>
		);
	}
);
AlertDescription.displayName = 'AlertDescription';
