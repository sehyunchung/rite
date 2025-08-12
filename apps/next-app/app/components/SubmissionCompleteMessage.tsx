'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@rite/ui';
import { Typography } from '@rite/ui';
import { useTranslations } from 'next-intl';

interface SubmissionCompleteMessageProps {
	eventName: string;
	djName: string;
	djInstagram: string;
	startTime: string;
	endTime: string;
}

export function SubmissionCompleteMessage({
	eventName,
	djName,
	djInstagram,
	startTime,
	endTime,
}: SubmissionCompleteMessageProps) {
	const t = useTranslations('djSubmission.success');

	return (
		<div className="min-h-screen bg-neutral-800 flex items-center justify-center">
			<Card className="w-full max-w-md text-center">
				<CardHeader>
					<div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg
							className="w-8 h-8 text-success"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
					<CardTitle className="text-success">{t('title')}</CardTitle>
					<CardDescription>{t('message', { eventName })}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="bg-neutral-700 p-4 rounded-lg text-left">
						<Typography variant="h6" className="text-success mb-2">
							{t('whatNext')}
						</Typography>
						<ul className="text-sm text-text-secondary space-y-1">
							{t.raw('steps').map((step: string, index: number) => (
								<li key={index}>• {step}</li>
							))}
						</ul>
					</div>
					<div className="text-sm space-y-1">
						<Typography variant="body-sm">
							<span className="font-medium">{t('eventLabel')}:</span> {eventName}
						</Typography>
						<Typography variant="body-sm">
							<span className="font-medium">{t('timeSlotLabel')}:</span> {startTime} - {endTime}
						</Typography>
						<Typography variant="body-sm">
							<span className="font-medium">{t('djLabel')}:</span> {djName} ({djInstagram})
						</Typography>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
