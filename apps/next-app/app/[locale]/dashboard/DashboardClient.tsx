'use client';

import { Button, Typography } from '@rite/ui';
import { Link } from '../../../i18n/routing';
import { DashboardContent } from './DashboardContent';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useTranslations } from 'next-intl';
import { MobileLayout } from '@/components/MobileLayout';

interface DashboardClientProps {
	userId: string;
	fallbackDisplayName: string;
}

export function DashboardClient({ userId, fallbackDisplayName }: DashboardClientProps) {
	const tDashboard = useTranslations('dashboard');

	return (
		<MobileLayout userId={userId} fallbackDisplayName={fallbackDisplayName}>
			<div className="p-4 md:p-8">
				<div className="max-w-7xl mx-auto">
					<div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8 space-y-4 md:space-y-0">
						<div>
							<Typography variant="h1" className="mb-2 text-2xl md:text-4xl">
								{tDashboard('title')}
							</Typography>
							<Typography variant="body-lg" color="secondary">
								{tDashboard('welcome')}
							</Typography>
						</div>
						<Button asChild className="hidden md:inline-flex">
							<Link href="/events/create">{tDashboard('createNewEvent')}</Link>
						</Button>
					</div>

					<ErrorBoundary>
						<DashboardContent userId={userId} />
					</ErrorBoundary>
				</div>
			</div>
		</MobileLayout>
	);
}
