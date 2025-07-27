import { SvelteKitAuth } from "@auth/sveltekit";
import type { Provider } from "@auth/core/providers";
import { env } from "$env/dynamic/private";


// Instagram profile type from our OAuth proxy
interface InstagramProfile {
  sub: string;
  username?: string;
  preferred_username?: string;
  email?: string;
  picture?: string;
  profile_picture_url?: string;
  account_type?: 'BUSINESS' | 'CREATOR';
  instagram_user_id?: string;
  name?: string;
}

// Type guard for Instagram profile
function isInstagramProfile(profile: unknown): profile is InstagramProfile {
  return (
    typeof profile === 'object' &&
    profile !== null &&
    'sub' in profile &&
    typeof (profile as any).sub === 'string'
  );
}

// Create providers array with fallback handling
const providers: Provider[] = [];

if (env.INSTAGRAM_OAUTH_PROXY_URL && env.INSTAGRAM_CLIENT_ID && env.INSTAGRAM_CLIENT_SECRET) {
  const instagramProvider: Provider = {
    id: 'instagram',
    name: 'Instagram',
    type: 'oidc',
    issuer: env.INSTAGRAM_OAUTH_PROXY_URL,
    wellKnown: `${env.INSTAGRAM_OAUTH_PROXY_URL}/.well-known/openid-configuration`,
    clientId: env.INSTAGRAM_CLIENT_ID,
    clientSecret: env.INSTAGRAM_CLIENT_SECRET,
    checks: ['state'],
    client: {
      id_token_signed_response_alg: 'none',
      token_endpoint_auth_method: 'client_secret_post',
    },
    profile(profile: InstagramProfile) {
      const username = profile.username || profile.preferred_username || profile.instagram_user_id || 'unknown';
      return {
        id: profile.sub,
        name: profile.name || username,
        email: profile.email,
        image: profile.picture,
        username: username,
        accountType: profile.account_type || 'BUSINESS',
      };
    },
    allowDangerousEmailAccountLinking: true,
  } as Provider;
  
  providers.push(instagramProvider);
} else {
  console.warn('Instagram OAuth configuration not found. Instagram login will be disabled.');
}

export const { handle, signIn, signOut } = SvelteKitAuth({
  secret: env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
      // Debug Instagram profile data
      if (account?.provider === 'instagram') {
        console.log('🔍 Instagram signin attempt:', {
          userEmail: user.email,
          userId: user.id,
          profileData: profile,
          signInStep: 'callback-after-user-creation'
        });
      }

      // Note: SvelteKit auth doesn't have the same Convex integration as Next.js
      // We'll need to handle Instagram connection separately in the application
      
      return true;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token?.sub || '';
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt', // Using JWT for SvelteKit simplicity
  },
});