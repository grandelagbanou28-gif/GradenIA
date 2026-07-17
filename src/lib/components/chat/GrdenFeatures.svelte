<script lang="ts">
	import { onMount, onDestroy, getContext } from 'svelte';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';
	import { chatId, chats, settings, showSidebar, user } from '$lib/stores';
	import CodeWorkspace from './CodeWorkspace.svelte';

	const i18n = getContext('i18n');

	export let messages = [];
	export let sendMessage: Function = () => {};
	export let stopGenerating: Function = () => {};
	export let chatTitle = '';

	let showTemplates = false;
	let showStats = false;
	let showExportMenu = false;
	let showPresentation = false;
	let showIDE = false;
	let isRecording = false;
	let recognition: any = null;
	let draftTimeout: any = null;
	let lastDraft = '';
	let responseStartTime = 0;
	let responseEndTime = 0;
	let stats = {
		totalMessages: 0,
		totalTokens: 0,
		avgResponseTime: 0,
		sessionsCount: 0
	};

	const templates = [
		{ name: 'Resumer', prompt: 'Resums le texte suivant en quelques lignes cle :', icon: 'summary' },
		{ name: 'Traduire en FR', prompt: 'Traduis le texte suivant en francais :', icon: 'lang' },
		{ name: 'Traduire en EN', prompt: 'Translate the following text to English:', icon: 'lang' },
		{ name: 'Expliquer', prompt: 'Explique le concept suivant de facon simple et claire :', icon: 'info' },
		{ name: 'Corriger', prompt: 'Corrige les erreurs dans le texte suivant et ameliore-le :', icon: 'edit' },
		{ name: 'Reformuler', prompt: 'Reformule le texte suivant de maniere plus professionnelle :', icon: 'reform' },
		{ name: 'Code', prompt: 'Ecris du code pour :', icon: 'code' },
		{ name: 'Email pro', prompt: 'Redige un email professionnel pour :', icon: 'mail' },
		{ name: 'Liste a puces', prompt: 'Transforme en liste a puces :', icon: 'list' },
		{ name: 'Arguments', prompt: 'Donne les arguments pour et contre :', icon: 'balance' }
	];

	onMount(() => {
		loadStats();
		initDraftAutoSave();
		initNotifications();
		initVoice();
		initPresentationMode();
	});

 onDestroy(() => {
		if (draftTimeout) clearTimeout(draftTimeout);
		if (recognition) recognition.stop();
	});

	function initDraftAutoSave() {
		const saved = localStorage.getItem('graden_draft_' + ($chatId || 'new'));
		if (saved) {
			lastDraft = saved;
		}
		setInterval(() => {
			const input = document.querySelector('textarea');
			if (input && input.value.trim()) {
				localStorage.setItem('graden_draft_' + ($chatId || 'new'), input.value);
			}
		}, 3000);
	}

	function initNotifications() {
		if ('Notification' in window && Notification.permission === 'default') {
			Notification.requestPermission();
		}
	}

	export function notifyResponseComplete() {
		if ('Notification' in window && Notification.permission === 'granted') {
			new Notification('Graden IA', {
				body: 'Votre reponse est prete !',
				icon: '/static/graden_blue.png'
			});
		}
	}

	function loadStats() {
		const saved = localStorage.getItem('graden_stats');
		if (saved) {
			stats = JSON.parse(saved);
		}
		stats.sessionsCount++;
		saveStats();
	}

	function saveStats() {
		localStorage.setItem('graden_stats', JSON.stringify(stats));
	}

	export function trackMessage(responseTime?: number) {
		stats.totalMessages++;
		if (responseTime) {
			stats.avgResponseTime = Math.round(
				(stats.avgResponseTime * (stats.totalMessages - 1) + responseTime) / stats.totalMessages
			);
		}
		saveStats();
	}

	export function exportMarkdown() {
		if (!messages || messages.length === 0) {
			toast.error('Aucune conversation a exporter');
			return;
		}
		let md = `# ${chatTitle || 'Conversation Graden IA'}\n\n`;
		md += `*Exporte le ${new Date().toLocaleDateString('fr-FR')} a ${new Date().toLocaleTimeString('fr-FR')}*\n\n---\n\n`;
		for (const msg of messages) {
			const role = msg.role === 'user' ? '**Vous**' : '**Graden IA**';
			const content = msg.content || '';
			md += `### ${role}\n\n${content}\n\n---\n\n`;
		}
		const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${chatTitle || 'conversation'}-${Date.now()}.md`;
		a.click();
		URL.revokeObjectURL(url);
		toast.success('Export Markdown termine');
	}

	export function exportJSON() {
		const data = {
			title: chatTitle,
			date: new Date().toISOString(),
			messages: messages,
			stats: stats
		};
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${chatTitle || 'conversation'}-${Date.now()}.json`;
		a.click();
		URL.revokeObjectURL(url);
		toast.success('Export JSON termine');
	}

	export function exportPDF() {
		const printWindow = window.open('', '_blank');
		if (!printWindow) {
			toast.error('Pop-up bloque');
			return;
		}
		let html = `<html><head><title>${chatTitle}</title>
		<style>
			body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; color: #333; }
			h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 0.5rem; }
			.msg { margin: 1.5rem 0; padding: 1rem; border-radius: 8px; }
			.user { background: #eff6ff; border-left: 3px solid #2563eb; }
			.assistant { background: #f8fafc; border-left: 3px solid #10b981; }
			.role { font-weight: bold; margin-bottom: 0.5rem; }
			.content { white-space: pre-wrap; line-height: 1.6; }
			.meta { color: #94a3b8; font-size: 0.8rem; margin-top: 2rem; text-align: center; }
		</style></head><body>
		<h1>${chatTitle || 'Conversation Grden IA'}</h1>`;
		for (const msg of messages) {
			const cls = msg.role === 'user' ? 'user' : 'assistant';
			const role = msg.role === 'user' ? 'Vous' : 'Grden IA';
			html += `<div class="msg ${cls}"><div class="role">${role}</div><div class="content">${(msg.content || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div></div>`;
		}
		html += `<div class="meta">Exporte le ${new Date().toLocaleDateString('fr-FR')} | Grden IA</div></body></html>`;
		printWindow.document.write(html);
		printWindow.document.close();
		printWindow.document.close();
		printWindow.print();
		toast.success('Ouvrez l\'impression pour sauvegarder en PDF');
	}

	function applyTemplate(template) {
		const input = document.querySelector('textarea');
		if (input) {
			input.value = template.prompt + ' ';
			input.focus();
			input.dispatchEvent(new Event('input', { bubbles: true }));
		}
		showTemplates = false;
		toast.success(`Template "${template.name}" applique`);
	}

	function initVoice() {
		if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
			const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
			recognition = new SpeechRecognition();
			recognition.continuous = false;
			recognition.interimResults = false;
			recognition.lang = 'fr-FR';
			recognition.onresult = (event) => {
				const transcript = event.results[0][0].transcript;
				const input = document.querySelector('textarea');
				if (input) {
					input.value = transcript;
					input.dispatchEvent(new Event('input', { bubbles: true }));
				}
				isRecording = false;
				toast.success('Voice convertie en texte');
			};
			recognition.onerror = () => { isRecording = false; };
			recognition.onend = () => { isRecording = false; };
		}
	}

	function toggleVoice() {
		if (!recognition) {
			toast.error('Reconnaissance vocale non supportee');
			return;
		}
		if (isRecording) {
			recognition.stop();
			isRecording = false;
		} else {
			recognition.start();
			isRecording = true;
			toast.info('Parlez maintenant...');
		}
	}

	function initPresentationMode() {
		document.addEventListener('keydown', (e) => {
			if (e.key === 'F11') {
				e.preventDefault();
				togglePresentation();
			}
		});
	}

	function togglePresentation() {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen().catch(() => {});
			showPresentation = true;
			$showSidebar = false;
			toast.success('Mode presentation active (Echap pour quitter)');
		} else {
			document.exitFullscreen();
			showPresentation = false;
		}
	}
</script>

<!-- Floating Feature Bar -->
<div class="fixed bottom-24 right-4 z-50 flex flex-col gap-2 items-end">
	<!-- Templates Menu -->
	{#if showTemplates}
		<div class="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-xl shadow-2xl p-3 w-64 max-h-80 overflow-y-auto">
			<div class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-1">Templates rapides</div>
			{#each templates as template}
				<button
					class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm flex items-center gap-2 transition-colors"
					on:click={() => applyTemplate(template)}
				>
					<span class="text-blue-500 flex-shrink-0">
						{#if template.icon === 'summary'}
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
						{:else if template.icon === 'lang'}
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
						{:else if template.icon === 'info'}
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
						{:else if template.icon === 'edit'}
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
						{:else if template.icon === 'reform'}
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
						{:else if template.icon === 'code'}
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
						{:else if template.icon === 'mail'}
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
						{:else if template.icon === 'list'}
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
						{:else if template.icon === 'balance'}
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v17"/><path d="M5 8l7-5 7 5"/><circle cx="5" cy="15" r="3"/><circle cx="19" cy="15" r="3"/></svg>
						{/if}
					</span>
					<span class="text-gray-700 dark:text-gray-200">{template.name}</span>
				</button>
			{/each}
		</div>
	{/if}

	<!-- Stats Modal -->
	{#if showStats}
		<div class="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-xl shadow-2xl p-5 w-72">
			<div class="text-sm font-bold text-gray-800 dark:text-white mb-3">Statistiques</div>
			<div class="space-y-2 text-sm">
				<div class="flex justify-between"><span class="text-gray-500">Messages total</span><span class="font-mono font-bold text-blue-500">{stats.totalMessages}</span></div>
				<div class="flex justify-between"><span class="text-gray-500">Sessions</span><span class="font-mono font-bold text-blue-500">{stats.sessionsCount}</span></div>
				<div class="flex justify-between"><span class="text-gray-500">Temps moyen</span><span class="font-mono font-bold text-blue-500">{stats.avgResponseTime}ms</span></div>
			</div>
			<button class="mt-3 w-full text-xs text-gray-400 hover:text-gray-600" on:click={() => showStats = false}>Fermer</button>
		</div>
	{/if}

	<!-- Export Menu -->
	{#if showExportMenu}
		<div class="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-xl shadow-2xl p-3 w-52">
			<div class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-1">Exporter</div>
			<button class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2" on:click={() => { exportMarkdown(); showExportMenu = false; }}>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
				Markdown
			</button>
			<button class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2" on:click={() => { exportJSON(); showExportMenu = false; }}>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>
				JSON
			</button>
			<button class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2" on:click={() => { exportPDF(); showExportMenu = false; }}>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M10 13h4"/><path d="M10 17h4"/><path d="M10 9h4"/></svg>
				PDF
			</button>
		</div>
	{/if}

	<!-- Buttons -->
	<div class="flex gap-2">
		<button
			class="feature-btn bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
			on:click={() => { showIDE = true; }}
			title="IDE - Ouvrir un dossier"
		>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
		</button>
		<button
			class="feature-btn bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-700 dark:text-gray-200 shadow-lg"
			on:click={() => { showTemplates = !showTemplates; showStats = false; showExportMenu = false; }}
			title="Templates rapides"
		>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
		</button>
		<button
			class="feature-btn bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-700 dark:text-gray-200 shadow-lg"
			on:click={() => { showExportMenu = !showExportMenu; showTemplates = false; showStats = false; }}
			title="Exporter"
		>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
		</button>
		<button
			class="feature-btn bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-700 dark:text-gray-200 shadow-lg"
			on:click={() => { showStats = !showStats; showTemplates = false; showExportMenu = false; }}
			title="Statistiques"
		>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
		</button>
		<button
			class="feature-btn bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-700 dark:text-gray-200 shadow-lg"
			on:click={togglePresentation}
			title="Mode presentation (F11)"
		>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/></svg>
		</button>
		<button
			class="feature-btn shadow-lg {isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-700 dark:text-gray-200'}"
			on:click={toggleVoice}
			title="Mode vocal"
		>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
		</button>
	</div>
</div>

<CodeWorkspace bind:show={showIDE} />

<style>
	:global(.fixed) {
		pointer-events: auto;
	}
	.feature-btn {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}
	.feature-btn:hover {
		transform: scale(1.12);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
	}
	.feature-btn:active {
		transform: scale(0.95);
	}
</style>
