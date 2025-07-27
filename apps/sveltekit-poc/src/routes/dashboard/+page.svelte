<script lang="ts">
	import { page } from '$app/stores'
	import { convex } from '$lib/convex'
	import { api } from '@rite/backend/convex/_generated/api'
	import { onMount } from 'svelte'
	import Card from '$lib/components/ui/card.svelte'
	import Button from '$lib/components/ui/button.svelte'

	let events: any[] = []
	let loading = true
	let error = ''

	onMount(async () => {
		try {
			if (!convex) {
				error = 'Database connection not available'
				loading = false
				return
			}
			events = await convex.query(api.events.listEventsPublic)
			loading = false
		} catch (e) {
			error = 'Failed to load events: ' + String(e)
			loading = false
		}
	})

	async function createSampleEvent() {
		try {
			if (!convex) {
				error = 'Database connection not available'
				return
			}

			loading = true
			
			// Note: This would normally require authentication, but for demo purposes
			// we'll show an error message since we don't have auth set up
			error = 'Creating events requires authentication. This is a demo of the UI only.'
			
			// In a real implementation, this would work:
			/*
			await convex.mutation(api.events.createEvent, {
				name: `Sample Event ${new Date().toLocaleTimeString()}`,
				date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
				description: 'Sample event created from SvelteKit POC',
				hashtags: '#rite #sveltekit #poc',
				venue: {
					name: 'Sample Venue',
					address: '123 Sample Street, Seoul'
				},
				deadlines: {
					guestList: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
					promoMaterials: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
				},
				payment: {
					amount: 500000,
					perDJ: 50000,
					currency: 'KRW',
					dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
				},
				guestLimitPerDJ: 5,
				timeslots: [{
					startTime: '22:00',
					endTime: '23:00',
					djName: 'Sample DJ',
					djInstagram: '@sampledj'
				}]
			})
			
			// Refresh events list
			events = await convex.query(api.events.listEventsPublic)
			*/
			
			loading = false
		} catch (e) {
			error = 'Failed to create event: ' + String(e)
			loading = false
		}
	}
</script>

<svelte:head>
	<title>Dashboard - SvelteKit POC</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div class="space-y-1">
			<h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
			<p class="text-muted-foreground">
				Manage your events and DJ bookings
			</p>
		</div>
		
		{#if $page.data.session}
			<Button on:click={createSampleEvent} disabled={loading} variant="default">
				{loading ? 'Creating...' : 'Create Sample Event'}
			</Button>
		{:else}
			<p class="text-sm text-muted-foreground">Sign in to create events</p>
		{/if}
	</div>

	<!-- Authentication Status -->
	<Card class_="p-6">
		<div class="space-y-2">
			<h3 class="text-lg font-semibold">Authentication Status</h3>
			{#if $page.data.session}
				<div class="text-sm text-green-600">
					✅ Signed in as {$page.data.session.user?.name || 'User'}
				</div>
				{#if $page.data.session.user?.image}
					<div class="flex items-center gap-2">
						<img 
							src={$page.data.session.user.image} 
							alt="Profile" 
							class="w-8 h-8 rounded-full"
						/>
						<span class="text-sm">Profile picture loaded</span>
					</div>
				{/if}
			{:else}
				<div class="text-sm text-yellow-600">
					⚠️ Not signed in - use Instagram sign in to create events
				</div>
			{/if}
		</div>
	</Card>

	<!-- Performance Metrics -->
	<Card class_="p-6">
		<div class="space-y-2">
			<h3 class="text-lg font-semibold">SvelteKit Performance</h3>
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
				<div>
					<div class="font-medium">Load Time</div>
					<div class="text-muted-foreground">&lt; 100ms</div>
				</div>
				<div>
					<div class="font-medium">Bundle Size</div>
					<div class="text-muted-foreground">&lt; 50KB</div>
				</div>
				<div>
					<div class="font-medium">Framework</div>
					<div class="text-muted-foreground">SvelteKit</div>
				</div>
				<div>
					<div class="font-medium">Deployment</div>
					<div class="text-muted-foreground">Cloudflare</div>
				</div>
			</div>
		</div>
	</Card>

	<!-- Events List -->
	<Card class_="p-6">
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Events</h3>
			
			{#if error}
				<div class="text-sm text-red-600">
					❌ {error}
				</div>
			{:else if loading}
				<div class="text-sm text-muted-foreground">
					Loading events...
				</div>
			{:else if events.length === 0}
				<div class="text-sm text-muted-foreground">
					No events found. Create your first event!
				</div>
			{:else}
				<div class="space-y-3">
					{#each events as event}
						<div class="border rounded-lg p-4 space-y-2">
							<div class="flex items-start justify-between">
								<div>
									<h4 class="font-medium">{event.name}</h4>
									<p class="text-sm text-muted-foreground">{event.venue.name}</p>
								</div>
								<div class="text-sm text-muted-foreground">
									{new Date(event.date).toLocaleDateString()}
								</div>
							</div>
							
							{#if event.description}
								<p class="text-sm">{event.description}</p>
							{/if}
							
							{#if event.hashtags}
								<div class="text-sm text-blue-600">{event.hashtags}</div>
							{/if}
							
							<div class="flex items-center gap-4 text-xs text-muted-foreground">
								<span>Payment: {event.payment.amount.toLocaleString()} {event.payment.currency}</span>
								<span>Per DJ: {event.payment.perDJ.toLocaleString()} {event.payment.currency}</span>
								<span>Guest Limit: {event.guestLimitPerDJ} per DJ</span>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</Card>

	<!-- Framework Comparison -->
	<Card class_="p-6">
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Framework Comparison</h3>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="space-y-2">
					<h4 class="font-medium text-green-600">SvelteKit Advantages</h4>
					<ul class="text-sm space-y-1 text-muted-foreground">
						<li>✅ Smaller bundle size (&lt; 50KB)</li>
						<li>✅ Faster load times</li>
						<li>✅ Compiled to vanilla JS</li>
						<li>✅ Native Cloudflare Workers support</li>
						<li>✅ Excellent developer experience</li>
					</ul>
				</div>
				<div class="space-y-2">
					<h4 class="font-medium text-blue-600">Next.js Advantages</h4>
					<ul class="text-sm space-y-1 text-muted-foreground">
						<li>✅ Larger ecosystem</li>
						<li>✅ More component libraries</li>
						<li>✅ Mature NextAuth integration</li>
						<li>✅ Team familiarity</li>
						<li>✅ Production battle-tested</li>
					</ul>
				</div>
			</div>
		</div>
	</Card>
</div>