#!/bin/bash
# Build and deploy script for Cloudflare Pages

echo "Building SvelteKit app..."
pnpm run build

echo "Deploying to Cloudflare..."
npx wrangler versions upload .svelte-kit/cloudflare/_worker.js --assets .svelte-kit/cloudflare