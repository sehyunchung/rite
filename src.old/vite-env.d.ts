/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL: string
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  readonly VITE_CLERK_FRONTEND_API_URL: string
  readonly VITE_INSTAGRAM_OAUTH_PROXY_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
