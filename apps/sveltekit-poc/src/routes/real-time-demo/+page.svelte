<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { convex } from '$lib/convex';
	import { api } from '@rite/backend/convex/_generated/api';
	
	let events: any[] = [];
	let timeslots: any[] = [];
	let loading = true;
	let error = '';
	let updateCount = 0;
	let lastUpdate = '';
	
	let intervalId: ReturnType<typeof setInterval>;
	
	async function fetchData() {
		if (!convex) {
			error = 'Convex not available';
			return;
		}
		
		try {
			const eventsData = await convex.query(api.events.listEventsPublic) || [];
			
			// Get timeslots for all events
			const allTimeslots = [];
			for (const event of eventsData) {
				const eventTimeslots = await convex.query(api.timeslots.getTimeslots, { eventId: event._id }) || [];
				allTimeslots.push(...eventTimeslots);
			}
			
			events = eventsData;
			timeslots = allTimeslots;
			updateCount++;
			lastUpdate = new Date().toLocaleTimeString();
			loading = false;
		} catch (err) {
			error = `Fetch failed: ${err}`;
			loading = false;
		}
	}
	
	onMount(() => {
		fetchData();
		
		// Poll for updates every 3 seconds to simulate real-time
		intervalId = setInterval(fetchData, 3000);
	});
	
	onDestroy(() => {
		if (intervalId) {
			clearInterval(intervalId);
		}
	});
</script>

<svelte:head>
	<title>Real-time Demo - SvelteKit POC</title>
	<meta name="description" content="Real-time data updates with SvelteKit and Convex" />
</svelte:head>

<div class="demo-container">
	<h1>⚡ Real-time Data Demo</h1>
	<p>This page automatically polls the Convex backend every 3 seconds</p>
	
	<div class="status-bar">
		<div class="status-item">
			<strong>Updates:</strong> {updateCount}
		</div>
		<div class="status-item">
			<strong>Last Update:</strong> {lastUpdate || 'Never'}
		</div>
		<div class="status-item {loading ? 'loading' : 'idle'}">
			<strong>Status:</strong> {loading ? 'Loading...' : 'Idle'}
		</div>
	</div>
	
	{#if error}
		<div class="error">
			<strong>Error:</strong> {error}
		</div>
	{/if}
	
	<div class="data-grid">
		<div class="data-card">
			<h2>📅 Events ({events.length})</h2>
			{#if events.length > 0}
				<div class="data-list">
					{#each events as event}
						<div class="data-item">
							<h3>{event.name}</h3>
							<p><strong>Venue:</strong> {event.venue}</p>
							<p><strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString()}</p>
							<p><strong>Slots:</strong> {event.timeslots?.length || 0}</p>
							<small>ID: {event._id}</small>
						</div>
					{/each}
				</div>
			{:else}
				<p class="empty-state">No events found. Create one in the Next.js app!</p>
			{/if}
		</div>
		
		<div class="data-card">
			<h2>🎵 DJ Timeslots ({timeslots.length})</h2>
			{#if timeslots.length > 0}
				<div class="data-list">
					{#each timeslots as slot}
						<div class="data-item">
							<h3>@{slot.instagramHandle}</h3>
							<p><strong>Time:</strong> {slot.startTime} - {slot.endTime}</p>
							<p><strong>Token:</strong> {slot.submissionToken}</p>
							<small>Event: {slot.eventId}</small>
						</div>
					{/each}
				</div>
			{:else}
				<p class="empty-state">No timeslots found. Add some DJs to events!</p>
			{/if}
		</div>
	</div>
	
	<div class="demo-info">
		<h2>🔬 What's Being Demonstrated</h2>
		<ul>
			<li><strong>Shared Backend:</strong> Same Convex database as Next.js app</li>
			<li><strong>Real-time Updates:</strong> Data refreshes automatically every 3 seconds</li>
			<li><strong>SvelteKit Reactivity:</strong> UI updates instantly when data changes</li>
			<li><strong>Performance:</strong> Fast renders, minimal JavaScript</li>
			<li><strong>Bundle Size:</strong> Much smaller than equivalent React app</li>
		</ul>
		
		<div class="test-instructions">
			<h3>🧪 Test This:</h3>
			<ol>
				<li>Open the Next.js app in another tab</li>
				<li>Create a new event or add DJ timeslots</li>
				<li>Watch this page automatically update within 3 seconds!</li>
			</ol>
		</div>
	</div>
	
	<div class="nav-links">
		<a href="/convex-demo" class="btn">← Convex Demo</a>
		<a href="/" class="btn">Home</a>
	</div>
</div>

<style>
	.demo-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}
	
	.status-bar {
		display: flex;
		gap: 2rem;
		padding: 1rem;
		background: #f1f5f9;
		border-radius: 8px;
		margin: 2rem 0;
		flex-wrap: wrap;
	}
	
	.status-item {
		font-family: monospace;
	}
	
	.status-item.loading {
		color: #f59e0b;
	}
	
	.status-item.idle {
		color: #059669;
	}
	
	.data-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		margin: 2rem 0;
	}
	
	.data-card {
		background: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}
	
	.data-list {
		max-height: 400px;
		overflow-y: auto;
	}
	
	.data-item {
		background: #f8fafc;
		padding: 1rem;
		border-radius: 4px;
		margin-bottom: 1rem;
		border-left: 3px solid #3b82f6;
	}
	
	.data-item h3 {
		margin: 0 0 0.5rem 0;
		color: #1e293b;
	}
	
	.data-item p {
		margin: 0.25rem 0;
		font-size: 0.9rem;
	}
	
	.data-item small {
		color: #64748b;
		font-family: monospace;
	}
	
	.empty-state {
		color: #64748b;
		font-style: italic;
		text-align: center;
		padding: 2rem;
	}
	
	.demo-info {
		background: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin: 2rem 0;
	}
	
	.test-instructions {
		background: #eff6ff;
		border: 1px solid #bfdbfe;
		border-radius: 4px;
		padding: 1rem;
		margin-top: 1rem;
	}
	
	.test-instructions h3 {
		margin-top: 0;
		color: #1d4ed8;
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
	
	.error {
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #dc2626;
		padding: 1rem;
		border-radius: 4px;
		margin: 1rem 0;
	}
	
	@media (max-width: 768px) {
		.data-grid {
			grid-template-columns: 1fr;
		}
		
		.status-bar {
			flex-direction: column;
			gap: 0.5rem;
		}
		
		.nav-links {
			flex-direction: column;
		}
	}
</style>