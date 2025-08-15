import * as React from 'react';
import { View, Text } from 'react-native';
import { cn } from '../../utils';

export const Card = React.forwardRef<View, React.ComponentProps<typeof View>>(
	({ className, ...props }, ref) => (
		<View
			ref={ref}
			className={cn('rounded-xl border border-neutral-600 bg-neutral-700 shadow-sm', className)}
			{...props}
		/>
	)
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<View, React.ComponentProps<typeof View>>(
	({ className, ...props }, ref) => (
		<View ref={ref} className={cn('flex flex-col gap-1.5 p-6', className)} {...props} />
	)
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<Text, React.ComponentProps<typeof Text>>(
	({ className, ...props }, ref) => (
		<Text
			ref={ref}
			className={cn(
				'text-2xl font-semibold leading-none tracking-tight text-card-foreground',
				className
			)}
			{...props}
		/>
	)
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<Text, React.ComponentProps<typeof Text>>(
	({ className, ...props }, ref) => (
		<Text ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
	)
);
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<View, React.ComponentProps<typeof View>>(
	({ className, ...props }, ref) => <View ref={ref} className={cn('p-6', className)} {...props} />
);
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<View, React.ComponentProps<typeof View>>(
	({ className, ...props }, ref) => (
		<View ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
	)
);
CardFooter.displayName = 'CardFooter';
