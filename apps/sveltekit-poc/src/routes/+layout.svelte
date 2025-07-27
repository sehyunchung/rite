<script lang="ts">
	import './app.css';
	import { page } from '$app/stores';
	import { signIn, signOut } from "@auth/sveltekit/client";
</script>

<div class="min-h-screen bg-background">
	<header class="border-b">
		<div class="container mx-auto px-4 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<h1 class="text-2xl font-bold">Rite</h1>
					<span class="text-sm text-muted-foreground">SvelteKit POC</span>
				</div>
				
				<div class="flex items-center gap-4">
					{#if $page.data.session}
						<span class="text-sm">Welcome, {$page.data.session.user?.name || 'User'}</span>
						<button 
							on:click={() => signOut()}
							class="text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							Sign Out
						</button>
					{:else}
						<button 
							on:click={() => signIn('instagram').catch(err => {
								console.error('Sign in error:', err);
								alert('Instagram sign in not available. Please check configuration.');
							})}
							class="text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							Sign In with Instagram
						</button>
					{/if}
				</div>
			</div>
		</div>
	</header>

	<main class="container mx-auto px-4 py-8">
		<slot />
	</main>
</div>