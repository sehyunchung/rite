# OAuth Setup Guide

This guide documents the secure OAuth implementation for the RITE mobile app.

## Security Improvements

All critical security issues have been resolved:

### 1. ✅ **No Hardcoded Credentials**
- Converted `app.json` to `app.config.js` for dynamic configuration
- OAuth client IDs are now read from environment variables
- No fallback values that could expose credentials

### 2. ✅ **PKCE Implementation**
- expo-auth-session automatically handles PKCE for code flow
- Includes code_challenge and code_verifier generation
- Secure token exchange without client secrets

### 3. ✅ **CSRF Protection**
- expo-auth-session automatically generates and validates state parameters
- Prevents cross-site request forgery attacks
- State is securely stored and validated

### 4. ✅ **Comprehensive Error Handling**
- AuthContext now includes error state management
- User-friendly error messages via AuthErrorAlert component
- Specific error codes for debugging

### 5. ✅ **Environment Variable Validation**
- Fail-fast approach with clear error messages
- Platform-specific validation
- No silent failures

## Environment Setup

### Required Environment Variables

Create a `.env` file in the mobile app directory:

```bash
# Google OAuth Client IDs (from Google Cloud Console)
EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_IOS=your-ios-client-id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_SECRET=your-web-client-secret

# Convex Backend
EXPO_PUBLIC_CONVEX_URL=your-convex-url
```

### Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 Client IDs:

#### iOS Client
- Type: iOS
- Bundle ID: `com.rite.mobile`
- URL Scheme: Auto-generated

#### Android Client
- Type: Android
- Package name: `com.rite.mobile`
- SHA-1 certificate fingerprint: (from your keystore)

#### Web Client
- Type: Web application
- Authorized redirect URIs: `http://localhost:8081`

## Platform-Specific Behavior

### Web Platform
- Uses implicit flow (response_type=token)
- Direct access token retrieval
- Redirect URI: `http://localhost:8081`

### iOS/Expo Go
- Uses authorization code flow with PKCE
- URL Scheme: `com.googleusercontent.apps.[CLIENT-ID]://`
- Automatic token exchange

### Android
- Uses authorization code flow with PKCE
- Custom scheme: `com.rite.mobile://`
- Automatic token exchange

## Error Handling

The app now provides user-friendly error messages for common issues:

- **OAUTH_NOT_READY**: OAuth configuration missing
- **MISSING_ACCESS_TOKEN**: No token received from provider
- **GOOGLE_API_ERROR**: Failed to fetch user info
- **USER_CREATION_ERROR**: Database operation failed
- **TOKEN_EXCHANGE_ERROR**: Code to token exchange failed

## Usage

```typescript
import { useAuth } from '../contexts/AuthContext';
import { AuthErrorAlert } from '../components/AuthErrorAlert';

function LoginScreen() {
  const { signIn, user, error, clearError } = useAuth();
  
  return (
    <>
      <AuthErrorAlert />
      <Button onPress={signIn} title="Sign in with Google" />
    </>
  );
}
```

## Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Rotate client secrets regularly**
3. **Use platform-specific client IDs** - Don't share across platforms
4. **Monitor OAuth logs** for suspicious activity
5. **Implement rate limiting** on your backend

## Troubleshooting

### "OAuth not configured" Error
- Ensure all required environment variables are set
- Restart Metro bundler after adding env vars
- Check platform-specific requirements

### "Redirect URI mismatch" Error
- Verify URL schemes in app.config.js
- Check Google Cloud Console settings
- Ensure correct platform detection

### Token Exchange Failures
- expo-auth-session handles PKCE automatically
- Check network connectivity
- Verify client IDs match