import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

/**
 * Component that displays authentication errors to users
 */
export function AuthErrorAlert() {
	const { error, clearError } = useAuth();

	useEffect(() => {
		if (error) {
			const title = 'Authentication Error';
			let message = error.message;

			// Provide user-friendly messages for common error codes
			switch (error.code) {
				case 'OAUTH_NOT_READY':
					message = 'Authentication is not configured. Please check your settings.';
					break;
				case 'MISSING_ACCESS_TOKEN':
					message = 'Authentication failed. Please try signing in again.';
					break;
				case 'GOOGLE_API_ERROR':
					message = 'Unable to connect to Google. Please check your internet connection.';
					break;
				case 'USER_CREATION_ERROR':
					message = 'Unable to create your account. Please try again.';
					break;
				case 'TOKEN_EXCHANGE_ERROR':
					message = 'Authentication verification failed. Please try again.';
					break;
				case 'SIGNOUT_ERROR':
					message = 'Unable to sign out. Please try again.';
					break;
			}

			if (Platform.OS === 'web') {
				// For web, use browser alert
				window.alert(`${title}: ${message}`);
				clearError();
			} else {
				// For mobile, use React Native Alert
				Alert.alert(
					title,
					message,
					[
						{
							text: 'OK',
							onPress: clearError,
							style: 'default',
						},
					],
					{ cancelable: false }
				);
			}
		}
	}, [error, clearError]);

	return null;
}
