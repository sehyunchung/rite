import { routing } from '../../i18n/routing';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';
import ConsentBanner from '../components/ConsentBanner';

interface Props {
	children: ReactNode;
	params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
	return routing.locales.map((locale: string) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
	const { locale } = await params;

	// Ensure that the incoming `locale` is valid
	if (!routing.locales.includes(locale as any)) {
		notFound();
	}

	// Enable static rendering
	setRequestLocale(locale);

	// Providing all messages to the client
	// side is the easiest way to get started
	const messages = await getMessages();

	return (
		<NextIntlClientProvider messages={messages}>
			{children}
			<ConsentBanner />
		</NextIntlClientProvider>
	);
}
