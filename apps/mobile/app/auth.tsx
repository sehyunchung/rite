import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { shadows } from '../utils/shadow';
import { themeColors } from '../lib/theme-colors';

export default function AuthScreen() {
	const { signIn, isLoading } = useAuth();

	// Check if Google OAuth is configured
	const hasGoogleConfig = Boolean(
		process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_IOS ||
		process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
		process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
	);

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				{/* Logo/Title */}
				<View style={styles.header} accessibilityRole="header">
					<Text
						style={styles.title}
						accessibilityRole="text"
						accessibilityLabel="RITE - DJ Event Management Platform"
					>
						RITE
					</Text>
					<Text style={styles.subtitle} accessibilityRole="text">
						DJ Event Management
					</Text>
					<Text
						style={styles.description}
						accessibilityRole="text"
						accessibilityHint="Application description"
					>
						Sign in to create events, manage DJ lineups, and connect with the music community
					</Text>
				</View>

				{/* Auth Buttons */}
				<View
					style={styles.authSection}
					accessibilityRole="none"
					accessibilityLabel="Authentication options"
				>
					<TouchableOpacity
						style={[styles.googleButton, !hasGoogleConfig && styles.disabledButton]}
						onPress={signIn}
						disabled={isLoading || !hasGoogleConfig}
						accessible={true}
						accessibilityRole="button"
						accessibilityLabel={
							!hasGoogleConfig
								? 'Google OAuth Not Configured - button disabled'
								: isLoading
									? 'Signing in with Google, please wait'
									: 'Continue with Google'
						}
						accessibilityHint={
							!hasGoogleConfig
								? 'Google OAuth credentials need to be configured'
								: 'Sign in using your Google account'
						}
						accessibilityState={{
							disabled: isLoading || !hasGoogleConfig,
							busy: isLoading,
						}}
					>
						<Ionicons
							name="logo-google"
							size={20}
							color={themeColors.neutral[800]}
							accessibilityElementsHidden={true}
						/>
						<Text style={styles.googleButtonText}>
							{!hasGoogleConfig
								? 'Google OAuth Not Configured'
								: isLoading
									? 'Signing in...'
									: 'Continue with Google'}
						</Text>
					</TouchableOpacity>

					{!hasGoogleConfig && (
						<Text
							style={styles.configText}
							accessibilityRole="text"
							accessibilityLabel="Configuration message: Add Google OAuth credentials to environment file to enable authentication"
						>
							Add Google OAuth credentials to .env file to enable authentication
						</Text>
					)}

					{/* Instagram OAuth - Coming Soon */}
					<TouchableOpacity
						style={[styles.instagramButton, styles.comingSoon]}
						disabled={true}
						accessible={true}
						accessibilityRole="button"
						accessibilityLabel="Continue with Instagram - Coming Soon"
						accessibilityHint="Instagram authentication is not yet available"
						accessibilityState={{ disabled: true }}
					>
						<Ionicons
							name="logo-instagram"
							size={20}
							color={themeColors.neutral[500]}
							accessibilityElementsHidden={true}
						/>
						<Text style={styles.instagramButtonText}>Continue with Instagram (Coming Soon)</Text>
					</TouchableOpacity>
				</View>

				{/* Terms */}
				<View style={styles.termsSection}>
					<Text
						style={styles.termsText}
						accessibilityRole="text"
						accessibilityLabel="Legal terms: By continuing, you agree to our Terms of Service and Privacy Policy"
					>
						By continuing, you agree to our Terms of Service and Privacy Policy
					</Text>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: themeColors.neutral[800],
	},
	content: {
		flex: 1,
		padding: 24,
		justifyContent: 'center',
	},
	header: {
		alignItems: 'center',
		marginBottom: 64,
	},
	title: {
		color: themeColors.brand.primary,
		marginBottom: 8,
		fontSize: 48,
		fontWeight: '700',
		fontFamily: 'SUIT-Bold',
	},
	subtitle: {
		fontSize: 20,
		fontWeight: '600',
		color: themeColors.neutral[0],
		marginBottom: 16,
	},
	description: {
		fontSize: 16,
		color: themeColors.neutral[400],
		textAlign: 'center',
		lineHeight: 24,
		maxWidth: 280,
	},
	authSection: {
		gap: 16,
		marginBottom: 48,
	},
	googleButton: {
		backgroundColor: themeColors.neutral[0],
		borderRadius: 12,
		height: 56,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
		...shadows.md,
	},
	googleButtonText: {
		fontWeight: '600',
		color: themeColors.neutral[800],
		fontSize: 16,
	},
	instagramButton: {
		backgroundColor: themeColors.neutral[700],
		borderRadius: 12,
		height: 56,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
		borderWidth: 1,
		borderColor: themeColors.neutral[600],
	},
	comingSoon: {
		opacity: 0.5,
	},
	instagramButtonText: {
		fontWeight: '600',
		color: themeColors.neutral[500],
		fontSize: 16,
	},
	termsSection: {
		alignItems: 'center',
	},
	termsText: {
		fontSize: 14,
		color: themeColors.neutral[500],
		textAlign: 'center',
		lineHeight: 20,
		maxWidth: 280,
	},
	disabledButton: {
		opacity: 0.5,
	},
	configText: {
		fontSize: 14,
		color: themeColors.neutral[500],
		textAlign: 'center',
		fontStyle: 'italic',
		marginTop: -8,
	},
});
