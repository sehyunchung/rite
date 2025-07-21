# Rite Deployment Guide

## Overview
This guide covers deploying the Rite DJ event management platform to production, with a focus on Korean market requirements and the specific tech stack (Vite + TanStack Router + Convex + Clerk).

## Recommended Platform: Vercel

### Why Vercel?
1. **Asia Performance**: Edge network optimized for Korean users (Seoul edge location)
2. **Zero Configuration**: Works perfectly with Vite + TanStack Router out of the box
3. **GitHub Integration**: Automatic deployments on push to main branch
4. **Environment Variables**: Simple UI for managing Clerk and Convex keys
5. **Free Tier**: 100GB bandwidth/month - more than enough for MVP phase
6. **SPA Support**: Handles client-side routing without additional configuration

### Prerequisites
- GitHub repository connected (already done ✓)
- Vercel account (free tier is sufficient)
- Production keys from Convex and Clerk

## Step-by-Step Deployment

### 1. Prepare Production Environment Variables

First, get your production keys:

**Convex Production URL:**
```bash
npx convex deploy --cmd 'npx convex env get CONVEX_URL'
```

**Clerk Production Keys:**
- Go to [Clerk Dashboard](https://dashboard.clerk.com)
- Select your production instance
- Copy the Publishable Key

### 2. Create Vercel Configuration

Create `vercel.json` in your project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This configuration ensures:
- Correct build process for Vite
- SPA routing works (all routes serve index.html)
- TanStack Router can handle client-side navigation

### 3. Connect to Vercel

#### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
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
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 4. Set Environment Variables

In Vercel Dashboard > Project Settings > Environment Variables:

```bash
# Required for production
VITE_CONVEX_URL=https://your-instance.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_actual_key

# Optional for development preview
CONVEX_DEPLOY_KEY=your_deploy_key
```

**Important**: 
- Use `VITE_` prefix for client-side variables
- Don't commit production keys to git
- Set different values for Preview/Development/Production environments

### 5. Deploy to Production

```bash
# Deploy to production
vercel --prod

# Or push to main branch (auto-deploys)
git push origin main
```

### 6. Verify Deployment

Check these critical paths:
- `/` - Landing page loads
- `/login` - Clerk authentication works
- `/dashboard` - Protected route redirects properly
- `/dj-submission?token=test` - Shows error for invalid token
- `/events/create` - Form loads with proper validation

## Production Checklist

### Security
- [ ] Environment variables set correctly (not exposed in client)
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Clerk production instance configured
- [ ] Convex production deployment active

### Performance
- [ ] Build optimization enabled (automatic with Vite)
- [ ] Assets served from CDN (automatic on Vercel)
- [ ] Gzip compression active (automatic on Vercel)
- [ ] Client-side routing works without full page reloads

### Monitoring
- [ ] Vercel Analytics enabled (optional)
- [ ] Error tracking configured (consider Sentry)
- [ ] Convex dashboard accessible for monitoring
- [ ] Clerk dashboard shows active users

## Alternative Deployment Options

### Netlify
Similar to Vercel with slightly different configuration:

`netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Pros: Good free tier, easy setup
Cons: Slightly slower in Asia

### Cloudflare Pages
Fast globally but requires more configuration:

1. Build configuration:
   - Build command: `npm run build`
   - Build output directory: `dist`

2. Add `_redirects` file in `public/`:
   ```
   /* /index.html 200
   ```

Pros: Excellent global performance
Cons: More complex setup, less intuitive dashboard

### Railway
Full-stack platform, but overkill for frontend-only:

`railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run preview",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Pros: Can host full-stack apps
Cons: More expensive, unnecessary complexity

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
1. **Font Loading**: Use Korean web fonts with `font-display: swap`
2. **Image Optimization**: Use WebP format with fallbacks
3. **Bundle Splitting**: Lazy load routes with TanStack Router
4. **Caching**: Set appropriate cache headers for assets

## Troubleshooting

### Common Issues

**404 on refresh:**
- Ensure SPA rewrite rules are configured
- Check `vercel.json` rewrites section

**Environment variables not working:**
- Variables must start with `VITE_` to be exposed to client
- Rebuild after changing environment variables

**Slow initial load:**
- Enable Vercel Edge Network
- Consider code splitting for large components
- Optimize bundle size with `npm run build -- --analyze`

**Authentication redirect loops:**
- Verify Clerk redirect URLs include production domain
- Check CORS settings in Clerk dashboard

### Debug Commands

```bash
# Check build output
npm run build

# Test production build locally
npm run preview

# Analyze bundle size
npm run build -- --analyze

# Check environment variables
vercel env ls
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