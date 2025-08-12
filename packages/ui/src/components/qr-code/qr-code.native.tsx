import * as React from 'react';
import { View, Text } from 'react-native';
import { cn } from '../../utils';

// Note: QR code generation in React Native requires a different approach
// This is a placeholder implementation
// For full functionality, consider using react-native-qrcode-svg

export interface QRCodeProps {
	data: string;
	foreground?: string;
	background?: string;
	robustness?: 'L' | 'M' | 'Q' | 'H';
	className?: string;
}

export function QRCode({ data, className }: QRCodeProps) {
	return (
		<View
			className={cn(
				'items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-md',
				className
			)}
		>
			<Text className="text-xs text-gray-600 dark:text-gray-400 text-center">
				QR Code: {data.substring(0, 20)}...
			</Text>
			<Text className="text-xs text-gray-500 dark:text-gray-500 mt-1">
				(QR generation not implemented for React Native)
			</Text>
		</View>
	);
}
