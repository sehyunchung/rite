# SvelteKit POC - Cloudflare Deployment Guide

## Overview
This SvelteKit POC is configured for Cloudflare Pages deployment using the `@sveltejs/adapter-cloudflare` adapter.

## Prerequisites
1. Cloudflare account
2. GitHub repository (or direct upload)
3. Convex backend URL

## Deployment Options

### Option 1: Cloudflare Pages (Recommended)

#### Step 1: Build Configuration
The app is already configured for Cloudflare Pages:
- `svelte.config.js` uses `@sveltejs/adapter-cloudflare`
- Build output will be in `build/` directory
- Functions are supported for edge computing

#### Step 2: Deploy via GitHub Integration
1. Go to [Cloudflare Dashboard → Pages](https://dash.cloudflare.com/pages)
2. Click "Create a project" → "Connect to Git"
3. Select your GitHub repository
4. Configure build settings:
   ```
   Framework preset: SvelteKit
   Build command: pnpm run build
   Build output directory: build
   Root directory: apps/sveltekit-poc
   ```

#### Step 3: Environment Variables
Add these environment variables in Cloudflare Pages:
```
VITE_CONVEX_URL=your_convex_deployment_url
```

#### Step 4: Custom Domain (Optional)
- Add your custom domain in Pages settings
- Configure DNS records as instructed

### Option 2: Cloudflare Workers (Advanced)

For more control over deployment:

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy from apps/sveltekit-poc directory
cd apps/sveltekit-poc
wrangler pages deploy build --project-name=rite-sveltekit-poc
```

## Build Commands

### Local Build Test
```bash
# From monorepo root
pnpm --filter=sveltekit-poc run build

# Or from app directory
cd apps/sveltekit-poc
pnpm run build
```

### Preview Build
```bash
pnpm run preview
```

## Environment Setup

### Development
1. Copy `.env.example` to `.env.local`
2. Set `VITE_CONVEX_URL` to your Convex development URL
3. Run `pnpm run dev`

### Production
Set environment variables in Cloudflare Pages dashboard:
- `VITE_CONVEX_URL`: Your Convex production deployment URL

## Performance Benefits on Cloudflare

### Why SvelteKit + Cloudflare?
1. **Smaller Bundle Size**: SvelteKit compiles to vanilla JS
2. **Edge Performance**: Runs closer to users globally
3. **Fast Cold Starts**: Minimal runtime overhead
4. **Cost Effective**: Generous free tier
5. **Global CDN**: Automatic asset optimization

### Expected Performance
- **Bundle Size**: ~50KB (vs ~200KB+ for equivalent React)
- **Cold Start**: <50ms
- **Time to Interactive**: <100ms
- **Global Latency**: <100ms from edge locations

## Comparison with Next.js Deployment

| Metric | SvelteKit + Cloudflare | Next.js + Vercel |
|--------|------------------------|-------------------|
| Bundle Size | ~50KB | ~200KB+ |
| Cold Start | <50ms | 100-300ms |
| Edge Locations | 330+ | 100+ |
| Free Tier | 100,000 requests/day | 100GB bandwidth |
| Build Time | ~30s | ~60s |

## Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   # Check dependencies
   pnpm install
   
   # Verify build locally
   pnpm run build
   ```

2. **Convex Connection Issues**
   - Verify `VITE_CONVEX_URL` is set correctly
   - Check Convex deployment status
   - Ensure environment variable is available at runtime

3. **Adapter Issues**
   ```bash
   # Reinstall adapter
   pnpm add -D @sveltejs/adapter-cloudflare@latest
   ```

## Monitoring & Analytics

### Cloudflare Analytics
- Page views and unique visitors
- Performance metrics
- Error rates
- Geographic distribution

### Convex Analytics
- Database query performance
- Function execution times
- Real-time connection stats

## Next Steps

1. **Set up CI/CD**: Automatic deployments on push to main
2. **Add Custom Domain**: Configure DNS for production domain
3. **Enable Analytics**: Set up monitoring and alerting
4. **Performance Testing**: Load testing and optimization
5. **A/B Testing**: Compare with Next.js deployment side-by-side

## Resources

- [SvelteKit Cloudflare Adapter Docs](https://kit.svelte.dev/docs/adapter-cloudflare)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Convex Deployment Guide](https://docs.convex.dev/production/hosting)