# Instagram API Migration Guide
## From Basic Display API to Instagram API with Instagram Login

### Overview
Instagram Basic Display API was deprecated on December 4, 2024. This guide covers migrating to the new Instagram API with Instagram Login.

### Key Differences

#### Old API (Basic Display)
- Simple user profile access
- Basic media retrieval
- Personal accounts supported
- Scopes: `user_profile`, `user_media`

#### New API (Instagram API with Instagram Login)
- **Business/Creator accounts only**
- Enhanced capabilities: content publishing, messaging, insights
- New scopes: `instagram_business_basic`, `instagram_business_content_publish`
- Old scopes deprecated January 27, 2025

### Migration Steps

## 1. Update App Configuration

### Meta Developer Console
1. Go to your app settings
2. Add "Instagram API with Instagram Login" product
3. Configure OAuth Redirect URIs:
   - Development: `http://localhost:5173/auth/instagram/callback`
   - Production: `https://rite-mu.vercel.app/auth/instagram/callback`

### Required Scopes
For Rite's use case, request these permissions:
- `instagram_business_basic` - Profile info and media
- `instagram_business_content_publish` - Post creation (Phase 3)

## 2. Update OAuth Flow

### Authorization URL
```
https://api.instagram.com/oauth/authorize
  ?client_id={app-id}
  &redirect_uri={redirect-uri}
  &scope=instagram_business_basic,instagram_business_content_publish
  &response_type=code
  &state={state-param}
```

### Token Exchange
```
POST https://api.instagram.com/oauth/access_token
  client_id={app-id}
  &client_secret={app-secret}
  &grant_type=authorization_code
  &redirect_uri={redirect-uri}
  &code={code}
```

## 3. Update OAuth Proxy

The proxy needs updates to:
1. Use new authorization URL
2. Request business scopes
3. Handle business account validation

## 4. Frontend Updates

### Check Account Type
The new API requires Business or Creator accounts:
```typescript
if (userProfile.account_type !== 'BUSINESS' && userProfile.account_type !== 'CREATOR') {
  throw new Error('Instagram Business or Creator account required');
}
```

### Update Clerk Integration
Clerk's custom OIDC provider configuration needs:
- Updated authorization endpoint
- New scope mappings
- Account type validation

## 5. Implementation Timeline

### Phase 1: Basic Authentication (Now)
- Update OAuth proxy for new API
- Implement account type validation
- Test with business/creator accounts

### Phase 2: Enhanced Features (Later)
- Content publishing API integration
- Media insights
- Comment management

### Testing Checklist
- [ ] OAuth flow works with business account
- [ ] Profile data retrieved correctly
- [ ] Clerk integration maintains session
- [ ] Error handling for personal accounts
- [ ] Token refresh works properly

### Important Notes
1. **Account Requirements**: Users need Instagram Business or Creator accounts
2. **Facebook Page**: NOT required (unlike Facebook Login variant)
3. **Permissions**: Start minimal, add more for Phase 3
4. **Rate Limits**: New API has different rate limits

### Resources
- [Instagram API Documentation](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/)
- [OAuth Reference](https://developers.facebook.com/docs/instagram-platform/reference/oauth-authorize/)
- [Migration Guide](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/migration-guide/)