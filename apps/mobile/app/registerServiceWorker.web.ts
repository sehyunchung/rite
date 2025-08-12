// Service Worker registration for PWA support
// Only runs on web platform

export function registerServiceWorker() {
	if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
		window.addEventListener('load', () => {
			navigator.serviceWorker
				.register('/service-worker.js')
				.then((registration) => {
					console.log('PWA service worker registered:', registration);

					// Check for updates periodically
					setInterval(
						() => {
							registration.update();
						},
						60 * 60 * 1000
					); // Check every hour
				})
				.catch((error) => {
					console.error('PWA service worker registration failed:', error);
				});
		});
	}
}
