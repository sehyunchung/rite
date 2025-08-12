import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
	params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: Props) {
	const { locale } = await params;
	let session = null;
	try {
		session = await auth();
	} catch (error) {
		console.error('Auth error in HomePage:', error);
	}

	// Redirect authenticated users to dashboard
	if (session) {
		redirect(`/${locale}/dashboard`);
	}

	// Redirect unauthenticated users to login
	redirect(`/${locale}/auth/signin`);
}
