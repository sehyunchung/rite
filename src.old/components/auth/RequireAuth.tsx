import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function RequireAuth({ children, redirectTo = '/login' }: RequireAuthProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      void router.navigate({ to: redirectTo });
    }
  }, [isLoaded, isSignedIn, redirectTo, router]);

  // Show loading while auth state is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isSignedIn) {
    return null;
  }

  return <>{children}</>;
}