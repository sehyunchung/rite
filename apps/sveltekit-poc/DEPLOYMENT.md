# SvelteKit POC - Cloudflare Workers Deployment Guide

## Overview
This SvelteKit POC is configured for Cloudflare Workers deployment using the `@sveltejs/adapter-cloudflare` adapter. Following Cloudflare's recommendation to use Workers for new projects, this guide focuses on the Workers deployment approach.

## Prerequisites
1. Cloudflare account
2. Wrangler CLI installed (`npm install -g wrangler`)
3. Convex backend URL
4. Node.js 18+ and pnpm

## Deployment Options

### Option 1: Cloudflare Workers (Recommended)

#### Step 1: Initial Setup

```bash
# Install Wrangler CLI globally (if not already installed)
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

#### Step 2: Configure Environment Variables

1. Create a `.env` file for local development:
```bash
VITE_CONVEX_URL=your_convex_development_url
```

2. For production, add secrets via Wrangler:
```bash
wrangler secret put VITE_CONVEX_URL
# Enter your production Convex URL when prompted
```

#### Step 3: Build and Deploy

```bash
# From monorepo root
cd apps/sveltekit-poc

# Build the application
pnpm run build

# Deploy to Workers
pnpm run deploy

# Or deploy to a preview environment
pnpm run deploy:preview
```

#### Step 4: Verify Deployment

After deployment, Wrangler will provide:
- Worker URL: `https://rite-sveltekit-poc.<your-subdomain>.workers.dev`
- Dashboard link for monitoring and logs

### Option 2: Cloudflare Pages (Legacy)

While Cloudflare recommends Workers for new projects, Pages is still supported:

```bash
# Deploy using Pages
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

## Workers vs Pages Comparison

### Why Workers for New Projects?

Based on [Cloudflare's compatibility matrix](https://developers.cloudflare.com/workers/static-assets/migrate-from-pages/#compatibility-matrix):

| Feature | Workers | Pages |
|---------|---------|-------|
| Static Assets | ✅ Native support | ✅ Built-in |
| Server-side Rendering | ✅ Full support | ✅ Limited |
| API Routes | ✅ Full Workers API | ⚠️ Functions only |
| Bindings (KV, D1, R2) | ✅ All bindings | ⚠️ Limited |
| WebSockets | ✅ Supported | ❌ Not supported |
| Cron Triggers | ✅ Supported | ❌ Not supported |
| Custom Domains | ✅ Unlimited | ✅ Unlimited |
| Preview Deployments | ✅ Via `--env` | ✅ Automatic |
| Build Pipeline | ⚡ Local/CI | ☁️ Cloudflare |

### Performance Benefits

1. **Workers Advantages**:
   - Better cold start performance
   - More consistent response times
   - Full access to Workers runtime APIs
   - Better integration with other Cloudflare services

2. **SvelteKit + Workers Performance**:
   - **Bundle Size**: ~50KB (vs ~200KB+ for React)
   - **Cold Start**: <25ms on Workers (vs <50ms on Pages)
   - **Time to Interactive**: <100ms
   - **Global Network**: 330+ edge locations

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

## Advanced Configuration

### Custom Domain Setup

1. Add your domain to Cloudflare DNS
2. Update `wrangler.toml`:
```toml
[[routes]]
pattern = "rite.party/*"
zone_name = "rite.party"
```
3. Deploy with: `pnpm run deploy`

### Environment-specific Deployments

```bash
# Development
wrangler dev

# Preview/Staging
wrangler deploy --env preview

# Production
wrangler deploy --env production
```

### CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Cloudflare Workers
on:
  push:
    branches: [main]
    paths:
      - 'apps/sveltekit-poc/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: pnpm install
      - name: Build
        run: pnpm --filter=sveltekit-poc run build
      - name: Deploy
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          workingDirectory: apps/sveltekit-poc
```

## Monitoring & Analytics

### Workers Analytics
- Real-time request logs
- Performance metrics
- Error tracking
- Geographic distribution

Access via: [Cloudflare Dashboard → Workers & Pages → Analytics](https://dash.cloudflare.com)

## Resources

- [Workers Static Assets Guide](https://developers.cloudflare.com/workers/static-assets)
- [Migrate from Pages to Workers](https://developers.cloudflare.com/workers/static-assets/migrate-from-pages/)
- [SvelteKit Cloudflare Adapter](https://kit.svelte.dev/docs/adapter-cloudflare)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)