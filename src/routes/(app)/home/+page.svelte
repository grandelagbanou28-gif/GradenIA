<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import { goto } from '$app/navigation';

	import { user, config, models, settings, showSettings } from '$lib/stores';
	import { WEBUI_API_BASE_URL, WEBUI_BASE_URL } from '$lib/constants';
	import { getChatList } from '$lib/apis/chats';

	const i18n = getContext('i18n');

	let recentChats: any[] = [];
	let greeting = '';

	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return $i18n.t('Bonjour');
		if (hour < 18) return $i18n.t('Bon apres-midi');
		return $i18n.t('Bonsoir');
	};

	const getModelCount = () => {
		return ($models ?? []).length;
	};

	const getOllamaModels = () => {
		return ($models ?? []).filter((m: any) => m?.owned_by === 'ollama').length;
	};

	const getRemoteModels = () => {
		return ($models ?? []).filter((m: any) => m?.owned_by !== 'ollama').length;
	};

	onMount(async () => {
		greeting = getGreeting();

		const chats = await getChatList(localStorage.token, 0, 5).catch(() => []);
		recentChats = (chats ?? []).slice(0, 5);
	});
</script>

<svelte:head>
	<title>{`${$WEBUI_NAME} - Accueil`}</title>
</svelte:head>

<div class="page-transition min-h-full bg-gray-50 dark:bg-gray-950">
	<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
				{greeting}, {$user?.name ?? 'Utilisateur'}
			</h1>
			<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
				{$i18n.t('Bienvenue sur')} <span class="font-semibold text-blue-600 dark:text-blue-400">Graden IA</span> — {$i18n.t('votre assistant IA personnel')}
			</p>
		</div>

		<!-- Quick Actions -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
			<!-- New Chat -->
			<button
				class="card-modern p-5 flex items-center gap-4 text-left group cursor-pointer"
				on:click={() => goto('/')}
			>
				<div class="flex-shrink-0 w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-shadow">
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
					</svg>
				</div>
				<div>
					<div class="font-semibold text-gray-900 dark:text-white">{$i18n.t('Nouveau Chat')}</div>
					<div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{$i18n.t('Commencer une conversation')}</div>
				</div>
			</button>

			<!-- Models -->
			<button
				class="card-modern p-5 flex items-center gap-4 text-left group cursor-pointer"
				on:click={() => goto('/workspace/models')}
			>
				<div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/30 transition-shadow">
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polygon points="12 2 2 7 12 12 22 7 12 2"/>
						<polyline points="2 17 12 22 22 17"/>
						<polyline points="2 12 12 17 22 12"/>
					</svg>
				</div>
				<div>
					<div class="font-semibold text-gray-900 dark:text-white">{$i18n.t('Modeles')}</div>
					<div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{getModelCount()} {$i18n.t('disponibles')}</div>
				</div>
			</button>

			<!-- Settings -->
			<button
				class="card-modern p-5 flex items-center gap-4 text-left group cursor-pointer"
				on:click={() => showSettings.set(true)}
			>
				<div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-shadow">
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="3"/>
						<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
					</svg>
				</div>
				<div>
					<div class="font-semibold text-gray-900 dark:text-white">{$i18n.t('Parametres')}</div>
					<div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{$i18n.t('Configurer Graden IA')}</div>
				</div>
			</button>
		</div>

		<!-- Stats Cards -->
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
			<div class="card-modern p-4 text-center">
				<div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{getModelCount()}</div>
				<div class="text-xs text-gray-500 dark:text-gray-400 mt-1">{$i18n.t('Modeles totaux')}</div>
			</div>
			<div class="card-modern p-4 text-center">
				<div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{getOllamaModels()}</div>
				<div class="text-xs text-gray-500 dark:text-gray-400 mt-1">{$i18n.t('Locaux (Ollama)')}</div>
			</div>
			<div class="card-modern p-4 text-center">
				<div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{getRemoteModels()}</div>
				<div class="text-xs text-gray-500 dark:text-gray-400 mt-1">{$i18n.t('Distants')}</div>
			</div>
			<div class="card-modern p-4 text-center">
				<div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{recentChats.length}</div>
				<div class="text-xs text-gray-500 dark:text-gray-400 mt-1">{$i18n.t('Chats recents')}</div>
			</div>
		</div>

		<!-- Recent Chats -->
		{#if recentChats.length > 0}
			<div class="mb-8">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white">{$i18n.t('Chats recents')}</h2>
					<button
						class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
						on:click={() => goto('/')}
					>
						{$i18n.t('Voir tout')}
					</button>
				</div>
				<div class="space-y-2">
					{#each recentChats as chat}
						<a
							href="/c/{chat.id}"
							class="card-modern p-4 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer block"
						>
							<div class="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400">
									<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
								</svg>
							</div>
							<div class="flex-1 min-w-0">
								<div class="text-sm font-medium text-gray-900 dark:text-white truncate">
									{chat.title}
								</div>
								<div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
									{new Date(chat.updated_at * 1000).toLocaleDateString('fr-FR')}
								</div>
							</div>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-300 dark:text-gray-600 flex-shrink-0">
								<polyline points="9 18 15 12 9 6"/>
							</svg>
						</a>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Info Cards -->
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<div class="card-modern p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600 dark:text-blue-400">
							<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
						</svg>
					</div>
					<h3 class="font-semibold text-gray-900 dark:text-white text-sm">{$i18n.t('Comment ca marche')}</h3>
				</div>
				<p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
					{$i18n.t('Choisissez un modele et commencez a discuter. Vos conversations restent privees et stockees localement.')}
				</p>
			</div>

			<div class="card-modern p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-purple-600 dark:text-purple-400">
							<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
						</svg>
					</div>
					<h3 class="font-semibold text-gray-900 dark:text-white text-sm">{$i18n.t('Securite & Vie privee')}</h3>
				</div>
				<p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
					{$i18n.t('Graden IA fonctionne en local avec Ollama. Aucune donnee n\'est envoyee a des serveurs tiers.')}
				</p>
			</div>
		</div>
	</div>
</div>
