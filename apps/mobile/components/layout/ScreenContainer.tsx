import * as React from 'react';
import { SafeAreaView, ScrollView, View, Platform } from 'react-native';
import { cn } from '@rite/ui/utils';

interface ScreenContainerProps {
	children: React.ReactNode;
	className?: string;
	scroll?: boolean;
	safeArea?: boolean;
}

export function ScreenContainer({
	children,
	className,
	scroll = true,
	safeArea = true,
}: ScreenContainerProps) {
	const Container = safeArea ? SafeAreaView : View;

	const content = (
		<View
			className={cn('flex-1 p-4 md:p-6', className)}
			style={{
				paddingBottom: Platform.OS === 'ios' ? 80 : 60,
			}}
		>
			{children}
		</View>
	);

	return (
		<Container className="flex-1 bg-background">
			{scroll ? (
				<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
					{content}
				</ScrollView>
			) : (
				content
			)}
		</Container>
	);
}

export function ContentContainer({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return <View className={cn('max-w-7xl mx-auto w-full', className)}>{children}</View>;
}
