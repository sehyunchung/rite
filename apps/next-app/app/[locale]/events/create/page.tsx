import { EventCreationClient } from './EventCreationClient';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
	params: Promise<{ locale: string }>;
}

export default async function CreateEventPage({ params }: Props) {
	const { locale } = await params;
	const session = await auth();

	// Redirect if not authenticated
	if (!session) {
		redirect(`/${locale}/auth/signin`);
	}

	const displayName = session?.user?.name || session?.user?.email || 'User';

	return (
		<EventCreationClient
			userId={session.user?.id || ''}
			fallbackDisplayName={displayName}
			locale={locale}
		/>
	);
}
