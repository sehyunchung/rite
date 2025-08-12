'use client';

import { useSession } from 'next-auth/react';
import { useConvexAuth } from 'convex/react';
import { useEffect } from 'react';

export function useAuthenticatedConvex() {
	const { data: session, status } = useSession();
	const { isAuthenticated, isLoading } = useConvexAuth();

	useEffect(() => {
		if (status === 'authenticated' && session?.user?.id && !isAuthenticated && !isLoading) {
			// The user is authenticated in NextAuth but not in Convex
			// This might happen if the Convex auth adapter hasn't synced yet
			console.log('NextAuth authenticated but Convex not yet synced');
		}
	}, [status, session, isAuthenticated, isLoading]);

	return {
		isAuthenticated: status === 'authenticated' && isAuthenticated,
		isLoading: status === 'loading' || isLoading,
		userId: session?.user?.id,
	};
}
