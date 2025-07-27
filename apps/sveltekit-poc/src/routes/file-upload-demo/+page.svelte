<script lang="ts">
	import Card from '$lib/components/ui/card.svelte'
	import Button from '$lib/components/ui/button.svelte'
	import Dropzone from '$lib/components/ui/dropzone.svelte'

	let selectedFiles: File[] = []
	let uploading = false
	let uploadResults: string[] = []

	function handleFiles(event: CustomEvent<FileList | null>) {
		const files = event.detail
		if (files) {
			selectedFiles = Array.from(files)
			uploadResults = []
		}
	}

	function removeFile(index: number) {
		selectedFiles = selectedFiles.filter((_, i) => i !== index)
	}

	async function uploadFiles() {
		if (selectedFiles.length === 0) return
		
		uploading = true
		uploadResults = []
		
		try {
			// Simulate file upload to Convex storage
			for (const file of selectedFiles) {
				await new Promise(resolve => setTimeout(resolve, 500)) // Simulate upload delay
				
				// In a real implementation, this would upload to Convex storage
				console.log('Uploading file:', file.name, file.size, file.type)
				
				uploadResults = [...uploadResults, `✅ ${file.name} uploaded successfully`]
			}
			
			// Clear selected files after successful upload
			selectedFiles = []
			
		} catch (error) {
			uploadResults = [...uploadResults, `❌ Upload failed: ${error}`]
		} finally {
			uploading = false
		}
	}

	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes'
		const k = 1024
		const sizes = ['Bytes', 'KB', 'MB', 'GB']
		const i = Math.floor(Math.log(bytes) / Math.log(k))
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
	}
</script>

<svelte:head>
	<title>File Upload Demo - SvelteKit POC</title>
</svelte:head>

<div class="max-w-2xl mx-auto space-y-6">
	<div class="space-y-1">
		<h1 class="text-3xl font-bold tracking-tight">File Upload Demo</h1>
		<p class="text-muted-foreground">
			Test file upload functionality with drag-and-drop support
		</p>
	</div>

	<!-- File Dropzone -->
	<Card class_="p-6">
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Upload Files</h3>
			
			<Dropzone
				accept="image/*,.pdf,.doc,.docx,.mp3,.wav"
				maxSize={10 * 1024 * 1024}
				on:files={handleFiles}
			/>
			
			<div class="text-xs text-muted-foreground">
				Supported formats: Images, PDFs, Documents, Audio files • Maximum 10MB per file
			</div>
		</div>
	</Card>

	<!-- Selected Files -->
	{#if selectedFiles.length > 0}
		<Card class_="p-6">
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-semibold">Selected Files ({selectedFiles.length})</h3>
					<Button on:click={uploadFiles} disabled={uploading}>
						{uploading ? 'Uploading...' : 'Upload Files'}
					</Button>
				</div>
				
				<div class="space-y-2">
					{#each selectedFiles as file, index}
						<div class="flex items-center justify-between p-3 border rounded-lg">
							<div class="flex items-center gap-3">
								<div class="text-2xl">
									{#if file.type.startsWith('image/')}
										🖼️
									{:else if file.type.includes('pdf')}
										📄
									{:else if file.type.startsWith('audio/')}
										🎵
									{:else}
										📎
									{/if}
								</div>
								<div>
									<div class="font-medium text-sm">{file.name}</div>
									<div class="text-xs text-muted-foreground">
										{formatFileSize(file.size)} • {file.type || 'Unknown type'}
									</div>
								</div>
							</div>
							<Button 
								variant="outline" 
								size="sm" 
								on:click={() => removeFile(index)}
								disabled={uploading}
							>
								Remove
							</Button>
						</div>
					{/each}
				</div>
			</div>
		</Card>
	{/if}

	<!-- Upload Results -->
	{#if uploadResults.length > 0}
		<Card class_="p-6">
			<div class="space-y-4">
				<h3 class="text-lg font-semibold">Upload Results</h3>
				<div class="space-y-2">
					{#each uploadResults as result}
						<div class="text-sm p-2 rounded {result.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}">
							{result}
						</div>
					{/each}
				</div>
			</div>
		</Card>
	{/if}

	<!-- Implementation Notes -->
	<Card class_="p-6">
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Implementation Notes</h3>
			<div class="text-sm space-y-2 text-muted-foreground">
				<p>
					This demo shows file upload functionality using a custom Svelte dropzone component.
					In a real implementation, files would be uploaded to Convex storage using the
					<code class="bg-muted px-1 rounded">convex.mutation(api.files.generateUploadUrl)</code> API.
				</p>
				<p>
					The component supports:
				</p>
				<ul class="list-disc list-inside ml-4 space-y-1">
					<li>Drag and drop file upload</li>
					<li>File type validation</li>
					<li>File size limits</li>
					<li>Multiple file selection</li>
					<li>Progress feedback</li>
					<li>Error handling</li>
				</ul>
			</div>
		</div>
	</Card>

	<!-- Performance Comparison -->
	<Card class_="p-6">
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">SvelteKit vs Next.js File Upload</h3>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="space-y-2">
					<h4 class="font-medium text-green-600">SvelteKit Advantages</h4>
					<ul class="text-sm space-y-1 text-muted-foreground">
						<li>✅ Smaller bundle size for upload components</li>
						<li>✅ Faster reactivity for file list updates</li>
						<li>✅ Simpler event handling</li>
						<li>✅ Built-in two-way binding</li>
					</ul>
				</div>
				<div class="space-y-2">
					<h4 class="font-medium text-blue-600">Next.js Advantages</h4>
					<ul class="text-sm space-y-1 text-muted-foreground">
						<li>✅ More file upload libraries available</li>
						<li>✅ React Dropzone ecosystem</li>
						<li>✅ Better TypeScript integration</li>
						<li>✅ More examples and tutorials</li>
					</ul>
				</div>
			</div>
		</div>
	</Card>
</div>