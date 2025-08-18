import * as React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import '@rite/ui/types/nativewind';

export interface ListItemProps {
	icon?: React.ReactNode;
	title: string;
	subtitle?: string;
	trailing?: React.ReactNode;
	showChevron?: boolean;
	onPress?: () => void;
	className?: string;
}

export function ListItem({
	icon,
	title,
	subtitle,
	trailing,
	showChevron = true,
	onPress,
	className = '',
}: ListItemProps) {
	return (
		<Pressable
			onPress={onPress}
			className={`flex-row items-center gap-4 px-5 py-4 active:bg-neutral-700 ${className}`}
		>
			{icon && (
				<View className="h-10 w-10 items-center justify-center rounded-lg bg-neutral-700">
					{icon}
				</View>
			)}

			<View className="flex-1">
				<Text className="text-base font-medium text-white">{title}</Text>
				{subtitle && <Text className="text-sm text-neutral-400 mt-0.5">{subtitle}</Text>}
			</View>

			{trailing || (showChevron && <ChevronRight size={20} color="#7A7A88" />)}
		</Pressable>
	);
}
