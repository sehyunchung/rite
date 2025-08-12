import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Typography } from '@rite/ui';
import { IconSymbol } from '@/components/ui/IconSymbol';

export function Collapsible({ children, title }: React.PropsWithChildren & { title: string }) {
	const [isOpen, setIsOpen] = React.useState(false);

	return (
		<View className="bg-neutral-800">
			<TouchableOpacity
				className="flex-row items-center gap-1.5"
				onPress={() => setIsOpen((value) => !value)}
				activeOpacity={0.8}
			>
				<IconSymbol
					name="chevron.right"
					size={18}
					weight="medium"
					color="var(--neutral-400)"
					style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
				/>

				<Typography variant="body" className="font-semibold text-white">
					{title}
				</Typography>
			</TouchableOpacity>
			{isOpen && <View className="mt-1.5 ml-6">{children}</View>}
		</View>
	);
}
