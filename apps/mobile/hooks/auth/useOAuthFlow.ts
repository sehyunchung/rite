import { useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { ConvexReactClient } from 'convex/react';
import { useRouter } from 'expo-router';
import { User, AuthError } from '../../lib/auth/types';
import { getGoogleOAuthConfig, hasGoogleConfig } from '../../lib/auth/oauth-config';
import { useGoogleAuth } from './useGoogleAuth';

/**
 * Custom hook for managing OAuth flow with Google
 */
export const useOAuthFlow = (
  convex: ConvexReactClient,
  onAuthSuccess: (user: User) => void
) => {
  const config = getGoogleOAuthConfig();
  const router = useRouter();
  const { handleGoogleAuth, handleWebRedirect } = useGoogleAuth(convex);
  
  const [request, response, promptAsync] = Google.useAuthRequest(config);

  const signIn = useCallback(async () => {
    if (!hasGoogleConfig() || !request) {
      throw new AuthError(
        'OAuth not configured or request not ready',
        'OAUTH_NOT_READY'
      );
    }
    
    try {
      // expo-auth-session automatically handles:
      // - PKCE for code flow (code_challenge, code_verifier)
      // - State parameter generation and validation
      // - Secure storage of OAuth parameters
      await promptAsync();
    } catch (error) {
      throw new AuthError(
        'OAuth flow failed',
        'OAUTH_FLOW_ERROR',
        error
      );
    }
  }, [request, promptAsync]);

  // Handle authentication response from mobile OAuth
  useEffect(() => {
    if (!response) {
      return;
    }
    
    if (response.type === 'success') {
      // With shouldAutoExchangeCode: true, we should get an access token directly
      if (response.authentication?.accessToken) {
        handleGoogleAuth(response.authentication.accessToken)
          .then((user) => {
            if (user) {
              onAuthSuccess(user);
            }
          })
          .catch((error) => {
            // Errors are now handled by AuthContext
            // Just log for debugging
            console.error('OAuth authentication failed:', error);
          });
      }
    } else if (response.type === 'error') {
      console.error('OAuth response error:', response.error);
    }
  }, [response, handleGoogleAuth, onAuthSuccess]);

  // Handle web platform OAuth redirect on page load
  useEffect(() => {
    if (Platform.OS === 'web') {
      handleWebRedirect()
        .then((user) => {
          if (user) {
            onAuthSuccess(user);
            // Ensure we're on the home screen after successful auth
            router.replace('/');
          }
        })
        .catch((error) => {
          // Handle web redirect error
          console.error('Web redirect error:', error);
        });
    }
  }, [handleWebRedirect, onAuthSuccess, router]);

  return {
    signIn,
    isReady: !!request && hasGoogleConfig(),
  };
};