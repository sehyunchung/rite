'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@rite/ui';
import { Badge } from '@rite/ui';
import { Button } from '@rite/ui';
import { LoadingIndicator } from '@rite/ui';
import { useEventStatus } from '@/hooks/useEventStatus';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { EventAction } from '@rite/backend/convex/eventStatus';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@rite/ui';
import { Alert, AlertDescription } from '@rite/ui';
import { AlertCircle, Calendar, CheckCircle, Edit, Lock, Music, XCircle } from 'lucide-react';

interface EventStatusCardProps {
	eventId: string;
	userId: string;
}

// Icon mapping
const IconMap = {
	edit: Edit,
	calendar: Calendar,
	lock: Lock,
	music: Music,
	'check-circle': CheckCircle,
	'x-circle': XCircle,
} as const;

// Color to variant mapping
const colorToVariant: Record<
	string,
	'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline'
> = {
	primary: 'primary',
	secondary: 'default',
	destructive: 'error',
	warning: 'warning',
	info: 'default',
	success: 'success',
};

export function EventStatusCard({ eventId, userId }: EventStatusCardProps) {
	const t = useTranslations('eventStatus');
	const {
		event,
		phaseInfo,
		capabilities,
		availableActions,
		performAction,
		isTransitioning,
		error,
		isLoading,
	} = useEventStatus({ eventId, userId });

	const [confirmDialog, setConfirmDialog] = useState<{
		action: EventAction;
		open: boolean;
	} | null>(null);

	if (isLoading) {
		return (
			<Card>
				<CardContent className="pt-6">
					<LoadingIndicator />
				</CardContent>
			</Card>
		);
	}

	if (!event || !phaseInfo) {
		return null;
	}

	const Icon = IconMap[phaseInfo.icon as keyof typeof IconMap] || Calendar;

	const handleAction = (action: EventAction) => {
		if (action.confirmRequired) {
			setConfirmDialog({ action, open: true });
		} else {
			performAction(action);
		}
	};

	const confirmAction = () => {
		if (confirmDialog) {
			performAction(confirmDialog.action);
			setConfirmDialog(null);
		}
	};

	return (
		<>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Icon className={`h-5 w-5 text-${phaseInfo.color}-500`} />
							<CardTitle className="text-lg">{t(`phases.${event.phase}.label`)}</CardTitle>
						</div>
						<Badge variant={colorToVariant[phaseInfo.color] || 'default'}>{event.phase}</Badge>
					</div>
					<p className="text-sm text-muted-foreground mt-1">
						{t(`phases.${event.phase}.description`)}
					</p>
				</CardHeader>

				{capabilities?.showUrgentBanner && (
					<div className="px-6">
						<Alert>
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{t('urgentBanner')}</AlertDescription>
						</Alert>
					</div>
				)}

				<CardContent>
					<div className="space-y-3">
						<div className="grid grid-cols-2 gap-2 text-sm">
							<div className="flex items-center gap-2">
								<span className="text-muted-foreground">{t('capabilities.canEdit')}:</span>
								<span className={capabilities?.canEdit ? 'text-green-600' : 'text-gray-400'}>
									{capabilities?.canEdit ? '✓' : '✗'}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-muted-foreground">
									{t('capabilities.canAcceptSubmissions')}:
								</span>
								<span
									className={
										capabilities?.canAcceptSubmissions ? 'text-green-600' : 'text-gray-400'
									}
								>
									{capabilities?.canAcceptSubmissions ? '✓' : '✗'}
								</span>
							</div>
							{capabilities?.showDayOfFeatures && (
								<div className="col-span-2 flex items-center gap-2">
									<span className="text-muted-foreground">
										{t('capabilities.dayOfFeaturesActive')}:
									</span>
									<span className="text-green-600">✓</span>
								</div>
							)}
						</div>

						{event.submissionCount !== undefined && (
							<div className="pt-3 border-t">
								<p className="text-sm">
									{t('submissionStatus', {
										count: event.submissionCount,
										total: event.timeslots.length,
									})}
								</p>
							</div>
						)}
					</div>
				</CardContent>

				{availableActions.length > 0 && (
					<CardFooter className="flex gap-2">
						{availableActions.map((action) => (
							<Button
								key={action.id}
								variant={action.variant || 'default'}
								size="sm"
								onClick={() => handleAction(action)}
								disabled={isTransitioning}
							>
								{action.label}
							</Button>
						))}
					</CardFooter>
				)}

				{error && (
					<div className="px-6 pb-4">
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					</div>
				)}
			</Card>

			{/* Confirmation Dialog */}
			<AlertDialog open={!!confirmDialog} onOpenChange={(open) => !open && setConfirmDialog(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t('confirmAction')}</AlertDialogTitle>
						<AlertDialogDescription>
							{confirmDialog?.action.confirmMessage || t('confirmActionMessage')}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
						<AlertDialogAction onClick={confirmAction}>{t('confirm')}</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
