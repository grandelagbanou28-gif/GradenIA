<script lang="ts">
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import { showSidebar, showSettings, user, config, showSearch, mobile, theme } from '$lib/stores';
	import { WEBUI_API_BASE_URL, WEBUI_BASE_URL } from '$lib/constants';

	import Tooltip from '$lib/components/common/Tooltip.svelte';
	import Search from '$lib/components/icons/Search.svelte';
	import SidebarIcon from '$lib/components/icons/Sidebar.svelte';

	const i18n = getContext('i18n');

	let themeValue = 'system';

	theme.subscribe((val) => {
		themeValue = val ?? 'system';
	});

	const toggleTheme = () => {
		const newTheme = themeValue === 'dark' ? 'light' : themeValue === 'light' ? 'system' : 'dark';
		theme.set(newTheme);
		localStorage.setItem('theme', newTheme);
	};

	const getBreadcrumb = () => {
		const path = $page.url.pathname;
		if (path === '/') return '';
		if (path === '/home') return $i18n.t('Home');
		if (path === '/workspace') return $i18n.t('Workspace');
		if (path.startsWith('/workspace/models')) return $i18n.t('Models');
		if (path.startsWith('/workspace/knowledge')) return $i18n.t('Knowledge');
		if (path.startsWith('/workspace/prompts')) return $i18n.t('Prompts');
		if (path.startsWith('/workspace/tools')) return $i18n.t('Tools');
		if (path.startsWith('/workspace/skills')) return $i18n.t('Skills');
		if (path.startsWith('/workspace/functions')) return $i18n.t('Functions');
		if (path.startsWith('/admin/settings')) return $i18n.t('Settings');
		if (path.startsWith('/admin/users')) return $i18n.t('Users');
		if (path.startsWith('/admin')) return $i18n.t('Admin');
		if (path.startsWith('/notes')) return $i18n.t('Notes');
		if (path.startsWith('/channels')) return $i18n.t('Channels');
		if (path.startsWith('/automations')) return $i18n.t('Automations');
		if (path.startsWith('/playground')) return $i18n.t('Playground');
		if (path.startsWith('/c')) return $i18n.t('Chat');
		return '';
	};
</script>

<div
	class="top-nav sticky top-0 z-30 flex items-center justify-between px-4 py-2 bg-white/80 dark:bg-gray-900/80"
>
	<div class="flex items-center gap-3">
		<Tooltip content={$showSidebar ? $i18n.t('Close Sidebar') : $i18n.t('Open Sidebar')}>
			<button
				class="flex items-center justify-center size-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
				on:click={() => {
					showSidebar.set(!$showSidebar);
				}}
			>
				<SidebarIcon className="size-4.5" />
			</button>
		</Tooltip>

		{#if getBreadcrumb()}
			<div class="flex items-center gap-2">
				<span class="text-gray-300 dark:text-gray-600">/</span>
				<span class="text-sm font-medium text-gray-700 dark:text-gray-300">
					{getBreadcrumb()}
				</span>
			</div>
		{/if}
	</div>

	<div class="flex items-center gap-2">
		<Tooltip content={$i18n.t('Search')} placement="bottom">
			<button
				class="flex items-center justify-center size-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
				on:click={() => {
					showSearch.set(true);
				}}
			>
				<Search strokeWidth="2" className="size-4" />
			</button>
		</Tooltip>

		<Tooltip content={$i18n.t('Theme')} placement="bottom">
			<button
				class="flex items-center justify-center size-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
				on:click={toggleTheme}
			>
				{#if themeValue === 'dark'}
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
					</svg>
				{:else if themeValue === 'light'}
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
					</svg>
				{:else}
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
					</svg>
				{/if}
			</button>
		</Tooltip>

		<Tooltip content={$i18n.t('Settings')} placement="bottom">
			<button
				class="flex items-center justify-center size-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
				on:click={() => {
					showSettings.set(true);
				}}
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
				</svg>
			</button>
		</Tooltip>

		{#if $user}
			<div class="flex items-center gap-2 ml-1 pl-2 border-l border-gray-200 dark:border-gray-700">
				<img
					src={`${WEBUI_API_BASE_URL}/users/${$user?.id}/profile/image`}
					class="size-7 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
					alt={$user?.name}
				/>
				{#if !$mobile}
					<span class="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
						{$user?.name}
					</span>
				{/if}
			</div>
		{/if}
	</div>
</div>
