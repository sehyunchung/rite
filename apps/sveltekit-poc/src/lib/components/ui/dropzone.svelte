<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	const dispatch = createEventDispatcher<{
		files: FileList | null;
	}>();

	export let accept = '*/*';
	export let multiple = true;
	export let maxSize = 10 * 1024 * 1024; // 10MB default
	export let disabled = false;

	let dragover = false;
	let fileInput: HTMLInputElement;
	let error = '';

	function handleDragOver(event: DragEvent) {
		if (disabled) return;
		event.preventDefault();
		dragover = true;
	}

	function handleDragLeave(event: DragEvent) {
		if (disabled) return;
		event.preventDefault();
		dragover = false;
	}

	function handleDrop(event: DragEvent) {
		if (disabled) return;
		event.preventDefault();
		dragover = false;
		
		const files = event.dataTransfer?.files;
		if (files) {
			handleFiles(files);
		}
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = target.files;
		if (files) {
			handleFiles(files);
		}
	}

	function handleFiles(files: FileList) {
		error = '';
		
		// Validate file sizes
		for (let i = 0; i < files.length; i++) {
			if (files[i].size > maxSize) {
				error = `File "${files[i].name}" is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`;
				return;
			}
		}
		
		dispatch('files', files);
	}

	function openFileDialog() {
		if (disabled) return;
		fileInput.click();
	}
</script>

<div
	class="border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
		{dragover ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
		{disabled ? 'opacity-50 cursor-not-allowed' : ''}"
	on:dragover={handleDragOver}
	on:dragleave={handleDragLeave}
	on:drop={handleDrop}
	on:click={openFileDialog}
	on:keydown={(e) => e.key === 'Enter' && openFileDialog()}
	role="button"
	tabindex="0"
>
	<input
		bind:this={fileInput}
		type="file"
		{accept}
		{multiple}
		{disabled}
		on:change={handleFileSelect}
		class="hidden"
	/>
	
	<div class="space-y-2">
		<div class="text-4xl">📁</div>
		<div class="text-lg font-medium">
			{dragover ? 'Drop files here' : 'Click to upload or drag and drop'}
		</div>
		<div class="text-sm text-muted-foreground">
			{accept === '*/*' ? 'Any file type' : accept} • 
			Max {Math.round(maxSize / 1024 / 1024)}MB per file
		</div>
		{#if error}
			<div class="text-sm text-red-600 mt-2">
				❌ {error}
			</div>
		{/if}
	</div>
</div>