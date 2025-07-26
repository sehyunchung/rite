import NextAuth from 'next-auth'
import { ConvexAdapter } from './convex-adapter'
import { convex } from './convex'
import { api } from '../../convex/_generated/api'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: ConvexAdapter(convex),
  providers: [
    {
      id: 'instagram',
      name: 'Instagram',
      type: 'oidc',
      issuer: process.env.INSTAGRAM_OAUTH_PROXY_URL,
      wellKnown: `${process.env.INSTAGRAM_OAUTH_PROXY_URL}/.well-known/openid-configuration`,
      clientId: process.env.INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
      checks: ['state'],
      client: {
        id_token_signed_response_alg: 'none',
        token_endpoint_auth_method: 'client_secret_post',
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.username,
          email: profile.email || `${profile.username}@instagram.local`,
          image: profile.profile_picture_url,
          username: profile.username,
          accountType: profile.account_type,
        }
      },
    },
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Auto-connect Instagram during signup
      if (account?.provider === 'instagram' && profile && user.email) {
        try {
          // Find user by email instead of relying on NextAuth ID
          const convexUser = await convex.query(api.auth.getUserByEmail, { 
            email: user.email 
          });
          
          if (convexUser) {
            // Save Instagram connection data using Convex user ID
            await convex.mutation(api.instagram.saveConnectionFromAuth, {
              userId: convexUser._id,
              instagramUserId: (profile as any).sub,
              username: (profile as any).username || (profile as any).name,
              accessToken: account.access_token || '',
              accountType: (profile as any).account_type,
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
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'database',
  },
  experimental: {
    enableWebAuthn: false,
  },
  // Allow linking Instagram to existing email accounts
  allowDangerousEmailAccountLinking: true,
})