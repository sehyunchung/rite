// This file acts as a platform resolver
// The bundler will automatically choose the correct file based on the platform

// For web, it will use text.web.tsx
// For native, it will use text.native.tsx

export * from './text.web'