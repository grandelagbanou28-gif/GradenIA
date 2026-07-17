<script lang="ts">
	import { getVersionUpdates } from '$lib/apis';
	import { getOllamaVersion } from '$lib/apis/ollama';
	import { WEBUI_BUILD_HASH, WEBUI_VERSION, WEBUI_BASE_URL } from '$lib/constants';
	import { WEBUI_NAME, config, showChangelog } from '$lib/stores';
	import { compareVersion } from '$lib/utils';
	import { onMount, getContext } from 'svelte';

	import Tooltip from '$lib/components/common/Tooltip.svelte';

	const i18n = getContext('i18n');

	let ollamaVersion = '';

	let updateAvailable = null;
	let version = {
		current: '',
		latest: ''
	};

	const checkForVersionUpdates = async () => {
		updateAvailable = null;
		version = await getVersionUpdates(localStorage.token).catch((error) => {
			return {
				current: WEBUI_VERSION,
				latest: WEBUI_VERSION
			};
		});

		updateAvailable = compareVersion(version.latest, version.current);
	};

	onMount(async () => {
		ollamaVersion = await getOllamaVersion(localStorage.token).catch((error) => {
			return '';
		});

		if ($config?.features?.enable_version_update_check) {
			checkForVersionUpdates();
		}
	});
</script>

<div id="tab-about" class="flex flex-col h-full justify-between space-y-3 text-sm">
	<div class="space-y-3 overflow-y-scroll max-h-[28rem] md:max-h-full">

		<!-- App Logo & Name -->
		<div class="flex items-center gap-3 pb-2">
			<img
				src="{WEBUI_BASE_URL}/static/graden_blue.png"
				alt="Graden IA"
				class="w-12 h-12 rounded-xl shadow-md"
			/>
			<div>
				<div class="font-semibold text-gray-900 dark:text-white text-base">Graden IA</div>
				<div class="text-xs text-gray-500 dark:text-gray-400">Votre assistant IA personnel</div>
			</div>
		</div>

		<hr class="border-gray-100/30 dark:border-gray-850/30" />

		<!-- Version -->
		<div>
			<div class="mb-2 text-sm font-medium flex items-center gap-2">
				<span>{$WEBUI_NAME}</span>
				<span class="text-gray-400">-</span>
				<span>{$i18n.t('Version')}</span>
			</div>
			<div class="flex w-full justify-between items-center">
				<div class="flex flex-col text-xs text-gray-700 dark:text-gray-200">
					<div class="flex gap-1">
						<Tooltip content={WEBUI_BUILD_HASH}>
							v{WEBUI_VERSION}
						</Tooltip>
						{#if $config?.features?.enable_version_update_check}
							<a
								href="https://github.com/grandelagbanou28-gif/GrdenIA/releases"
								target="_blank"
							>
								{updateAvailable === null
									? $i18n.t('Verification en cours...')
									: updateAvailable
										? `(v${version.latest} disponible!)`
										: $i18n.t('(a jour)')}
							</a>
						{/if}
					</div>
					<button
						class="underline flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-500 mt-1"
						on:click={() => {
							showChangelog.set(true);
						}}
					>
						<div>{$i18n.t("Voir les nouveautes")}</div>
					</button>
				</div>
				{#if $config?.features?.enable_version_update_check}
					<button
						class="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-850 dark:hover:bg-gray-800 transition rounded-lg font-medium"
						on:click={() => {
							checkForVersionUpdates();
						}}
					>
						{$i18n.t('Verifier les mises a jour')}
					</button>
				{/if}
			</div>
		</div>

		<!-- Ollama Version -->
		{#if ollamaVersion}
			<hr class="border-gray-100/30 dark:border-gray-850/30" />
			<div>
				<div class="mb-2 text-sm font-medium">{$i18n.t('Version Ollama')}</div>
				<div class="text-xs text-gray-700 dark:text-gray-200">
					{ollamaVersion ?? 'N/A'}
				</div>
			</div>
		{/if}

		<hr class="border-gray-100/30 dark:border-gray-850/30" />

		<!-- Credits -->
		<div class="space-y-2">
			<div class="text-xs text-gray-500 dark:text-gray-400">
				<span class="font-medium text-gray-700 dark:text-gray-300">Graden IA</span>
				est un fork d'Open WebUI, developpe et personnalise par
			</div>
			<div class="flex items-center gap-2">
				<div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-bold">
					GA
				</div>
				<div>
					<a
						class="text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
						href="https://github.com/grandelagbanou28-gif"
						target="_blank"
					>
						Grandel Agbanou
					</a>
					<div class="text-xs text-gray-500 dark:text-gray-400">Developpeur</div>
				</div>
			</div>
		</div>

		<hr class="border-gray-100/30 dark:border-gray-850/30" />

		<!-- Links -->
		<div class="space-y-1.5">
			<a
				href="https://github.com/grandelagbanou28-gif/GrdenIA"
				target="_blank"
				class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
				Source sur GitHub
			</a>
			<a
				href="https://github.com/grandelagbanou28-gif/GrdenIA/issues"
				target="_blank"
				class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
				Signaler un bug
			</a>
		</div>

		<div class="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">
			&copy; 2026 Graden IA &mdash; Fait avec passion par Grandel Agbanou
		</div>
	</div>
</div>
