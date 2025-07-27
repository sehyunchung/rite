import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			// Workers-specific configuration
			routes: {
				include: ['/*'],
				exclude: ['<all>']
			},
			// Enable Workers mode
			platformProxy: {
				configPath: 'wrangler.toml',
				environment: undefined,
				experimentalJsonConfig: false,
				persist: false
			}
		}),
		alias: {
			'@rite/backend': '../../packages/backend'
		}
	}
};

export default config;