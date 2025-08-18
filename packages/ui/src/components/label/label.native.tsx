import * as React from 'react';
import { Text, View, Pressable } from 'react-native';
import type { TextProps } from 'react-native';
import '@rite/ui/types/nativewind';

export interface LabelProps extends Omit<TextProps, 'className'> {
	className?: string;
	htmlFor?: string;
	children?: React.ReactNode;
	onPress?: () => void;
}

export const Label = React.forwardRef<View, LabelProps>(
	({ className = '', children, onPress, ...props }, ref) => {
		const content = (
			<Text className={`text-sm font-medium text-gray-700 ${className}`} {...props}>
				{children}
			</Text>
		);

		// If onPress is provided, wrap in Pressable for tap handling
		if (onPress) {
			return (
				<Pressable ref={ref} onPress={onPress}>
					{content}
				</Pressable>
			);
		}

		return content;
	}
);

Label.displayName = 'Label';
