import NextAuth from 'next-auth'
import { ConvexAdapter } from './convex-adapter'
import { convex } from './convex'
import { api } from '@rite/backend/convex/_generated/api'

// Instagram profile type from our OAuth proxy
interface InstagramProfile {
  sub: string
  username?: string
  preferred_username?: string
  email?: string
  profile_picture_url?: string
  account_type?: 'BUSINESS' | 'CREATOR'
  instagram_user_id?: string
  name?: string
}

// Type guard for Instagram profile - more flexible
function isInstagramProfile(profile: unknown): profile is InstagramProfile {
  return (
    typeof profile === 'object' &&
    profile !== null &&
    'sub' in profile &&
    typeof (profile as any).sub === 'string'
  )
}

// Create providers array with fallback handling
const providers = []
if (process.env.INSTAGRAM_OAUTH_PROXY_URL && process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET) {
  const instagramProvider = {
    id: 'instagram',
    name: 'Instagram',
    type: 'oidc' as const,
    issuer: process.env.INSTAGRAM_OAUTH_PROXY_URL,
    wellKnown: `${process.env.INSTAGRAM_OAUTH_PROXY_URL}/.well-known/openid-configuration`,
    clientId: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    checks: ['state' as const],
    client: {
      id_token_signed_response_alg: 'none',
      token_endpoint_auth_method: 'client_secret_post',
    },
    profile(profile: InstagramProfile) {
      const username = profile.username || profile.preferred_username || profile.instagram_user_id || 'unknown'
      return {
        id: profile.sub,
        name: profile.name || username,
        email: profile.email || `${username}@instagram.local`,
        image: profile.profile_picture_url,
        username: username,
        accountType: profile.account_type || 'BUSINESS',
      }
    },
    allowDangerousEmailAccountLinking: true,
  }
  providers.push(instagramProvider)
} else {
  console.warn('Instagram OAuth configuration not found. Instagram login will be disabled.')
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: convex ? ConvexAdapter(convex) : undefined,
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
      // Debug Instagram profile data
      if (account?.provider === 'instagram') {
        console.log('🔍 Instagram signin attempt:', {
          userEmail: user.email,
          userId: user.id,
          profileData: profile,
          convexAvailable: !!convex,
          signInStep: 'callback-after-user-creation'
        })
      }

      // Auto-connect Instagram during signup (only if convex is available)
      if (convex && account?.provider === 'instagram' && profile && user.email) {
        try {
          // Add timeout for Convex queries to prevent hanging
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Convex query timeout')), 5000)
          })
          
          // Find user by email instead of relying on NextAuth ID
          const convexUser = await Promise.race([
            convex.query(api.auth.getUserByEmail, { email: user.email }),
            timeoutPromise
          ]) as any;
          
          if (convexUser) {
            if (isInstagramProfile(profile)) {
              const username = profile.username || profile.preferred_username || profile.instagram_user_id || 'unknown'
              // Save Instagram connection data using Convex user ID
              await Promise.race([
                convex.mutation(api.instagram.saveConnectionFromAuth, {
                  userId: convexUser._id,
                  instagramUserId: profile.sub,
                  username: username,
                  accessToken: account.access_token || '',
                  accountType: profile.account_type || 'BUSINESS',
                }),
                timeoutPromise
              ])
              
              console.log('✅ Instagram auto-connected for user:', user.email)
            } else {
              console.warn('⚠️ Invalid Instagram profile format:', profile)
            }
          } else {
            console.warn('⚠️ User not found by email:', user.email, '- this is normal for new users, they should be created by the adapter')
          }
        } catch (error) {
          console.error('❌ Failed to auto-connect Instagram:', error)
          // Don't block signin if Instagram connection fails
        }
      } else if (account?.provider === 'instagram') {
        console.warn('⚠️ Instagram signin skipped:', {
          convex: !!convex,
          profile: !!profile, 
          userEmail: user.email
        })
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