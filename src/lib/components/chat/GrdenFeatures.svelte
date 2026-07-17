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
		{ name: 'Resumer', prompt: 'Resums le texte suivant en quelques lignes cle :', icon: '📝' },
		{ name: 'Traduire en FR', prompt: 'Traduis le texte suivant en francais :', icon: '🇫🇷' },
		{ name: 'Traduire en EN', prompt: 'Translate the following text to English:', icon: '🇬🇧' },
		{ name: 'Expliquer', prompt: 'Explique le concept suivant de facon simple et claire :', icon: '💡' },
		{ name: 'Corriger', prompt: 'Corrige les erreurs dans le texte suivant et ameliore-le :', icon: '✏️' },
		{ name: 'Reformuler', prompt: 'Reformule le texte suivant de maniere plus professionnelle :', icon: '🔄' },
		{ name: 'Code', prompt: 'Ecris du code pour :', icon: '💻' },
		{ name: 'Email pro', prompt: 'Redige un email professionnel pour :', icon: '📧' },
		{ name: 'Liste a puces', prompt: 'Transforme en liste a puces :', icon: '📋' },
		{ name: 'Arguments', prompt: 'Donne les arguments pour et contre :', icon: '⚖️' }
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

	// === DRAFT AUTO-SAVE ===
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

	// === NOTIFICATIONS ===
	function initNotifications() {
		if ('Notification' in window && Notification.permission === 'default') {
			Notification.requestPermission();
		}
	}

	export function notifyResponseComplete() {
		if ('Notification' in window && Notification.permission === 'granted') {
			new Notification('Grden IA', {
				body: 'Votre reponse est prete !',
				icon: '/static/graden_blue.png'
			});
		}
	}

	// === STATS ===
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

	// === EXPORT ===
	export function exportMarkdown() {
		if (!messages || messages.length === 0) {
			toast.error('Aucune conversation a exporter');
			return;
		}
		let md = `# ${chatTitle || 'Conversation Grden IA'}\n\n`;
		md += `*Exporte le ${new Date().toLocaleDateString('fr-FR')} a ${new Date().toLocaleTimeString('fr-FR')}*\n\n---\n\n`;
		for (const msg of messages) {
			const role = msg.role === 'user' ? '**Vous**' : '**Grden IA**';
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
		printWindow.print();
		toast.success('Ouvrez l\'impression pour sauvegarder en PDF');
	}

	// === TEMPLATES ===
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

	// === VOICE ===
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

	// === PRESENTATION MODE ===
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
					<span>{template.icon}</span>
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
			<button class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-200" on:click={() => { exportMarkdown(); showExportMenu = false; }}>📄 Markdown</button>
			<button class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-200" on:click={() => { exportJSON(); showExportMenu = false; }}>{'{ }'} JSON</button>
			<button class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-200" on:click={() => { exportPDF(); showExportMenu = false; }}>📑 PDF</button>
		</div>
	{/if}

	<!-- Buttons -->
	<div class="flex gap-2">
		<button
			class="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg flex items-center justify-center text-lg hover:scale-110 transition-transform"
			on:click={() => { showIDE = true; }}
			title="IDE - Ouvrir un dossier"
		>💻</button>
		<button
			class="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-lg flex items-center justify-center text-lg hover:scale-110 transition-transform"
			on:click={() => { showTemplates = !showTemplates; showStats = false; showExportMenu = false; }}
			title="Templates rapides"
		>📝</button>
		<button
			class="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-lg flex items-center justify-center text-lg hover:scale-110 transition-transform"
			on:click={() => { showExportMenu = !showExportMenu; showTemplates = false; showStats = false; }}
			title="Exporter"
		>📥</button>
		<button
			class="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-lg flex items-center justify-center text-lg hover:scale-110 transition-transform"
			on:click={() => { showStats = !showStats; showTemplates = false; showExportMenu = false; }}
			title="Statistiques"
		>📊</button>
		<button
			class="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-lg flex items-center justify-center text-lg hover:scale-110 transition-transform"
			on:click={togglePresentation}
			title="Mode presentation (F11)"
		>🖥️</button>
		<button
			class="w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-lg hover:scale-110 transition-transform {isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white dark:bg-gray-800 border dark:border-gray-700'}"
			on:click={toggleVoice}
			title="Mode vocal"
		>🎤</button>
	</div>
</div>

<CodeWorkspace bind:show={showIDE} />

<style>
	:global(.fixed) {
		pointer-events: auto;
	}
</style>
