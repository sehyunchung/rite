// Placeholder worker for Cloudflare Pages deployment
// This file exists to satisfy wrangler versions upload before build
// The actual worker will be at .svelte-kit/cloudflare/_worker.js after build

export default {
  async fetch(request, env, ctx) {
    return new Response('Build not complete. Please run build command first.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};