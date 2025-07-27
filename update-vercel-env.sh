#!/bin/bash

# Remove old Vite/Clerk environment variables
echo "Removing old environment variables..."
vercel env rm VITE_CONVEX_URL production --yes
vercel env rm VITE_CLERK_PUBLISHABLE_KEY production --yes
vercel env rm VITE_CLERK_PUBLISHABLE_KEY preview --yes
vercel env rm VITE_CLERK_PUBLISHABLE_KEY development --yes
vercel env rm VITE_CLERK_FRONTEND_API_URL production --yes
vercel env rm VITE_CLERK_FRONTEND_API_URL preview --yes
vercel env rm VITE_CLERK_FRONTEND_API_URL development --yes
vercel env rm CLERK_SECRET_KEY production --yes
vercel env rm CLERK_SECRET_KEY preview --yes
vercel env rm CLERK_SECRET_KEY development --yes
vercel env rm VITE_INSTAGRAM_CLIENT_ID production --yes
vercel env rm VITE_INSTAGRAM_CLIENT_ID preview --yes
vercel env rm VITE_INSTAGRAM_CLIENT_ID development --yes
vercel env rm VITE_INSTAGRAM_OAUTH_PROXY_URL production --yes
vercel env rm VITE_INSTAGRAM_OAUTH_PROXY_URL preview --yes
vercel env rm VITE_INSTAGRAM_OAUTH_PROXY_URL development --yes

echo ""
echo "Now you need to add the new environment variables manually."
echo "Run the following commands and enter the values when prompted:"
echo ""
echo "# Add NEXT_PUBLIC_CONVEX_URL (get from Convex dashboard)"
echo "vercel env add NEXT_PUBLIC_CONVEX_URL production"
echo ""
echo "# Add CONVEX_DEPLOY_KEY (get from Convex dashboard)"
echo "vercel env add CONVEX_DEPLOY_KEY production"
echo ""
echo "# Add NEXTAUTH_URL"
echo "vercel env add NEXTAUTH_URL production"
echo "# Enter: https://rite.party (or your production domain)"
echo ""
echo "# Add NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
echo "vercel env add NEXTAUTH_SECRET production"
echo ""
echo "# Add INSTAGRAM_CLIENT_ID (from Instagram app)"
echo "vercel env add INSTAGRAM_CLIENT_ID production"
echo ""
echo "# Add INSTAGRAM_CLIENT_SECRET (from Instagram app)"
echo "vercel env add INSTAGRAM_CLIENT_SECRET production"
echo ""
echo "# Add INSTAGRAM_OAUTH_PROXY_URL"
echo "vercel env add INSTAGRAM_OAUTH_PROXY_URL production"
echo "# Enter: https://rite-instagram-oauth-proxy.sehyunchung.workers.dev"