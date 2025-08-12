import * as React from 'react';
import { useConvex } from 'convex/react';
import { AuthContextType, User, AuthError } from '../lib/auth/types';
import { useSession } from '../hooks/auth/useSession';
import { useOAuthFlow } from '../hooks/auth/useOAuthFlow';

const AuthContext = React.createContext<AuthContextType | null>(null);

interface AuthProviderProps {
	children: React.ReactNode;
}

export const AuthProvider = React.memo(({ children }: AuthProviderProps) => {
	const convex = useConvex();
	const [error, setError] = React.useState<AuthError | null>(null);

	// Session management
	const { user, isLoading, setUser, signOut: sessionSignOut } = useSession(convex);

	// OAuth flow management
	const handleAuthSuccess = (userData: User) => {
		setUser(userData);
		setError(null); // Clear any previous errors on success
	};

	const { signIn: oauthSignIn } = useOAuthFlow(convex, handleAuthSuccess);

	// Wrap signIn to handle errors
	const signIn = React.useCallback(async () => {
		try {
			setError(null); // Clear previous errors
			await oauthSignIn();
		} catch (err) {
			if (err instanceof AuthError) {
				setError(err);
			} else {
				setError(new AuthError('Authentication failed', 'UNKNOWN_ERROR', err));
			}
			throw err; // Re-throw to maintain existing behavior
		}
	}, [oauthSignIn]);

	// Wrap signOut to handle errors
	const signOut = React.useCallback(async () => {
		try {
			setError(null);
			await sessionSignOut();
		} catch (err) {
			const authError = new AuthError('Sign out failed', 'SIGNOUT_ERROR', err);
			setError(authError);
			throw authError;
		}
	}, [sessionSignOut]);

	const clearError = React.useCallback(() => {
		setError(null);
	}, []);

	const value: AuthContextType = {
		user,
		isLoading,
		error,
		signIn,
		signOut,
		clearError,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
});

AuthProvider.displayName = 'AuthProvider';

export function useAuth() {
	const context = React.useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}
