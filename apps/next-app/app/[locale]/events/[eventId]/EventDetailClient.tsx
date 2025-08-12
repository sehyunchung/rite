'use client';

import { api } from '@rite/backend/convex/_generated/api';
import { Id, Doc } from '@rite/backend/convex/_generated/dataModel';
import { useEffectEvent } from '@/hooks/useEffectEvents';
import { Card, CardContent, CardHeader, CardTitle } from '@rite/ui';
import { Badge } from '@rite/ui';
import { Button } from '@rite/ui';
import { FullScreenLoading } from '@rite/ui';
import { Typography } from '@rite/ui';
import { Link } from '../../../../i18n/routing';
import { useRouter } from 'next/navigation';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SubmissionLinks } from '@/components/SubmissionLinks';
import { QRCode } from '@rite/ui';
import { useState } from 'react';
import {
	EditIcon,
	ClipboardListIcon,
	QrCodeIcon,
	Trash2Icon,
	AlertTriangleIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { MobileLayout } from '../../../components/MobileLayout';
import { useMutation } from 'convex/react';
import { toast } from 'sonner';
import { Label, Textarea } from '@rite/ui';
import { isValidConvexId } from '@/lib/utils';

interface EventDetailClientProps {
	eventId: string;
	userId: string;
	locale: string;
}

export function EventDetailClient({ eventId, userId, locale }: EventDetailClientProps) {
	const router = useRouter();
	const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
	const [showQRCode, setShowQRCode] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showCancelConfirm, setShowCancelConfirm] = useState(false);
	const [cancelReason, setCancelReason] = useState('');
	const [isDeleting, setIsDeleting] = useState(false);
	const [eventDeleted, setEventDeleted] = useState(false);
	const t = useTranslations('events.detail');
	const tStatus = useTranslations('status');

	const deleteEvent = useMutation(api.events.deleteEvent);
	const cancelEvent = useMutation(api.events.cancelEvent);

	// Validate IDs before using them
	const isValidEventId = isValidConvexId(eventId);
	const isValidUserId = isValidConvexId(userId);

	const handleDeleteEvent = async () => {
		if (!event) return;

		setIsDeleting(true);
		try {
			await deleteEvent({
				eventId: event._id,
				userId: userId as Id<'users'>,
			});
			setEventDeleted(true);
			router.push(`/${locale}/dashboard`);
		} catch (error) {
			console.error('Failed to delete event:', error);
			toast.error('Failed to delete event. Please try again.');
		}
		setIsDeleting(false);
		setShowDeleteConfirm(false);
	};

	const handleCancelEvent = async () => {
		if (!event) return;

		setIsDeleting(true);
		try {
			await cancelEvent({
				eventId: event._id,
				userId: userId as Id<'users'>,
				reason: cancelReason,
			});
			setEventDeleted(true);
			router.push(`/${locale}/dashboard`);
		} catch (error) {
			console.error('Failed to cancel event:', error);
			toast.error('Failed to cancel event. Please try again.');
		}
		setIsDeleting(false);
		setShowCancelConfirm(false);
	};

	// Use Effect-validated event hook - eliminates undefined pollution
	const { event, isLoading, exists } = useEffectEvent(
		eventDeleted || !isValidEventId || !isValidUserId ? '' : eventId,
		userId
	);

	// Handle invalid IDs
	if (!isValidEventId || !isValidUserId) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<Typography variant="h2" className="mb-2">
						{t('invalidRequest')}
					</Typography>
					<Typography variant="body" color="secondary" className="mb-4">
						{t('invalidRequestMessage') || 'The request contains invalid parameters'}
					</Typography>
					<Button onClick={() => router.push(`/${locale}/dashboard`)}>
						{t('backToDashboard')}
					</Button>
				</div>
			</div>
		);
	}

	if (eventDeleted) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<Typography variant="h2" className="mb-2">
						Event Deleted
					</Typography>
					<Typography variant="body" color="secondary" className="mb-4">
						Redirecting to dashboard...
					</Typography>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return <FullScreenLoading />;
	}

	if (!exists || !event) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<Typography variant="h2" className="mb-2">
						{t('notFound')}
					</Typography>
					<Typography variant="body" color="secondary" className="mb-4">
						{t('notFoundMessage')}
					</Typography>
					<Button onClick={() => router.push(`/${locale}/dashboard`)}>
						{t('backToDashboard')}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<MobileLayout userId={userId} fallbackDisplayName="User">
			<div className="p-4 md:p-8">
				<div className="max-w-7xl mx-auto">
					{/* Back Button - Desktop only (mobile uses MobileLayout navigation) */}
					<div className="hidden md:block mb-4">
						<Button
							variant="outline"
							onClick={() => router.push(`/${locale}/dashboard`)}
						>
							{t('backToDashboard')}
						</Button>
					</div>

					{/* Event Header */}
					<div className="mb-6 md:mb-8">
						<div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 space-y-4 md:space-y-0">
							<div className="flex-1">
								<div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
									<Typography variant="h1" className="text-xl md:text-3xl">
										{event.name}
									</Typography>
									<Badge
										variant={event.status === 'active' ? 'primary' : 'default'}
									>
										{tStatus(event.status)}
									</Badge>
								</div>
								<Typography
									variant="body"
									color="secondary"
									className="text-sm md:text-base"
								>
									{event.venue.name} • {event.date}
								</Typography>
							</div>
							<div className="flex items-center space-x-2 md:space-x-3">
								{/* Action Buttons */}
								<Button variant="outline" size="sm" asChild>
									<Link href={`/events/${event._id}/edit`}>
										<EditIcon className="w-4 h-4" />
										<span className="ml-1 hidden sm:inline">{t('edit')}</span>
									</Link>
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										router.push(`/${locale}/events/${event._id}/submissions`)
									}
								>
									<ClipboardListIcon className="w-4 h-4" />
									<span className="ml-1 hidden sm:inline">
										{t('submissions')}
									</span>
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setShowQRCode(!showQRCode)}
								>
									<QrCodeIcon className="w-4 h-4" />
									<span className="ml-1 hidden sm:inline">
										{t('qrCodeButton')}
									</span>
								</Button>

								{/* Delete/Cancel buttons */}
								{event.phase !== 'cancelled' && event.phase !== 'completed' && (
									<>
										{event.timeslots.some((slot) => slot.submissionId) ? (
											<Button
												variant="outline"
												size="sm"
												onClick={() => setShowCancelConfirm(true)}
												className="text-orange-600 hover:text-orange-700 border-orange-300"
											>
												<AlertTriangleIcon className="w-4 h-4" />
												<span className="ml-1 hidden sm:inline">
													{t('cancel')}
												</span>
											</Button>
										) : (
											<Button
												variant="outline"
												size="sm"
												onClick={() => setShowDeleteConfirm(true)}
												className="text-red-600 hover:text-red-700 border-red-300"
											>
												<Trash2Icon className="w-4 h-4" />
												<span className="ml-1 hidden sm:inline">
													{t('delete')}
												</span>
											</Button>
										)}
									</>
								)}
							</div>
						</div>
						{event.description && (
							<Typography
								variant="body-lg"
								color="secondary"
								className="mb-4 text-sm md:text-base"
							>
								{event.description}
							</Typography>
						)}
					</div>

					<div className="grid gap-4 md:gap-6 lg:grid-cols-3">
						{/* Event Details */}
						<div className="lg:col-span-2 space-y-6">
							{/* Venue Information */}
							<Card>
								<CardHeader>
									<CardTitle>{t('venueInformation')}</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										<Typography variant="body" className="font-medium">
											{event.venue.name}
										</Typography>
										<Typography variant="body" color="secondary">
											{event.venue.address}
										</Typography>
									</div>
								</CardContent>
							</Card>

							{/* DJ Timeslots */}
							<Card>
								<CardHeader>
									<CardTitle>
										{t('djLineup', { count: event.timeslots.length })}
									</CardTitle>
								</CardHeader>
								<CardContent>
									{event.timeslots.length > 0 ? (
										<div className="space-y-4">
											{event.timeslots.map((slot: Doc<'timeslots'>) => (
												<div
													key={slot._id}
													className="flex items-center justify-between p-4 bg-muted rounded-lg"
												>
													<div className="flex-1">
														<div className="flex items-center space-x-3">
															<span className="font-medium">
																{slot.djName}
															</span>
															<span className="text-brand-primary">
																{slot.djInstagram}
															</span>
														</div>
														<p className="text-sm text-muted-foreground mt-1">
															{slot.startTime} - {slot.endTime}
														</p>
													</div>
													<div className="text-right">
														<Badge variant="outline">
															{slot.submissionId
																? t('status.submitted')
																: t('status.pending')}
														</Badge>
													</div>
												</div>
											))}
										</div>
									) : (
										<p className="text-muted-foreground">
											{t('noDJsScheduled')}
										</p>
									)}
								</CardContent>
							</Card>

							{/* DJ Submission Links */}
							<ErrorBoundary>
								<SubmissionLinks events={[event]} />
							</ErrorBoundary>
						</div>

						{/* Event Sidebar */}
						<div className="space-y-6">
							{/* Deadlines */}
							<Card>
								<CardHeader>
									<CardTitle>{t('importantDates')}</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div>
										<p className="font-medium text-sm">{t('eventDate')}</p>
										<p className="text-muted-foreground">{event.date}</p>
									</div>
									<div>
										<p className="font-medium text-sm">
											{t('guestListDeadline')}
										</p>
										<p className="text-muted-foreground">
											{event.deadlines.guestList}
										</p>
									</div>
									<div>
										<p className="font-medium text-sm">
											{t('promoMaterialsDeadline')}
										</p>
										<p className="text-muted-foreground">
											{event.deadlines.promoMaterials}
										</p>
									</div>
									<div>
										<p className="font-medium text-sm">{t('paymentDue')}</p>
										<p className="text-muted-foreground">
											{event.payment.dueDate}
										</p>
									</div>
								</CardContent>
							</Card>

							{/* Payment Information */}
							<Card>
								<CardHeader>
									<CardTitle>{t('paymentDetails')}</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div>
										<p className="font-medium text-sm">{t('totalAmount')}</p>
										<p className="text-muted-foreground">
											{event.payment.amount.toLocaleString()}{' '}
											{event.payment.currency}
										</p>
									</div>
									<div>
										<p className="font-medium text-sm">{t('perDJ')}</p>
										<p className="text-muted-foreground">
											{event.payment.perDJ.toLocaleString()}{' '}
											{event.payment.currency}
										</p>
									</div>
									<div>
										<p className="font-medium text-sm">
											{t('guestLimitPerDJ')}
										</p>
										<p className="text-muted-foreground">
											{event.guestLimitPerDJ} {t('guests')}
										</p>
									</div>
								</CardContent>
							</Card>

							{/* Instagram Hashtags */}
							{event.hashtags && (
								<Card>
									<CardHeader>
										<CardTitle>{t('instagramHashtags')}</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-sm text-foreground font-mono bg-muted p-3 rounded">
											{event.hashtags}
										</p>
									</CardContent>
								</Card>
							)}
						</div>
					</div>

					{/* QR Code Section */}
					{showQRCode && (
						<div className="mt-8">
							<Card className="max-w-md mx-auto">
								<CardHeader>
									<CardTitle className="text-center">
										{t('qrCode.title')}
									</CardTitle>
								</CardHeader>
								<CardContent className="text-center">
									<div className="flex justify-center mb-4">
										<QRCode
											data={`${baseUrl}/${locale}/events/${event._id}`}
											className="w-48 h-48 border rounded-lg p-4 bg-neutral-0"
										/>
									</div>
									<p className="text-sm text-muted-foreground">
										{t('qrCode.description')}
									</p>
								</CardContent>
							</Card>
						</div>
					)}

					{/* Delete Confirmation Dialog */}
					{showDeleteConfirm && (
						<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
							<Card className="max-w-md w-full">
								<CardHeader>
									<CardTitle className="flex items-center space-x-2 text-red-600">
										<Trash2Icon className="w-5 h-5" />
										<span>{t('deleteEvent')}</span>
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground mb-4">
										{t('deleteConfirmMessage')}
									</p>
									<div className="flex justify-end space-x-2">
										<Button
											variant="outline"
											onClick={() => setShowDeleteConfirm(false)}
											disabled={isDeleting}
										>
											{t('cancelAction')}
										</Button>
										<Button
											variant="destructive"
											onClick={handleDeleteEvent}
											disabled={isDeleting}
										>
											{isDeleting ? t('deleting') : t('deleteEvent')}
										</Button>
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					{/* Cancel Confirmation Dialog */}
					{showCancelConfirm && (
						<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
							<Card className="max-w-md w-full">
								<CardHeader>
									<CardTitle className="flex items-center space-x-2 text-orange-600">
										<AlertTriangleIcon className="w-5 h-5" />
										<span>{t('cancelEvent')}</span>
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground mb-4">
										{t('cancelConfirmMessage')}
									</p>
									<div className="space-y-4">
										<div>
											<Label htmlFor="cancelReason">
												{t('cancellationReason')}
											</Label>
											<Textarea
												id="cancelReason"
												value={cancelReason}
												onChange={(
													e: React.ChangeEvent<HTMLTextAreaElement>
												) => setCancelReason(e.target.value)}
												placeholder={t('cancellationReasonPlaceholder')}
												rows={3}
											/>
										</div>
										<div className="flex justify-end space-x-2">
											<Button
												variant="outline"
												onClick={() => setShowCancelConfirm(false)}
												disabled={isDeleting}
											>
												{t('keepEvent')}
											</Button>
											<Button
												variant="destructive"
												onClick={handleCancelEvent}
												disabled={isDeleting}
												className="bg-orange-600 hover:bg-orange-700"
											>
												{isDeleting ? t('cancelling') : t('cancelEvent')}
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					)}
				</div>
			</div>
		</MobileLayout>
	);
}
