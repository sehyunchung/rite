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
  picture?: string
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
        email: profile.email, // Leave undefined if Instagram doesn't provide email
        image: profile.picture,
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

      // Auto-connect Instagram with retry logic
      if (convex && account?.provider === 'instagram' && profile && user.id && isInstagramProfile(profile)) {
        // Don't await this - let it run in background to not block signin
        setTimeout(async () => {
          try {
            // Retry a few times to wait for adapter to create user
            let convexUser = null
            for (let i = 0; i < 5; i++) {
              convexUser = await convex!.query(api.auth.getUserByNextAuthId, { nextAuthId: user.id! })
              if (convexUser) break
              await new Promise(resolve => setTimeout(resolve, 200 * (i + 1))) // Exponential backoff
            }
            
            if (convexUser) {
              const username = profile.username || profile.preferred_username || profile.instagram_user_id || 'unknown'
              await convex!.mutation(api.instagram.saveConnectionFromAuth, {
                userId: convexUser._id,
                instagramUserId: profile.sub,
                username: username,
                accessToken: account.access_token || '',
                accountType: profile.account_type || 'BUSINESS',
                profilePictureUrl: profile.picture,
                displayName: profile.name,
              })
              
              console.log('✅ Instagram auto-connected (delayed) for user:', convexUser._id)
            } else {
              console.warn('⚠️ Failed to find Convex user after retries for NextAuth ID:', user.id)
            }
          } catch (error) {
            console.error('❌ Failed to auto-connect Instagram (delayed):', error)
          }
        }, 0)
        
        console.log('📝 Instagram auto-connection scheduled for NextAuth ID:', user.id)
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