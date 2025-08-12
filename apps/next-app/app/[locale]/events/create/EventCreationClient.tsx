'use client';

import { EventCreationForm } from '@/components/EventCreationForm';
import { useRouter } from 'next/navigation';
import { Typography } from '@rite/ui';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useTranslations } from 'next-intl';
import { MobileLayout } from '@/components/MobileLayout';

interface EventCreationClientProps {
	userId: string;
	fallbackDisplayName: string;
	locale: string;
}

export function EventCreationClient({
	userId,
	fallbackDisplayName,
	locale,
}: EventCreationClientProps) {
	const router = useRouter();
	const tEvents = useTranslations('events.create');

	return (
		<MobileLayout userId={userId} fallbackDisplayName={fallbackDisplayName}>
			<div className="p-4 md:p-8">
				<div className="max-w-7xl mx-auto">
					<div className="mb-6 md:mb-8">
						<Typography variant="h1" className="text-2xl md:text-3xl">
							{tEvents('title')}
						</Typography>
						<Typography variant="body-lg" color="secondary" className="mt-2">
							{tEvents('subtitle')}
						</Typography>
					</div>

					<ErrorBoundary>
						<EventCreationForm
							onEventCreated={() => router.push(`/${locale}/dashboard`)}
						/>
					</ErrorBoundary>
				</div>
			</div>
		</MobileLayout>
	);
}
