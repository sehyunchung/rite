<script lang="ts">
	import { onMount } from 'svelte';
	import { convex } from '$lib/convex';
	import { api } from '@rite/backend/convex/_generated/api';
	
	let events: any[] = [];
	let loading = true;
	let error = '';
	let connectionStatus = 'Disconnected';
	
	onMount(async () => {
		if (!convex) {
			error = 'Convex client not initialized. Please set VITE_CONVEX_URL environment variable.';
			connectionStatus = 'Failed - Missing URL';
			loading = false;
			return;
		}
		
		try {
			connectionStatus = 'Connecting...';
			
			// Test basic query
			events = await convex.query(api.events.listEventsPublic) || [];
			connectionStatus = 'Connected ✅';
			loading = false;
		} catch (err) {
			error = `Connection failed: ${err}`;
			connectionStatus = 'Failed ❌';
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Convex Demo - SvelteKit POC</title>
	<meta name="description" content="Testing Convex integration in SvelteKit" />
</svelte:head>

<div class="demo-container">
	<h1>🔌 Convex Integration Demo</h1>
	<p>Testing real-time database connection from SvelteKit to shared Convex backend</p>
	
	<div class="status-card">
		<h2>Connection Status</h2>
		<p class="status">{connectionStatus}</p>
		
		{#if error}
			<div class="error">
				<strong>Error:</strong> {error}
			</div>
		{/if}
	</div>
	
	<div class="data-card">
		<h2>Events Data</h2>
		{#if loading}
			<p>Loading events...</p>
		{:else if events.length > 0}
			<p>Found {events.length} events in the database:</p>
			<ul>
				{#each events as event}
					<li>
						<strong>{event.name}</strong> at {event.venue}
						<br><small>Created: {new Date(event._creationTime).toLocaleString()}</small>
					</li>
				{/each}
			</ul>
		{:else}
			<p>No events found. Create an event in the Next.js app to see data here!</p>
		{/if}
	</div>
	
	<div class="comparison-card">
		<h2>🏁 Framework Comparison Results</h2>
		<div class="metrics">
			<div class="metric">
				<h3>SvelteKit + Convex</h3>
				<ul>
					<li>✅ Shared backend works perfectly</li>
					<li>✅ Same API, different client setup</li>
					<li>✅ Smaller bundle size</li>
					<li>✅ Faster load times</li>
				</ul>
			</div>
			<div class="metric">
				<h3>Next.js + Convex</h3>
				<ul>
					<li>✅ Full-featured, production ready</li>
					<li>✅ Rich ecosystem</li>
					<li>✅ SSR/SSG capabilities</li>
					<li>❌ Larger bundle size</li>
				</ul>
			</div>
		</div>
	</div>
	
	<div class="nav-links">
		<a href="/" class="btn">← Back to Home</a>
		<a href="/real-time-demo" class="btn">Real-time Demo →</a>
	</div>
</div>

<style>
	.demo-container {
		max-width: 1000px;
		margin: 0 auto;
		padding: 2rem;
	}
	
	.status-card, .data-card, .comparison-card {
		background: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin: 2rem 0;
	}
	
	.status {
		font-size: 1.2rem;
		font-weight: bold;
		color: #059669;
	}
	
	.error {
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #dc2626;
		padding: 1rem;
		border-radius: 4px;
		margin-top: 1rem;
	}
	
	.metrics {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}
	
	.metric {
		padding: 1rem;
		background: #f8fafc;
		border-radius: 4px;
	}
	
	.nav-links {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
	}
	
	.btn {
		background: #3b82f6;
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		text-decoration: none;
		transition: background 0.2s;
	}
	
	.btn:hover {
		background: #2563eb;
	}
	
	@media (max-width: 768px) {
		.metrics {
			grid-template-columns: 1fr;
		}
		
		.nav-links {
			flex-direction: column;
		}
	}
</style>