import * as React from 'react';
import {
	View,
	ScrollView,
	SafeAreaView,
	Platform,
	ActivityIndicator,
	useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Typography, Card, CardContent, EventCard, Button } from '../../lib/ui-native';
import { useQuery } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from '../../contexts/I18nContext';
import { themeColors } from '../../lib/theme-colors';
import { routes } from '../../lib/navigation';

export default function HomeScreen() {
	const router = useRouter();
	const { user } = useAuth();
	const { width } = useWindowDimensions();
	const t = useTranslations('dashboard');

	// Determine if we're on a larger screen (web desktop/tablet)
	const isLargeScreen = width > 768;
	const isDesktop = width > 1024;

	// Memoize className strings for performance
	const gridClassName = React.useMemo(
		() =>
			isLargeScreen ? (isDesktop ? 'grid grid-cols-3 gap-6' : 'grid grid-cols-2 gap-4') : 'gap-4',
		[isLargeScreen, isDesktop]
	);

	const containerClassName = React.useMemo(
		() =>
			`${isDesktop ? 'px-8 py-8 max-w-7xl mx-auto w-full' : 'p-6'} ${Platform.OS === 'web' ? 'min-h-[100dvh]' : ''}`,
		[isDesktop]
	);

	const events = useQuery(api.events.listEvents, user ? { userId: user._id } : 'skip');

	return (
		<SafeAreaView className="flex-1 bg-neutral-800">
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ flexGrow: 1 }}
				accessible={true}
				accessibilityLabel="Dashboard content"
			>
				<View
					className={containerClassName}
					style={{
						paddingBottom: Platform.OS === 'ios' ? 124 : Platform.OS === 'web' ? 84 : 104,
					}}
					accessibilityRole="none"
				>
					{/* Header with responsive layout */}
					<View
						className={isLargeScreen ? 'flex-row justify-between items-center mb-8' : 'mb-6'}
						accessibilityRole="header"
					>
						<View className={isLargeScreen ? '' : 'mb-6'}>
							<Typography variant="h3" color="primary" className="mb-2">
								{t('title')}
							</Typography>
							<Typography variant="body" color="secondary">
								{t('subtitle')}
							</Typography>
						</View>

						{/* Desktop create button */}
						{isLargeScreen && (
							<Button
								onPress={() => router.push('/(tabs)/create')}
								variant="default"
								size="default"
								className="flex-row items-center justify-center rounded-lg"
								accessibilityLabel="Create New Event"
								accessibilityHint="Navigate to create event form"
								testID="create-event-button"
							>
								{t('createNewEvent')}
							</Button>
						)}
					</View>

					{/* Quick Actions for larger screens */}
					{isLargeScreen && (
						<View className="mb-8">
							<View className={isDesktop ? 'flex-row gap-4' : 'gap-4'}>
								<Button
									onPress={() => router.push('/(tabs)/create')}
									variant="default"
									size="default"
									className="flex-row items-center justify-center rounded-lg mb-4"
								>
									{t('actions.createEvent')}
								</Button>
								<Button
									onPress={() => router.push('/(tabs)/events')}
									variant="outline"
									size="default"
									className="flex-row items-center justify-center rounded-lg mb-4"
								>
									{t('actions.viewEvents')}
								</Button>
								{isDesktop && (
									<Button
										onPress={() => router.push('/(tabs)/explore')}
										variant="secondary"
										size="default"
										className="flex-row items-center justify-center rounded-lg"
									>
										{t('actions.profile')}
									</Button>
								)}
							</View>
						</View>
					)}

					{/* Mobile create event button */}
					{!isLargeScreen && (
						<Button
							onPress={() => router.push('/(tabs)/create')}
							variant="default"
							size="default"
							className="flex-row items-center justify-center mt-4 mb-8 rounded-lg"
							accessibilityLabel="Create New Event"
							accessibilityHint="Navigate to create event form"
							testID="create-event-button"
						>
							{t('createNewEvent')}
						</Button>
					)}

					{/* Your Events Section */}
					<View className="mb-6" accessibilityRole="none" accessibilityLabel="Your events section">
						<Typography variant="h5" color="default" className="mb-4">
							{t('yourEvents')}
						</Typography>

						{events === undefined ? (
							<View
								className="p-8"
								accessible={true}
								accessibilityLabel="Loading your events"
								accessibilityRole="progressbar"
								accessibilityLiveRegion="polite"
							>
								<ActivityIndicator size="large" color={themeColors.brand.primary} />
							</View>
						) : events.length === 0 ? (
							<Card className="bg-neutral-700 border-neutral-600 rounded-2xl">
								<CardContent className="p-6">
									<Typography variant="body" color="default" className="text-center mb-1">
										{t('noEvents')}
									</Typography>
									<Typography variant="caption" color="secondary" className="text-center">
										{t('noEventsDescription')}
									</Typography>
								</CardContent>
							</Card>
						) : (
							<View
								className={gridClassName}
								accessible={true}
								accessibilityRole="list"
								accessibilityLabel={`${events.length} events available`}
							>
								{events.map((event) => (
									<EventCard
										key={event._id}
										eventName={event.name}
										venueName={event.venue.name}
										date={event.date}
										djCount={event.timeslots?.length || 0}
										dueDate={event.deadlines?.guestList || ''}
										status={event.status === 'active' ? 'published' : 'draft'}
										onViewDetails={() => {
											router.push(routes.event(event._id));
										}}
										onShare={() => {
											// TODO: Implement share functionality with web API
											if (Platform.OS === 'web' && navigator.share) {
												navigator.share({
													title: event.name,
													text: `Check out ${event.name} at ${event.venue.name}`,
													url: `${window.location.origin}/events/${event._id}`,
												});
											}
										}}
									/>
								))}
							</View>
						)}
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
