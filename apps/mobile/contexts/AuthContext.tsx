import React, { createContext, useContext, ReactNode } from 'react';
import { useConvex } from 'convex/react';
import { AuthContextType, User } from '../lib/auth/types';
import { useSession } from '../hooks/auth/useSession';
import { useOAuthFlow } from '../hooks/auth/useOAuthFlow';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const convex = useConvex();
  
  // Session management
  const { user, isLoading, setUser, signOut } = useSession(convex);
  
  // OAuth flow management
  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
  };
  
  const { signIn } = useOAuthFlow(convex, handleAuthSuccess);

  const value: AuthContextType = {
    user,
    isLoading,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}