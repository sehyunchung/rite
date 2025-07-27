import NextAuth from 'next-auth'
import type { Provider } from 'next-auth/providers'
import { ConvexAdapter } from './convex-adapter'
import { convex } from './convex'
import { api } from '@rite/backend/convex/_generated/api'

// Instagram profile type from our OAuth proxy
interface InstagramProfile {
  sub: string
  username: string
  email?: string
  profile_picture_url?: string
  account_type: 'BUSINESS' | 'CREATOR'
}

// Create providers array with fallback handling
const providers: Provider[] = []
if (process.env.INSTAGRAM_OAUTH_PROXY_URL && process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET) {
  providers.push({
    id: 'instagram',
    name: 'Instagram',
    type: 'oidc' as const,
    issuer: process.env.INSTAGRAM_OAUTH_PROXY_URL,
    wellKnown: `${process.env.INSTAGRAM_OAUTH_PROXY_URL}/.well-known/openid-configuration`,
    clientId: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    checks: ['state'] as const,
    client: {
      id_token_signed_response_alg: 'none',
      token_endpoint_auth_method: 'client_secret_post',
    },
    profile(profile: InstagramProfile) {
      return {
        id: profile.sub,
        name: profile.username,
        email: profile.email || `${profile.username}@instagram.local`,
        image: profile.profile_picture_url,
        username: profile.username,
        accountType: profile.account_type,
      }
    },
    allowDangerousEmailAccountLinking: true,
  })
} else {
  console.warn('Instagram OAuth configuration not found. Instagram login will be disabled.')
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: convex ? ConvexAdapter(convex) : undefined,
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
      // Auto-connect Instagram during signup (only if convex is available)
      if (convex && account?.provider === 'instagram' && profile && user.email) {
        try {
          // Find user by email instead of relying on NextAuth ID
          const convexUser = await convex.query(api.auth.getUserByEmail, { 
            email: user.email 
          });
          
          if (convexUser) {
            // Save Instagram connection data using Convex user ID
            const instagramProfile = profile as unknown as InstagramProfile
            await convex.mutation(api.instagram.saveConnectionFromAuth, {
              userId: convexUser._id,
              instagramUserId: instagramProfile.sub,
              username: instagramProfile.username,
              accessToken: account.access_token || '',
              accountType: instagramProfile.account_type,
            })
            
            console.log('✅ Instagram auto-connected for user:', user.email)
          } else {
            console.warn('⚠️ User not found by email:', user.email)
          }
        } catch (error) {
          console.error('❌ Failed to auto-connect Instagram:', error)
          // Don't block signin if Instagram connection fails
        }
      }
      
      return true
    },
    async session({ session, user, token }) {
      if (session?.user) {
        // Use user.id for database sessions, token.sub for JWT sessions
        session.user.id = user?.id || token?.sub || ''
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    // Use JWT when no adapter is available, database when Convex is connected
    strategy: convex ? 'database' : 'jwt',
  },
  experimental: {
    enableWebAuthn: false,
  },
})