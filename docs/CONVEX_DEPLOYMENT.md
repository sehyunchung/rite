# Convex Automatic Deployment Setup

This document explains how Convex backend is automatically deployed when code changes are pushed.

## How It Works

1. **GitHub Actions Workflow** (`.github/workflows/deploy-convex.yml`)
   - Triggers on push to `main` branch
   - Only runs when Convex files change
   - Deploys to production Convex instance

2. **Deployment Flow**
   ```
   Push to main → GitHub Actions → Deploy Convex → Vercel builds frontend
   ```

## Setup Required

### 1. Add CONVEX_DEPLOY_KEY to GitHub Secrets

1. Go to your GitHub repository settings
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add:
   - Name: `CONVEX_DEPLOY_KEY`
   - Value: Your Convex deploy key (get from Convex dashboard)

### 2. Verify Vercel Environment Variables

Ensure these are set in Vercel project settings:
- `NEXT_PUBLIC_CONVEX_URL` - Your production Convex URL
- `CONVEX_DEPLOY_KEY` - Same key as GitHub (for local builds)

## Manual Deployment

If needed, you can manually deploy Convex:

```bash
cd packages/backend
pnpm run deploy:prod
# or
npx convex deploy
```

## Troubleshooting

- **"Server Error" in production**: Convex not deployed yet
- **Build succeeds but app fails**: Check NEXT_PUBLIC_CONVEX_URL matches production
- **GitHub Action fails**: Verify CONVEX_DEPLOY_KEY secret is set correctly