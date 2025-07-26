# Next.js 15 Migration Guide

## ✅ Migration Complete

The Rite DJ event management platform has been successfully migrated from Vite + TanStack Router to **Next.js 15 with App Router**.

### 🎯 Key Achievement: **Automatic Instagram Connection**

Users who sign up with Instagram OAuth will now have their Instagram account **automatically connected** without any additional steps!

## 🚀 Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the example environment file:
```bash
cp .env.local.example .env.local
```

Update `.env.local` with your actual values:
- `CONVEX_URL` - Your Convex deployment URL
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- Instagram OAuth credentials (same as before)

### 3. Update Convex Schema
The database schema has been updated to support NextAuth.js. Run:
```bash
npm run dev:backend
```
This will apply the new schema changes.

**Note**: The Convex adapter for NextAuth is manually implemented (not an npm package). The adapter code is included in `app/lib/convex-adapter.ts` and corresponding Convex functions in `convex/auth.ts`.

### 4. Start Development
```bash
npm run dev
```

## 🔧 What Changed

### ✅ **New Architecture**
- **Frontend**: Next.js 15 App Router
- **Authentication**: NextAuth.js with Convex adapter  
- **Instagram OAuth**: Automatic connection during signup
- **Server Actions**: Replace complex webhook flows

### ✅ **Instagram Auto-Connection Flow**
1. User clicks "Continue with Instagram" 
2. NextAuth handles OAuth with Instagram proxy
3. **Server automatically saves Instagram connection**
4. User lands on dashboard with Instagram already connected
5. ✨ **No separate connection step needed!**

### ✅ **Files Structure**
```
app/
├── layout.tsx              # Root layout
├── page.tsx               # Landing page  
├── globals.css            # Tailwind styles
├── api/auth/[...nextauth]/ # NextAuth API routes
├── auth/signin/           # Sign-in page
├── dashboard/             # Dashboard page
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   └── convex.ts         # Convex client
└── providers/            # React providers
```

## 🎉 Testing the Instagram Auto-Connection

### 1. **Start the application**
```bash
npm run dev
```

### 2. **Test the flow**
1. Go to `http://localhost:3000`
2. Click "Get Started" or "Sign In"
3. Click "Continue with Instagram"
4. Complete Instagram OAuth (requires Business/Creator account)
5. **You should land on dashboard with Instagram already connected!**

### 3. **Verify in dashboard**
Look for the green success banner:
> ✅ Instagram Connected Successfully! 🎉
> Your Instagram account was automatically connected during signup.

## 🔧 Key Configuration

### NextAuth Instagram Provider
The Instagram provider in `app/lib/auth.ts` handles:
- OAuth flow via your existing Cloudflare proxy
- **Automatic connection saving** in `signIn` callback
- User creation and session management

### Server Actions
- **No webhooks needed** - Instagram connection happens synchronously
- **Better error handling** - Users get immediate feedback
- **Type-safe** - Full TypeScript integration

## 🚨 Migration Notes

### Database Changes
- Added NextAuth tables: `accounts`, `sessions`, `verificationTokens`
- Updated `users` table with NextAuth support
- **Backward compatible** with existing Clerk data

### Environment Variables
- New: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- Same: Instagram OAuth proxy configuration
- Same: Convex configuration

## 🎯 Benefits Achieved

1. **✅ Automatic Instagram Connection** - Main goal achieved!
2. **✅ Better Error Handling** - Server actions provide immediate feedback
3. **✅ Simplified Architecture** - No complex webhook setup needed  
4. **✅ Type Safety** - Full TypeScript integration
5. **✅ Modern Stack** - Next.js 15, App Router, Server Actions
6. **✅ Korean Optimization** - Vercel's Asia-Pacific performance

## 🔄 Rollback Plan (if needed)

The old Vite setup is preserved in the `src/` directory. To rollback:
1. Restore old `package.json`
2. Remove `app/` directory  
3. Restore Vite configuration files

However, the **automatic Instagram connection** feature will only work with the Next.js setup.

---

**🎉 The migration is complete! Users can now sign up with Instagram and have their account automatically connected without any additional steps.**