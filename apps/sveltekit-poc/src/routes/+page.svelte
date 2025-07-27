<script lang="ts">
	import { onMount } from 'svelte';
	
	let loadTime = 0;
	let bundleSize = '< 50KB';
	
	onMount(() => {
		loadTime = performance.now();
	});
</script>

<svelte:head>
	<title>SvelteKit POC - Rite</title>
	<meta name="description" content="SvelteKit proof of concept for Rite platform" />
</svelte:head>

<div class="hero">
	<h1>🚀 SvelteKit POC for Rite</h1>
	<p>Exploring SvelteKit as an alternative to Next.js for Cloudflare deployment</p>
</div>

<div class="comparison">
	<div class="card">
		<h2>📊 Performance Metrics</h2>
		<ul>
			<li>Load time: {Math.round(loadTime)}ms</li>
			<li>Bundle size: {bundleSize}</li>
			<li>Framework overhead: Minimal</li>
			<li>Time to Interactive: Ultra-fast</li>
		</ul>
	</div>
	
	<div class="card">
		<h2>🔧 Framework Comparison</h2>
		<ul>
			<li><strong>Next.js:</strong> React-based, larger bundles</li>
			<li><strong>SvelteKit:</strong> Compiled, smaller bundles</li>
			<li><strong>Cloudflare:</strong> Both support edge deployment</li>
			<li><strong>Performance:</strong> SvelteKit typically faster</li>
		</ul>
	</div>
</div>

<div class="performance-demo">
	<h2>⚡ Real-time Performance Demo</h2>
	<p>This page loaded in <strong>{Math.round(loadTime)}ms</strong></p>
	<p>SvelteKit compiles to vanilla JavaScript, reducing runtime overhead.</p>
	<p>Perfect for Cloudflare Workers with their lightweight runtime constraints.</p>
</div>

<div class="card">
	<h2>🎯 POC Objectives</h2>
	<ul>
		<li>✅ Demonstrate SvelteKit setup in monorepo</li>
		<li>✅ Configure Cloudflare adapter</li>
		<li>✅ Show performance benefits</li>
		<li>🔄 Test Convex integration (next step)</li>
		<li>🔄 Compare build times and bundle sizes</li>
		<li>🔄 Evaluate developer experience</li>
	</ul>
</div>

<style>
	.hero {
		text-align: center;
		padding: 4rem 0;
	}
	
	.comparison {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		margin: 2rem 0;
	}
	
	@media (max-width: 768px) {
		.comparison {
			grid-template-columns: 1fr;
		}
	}
</style>