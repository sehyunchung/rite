import { useUser, useAuth } from '@clerk/clerk-react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useEffect } from 'react';

// Custom hook to sync Clerk user with Convex database
export function useAuthSync() {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const upsertUser = useMutation(api.auth.upsertUser);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Sync user data with Convex
      void upsertUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? '',
        name: user.fullName ?? undefined,
      });
    }
  }, [isLoaded, isSignedIn, user, upsertUser]);

  return {
    isAuthenticated: isSignedIn,
    user,
    isLoaded,
  };
}

// Auth state for use in components
export function useAuthState() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  return {
    isAuthenticated: !!isSignedIn,
    isLoading: !isLoaded,
    user,
    userId: user?.id,
  };
}