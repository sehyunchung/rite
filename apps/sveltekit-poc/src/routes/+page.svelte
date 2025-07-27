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
		<li>✅ Test Convex integration with shared backend</li>
		<li>✅ Real-time data updates and reactivity</li>
		<li>🔄 Compare build times and bundle sizes</li>
		<li>🔄 Evaluate developer experience</li>
	</ul>
</div>

<div class="demo-section">
	<h2>🚀 Interactive Demos</h2>
	<div class="demo-cards">
		<a href="/convex-demo" class="demo-card">
			<h3>🔌 Convex Integration</h3>
			<p>Test connection to shared Convex backend</p>
		</a>
		<a href="/real-time-demo" class="demo-card">
			<h3>⚡ Real-time Updates</h3>
			<p>See live data updates from the database</p>
		</a>
		<a href="/dashboard" class="demo-card">
			<h3>📊 Dashboard</h3>
			<p>Event creation and management interface</p>
		</a>
		<a href="/dj-submission" class="demo-card">
			<h3>🎧 DJ Submission</h3>
			<p>DJ submission form with token validation</p>
		</a>
		<a href="/file-upload-demo" class="demo-card">
			<h3>📁 File Upload</h3>
			<p>Drag-and-drop file upload with Convex integration</p>
		</a>
		<a href="/performance-comparison" class="demo-card">
			<h3>⚡ Performance Analysis</h3>
			<p>Comprehensive benchmarks vs Next.js</p>
		</a>
	</div>
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
	
	.demo-section {
		margin: 3rem 0;
	}
	
	.demo-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-top: 1rem;
	}
	
	.demo-card {
		background: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		text-decoration: none;
		color: inherit;
		transition: transform 0.2s, box-shadow 0.2s;
		border: 2px solid transparent;
	}
	
	.demo-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		border-color: #3b82f6;
	}
	
	.demo-card h3 {
		margin: 0 0 0.5rem 0;
		color: #1e293b;
	}
	
	.demo-card p {
		margin: 0;
		color: #64748b;
	}
	
	@media (max-width: 768px) {
		.comparison {
			grid-template-columns: 1fr;
		}
		
		.demo-cards {
			grid-template-columns: 1fr;
		}
	}
</style>