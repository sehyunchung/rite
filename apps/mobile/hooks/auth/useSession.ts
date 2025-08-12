import { useState, useEffect, useCallback } from 'react';
import { ConvexReactClient } from 'convex/react';
import { User, AuthError } from '../../lib/auth/types';
import { checkExistingSession, clearUserSession } from '../../lib/auth/session-utils';

/**
 * Custom hook for managing user sessions
 */
export const useSession = (convex: ConvexReactClient) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const restoreSession = useCallback(async () => {
		try {
			setIsLoading(true);
			const userData = await checkExistingSession(convex);
			setUser(userData);
		} catch (error) {
			// Session restoration failed, continue without auth
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	}, [convex]);

	const signOut = useCallback(async () => {
		try {
			setIsLoading(true);
			await clearUserSession(convex);
			setUser(null);
		} catch (error) {
			// Sign out failed, but still clear local state
			setUser(null);
			throw new AuthError('Sign out failed', 'SIGNOUT_ERROR', error);
		} finally {
			setIsLoading(false);
		}
	}, [convex]);

	const setUserData = useCallback((userData: User | null) => {
		setUser(userData);
	}, []);

	// Check for existing session on mount
	useEffect(() => {
		restoreSession();
	}, [restoreSession]);

	return {
		user,
		isLoading,
		setUser: setUserData,
		signOut,
		restoreSession,
	};
};
