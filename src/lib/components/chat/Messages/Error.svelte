<script lang="ts">
	import Info from '$lib/components/icons/Info.svelte';

	export let content = '';
</script>

<div class="flex my-2 gap-2.5 border px-4 py-3 border-red-600/10 bg-red-600/10 rounded-lg">
	<div class=" self-start mt-0.5">
		<Info className="size-5 text-red-700 dark:text-red-400" />
	</div>

	<div class=" self-center text-sm">
		{#if typeof content === 'string'}
			{content}
		{:else if typeof content === 'object' && content !== null}
			{#if content?.error && content?.error?.message}
				{content.error.message}
			{:else if content?.detail}
				{content.detail}
			{:else if content?.message}
				{content.message}
			{:else}
				<div class="text-gray-600 dark:text-gray-400">
					<div class="font-medium mb-1">Erreur inattendue:</div>
					{#each Object.entries(content) as [key, value]}
						<div><span class="font-mono text-xs text-gray-500">{key}:</span> {typeof value === 'object' ? JSON.stringify(value) : value}</div>
					{/each}
				</div>
			{/if}
		{:else}
			{String(content)}
		{/if}
	</div>
</div>
