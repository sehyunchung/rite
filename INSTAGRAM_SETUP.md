# Instagram OAuth Setup Guide

This guide walks you through setting up Instagram login for Rite using our custom OAuth proxy service.

## Why Instagram Login?

Since DJs and event organizers are heavily on Instagram, having Instagram login provides:
- ✅ **Seamless onboarding** for your core user base
- ✅ **Competitive advantage** - few event platforms offer Instagram login
- ✅ **Brand alignment** with the DJ/music industry
- ✅ **Higher conversion rates** compared to email/password signup

## Step 1: Create Instagram App

### 1.1 Go to Meta Developer Console
1. Visit [developers.facebook.com](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Select "Consumer" as app type
4. Fill in app details:
   - **App Name**: "Rite DJ Events"
   - **App Contact Email**: your email
   - **App Purpose**: "To help DJs and event organizers manage events"

### 1.2 Add Instagram Basic Display Product
1. In your app dashboard, click "Add Product"
2. Find "Instagram Basic Display" and click "Set Up"
3. Go to Basic Display → Basic Display settings

### 1.3 Configure OAuth Settings
1. **Valid OAuth Redirect URIs**:
   - Development: `https://rite-instagram-oauth-proxy-dev.workers.dev/oauth/callback`
   - Production: `https://rite-instagram-oauth-proxy.workers.dev/oauth/callback`
2. **Deauthorize Callback URL**: `https://app.rite.com/auth/deauthorize`
3. **Data Deletion Request URL**: `https://app.rite.com/auth/delete`

### 1.4 Get Credentials
1. Copy **Instagram App ID** (Client ID)
2. Copy **Instagram App Secret** (Client Secret)
3. Save these securely - you'll need them for the proxy service

## Step 2: Deploy Instagram OAuth Proxy

### 2.1 Install Cloudflare CLI
```bash
npm install -g wrangler
wrangler login
```

### 2.2 Configure Environment Variables
```bash
cd instagram-oauth-proxy
wrangler secret put INSTAGRAM_CLIENT_ID
# Enter your Instagram App ID when prompted

wrangler secret put INSTAGRAM_CLIENT_SECRET  
# Enter your Instagram App Secret when prompted

wrangler secret put RITE_APP_URL
# Enter https://app.rite.com for production or http://localhost:5174 for dev
```

### 2.3 Deploy the Proxy
```bash
# Deploy to production
npm run deploy

# Or deploy to development environment
wrangler deploy --env development
```

### 2.4 Note Your Proxy URL
After deployment, you'll get a URL like:
- Production: `https://rite-instagram-oauth-proxy.workers.dev`
- Development: `https://rite-instagram-oauth-proxy-dev.workers.dev`

## Step 3: Configure Clerk Custom Provider

### 3.1 Add Custom OAuth Provider in Clerk Dashboard
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to "SSO Connections"
3. Click "Add connection" → "Custom provider"
4. Fill in the configuration:

**Provider Configuration:**
- **Provider name**: Instagram
- **Unique key**: `instagram`
- **Discovery endpoint**: `https://your-proxy-url/.well-known/openid-configuration`
- **Client ID**: `instagram` (can be any identifier)
- **Client secret**: Generate a random secret for security

### 3.2 Configure Attribute Mapping
In Clerk Dashboard, configure these attribute mappings:
- **Email**: Leave empty (Instagram doesn't provide email)
- **First name**: `preferred_username`
- **Last name**: Leave empty
- **Username**: `preferred_username`

**Custom attributes:**
- `instagram_username` → `https://rite.app/instagram_username`
- `instagram_id` → `https://rite.app/instagram_id`
- `account_type` → `https://rite.app/account_type`

### 3.3 Enable the Provider
1. In the provider settings, toggle "Enable connection"
2. Test the configuration using the "Test connection" button

## Step 4: Update Rite Application

### 4.1 Environment Variables
Update your `.env.local`:
```bash
# Instagram OAuth Proxy URL
VITE_INSTAGRAM_OAUTH_PROXY_URL=https://rite-instagram-oauth-proxy.workers.dev
```

### 4.2 Test Instagram Login
1. Start your development server: `npm run dev`
2. Go to the login page
3. Click "Continue with Instagram"
4. You should be redirected to Instagram OAuth
5. After authorization, you'll be redirected back to Rite

## Step 5: Handle Email Collection

Since Instagram doesn't provide email addresses, Rite handles this elegantly:

1. **User clicks Instagram login** → Redirected to Instagram OAuth
2. **Instagram authorization** → User approves app access
3. **Email collection** → Rite prompts for email address
4. **Account creation** → User account created with Instagram data + email
5. **Future logins** → One-click Instagram login (no email prompt)

## Testing the Flow

### Test URLs:
- **Health check**: `https://your-proxy-url/`
- **OIDC discovery**: `https://your-proxy-url/.well-known/openid-configuration`
- **Manual OAuth test**: `https://your-proxy-url/oauth/authorize`

### Expected Behavior:
1. Instagram login button appears on Rite login page
2. Clicking it redirects to Instagram OAuth
3. After Instagram authorization, redirects to Rite email collection
4. After email submission, user is logged into Rite dashboard
5. Profile shows Instagram username and avatar

## Troubleshooting

### Common Issues:

**"Invalid OAuth Redirect URI"**
- Ensure redirect URI in Instagram app matches proxy URL exactly
- Check for typos in the proxy URL

**"Discovery endpoint not found"**
- Verify proxy is deployed and accessible
- Check proxy URL in Clerk configuration

**"Email required error"**
- Normal behavior - Instagram doesn't provide email
- Users must provide email once during signup

**"Authentication failed"**
- Check proxy logs in Cloudflare Workers dashboard
- Verify Instagram app credentials are correct

### Debug Commands:
```bash
# Check proxy deployment
curl https://your-proxy-url/

# Test OIDC discovery
curl https://your-proxy-url/.well-known/openid-configuration

# View proxy logs
wrangler tail
```

## Production Checklist

Before going live:
- [ ] Instagram app approved for public use
- [ ] Proxy deployed to production environment
- [ ] Clerk custom provider configured and enabled
- [ ] Rite app environment variables updated
- [ ] End-to-end authentication flow tested
- [ ] Error handling and user feedback tested
- [ ] Analytics/monitoring set up for login conversions

## Business Impact

Expected improvements after Instagram login:
- **🚀 Higher conversion rates** - easier signup for DJs
- **🎯 Better user targeting** - Instagram data helps understand user base  
- **💪 Competitive advantage** - unique feature in event management space
- **📈 Viral potential** - users can share events directly from Instagram accounts

## Security Notes

- All tokens are exchanged server-side in the proxy
- No Instagram credentials stored in the main Rite application
- Proxy follows OAuth 2.0 security best practices
- CORS configured to only allow Clerk domains
- Environment variables securely managed in Cloudflare Workers