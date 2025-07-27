#!/bin/bash

echo "Adding NextAuth environment variables to Vercel..."
echo ""
echo "This script will guide you through adding each variable."
echo "Press Enter to continue or Ctrl+C to cancel."
read

# Generate a random NEXTAUTH_SECRET if needed
echo ""
echo "Generating a secure NEXTAUTH_SECRET..."
GENERATED_SECRET=$(openssl rand -base64 32)
echo "Generated secret: $GENERATED_SECRET"
echo ""

# Add each environment variable
echo "1. Adding NEXT_PUBLIC_CONVEX_URL..."
echo "   Get this from your Convex dashboard (https://dashboard.convex.dev)"
vercel env add NEXT_PUBLIC_CONVEX_URL production

echo ""
echo "2. Adding CONVEX_DEPLOY_KEY..."
echo "   Get this from Convex dashboard > Settings > Deploy Key"
vercel env add CONVEX_DEPLOY_KEY production

echo ""
echo "3. Adding NEXTAUTH_URL..."
echo "   For production, enter: https://rite.party (or your domain)"
echo "   For development, enter: http://localhost:3000"
vercel env add NEXTAUTH_URL production

echo ""
echo "4. Adding NEXTAUTH_SECRET..."
echo "   Use this generated secret: $GENERATED_SECRET"
echo "   (Copy and paste when prompted)"
vercel env add NEXTAUTH_SECRET production

echo ""
echo "5. Adding INSTAGRAM_CLIENT_ID..."
echo "   Get this from your Instagram app settings"
vercel env add INSTAGRAM_CLIENT_ID production

echo ""
echo "6. Adding INSTAGRAM_CLIENT_SECRET..."
echo "   Get this from your Instagram app settings"
vercel env add INSTAGRAM_CLIENT_SECRET production

echo ""
echo "7. Adding INSTAGRAM_OAUTH_PROXY_URL..."
echo "   Enter: https://rite-instagram-oauth-proxy.sehyunchung.workers.dev"
vercel env add INSTAGRAM_OAUTH_PROXY_URL production

echo ""
echo "✅ All done! Your Vercel environment variables have been updated."
echo ""
echo "To deploy with these new variables, run:"
echo "  vercel --prod"