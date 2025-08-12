import type { Metadata } from 'next';
import './globals.css';
import { RootProvider } from './providers/root-provider';
import { suit } from './lib/fonts';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Suspense } from 'react';
import PostHogPageView from './components/PostHogPageView';
import { getThemeInitScript } from './lib/theme-init';

export const metadata: Metadata = {
	title: 'Rite - DJ Event Management Platform',
	description: 'Streamline DJ event management with Instagram workflow integration',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className={suit.variable}>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: getThemeInitScript(),
					}}
				/>
			</head>
			<body className="font-sans">
				<ErrorBoundary>
					<RootProvider>
						<Suspense>
							<PostHogPageView />
						</Suspense>
						{children}
					</RootProvider>
				</ErrorBoundary>
			</body>
		</html>
	);
}
