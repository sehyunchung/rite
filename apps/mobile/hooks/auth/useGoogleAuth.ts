import { useCallback } from 'react';
import { Platform } from 'react-native';
import { ConvexReactClient } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { User, AuthError } from '../../lib/auth/types';
import { createUserSession } from '../../lib/auth/session-utils';
import { getGoogleOAuthConfig } from '../../lib/auth/oauth-config';

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
}

/**
 * Custom hook for handling Google OAuth authentication
 */
export const useGoogleAuth = (convex: ConvexReactClient) => {
  const handleGoogleAuth = useCallback(async (accessToken: string): Promise<User | null> => {
    if (!accessToken) {
      throw new AuthError('No access token provided', 'MISSING_ACCESS_TOKEN');
    }

    try {
      // Get user info from Google
      const userInfoResponse = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
      );
      
      if (!userInfoResponse.ok) {
        throw new AuthError(
          'Failed to fetch user info from Google',
          'GOOGLE_API_ERROR',
          { status: userInfoResponse.status, statusText: userInfoResponse.statusText }
        );
      }
      
      const googleUser: GoogleUser = await userInfoResponse.json();

      // Check if user exists in Convex
      let userData = await convex.query(api.auth.getUserByEmail, { 
        email: googleUser.email 
      });

      // Create user if doesn't exist
      if (!userData) {
        const userId = await convex.mutation(api.auth.createUser, {
          email: googleUser.email,
          name: googleUser.name,
          image: googleUser.picture,
          emailVerified: Date.now(),
        });
        userData = await convex.query(api.auth.getUser, { userId });
      }

      if (!userData) {
        throw new AuthError('Failed to create or retrieve user', 'USER_CREATION_ERROR');
      }

      // Create session
      await createUserSession(convex, userData._id);
      return userData;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(
        'Google authentication failed',
        'GOOGLE_AUTH_ERROR',
        error
      );
    }
  }, [convex]);

  const exchangeCodeForToken = useCallback(async (code: string): Promise<User | null> => {
    const config = getGoogleOAuthConfig();
    
    try {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: config.webClientId || '',
          // Client secret removed for security - using PKCE flow instead
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: config.redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new AuthError(
          'Token exchange failed',
          'TOKEN_EXCHANGE_ERROR',
          { status: tokenResponse.status, response: errorText }
        );
      }

      const tokenData = await tokenResponse.json();
      
      if (!tokenData.access_token) {
        throw new AuthError('No access token in response', 'MISSING_ACCESS_TOKEN');
      }

      return await handleGoogleAuth(tokenData.access_token);
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(
        'Token exchange failed',
        'TOKEN_EXCHANGE_ERROR',
        error
      );
    }
  }, [handleGoogleAuth]);

  const handleWebRedirect = useCallback((): Promise<User | null> => {
    return new Promise((resolve, reject) => {
      if (Platform.OS !== 'web') {
        resolve(null);
        return;
      }

      try {
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        // Check for access token (implicit flow)
        const accessToken = hashParams.get('access_token');
        const state = hashParams.get('state') || urlParams.get('state');
        
        // Check for authorization code (code flow - fallback)
        const code = urlParams.get('code');
        
        if (accessToken && state) {
          // Process the access token directly (implicit flow)
          handleGoogleAuth(accessToken)
            .then(resolve)
            .catch(reject);
          
          // Clear URL parameters and hash to clean up the browser
          window.history.replaceState({}, document.title, window.location.pathname);
        } else if (code && state) {
          // Process the code manually (code flow - fallback)
          exchangeCodeForToken(code)
            .then(resolve)
            .catch(reject);
          
          // Clear URL parameters to clean up the browser
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          resolve(null);
        }
      } catch (error) {
        reject(new AuthError(
          'Web redirect handling failed',
          'WEB_REDIRECT_ERROR',
          error
        ));
      }
    });
  }, [handleGoogleAuth, exchangeCodeForToken]);

  return {
    handleGoogleAuth,
    exchangeCodeForToken,
    handleWebRedirect,
  };
};