'use client';

import { useQuery } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { useTranslations } from 'next-intl';
import { Typography } from '@rite/ui';
import { toConvexId } from '@/lib/utils';

interface UserDisplayProps {
	userId: string;
	fallbackName: string;
}

export function UserDisplay({ userId, fallbackName }: UserDisplayProps) {
	const t = useTranslations('navigation');

	// Convert to valid Convex ID or null
	const validUserId = toConvexId(userId, 'users');

	// Only query if we have a valid userId
	const instagramConnection = useQuery(
		api.instagram.getInstagramConnection,
		validUserId ? { userId: validUserId } : 'skip'
	);

	const displayName = instagramConnection?.username
		? `@${instagramConnection.username}`
		: fallbackName;

	return (
		<Typography variant="body-sm" color="secondary">
			{t('welcomeUser', { name: displayName })}
		</Typography>
	);
}
