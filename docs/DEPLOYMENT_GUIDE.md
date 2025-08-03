# Rite Deployment Guide

## Overview
This guide covers deploying the Rite DJ event management platform to production, with a focus on Korean market requirements and the specific tech stack (Next.js 15 + App Router + Convex + NextAuth v5).

## Recommended Platform: Vercel

### Why Vercel?
1. **Asia Performance**: Edge network optimized for Korean users (Seoul edge location)
2. **Zero Configuration**: Works perfectly with Next.js out of the box
3. **GitHub Integration**: Automatic deployments on push to main branch
4. **Environment Variables**: Simple UI for managing NextAuth and Convex keys
5. **Free Tier**: 100GB bandwidth/month - more than enough for MVP phase
6. **SSR Support**: Handles server-side rendering and API routes automatically

### Prerequisites
- GitHub repository connected (already done ✓)
- Vercel account (free tier is sufficient)
- Production keys from Convex and NextAuth configuration

## Step-by-Step Deployment

### 1. Prepare Production Environment Variables

First, get your production keys:

**Convex Production URL:**
```bash
npx convex deploy --cmd 'npx convex env get CONVEX_URL'
```

**NextAuth v5 Configuration:**
- Configure OAuth providers (Instagram via proxy, Google)
- Set NEXTAUTH_SECRET for production
- Configure redirect URLs for each OAuth provider

### 2. Vercel Configuration

Vercel automatically detects Next.js projects and configures them optimally. No additional configuration is needed as Next.js 15 with App Router handles:
- Server-side rendering and static generation
- API routes
- Internationalization routing
- Image optimization
- Automatic bundle optimization

### 3. Connect to Vercel

#### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
pnpm add -g vercel

# Login to Vercel
vercel login

# Deploy from Next.js app directory
cd apps/next-app
vercel

# Follow prompts:
# - Link to existing project? No
# - What's your project name? rite
# - In which directory is your code located? ./
# - Want to override settings? No
```

#### Option B: Vercel Dashboard
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `apps/next-app`
   - Build Command: `cd ../.. && pnpm run build --filter=next-app`
   - Install Command: `cd ../.. && pnpm install`

### 4. Set Environment Variables

In Vercel Dashboard > Project Settings > Environment Variables:

```bash
# Required for production
NEXT_PUBLIC_CONVEX_URL=https://your-instance.convex.cloud
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_here

# Instagram OAuth (via proxy)
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
INSTAGRAM_OAUTH_PROXY_URL=https://rite-instagram-oauth-proxy.sehyunchung.workers.dev

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Optional for development preview
CONVEX_DEPLOY_KEY=your_deploy_key
```

**Important**: 
- Use `NEXT_PUBLIC_` prefix for client-side variables
- Don't commit production keys to git
- Set different values for Preview/Development/Production environments
- Ensure OAuth redirect URLs match production domain

### 5. Deploy to Production

```bash
# Deploy to production
vercel --prod

# Or push to main branch (auto-deploys)
git push origin main
```

### 6. Verify Deployment

Check these critical paths:
- `/` - Landing page loads with theme switcher
- `/ko` and `/en` - Internationalization works
- `/auth/signin` - NextAuth v5 authentication works
- `/dashboard` - Protected route redirects properly
- `/submit/[token]` - Shows error for invalid token
- `/events/create` - Form loads with proper validation
- Test Instagram and Google OAuth flows

## Production Checklist

### Security
- [ ] Environment variables set correctly (not exposed in client)
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] NextAuth v5 production configuration active
- [ ] OAuth providers properly configured with production URLs
- [ ] Convex production deployment active

### Performance
- [ ] Build optimization enabled (automatic with Next.js 15)
- [ ] Assets served from CDN (automatic on Vercel)
- [ ] Gzip compression active (automatic on Vercel)
- [ ] Server-side rendering and static generation working
- [ ] Image optimization enabled
- [ ] i18n routing works correctly

### Monitoring
- [ ] Vercel Analytics enabled (optional)
- [ ] Error tracking configured (consider Sentry)
- [ ] Convex dashboard accessible for monitoring
- [ ] NextAuth session management working
- [ ] OAuth providers showing successful authentications

## Alternative Deployment Options

### Netlify
Next.js support with additional configuration:

`netlify.toml`:
```toml
[build]
  command = "cd ../.. && pnpm run build --filter=next-app"
  publish = "apps/next-app/.next"

[build.environment]
  NODE_VERSION = "18"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

Pros: Good free tier, Next.js plugin support
Cons: Slightly slower in Asia, requires additional configuration

### Cloudflare Pages
Fast globally but limited Next.js support:

1. Build configuration:
   - Build command: `cd ../.. && pnpm run build --filter=next-app`
   - Build output directory: `apps/next-app/out`
   - Requires static export configuration

2. Add to `next.config.js`:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     trailingSlash: true,
     images: { unoptimized: true }
   }
   ```

Pros: Excellent global performance
Cons: Limited Next.js features (no server-side rendering, API routes)

### Railway
Full-stack platform suitable for Next.js apps:

`railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd ../.. && pnpm run build --filter=next-app"
  },
  "deploy": {
    "startCommand": "cd apps/next-app && pnpm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Pros: Full Next.js support, good for monorepos
Cons: More expensive than Vercel free tier

## Korean Market Optimizations

### CDN Configuration
For optimal Korean performance, consider:

1. **Cloudflare (Free)**:
   - Add site to Cloudflare
   - Enable Korean PoP (Point of Presence)
   - Configure caching rules

2. **AWS CloudFront** (Paid):
   - Create distribution with Seoul edge location
   - Configure origin to Vercel deployment

### Performance Tips
1. **Font Loading**: SUIT Variable font with `font-display: swap`
2. **Image Optimization**: Next.js automatic optimization with WebP
3. **Bundle Splitting**: Automatic with Next.js App Router
4. **Caching**: ISR and static generation for optimal caching
5. **i18n**: Efficient locale-based routing

## Troubleshooting

### Common Issues

**404 on refresh:**
- Next.js App Router handles this automatically
- Ensure dynamic routes are properly configured

**Environment variables not working:**
- Variables must start with `NEXT_PUBLIC_` to be exposed to client
- Rebuild after changing environment variables
- Check Vercel dashboard environment settings

**Slow initial load:**
- Enable Vercel Edge Network
- Use Next.js static generation where possible
- Optimize images with Next.js Image component

**Authentication issues:**
- Verify NextAuth redirect URLs include production domain
- Check OAuth provider settings
- Ensure NEXTAUTH_SECRET is set in production

### Debug Commands

```bash
# Check build output (from root)
pnpm run build --filter=next-app

# Test production build locally
cd apps/next-app && pnpm start

# Analyze bundle size
cd apps/next-app && pnpm run build && npx @next/bundle-analyzer

# Check environment variables
vercel env ls

# Test monorepo dependencies
pnpm run type-check
```

## Maintenance

### Updating Production

```bash
# Standard deployment
git push origin main

# Rollback to previous deployment
vercel rollback

# Promote staging to production
vercel promote [deployment-url]
```

### Monitoring

1. **Vercel Dashboard**:
   - Function logs
   - Build logs
   - Analytics (if enabled)

2. **Convex Dashboard**:
   - Database queries
   - Function execution
   - Storage usage

3. **Clerk Dashboard**:
   - User signups
   - Authentication methods
   - Session activity

## Cost Estimation

### Free Tier Limits (Monthly)
- **Vercel**: 100GB bandwidth, 1000 image optimizations
- **Convex**: 1M function calls, 1GB storage
- **Clerk**: 1000 monthly active users

### Estimated Costs for 100 Users
- **Vercel**: $0 (within free tier)
- **Convex**: $0 (within free tier)
- **Clerk**: $0 (within free tier)
- **Total**: $0/month

### When to Upgrade
- Over 1000 active users
- Need custom domain with SSL
- Advanced analytics required
- Team collaboration features

## Next Steps

1. Deploy to Vercel following this guide
2. Test all critical user flows
3. Set up monitoring and alerts
4. Configure custom domain (optional)
5. Enable analytics for user insights

---

**Remember**: Start with the simplest deployment (Vercel + GitHub auto-deploy) and add complexity only when needed. The goal is a reliable platform for Korean DJ organizers, not deployment perfection.