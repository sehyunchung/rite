import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { ConvexAdapter } from './convex-adapter';
import { convex } from './convex';
import { api } from '@rite/backend/convex/_generated/api';
import { Id } from '@rite/backend/convex/_generated/dataModel';

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

// Type guard for Instagram profile - more flexible
function isInstagramProfile(profile: unknown): profile is InstagramProfile {
	return (
		typeof profile === 'object' &&
		profile !== null &&
		'sub' in profile &&
		typeof (profile as any).sub === 'string'
	);
}

// Create providers array with fallback handling
const providers = [];
if (
	process.env.INSTAGRAM_OAUTH_PROXY_URL &&
	process.env.INSTAGRAM_CLIENT_ID &&
	process.env.INSTAGRAM_CLIENT_SECRET
) {
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
			// Add mobile-specific OAuth configuration
			response_mode: 'query',
			use_pkce: false,
		},
		// Override authorization URL to include mobile-friendly parameters
		authorization: {
			params: {
				display: 'web',
				platform: 'web',
				force_authentication: 'true',
			},
		},
		profile(profile: InstagramProfile) {
			const username =
				profile.username ||
				profile.preferred_username ||
				profile.instagram_user_id ||
				'unknown';
			return {
				id: profile.sub,
				name: profile.name || username,
				email: profile.email, // Leave undefined if Instagram doesn't provide email
				image: profile.picture,
				username: username,
				accountType: profile.account_type || 'BUSINESS',
			};
		},
		allowDangerousEmailAccountLinking: true,
	};
	providers.push(instagramProvider);
} else {
	console.warn('Instagram OAuth configuration not found. Instagram login will be disabled.');
}

// Add Google provider if configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
	providers.push(
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			allowDangerousEmailAccountLinking: true,
		})
	);
} else {
	console.warn('Google OAuth configuration not found. Google login will be disabled.');
}

// Add Apple provider if configured (commented out for future use)
// if (process.env.APPLE_ID && process.env.APPLE_SECRET) {
//   providers.push(
//     Apple({
//       clientId: process.env.APPLE_ID,
//       clientSecret: process.env.APPLE_SECRET,
//       allowDangerousEmailAccountLinking: true,
//     })
//   )
// } else {
//   console.warn('Apple OAuth configuration not found. Apple login will be disabled.')
// }

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: convex ? ConvexAdapter(convex) : undefined,
	secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
	providers,
	session: {
		strategy: 'jwt',
	},
	callbacks: {
		async jwt({ token, user }) {
			// When user signs in, add their ID to the token
			if (user) {
				token.userId = user.id;
			}
			return token;
		},
		async session({ session, token }) {
			if (session?.user && token?.userId) {
				session.user.id = token.userId as string;
			}
			return session;
		},
		async signIn({ user, account, profile }) {
			// Auto-connect Instagram on sign in
			if (
				convex &&
				account?.provider === 'instagram' &&
				profile &&
				user.id &&
				isInstagramProfile(profile)
			) {
				try {
					const username =
						profile.username ||
						profile.preferred_username ||
						profile.instagram_user_id ||
						'unknown';
					await convex.mutation(api.instagram.saveConnectionFromAuth, {
						userId: user.id as Id<'users'>,
						instagramUserId: profile.sub,
						username: username,
						accessToken: account.access_token || '',
						accountType: profile.account_type || 'BUSINESS',
						profilePictureUrl: profile.picture,
						displayName: profile.name,
					});
					console.log('✅ Instagram connected for user:', user.id);
				} catch (error) {
					console.error('❌ Failed to connect Instagram:', error);
				}
			}

			return true;
		},
	},
	pages: {
		signIn: '/en/auth/signin', // Use localized path for consistency
		error: '/en/auth/error', // Use localized path for consistency
	},
	experimental: {
		enableWebAuthn: false,
	},
});
