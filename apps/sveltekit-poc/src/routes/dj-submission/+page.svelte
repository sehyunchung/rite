<script lang="ts">
	import { page } from '$app/stores'
	import { convex } from '$lib/convex'
	import { api } from '@rite/backend/convex/_generated/api'
	import { onMount } from 'svelte'
	import Card from '$lib/components/ui/card.svelte'
	import Button from '$lib/components/ui/button.svelte'
	import Input from '$lib/components/ui/input.svelte'
	import Label from '$lib/components/ui/label.svelte'
	import Textarea from '$lib/components/ui/textarea.svelte'
	import { validateInstagramHandle } from '$lib/validation';

	// URL parameters
	$: token = $page.url.searchParams.get('token')
	
	let timeslot: any = null
	let event: any = null
	let loading = true
	let error = ''
	let submitting = false

	// Form data
	let djName = ''
	let djInstagram = ''
	let djEmail = ''
	let guestList: Array<{name: string, phone: string}> = [{name: '', phone: ''}]
	let specialRequests = ''
	let paymentInfo = {
		bankName: '',
		accountNumber: '',
		accountHolder: '',
		residentNumber: ''
	}

	onMount(async () => {
		if (!token) {
			error = 'No submission token provided. Please use the link from your event organizer.'
			loading = false
			return
		}

		try {
			if (!convex) {
				error = 'Database connection not available.'
				loading = false
				return
			}

			const timeslotWithEvent = await convex.query(api.timeslots.getTimeslotByToken, { submissionToken: token })
			if (!timeslotWithEvent) {
				error = 'Invalid or expired submission token.'
				loading = false
				return
			}

			// The API returns both timeslot and event data
			timeslot = timeslotWithEvent
			event = timeslotWithEvent.event

			// Pre-fill DJ info if available
			djName = timeslot.djName || ''
			djInstagram = timeslot.djInstagram || ''
			
			loading = false
		} catch (e) {
			error = 'Failed to load submission details: ' + String(e)
			loading = false
		}
	})

	function addGuest() {
		guestList = [...guestList, {name: '', phone: ''}]
	}

	function removeGuest(index: number) {
		guestList = guestList.filter((_, i) => i !== index)
	}

	function validateForm(): string[] {
		const errors: string[] = []
		
		if (!djName.trim()) errors.push('DJ name is required')
		if (!djInstagram.trim()) errors.push('Instagram handle is required')
		
		const instagramError = validateInstagramHandle(djInstagram)
		if (instagramError) errors.push(instagramError)
		
		if (!djEmail.trim() || !djEmail.includes('@')) errors.push('Valid email is required')
		
		// Validate guest list (at least one guest with name)
		const validGuests = guestList.filter(guest => guest.name.trim())
		if (validGuests.length === 0) {
			errors.push('At least one guest is required')
		}
		
		// Check guest limit
		if (event && validGuests.length > event.guestLimitPerDJ) {
			errors.push(`Maximum ${event.guestLimitPerDJ} guests allowed`)
		}
		
		// Validate payment info
		if (!paymentInfo.bankName.trim()) errors.push('Bank name is required')
		if (!paymentInfo.accountNumber.trim()) errors.push('Account number is required')
		if (!paymentInfo.accountHolder.trim()) errors.push('Account holder name is required')
		
		return errors
	}

	async function submitForm() {
		const validationErrors = validateForm()
		if (validationErrors.length > 0) {
			error = validationErrors.join(', ')
			return
		}

		try {
			submitting = true
			error = ''

			// Filter out empty guests
			const validGuests = guestList.filter(guest => guest.name.trim())

			// Submit to database (this would be implemented)
			console.log('Submitting DJ form:', {
				token,
				djName,
				djInstagram,
				djEmail,
				guestList: validGuests,
				specialRequests,
				paymentInfo
			})

			// Simulate submission
			await new Promise(resolve => setTimeout(resolve, 1000))
			
			alert('✅ Submission successful! Thank you for your submission.')
			
		} catch (e) {
			error = 'Failed to submit: ' + String(e)
		} finally {
			submitting = false
		}
	}
</script>

<svelte:head>
	<title>DJ Submission - SvelteKit POC</title>
</svelte:head>

<div class="max-w-2xl mx-auto space-y-6">
	{#if loading}
		<Card class_="p-6">
			<div class="text-center">Loading submission form...</div>
		</Card>
	{:else if error && !timeslot}
		<Card class_="p-6">
			<div class="text-center text-red-600">
				❌ {error}
			</div>
		</Card>
	{:else if timeslot && event}
		<!-- Event Information -->
		<Card class_="p-6">
			<div class="space-y-4">
				<div class="text-center">
					<h1 class="text-2xl font-bold">{event.name}</h1>
					<p class="text-muted-foreground">{event.venue.name}</p>
					<p class="text-sm text-muted-foreground">
						{new Date(event.date).toLocaleDateString()} • 
						{timeslot.startTime} - {timeslot.endTime}
					</p>
				</div>
				
				<div class="border-t pt-4">
					<h3 class="font-semibold mb-2">Important Deadlines</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
						<div>
							<div class="font-medium">Guest List Deadline</div>
							<div class="text-muted-foreground">
								{new Date(event.deadlines.guestList).toLocaleDateString()}
							</div>
						</div>
						<div>
							<div class="font-medium">Promo Materials Deadline</div>
							<div class="text-muted-foreground">
								{new Date(event.deadlines.promoMaterials).toLocaleDateString()}
							</div>
						</div>
					</div>
				</div>

				<div class="border-t pt-4">
					<h3 class="font-semibold mb-2">Payment Information</h3>
					<div class="text-sm space-y-1">
						<div>Amount: <strong>{event.payment.perDJ.toLocaleString()} {event.payment.currency}</strong></div>
						<div>Due: {new Date(event.payment.dueDate).toLocaleDateString()}</div>
						<div>Guest Limit: <strong>{event.guestLimitPerDJ} guests maximum</strong></div>
					</div>
				</div>
			</div>
		</Card>

		<!-- DJ Information Form -->
		<Card class_="p-6">
			<div class="space-y-4">
				<h3 class="text-lg font-semibold">DJ Information</h3>
				
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="djName">DJ Name *</Label>
						<Input 
							id="djName"
							bind:value={djName}
							placeholder="Your DJ name"
							required
						/>
					</div>
					
					<div class="space-y-2">
						<Label for="djInstagram">Instagram Handle *</Label>
						<Input 
							id="djInstagram"
							bind:value={djInstagram}
							placeholder="@yourhandle"
							required
						/>
					</div>
				</div>
				
				<div class="space-y-2">
					<Label for="djEmail">Email Address *</Label>
					<Input 
						id="djEmail"
						type="email"
						bind:value={djEmail}
						placeholder="your@email.com"
						required
					/>
				</div>
			</div>
		</Card>

		<!-- Guest List -->
		<Card class_="p-6">
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-semibold">Guest List</h3>
					<Button variant="outline" size="sm" on:click={addGuest}>
						Add Guest
					</Button>
				</div>
				
				<div class="text-sm text-muted-foreground">
					Maximum {event.guestLimitPerDJ} guests allowed. Phone numbers are optional.
				</div>
				
				<div class="space-y-3">
					{#each guestList as guest, index}
						<div class="flex gap-2 items-end">
							<div class="flex-1">
								<Label for="guest-name-{index}">Name</Label>
								<Input 
									id="guest-name-{index}"
									bind:value={guest.name}
									placeholder="Guest name"
								/>
							</div>
							<div class="flex-1">
								<Label for="guest-phone-{index}">Phone (optional)</Label>
								<Input 
									id="guest-phone-{index}"
									bind:value={guest.phone}
									placeholder="Phone number"
								/>
							</div>
							{#if guestList.length > 1}
								<Button 
									variant="outline" 
									size="icon" 
									on:click={() => removeGuest(index)}
								>
									×
								</Button>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</Card>

		<!-- Payment Information -->
		<Card class_="p-6">
			<div class="space-y-4">
				<h3 class="text-lg font-semibold">Payment Information</h3>
				<div class="text-sm text-muted-foreground">
					This information is required for payment processing. All data is encrypted and secure.
				</div>
				
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="bankName">Bank Name *</Label>
						<Input 
							id="bankName"
							bind:value={paymentInfo.bankName}
							placeholder="Bank name"
							required
						/>
					</div>
					
					<div class="space-y-2">
						<Label for="accountNumber">Account Number *</Label>
						<Input 
							id="accountNumber"
							bind:value={paymentInfo.accountNumber}
							placeholder="Account number"
							required
						/>
					</div>
					
					<div class="space-y-2">
						<Label for="accountHolder">Account Holder *</Label>
						<Input 
							id="accountHolder"
							bind:value={paymentInfo.accountHolder}
							placeholder="Account holder name"
							required
						/>
					</div>
					
					<div class="space-y-2">
						<Label for="residentNumber">Resident Registration Number</Label>
						<Input 
							id="residentNumber"
							bind:value={paymentInfo.residentNumber}
							placeholder="123456-1234567"
						/>
					</div>
				</div>
			</div>
		</Card>

		<!-- Special Requests -->
		<Card class_="p-6">
			<div class="space-y-4">
				<h3 class="text-lg font-semibold">Special Requests</h3>
				<div class="space-y-2">
					<Label for="specialRequests">Additional Notes (Optional)</Label>
					<Textarea 
						id="specialRequests"
						bind:value={specialRequests}
						placeholder="Any special equipment needs, requests, or comments..."
						rows="3"
					/>
				</div>
			</div>
		</Card>

		<!-- Submit Section -->
		<Card class_="p-6">
			<div class="space-y-4">
				{#if error}
					<div class="text-sm text-red-600">
						❌ {error}
					</div>
				{/if}
				
				<Button 
					on:click={submitForm} 
					disabled={submitting}
					size="lg"
					class_="w-full"
				>
					{submitting ? 'Submitting...' : 'Submit DJ Information'}
				</Button>
				
				<div class="text-xs text-muted-foreground text-center">
					By submitting, you agree to the event terms and conditions.
					Your information will be securely stored and used only for this event.
				</div>
			</div>
		</Card>
	{/if}
</div>