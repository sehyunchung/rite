import { Hono } from 'hono';
import { cors } from 'hono/cors';

interface Env {
	INSTAGRAM_CLIENT_ID: string;
	INSTAGRAM_CLIENT_SECRET: string;
	RITE_APP_URL: string;
}

interface InstagramTokenResponse {
	access_token: string;
	user_id: number;
}

interface InstagramUserResponse {
	id: string;
	username: string;
	account_type?: string;
	media_count?: number;
	name?: string;
	profile_picture_url?: string;
}

const app = new Hono<{ Bindings: Env }>();

// Enhanced logging utility
function logRequest(endpoint: string, details: any) {
	const timestamp = new Date().toISOString();
	console.log(`[${timestamp}] ${endpoint}:`, JSON.stringify(details, null, 2));
}

// Enable CORS for NextAuth and mobile browsers
app.use(
	'*',
	cors({
		origin: [
			'https://clerk.com',
			'https://*.clerk.accounts.dev',
			'https://*.accounts.dev',
			'https://rite.party',
			'https://*.rite.party',
			'http://localhost:*',
		],
		allowHeaders: ['Authorization', 'Content-Type', 'User-Agent', 'X-Requested-With'],
		allowMethods: ['GET', 'POST', 'OPTIONS'],
		credentials: true,
	})
);

// Health check endpoint
app.get('/', (c) => {
	return c.json({
		service: 'Rite Instagram OAuth Proxy',
		status: 'healthy',
		version: '2.0.0',
		api: 'Instagram API with Instagram Login',
		requirements: 'Business or Creator account required',
	});
});

// OIDC Discovery endpoint (required by Clerk)
app.get('/.well-known/openid-configuration', (c) => {
	const baseUrl = new URL(c.req.url).origin;

	return c.json({
		issuer: baseUrl,
		authorization_endpoint: `${baseUrl}/oauth/authorize`,
		token_endpoint: `${baseUrl}/oauth/token`,
		userinfo_endpoint: `${baseUrl}/oauth/userinfo`,
		jwks_uri: `${baseUrl}/.well-known/jwks.json`,
		response_types_supported: ['code'],
		subject_types_supported: ['public'],
		id_token_signing_alg_values_supported: ['RS256'],
		scopes_supported: ['openid', 'profile'],
		claims_supported: ['sub', 'name', 'preferred_username', 'picture'],
	});
});

// OAuth authorization endpoint
app.get('/oauth/authorize', (c) => {
	const clientId = c.env.INSTAGRAM_CLIENT_ID;
	const redirectUri = `${new URL(c.req.url).origin}/oauth/callback`;
	const state = c.req.query('state') || '';
	const clerkRedirectUri = c.req.query('redirect_uri') || '';

	// Detect mobile user agent
	const userAgent = c.req.header('User-Agent') || '';
	const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		userAgent
	);

	// Store Clerk's redirect URI and mobile info in state for later use
	const stateData = {
		originalState: state,
		clerkRedirectUri: clerkRedirectUri,
		isMobile: isMobile,
	};
	const encodedState = btoa(JSON.stringify(stateData));

	// Enhanced logging for authorization
	logRequest('OAUTH_AUTHORIZE', {
		userAgent: userAgent,
		isMobile: isMobile,
		hasState: !!state,
		hasClerkRedirect: !!clerkRedirectUri,
		clientId: clientId ? 'present' : 'missing',
		redirectUri: redirectUri,
	});

	// Redirect to Instagram OAuth with mobile web forcing parameters
	const instagramAuthUrl = new URL('https://api.instagram.com/oauth/authorize');
	instagramAuthUrl.searchParams.set('client_id', clientId);
	instagramAuthUrl.searchParams.set('redirect_uri', redirectUri);
	// New scopes for Instagram API with Instagram Login
	instagramAuthUrl.searchParams.set(
		'scope',
		'instagram_business_basic,instagram_business_content_publish'
	);
	instagramAuthUrl.searchParams.set('response_type', 'code');
	instagramAuthUrl.searchParams.set('state', encodedState);

	// Force web browser display on mobile devices
	// These parameters help prevent mobile app redirects
	if (isMobile) {
		instagramAuthUrl.searchParams.set('display', 'web');
		instagramAuthUrl.searchParams.set('force_authentication', 'true');
		instagramAuthUrl.searchParams.set('force_classic_login', 'true');
		// Add mobile-specific parameters to force web browser
		instagramAuthUrl.searchParams.set('platform', 'web');
		instagramAuthUrl.searchParams.set('device', 'desktop');

		logRequest('MOBILE_PARAMS_ADDED', {
			display: 'web',
			force_authentication: 'true',
			force_classic_login: 'true',
			platform: 'web',
			device: 'desktop',
		});
	}

	logRequest('INSTAGRAM_REDIRECT', {
		finalUrl: instagramAuthUrl.toString(),
		mobileParamsAdded: isMobile,
	});

	return c.redirect(instagramAuthUrl.toString());
});

// OAuth callback endpoint
app.get('/oauth/callback', async (c) => {
	const code = c.req.query('code');
	const encodedState = c.req.query('state') || '';
	const error = c.req.query('error');
	const errorDescription = c.req.query('error_description');

	logRequest('OAUTH_CALLBACK', {
		hasCode: !!code,
		hasState: !!encodedState,
		hasError: !!error,
		error: error,
		errorDescription: errorDescription,
		userAgent: c.req.header('User-Agent') || '',
	});

	if (error) {
		logRequest('OAUTH_ERROR', {
			error: error,
			errorDescription: errorDescription,
			encodedState: encodedState,
		});
		return c.json(
			{
				error: error,
				error_description: errorDescription || 'Instagram OAuth authorization failed',
			},
			400
		);
	}

	if (!code) {
		logRequest('MISSING_CODE', { encodedState: encodedState });
		return c.json({ error: 'Authorization code not provided' }, 400);
	}

	try {
		// Decode state to get Clerk's redirect URI
		let stateData: { originalState: string; clerkRedirectUri: string; isMobile?: boolean };
		try {
			stateData = JSON.parse(atob(encodedState));
			logRequest('STATE_DECODED', {
				hasClerkRedirect: !!stateData.clerkRedirectUri,
				isMobile: stateData.isMobile,
				hasOriginalState: !!stateData.originalState,
			});
		} catch (error) {
			logRequest('STATE_DECODE_ERROR', {
				error: error instanceof Error ? error.message : String(error),
				encodedState: encodedState,
			});
			// Fallback for old state format
			stateData = { originalState: encodedState, clerkRedirectUri: '' };
		}

		// If we have a Clerk redirect URI, redirect back to Clerk with the code
		if (stateData.clerkRedirectUri) {
			const clerkCallbackUrl = new URL(stateData.clerkRedirectUri);
			clerkCallbackUrl.searchParams.set('code', code);
			clerkCallbackUrl.searchParams.set('state', stateData.originalState);

			logRequest('REDIRECTING_TO_NEXTAUTH', {
				isMobile: stateData.isMobile,
				clerkCallbackUrl: clerkCallbackUrl.toString(),
				codeLength: code.length,
			});

			return c.redirect(clerkCallbackUrl.toString());
		}

		// Otherwise, handle the old flow (for backward compatibility)
		const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				client_id: c.env.INSTAGRAM_CLIENT_ID,
				client_secret: c.env.INSTAGRAM_CLIENT_SECRET,
				grant_type: 'authorization_code',
				redirect_uri: `${new URL(c.req.url).origin}/oauth/callback`,
				code: code,
			}),
		});

		if (!tokenResponse.ok) {
			throw new Error(`Token exchange failed: ${tokenResponse.statusText}`);
		}

		const tokenData: InstagramTokenResponse = await tokenResponse.json();

		// Redirect to app success page (old flow)
		const redirectUrl = new URL(`${c.env.RITE_APP_URL}/auth/instagram/success`);
		redirectUrl.searchParams.set('access_token', tokenData.access_token);
		redirectUrl.searchParams.set('user_id', tokenData.user_id.toString());
		redirectUrl.searchParams.set('state', stateData.originalState);

		return c.redirect(redirectUrl.toString());
	} catch (error) {
		console.error('OAuth callback error:', error);
		return c.json({ error: 'Authentication failed' }, 500);
	}
});

// Token endpoint (for OIDC compatibility)
app.post('/oauth/token', async (c) => {
	const body = await c.req.formData();
	const code = body.get('code');
	const clientId = body.get('client_id');
	const clientSecret = body.get('client_secret');
	const grantType = body.get('grant_type');

	logRequest('TOKEN_ENDPOINT', {
		hasCode: !!code,
		hasClientId: !!clientId,
		hasClientSecret: !!clientSecret,
		grantType: grantType,
		codeLength: code ? String(code).length : 0,
	});

	if (!code) {
		logRequest('TOKEN_ERROR_MISSING_CODE', { body: Object.fromEntries(body.entries()) });
		return c.json({ error: 'invalid_request', error_description: 'Missing code parameter' }, 400);
	}

	try {
		// Exchange code for access token with Instagram
		// Always use the proxy's callback URL as redirect_uri for Instagram
		const proxyCallbackUrl = `${new URL(c.req.url).origin}/oauth/callback`;

		logRequest('INSTAGRAM_TOKEN_EXCHANGE', {
			proxyCallbackUrl: proxyCallbackUrl,
			codeUsed: String(code).substring(0, 10) + '...',
		});

		const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				client_id: c.env.INSTAGRAM_CLIENT_ID,
				client_secret: c.env.INSTAGRAM_CLIENT_SECRET,
				grant_type: 'authorization_code',
				redirect_uri: proxyCallbackUrl,
				code: code as string,
			}),
		});

		if (!tokenResponse.ok) {
			const errorText = await tokenResponse.text();
			logRequest('INSTAGRAM_TOKEN_ERROR', {
				status: tokenResponse.status,
				statusText: tokenResponse.statusText,
				errorText: errorText,
			});
			throw new Error(`Token exchange failed: ${tokenResponse.statusText}`);
		}

		const tokenData: InstagramTokenResponse = await tokenResponse.json();

		logRequest('TOKEN_RECEIVED', {
			hasAccessToken: !!tokenData.access_token,
			userId: tokenData.user_id,
			tokenPrefix: tokenData.access_token
				? tokenData.access_token.substring(0, 10) + '...'
				: 'none',
		});

		// Fetch user info immediately to include in JWT token
		const userResponse = await fetch(
			`https://graph.instagram.com/v18.0/me?fields=id,username,account_type,name,profile_picture_url&access_token=${tokenData.access_token}`
		);

		if (!userResponse.ok) {
			const errorText = await userResponse.text();
			logRequest('USER_INFO_ERROR', {
				status: userResponse.status,
				statusText: userResponse.statusText,
				errorText: errorText,
			});
			throw new Error(`User info fetch failed: ${userResponse.statusText}`);
		}

		const userData: InstagramUserResponse = await userResponse.json();

		logRequest('USER_DATA_FETCHED', {
			username: userData.username,
			accountType: userData.account_type,
			hasName: !!userData.name,
			hasProfilePicture: !!userData.profile_picture_url,
			userId: userData.id,
		});

		// Generate a simple JWT-like ID token (unsigned for simplicity)
		// In production, this should be a properly signed JWT with RS256
		const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
		const payload = btoa(
			JSON.stringify({
				iss: new URL(c.req.url).origin,
				sub: userData.id,
				aud: clientId || 'rite-app',
				exp: Math.floor(Date.now() / 1000) + 3600,
				iat: Math.floor(Date.now() / 1000),
				instagram_user_id: userData.id,
				preferred_username: userData.username,
				name: userData.name || userData.username,
				picture: userData.profile_picture_url,
				'https://rite.app/instagram_username': userData.username,
				'https://rite.app/instagram_id': userData.id,
				'https://rite.app/account_type': userData.account_type,
			})
		);
		const idToken = `${header}.${payload}.`; // Unsigned JWT

		logRequest('TOKEN_RESPONSE_GENERATED', {
			username: userData.username,
			accountType: userData.account_type,
			tokenGenerated: true,
		});

		// Return OIDC-compatible token response
		return c.json({
			access_token: tokenData.access_token,
			token_type: 'Bearer',
			expires_in: 3600,
			id_token: idToken,
			scope: 'openid profile',
		});
	} catch (error) {
		logRequest('TOKEN_ENDPOINT_ERROR', {
			errorMessage: error instanceof Error ? error.message : String(error),
			errorStack: error instanceof Error ? error.stack : undefined,
		});
		return c.json(
			{
				error: 'invalid_grant',
				error_description: error instanceof Error ? error.message : 'Token exchange failed',
			},
			400
		);
	}
});

// User info endpoint (for OIDC compatibility)
app.get('/oauth/userinfo', async (c) => {
	const authorization = c.req.header('Authorization');

	logRequest('USERINFO_ENDPOINT', {
		hasAuth: !!authorization,
		isBearerToken: authorization ? authorization.startsWith('Bearer ') : false,
		tokenLength: authorization ? authorization.replace('Bearer ', '').length : 0,
	});

	if (!authorization || !authorization.startsWith('Bearer ')) {
		logRequest('USERINFO_NO_AUTH', { authorization: authorization });
		return c.json({ error: 'invalid_token' }, 401);
	}

	const accessToken = authorization.replace('Bearer ', '');

	try {
		// Fetch user info from Instagram (using new API endpoint)
		const userResponse = await fetch(
			`https://graph.instagram.com/v18.0/me?fields=id,username,account_type,name,profile_picture_url&access_token=${accessToken}`
		);

		if (!userResponse.ok) {
			const errorText = await userResponse.text();
			logRequest('USERINFO_FETCH_ERROR', {
				status: userResponse.status,
				statusText: userResponse.statusText,
				errorText: errorText,
				tokenPrefix: accessToken.substring(0, 10) + '...',
			});
			throw new Error(`User info fetch failed: ${userResponse.statusText}`);
		}

		const userData: InstagramUserResponse = await userResponse.json();

		logRequest('USERINFO_SUCCESS', {
			username: userData.username,
			accountType: userData.account_type,
			hasName: !!userData.name,
			hasProfilePicture: !!userData.profile_picture_url,
			userId: userData.id,
		});

		// Transform to OIDC claims format
		return c.json({
			sub: userData.id,
			name: userData.name || userData.username,
			preferred_username: userData.username,
			picture: userData.profile_picture_url || `https://instagram.com/${userData.username}`,
			// Note: Instagram doesn't provide email, so we'll handle this in the app
			'https://rite.app/instagram_username': userData.username,
			'https://rite.app/instagram_id': userData.id,
			'https://rite.app/account_type': userData.account_type,
		});
	} catch (error) {
		logRequest('USERINFO_ERROR', {
			errorMessage: error instanceof Error ? error.message : String(error),
			tokenPrefix: accessToken.substring(0, 10) + '...',
		});
		return c.json({ error: 'invalid_token' }, 401);
	}
});

// JWKS endpoint (minimal implementation for OIDC compatibility)
app.get('/.well-known/jwks.json', (c) => {
	return c.json({
		keys: [
			{
				kty: 'RSA',
				use: 'sig',
				kid: 'instagram-proxy-key',
				alg: 'RS256',
				// This is a placeholder - in production you'd use proper JWT signing
				n: 'placeholder',
				e: 'AQAB',
			},
		],
	});
});

export default app;
