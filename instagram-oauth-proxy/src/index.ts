import { Hono } from 'hono'
import { cors } from 'hono/cors'

interface Env {
  INSTAGRAM_CLIENT_ID: string
  INSTAGRAM_CLIENT_SECRET: string
  RITE_APP_URL: string
}

interface InstagramTokenResponse {
  access_token: string
  user_id: number
}

interface InstagramUserResponse {
  id: string
  username: string
  account_type?: string
  media_count?: number
  name?: string
  profile_picture_url?: string
}

const app = new Hono<{ Bindings: Env }>()

// Enable CORS for Clerk
app.use('*', cors({
  origin: ['https://clerk.com', 'https://*.clerk.accounts.dev'],
  allowHeaders: ['Authorization', 'Content-Type'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
}))

// Health check endpoint
app.get('/', (c) => {
  return c.json({ 
    service: 'Rite Instagram OAuth Proxy',
    status: 'healthy',
    version: '2.0.0',
    api: 'Instagram API with Instagram Login',
    requirements: 'Business or Creator account required'
  })
})

// OIDC Discovery endpoint (required by Clerk)
app.get('/.well-known/openid-configuration', (c) => {
  const baseUrl = new URL(c.req.url).origin
  
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
    claims_supported: ['sub', 'name', 'preferred_username', 'picture']
  })
})

// OAuth authorization endpoint
app.get('/oauth/authorize', (c) => {
  const clientId = c.env.INSTAGRAM_CLIENT_ID
  const redirectUri = `${new URL(c.req.url).origin}/oauth/callback`
  const state = c.req.query('state') || ''
  
  // Redirect to Instagram OAuth
  const instagramAuthUrl = new URL('https://api.instagram.com/oauth/authorize')
  instagramAuthUrl.searchParams.set('client_id', clientId)
  instagramAuthUrl.searchParams.set('redirect_uri', redirectUri)
  // New scopes for Instagram API with Instagram Login
  instagramAuthUrl.searchParams.set('scope', 'instagram_business_basic,instagram_business_content_publish')
  instagramAuthUrl.searchParams.set('response_type', 'code')
  instagramAuthUrl.searchParams.set('state', state)
  
  return c.redirect(instagramAuthUrl.toString())
})

// OAuth callback endpoint  
app.get('/oauth/callback', async (c) => {
  const code = c.req.query('code')
  const state = c.req.query('state') || ''
  
  if (!code) {
    return c.json({ error: 'Authorization code not provided' }, 400)
  }
  
  try {
    // Exchange code for access token
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
    })
    
    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.statusText}`)
    }
    
    const tokenData: InstagramTokenResponse = await tokenResponse.json()
    
    // Store access token in a temporary way and redirect back to Clerk
    // In a real implementation, you might want to encrypt this token
    const redirectUrl = new URL(`${c.env.RITE_APP_URL}/auth/instagram/success`)
    redirectUrl.searchParams.set('access_token', tokenData.access_token)
    redirectUrl.searchParams.set('user_id', tokenData.user_id.toString())
    redirectUrl.searchParams.set('state', state)
    
    return c.redirect(redirectUrl.toString())
    
  } catch (error) {
    console.error('OAuth callback error:', error)
    return c.json({ error: 'Authentication failed' }, 500)
  }
})

// Token endpoint (for OIDC compatibility)
app.post('/oauth/token', async (c) => {
  const body = await c.req.formData()
  const code = body.get('code')
  const redirectUri = body.get('redirect_uri')
  
  if (!code) {
    return c.json({ error: 'invalid_request' }, 400)
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: c.env.INSTAGRAM_CLIENT_ID,
        client_secret: c.env.INSTAGRAM_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri as string,
        code: code as string,
      }),
    })
    
    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.statusText}`)
    }
    
    const tokenData: InstagramTokenResponse = await tokenResponse.json()
    
    // Return OIDC-compatible token response
    return c.json({
      access_token: tokenData.access_token,
      token_type: 'Bearer',
      expires_in: 3600,
      id_token: tokenData.access_token, // Using access token as ID token for simplicity
    })
    
  } catch (error) {
    console.error('Token endpoint error:', error)
    return c.json({ error: 'invalid_grant' }, 400)
  }
})

// User info endpoint (for OIDC compatibility)
app.get('/oauth/userinfo', async (c) => {
  const authorization = c.req.header('Authorization')
  
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return c.json({ error: 'invalid_token' }, 401)
  }
  
  const accessToken = authorization.replace('Bearer ', '')
  
  try {
    // Fetch user info from Instagram (using new API endpoint)
    const userResponse = await fetch(`https://graph.instagram.com/v18.0/me?fields=id,username,account_type,name,profile_picture_url&access_token=${accessToken}`)
    
    if (!userResponse.ok) {
      throw new Error(`User info fetch failed: ${userResponse.statusText}`)
    }
    
    const userData: InstagramUserResponse = await userResponse.json()
    
    // Validate account type for new API
    if (userData.account_type !== 'BUSINESS' && userData.account_type !== 'CREATOR') {
      return c.json({ 
        error: 'invalid_account_type',
        error_description: 'Instagram Business or Creator account required'
      }, 403)
    }
    
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
    })
    
  } catch (error) {
    console.error('User info error:', error)
    return c.json({ error: 'invalid_token' }, 401)
  }
})

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
        e: 'AQAB'
      }
    ]
  })
})

export default app