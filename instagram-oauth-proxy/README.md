# Rite Instagram OAuth Proxy

A Cloudflare Workers service that acts as an OIDC-compatible proxy for Instagram OAuth, enabling Instagram login through Clerk.

## Why This Exists

Instagram doesn't support OpenID Connect (OIDC), only OAuth 2.0. Clerk requires OIDC-compatible providers for custom social connections. This proxy bridges Instagram OAuth 2.0 to OIDC format.

## Features

- Handles Instagram Basic Display API OAuth flow
- Transforms Instagram user data to OIDC claims format
- Provides OIDC discovery endpoints for Clerk compatibility
- Secure token exchange and user info retrieval
- Deployed on Cloudflare Workers for fast global performance

## Setup

### 1. Install Dependencies

```bash
cd instagram-oauth-proxy
npm install
```

### 2. Create Instagram App

1. Go to [Meta Developer Console](https://developers.facebook.com/)
2. Create a new app
3. Add "Instagram Basic Display" product
4. Configure OAuth redirect URIs:
   - Development: `https://your-worker.your-subdomain.workers.dev/oauth/callback`
   - Production: `https://instagram-proxy.rite.app/oauth/callback`

### 3. Configure Environment Variables

```bash
# Set secrets in Cloudflare Workers
wrangler secret put INSTAGRAM_CLIENT_ID
wrangler secret put INSTAGRAM_CLIENT_SECRET
wrangler secret put RITE_APP_URL
```

Environment variables:

- `INSTAGRAM_CLIENT_ID`: Your Instagram app client ID
- `INSTAGRAM_CLIENT_SECRET`: Your Instagram app client secret
- `RITE_APP_URL`: Your main Rite app URL (e.g., `https://app.rite.com`)

### 4. Deploy

```bash
# Development
npm run dev

# Production
npm run deploy
```

## Integration with Clerk

1. **Add Custom OAuth Provider in Clerk Dashboard**:
   - Go to SSO Connections → Add Connection → Custom Provider
   - Discovery URL: `https://your-proxy-url/.well-known/openid-configuration`
   - Client ID: `instagram` (or any identifier)
   - Client Secret: (generate a random secret for security)

2. **Configure Attribute Mapping**:
   - `sub` → User ID
   - `preferred_username` → Instagram username
   - `https://rite.app/instagram_username` → Instagram username (custom claim)
   - `https://rite.app/instagram_id` → Instagram ID (custom claim)

## API Endpoints

- `GET /` - Health check
- `GET /.well-known/openid-configuration` - OIDC discovery
- `GET /oauth/authorize` - OAuth authorization (redirects to Instagram)
- `GET /oauth/callback` - OAuth callback from Instagram
- `POST /oauth/token` - Token exchange
- `GET /oauth/userinfo` - User information
- `GET /.well-known/jwks.json` - JWKS for JWT verification

## Limitations

- Instagram Basic Display API doesn't provide email addresses
- Users will need to provide email separately in Rite app
- Access tokens expire and need refresh (handled by Instagram API)

## Security

- All tokens are exchanged server-side
- CORS configured for Clerk domains only
- Secrets stored securely in Cloudflare Workers
- No persistent storage of user tokens

## Development

```bash
# Start local development
npm run dev

# Test OAuth flow
curl http://localhost:8787/.well-known/openid-configuration
```

## Production Deployment

The proxy is deployed to Cloudflare Workers for:

- Global edge performance
- Automatic scaling
- 99.9% uptime SLA
- Zero cold starts
