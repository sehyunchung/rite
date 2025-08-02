import { Id } from '@rite/backend/convex/_generated/dataModel';

export interface User {
  _id: Id<"users">;
  email: string;
  name?: string;
  image?: string;
  createdAt: string;
  organizerProfile?: {
    companyName?: string;
    phone?: string;
  };
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export interface GoogleOAuthConfig {
  iosClientId?: string;
  androidClientId?: string;
  webClientId?: string;
  scopes: string[];
  responseType: 'token' | 'code';
  shouldAutoExchangeCode: boolean;
  redirectUri: string;
  clientId?: string;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export type Platform = 'web' | 'ios' | 'android';
export type AppEnvironment = 'expo' | 'standalone';