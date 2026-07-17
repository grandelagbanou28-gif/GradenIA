<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { generateOpenAIChatCompletion } from '$lib/apis/openai';
	import Code from '$lib/components/icons/Code.svelte';
	import XMark from '$lib/components/icons/XMark.svelte';
	import FolderOpen from '$lib/components/icons/FolderOpen.svelte';
	import Folder from '$lib/components/icons/Folder.svelte';
	import Terminal from '$lib/components/icons/Terminal.svelte';
	import CommandLine from '$lib/components/icons/CommandLine.svelte';
	import Computer from '$lib/components/icons/Computer.svelte';
	import Bolt from '$lib/components/icons/Bolt.svelte';
	import Clipboard from '$lib/components/icons/Clipboard.svelte';
	import Link from '$lib/components/icons/Link.svelte';
	import FloppyDisk from '$lib/components/icons/FloppyDisk.svelte';
	import ChatBubble from '$lib/components/icons/ChatBubble.svelte';
	import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
	import Spinner from '$lib/components/common/Spinner.svelte';
	import XTerminal from './XTerminal.svelte';

	export let show = false;

	let folderPath = '';
	let files: any[] = [];
	let selectedFile: any = null;
	let fileContent = '';
	let isLoading = false;
	let expandedDirs = new Set<string>();

	let editorContainer: HTMLDivElement;
	let editorView: any = null;

	let showTerminal = true;
	let showChat = false;
	let terminalHeight = 200;

	let chatMessages: { role: string; content: string }[] = [];
	let chatInput = '';
	let chatLoading = false;
	let chatContainer: HTMLDivElement;

	let cursorPos = { line: 1, col: 1 };
	let showSearch = false;
	let searchQuery = '';
	let searchMatches: { from: number; to: number }[] = [];
	let currentMatch = 0;
	let contextMenu: { x: number; y: number; file: any } | null = null;

	const isWindows = navigator.platform.includes('Win');
	const isMac = navigator.platform.includes('Mac');

	const QUICK_ACTIONS: { key: string; label: string; icon: string; color: string }[] = [
		{ key: 'analyze', label: 'Analyser', icon: '🔍', color: '#6366f1' },
		{ key: 'fix', label: 'Corriger', icon: '🛠️', color: '#22c55e' },
		{ key: 'explain', label: 'Expliquer', icon: '📖', color: '#3b82f6' },
		{ key: 'optimize', label: 'Optimiser', icon: '⚡', color: '#f59e0b' },
		{ key: 'tests', label: 'Tests', icon: '🧪', color: '#ef4444' },
		{ key: 'doc', label: 'Documenter', icon: '📝', color: '#8b5cf6' },
		{ key: 'deps', label: 'Dependances', icon: '🔗', color: '#ec4899' }
	];

	const ACTION_PROMPTS: Record<string, string> = {
		analyze: "Analyse ce code en detail. Cherche les bugs, mauvaises pratiques, problemes de performance, failles de securite, et tout ce qui doit etre corrige. Donne une liste priorisee.",
		fix: "Corrige tous les problemes dans ce code. Renvoie le code complet corrige dans un bloc de code. Explique chaque correction.",
		explain: "Explique ce code en detail : architecture, flux, chaque fonction, les choix techniques. Sois pedagogique.",
		optimize: "Optimise ce code pour performance et maintenabilite. Renvoie le code optimise dans un bloc de code avec explications.",
		tests: "Genere des tests unitaires complets (jest/vitest/pytest). Inclus cas normaux, limites, erreur. Renvoie le code des tests.",
		doc: "Ajoute documentation complete : docstrings/JSDoc, commentaires, typage TypeScript si applicable. Renvoie le code documente.",
		deps: "Analyse les dependances, imports et modules utilises. Suggere les packages, versions et alternatives."
	};

	function getFileIcon(name: string): { label: string; color: string } {
		const ext = name.split('.').pop()?.toLowerCase();
		const map: Record<string, { label: string; color: string }> = {
			js: { label: 'JS', color: '#f7df1e' }, jsx: { label: 'JX', color: '#61dafb' },
			ts: { label: 'TS', color: '#3178c6' }, tsx: { label: 'TX', color: '#3178c6' },
			py: { label: 'PY', color: '#3776ab' }, html: { label: 'HT', color: '#e34f26' },
			css: { label: 'CS', color: '#1572b6' }, json: { label: 'JS', color: '#000000' },
			md: { label: 'MD', color: '#083fa1' }, svelte: { label: 'SV', color: '#ff3e00' },
			sh: { label: 'SH', color: '#89e051' }, yml: { label: 'YM', color: '#cb171e' },
			xml: { label: 'XL', color: '#0060ac' }
		};
		return map[ext || ''] || { label: ext?.toUpperCase().slice(0, 2) || 'FI', color: '#6b7280' };
	}

	function getFileLang(name: string): string {
		const ext = name.split('.').pop()?.toLowerCase();
		const map: Record<string, string> = {
			js: 'JavaScript', jsx: 'JSX', ts: 'TypeScript', tsx: 'TSX',
			py: 'Python', html: 'HTML', css: 'CSS', scss: 'SCSS',
			json: 'JSON', md: 'Markdown', svelte: 'Svelte', sh: 'Shell',
			yml: 'YAML', xml: 'XML', sql: 'SQL'
		};
		return map[ext || ''] || ext?.toUpperCase() || 'Texte';
	}

	async function initEditor() {
		if (!editorContainer) return;
		if (editorView) { editorView.destroy(); editorView = null; }

		const { EditorView, basicSetup } = await import('codemirror');
		const { EditorState } = await import('@codemirror/state');
		const { oneDark } = await import('@codemirror/theme-one-dark');

		const ext = selectedFile?.name.split('.').pop()?.toLowerCase();
		let langExtension = [];
		if (['js','jsx','ts','tsx','svelte'].includes(ext)) {
			const { javascript } = await import('@codemirror/lang-javascript');
			langExtension = [javascript({ jsx: ext === 'jsx' || ext === 'tsx', typescript: ext === 'ts' || ext === 'tsx' })];
		} else if (ext === 'py') { const { python } = await import('@codemirror/lang-python'); langExtension = [python()]; }
		else if (['html','htm'].includes(ext)) { const { html } = await import('@codemirror/lang-html'); langExtension = [html()]; }
		else if (['css','scss'].includes(ext)) { const { css } = await import('@codemirror/lang-css'); langExtension = [css()]; }
		else if (ext === 'json') { const { json } = await import('@codemirror/lang-json'); langExtension = [json()]; }

		const state = EditorState.create({
			doc: fileContent,
			extensions: [
				basicSetup, oneDark, ...langExtension,
				EditorView.updateListener.of((update) => {
					if (update.docChanged) fileContent = update.state.doc.toString();
				}),
				EditorView.updateListener.of((update) => {
					if (update.selectionSet) {
						const pos = update.state.selection.main.head;
						const line = update.state.doc.lineAt(pos);
						cursorPos = { line: line.number, col: pos - line.from + 1 };
					}
				}),
				EditorView.lineWrapping
			]
		});

		editorView = new EditorView({ state, parent: editorContainer });
		editorView.focus();
	}

	async function selectFolder() {
		if ('showDirectoryPicker' in window) {
			try {
				const dirHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
				folderPath = dirHandle.name;
				isLoading = true;
				files = await readDirectory(dirHandle, '');
				isLoading = false;
				toast.success(`Dossier "${dirHandle.name}" ouvert`);
			} catch (e) {
				if (e.name !== 'AbortError') toast.error('Erreur ouverture dossier');
			}
		} else {
			toast.error('API System Access non supportee dans ce navigateur');
		}
	}

	async function readDirectory(dirHandle: any, basePath: string): Promise<any[]> {
		const entries = [];
		for await (const [name, handle] of dirHandle.entries()) {
			if (name.startsWith('.')) continue;
			const fullPath = basePath ? `${basePath}/${name}` : name;
			if (handle.kind === 'directory') {
				const children = await readDirectory(handle, fullPath);
				entries.push({ name, path: fullPath, isDir: true, handle, children, parent: dirHandle });
			} else {
				entries.push({ name, path: fullPath, isDir: false, handle, parent: dirHandle });
			}
		}
		return entries.sort((a, b) => {
			if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
			return a.name.localeCompare(b.name);
		});
	}

	async function refreshTree() {
		if (!folderPath) return;
		try {
			const dirHandle = files[0]?.parent || await (window as any).showDirectoryPicker();
			files = await readDirectory(dirHandle, '');
		} catch {}
	}

	async function openFile(file: any) {
		if (file.isDir) {
			if (expandedDirs.has(file.path)) expandedDirs.delete(file.path);
			else expandedDirs.add(file.path);
			expandedDirs = expandedDirs;
			return;
		}
		try {
			const content = await file.handle.getFile();
			fileContent = await content.text();
			selectedFile = file;
			cursorPos = { line: 1, col: 1 };
			await tick();
			await initEditor();
		} catch (e) {
			toast.error('Impossible de lire le fichier');
		}
	}

	async function saveFile() {
		if (!selectedFile) return;
		try {
			const writable = await selectedFile.handle.createWritable();
			await writable.write(fileContent);
			await writable.close();
			toast.success(`${selectedFile.name} sauvegarde`);
		} catch (e) {
			toast.error('Erreur sauvegarde');
		}
	}

	function copyPath() {
		if (!selectedFile) return;
		navigator.clipboard.writeText(selectedFile.path);
		toast.success('Chemin copie');
	}

	function openInEditor(editor: string) {
		const commands: Record<string, string> = {
			vscode: `code "${folderPath}"`, cursor: `cursor "${folderPath}"`, zed: `zed "${folderPath}"`,
			finder: isWindows ? `explorer "${folderPath}"` : isMac ? `open "${folderPath}"` : `xdg-open "${folderPath}"`,
			powershell: `powershell -NoExit -Command "cd '${folderPath}'"`, windowsterminal: `wt -d "${folderPath}"`
		};
		const cmd = commands[editor];
		if (cmd) { navigator.clipboard.writeText(cmd); toast.success(`Commande copiee: ${cmd}`); }
	}

	function closeIDE() { show = false; }

	async function sendQuickAction(action: string) {
		if (!selectedFile) { toast.error('Ouvrez un fichier d abord'); return; }
		const prompt = ACTION_PROMPTS[action];
		if (!prompt) return;
		chatInput = prompt;
		await tick();
		await sendChatMessage();
	}

	function getCodeBlocks(text: string): string[] {
		const regex = /```(?:\w+)?\n([\s\S]*?)```/g;
		const blocks: string[] = [];
		let match;
		while ((match = regex.exec(text)) !== null) blocks.push(match[1]);
		return blocks;
	}

	async function applyFix(code: string) {
		fileContent = code;
		await tick();
		await initEditor();
		toast.success('Correction appliquee');
	}

	async function sendChatMessage() {
		if (!chatInput.trim() || chatLoading) return;
		const msg = chatInput.trim();
		chatMessages = [...chatMessages, { role: 'user', content: msg }];
		chatInput = '';
		chatLoading = true;
		await tick();
		if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;

		try {
			const systemPrompt = selectedFile
				? `Tu es un assistant de code expert. Tu aides le developpeur avec son code.
Fichier: ${selectedFile.name}
Langage: ${getFileLang(selectedFile.name)}
Contenu:
\`\`\`
${fileContent || 'vide'}
\`\`\`

Instructions:
- Analyse le code en profondeur
- Si tu suggeres des corrections, renvoie le code complet dans un bloc de code
- Sois technique et precis
- Si tu trouves des bugs, explique-les clairement`
				: "Tu es un assistant de code expert. Reponds de facon concise et technique.";

			const messages = [
				{ role: 'system', content: systemPrompt },
				...chatMessages.map((m) => ({ role: m.role, content: m.content }))
			];

			const token = localStorage.getItem('token') || '';
			const res = await generateOpenAIChatCompletion(token, {
				model: 'qwen2.5-coder:1.5b',
				messages,
				stream: false
			});

			const reply = res?.choices?.[0]?.message?.content || 'Pas de reponse';
			chatMessages = [...chatMessages, { role: 'assistant', content: reply }];
		} catch (e) {
			chatMessages = [...chatMessages, { role: 'assistant', content: `Erreur: ${e}` }];
		}

		chatLoading = false;
		await tick();
		if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
	}

	function handleChatKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
	}

	function toggleSearch() {
		showSearch = !showSearch;
		if (!showSearch) { searchQuery = ''; searchMatches = []; }
		else setTimeout(() => document.getElementById('ide-search-input')?.focus(), 100);
	}

	function performSearch() {
		if (!editorView || !searchQuery) { searchMatches = []; return; }
		const doc = editorView.state.doc;
		const matches: { from: number; to: number }[] = [];
		let pos = 0;
		while (pos < doc.length) {
			const idx = doc.sliceString(pos).toLowerCase().indexOf(searchQuery.toLowerCase());
			if (idx === -1) break;
			const from = pos + idx;
			const to = from + searchQuery.length;
			matches.push({ from, to });
			pos = to;
		}
		searchMatches = matches;
		currentMatch = 0;
		if (matches.length > 0) {
			editorView.dispatch({ selection: { anchor: matches[0].from, head: matches[0].to }, scrollIntoView: true });
		}
	}

	function nextMatch() {
		if (searchMatches.length === 0) return;
		currentMatch = (currentMatch + 1) % searchMatches.length;
		const m = searchMatches[currentMatch];
		editorView.dispatch({ selection: { anchor: m.from, head: m.to }, scrollIntoView: true });
	}

	function prevMatch() {
		if (searchMatches.length === 0) return;
		currentMatch = (currentMatch - 1 + searchMatches.length) % searchMatches.length;
		const m = searchMatches[currentMatch];
		editorView.dispatch({ selection: { anchor: m.from, head: m.to }, scrollIntoView: true });
	}

	async function formatCode() {
		if (!selectedFile) return;
		chatInput = "Formate ce code correctement (indentation, espaces, style). Renvoie uniquement le code formate dans un bloc de code sans explications.";
		showChat = true;
		await tick();
		await sendChatMessage();
	}

	function handleGlobalKeydown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveFile(); }
		if ((e.ctrlKey || e.metaKey) && e.key === 'f') { e.preventDefault(); toggleSearch(); }
		if (e.key === 'Escape') { contextMenu = null; if (showSearch) showSearch = false; }
		if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'F' || e.key === 'À')) { e.preventDefault(); showChat = !showChat; }
	}

	function showContextMenu(e: MouseEvent, file: any) {
		if (!file) return;
		e.preventDefault();
		contextMenu = { x: e.clientX, y: e.clientY, file };
	}

	async function deleteFileEntry(file: any) {
		try {
			await file.handle.remove({ recursive: file.isDir });
			toast.success(`${file.name} supprime`);
			await refreshTree();
		} catch (e) {
			toast.error(`Erreur: ${e.message || e}`);
		}
		contextMenu = null;
	}

	async function renameFileEntry(file: any) {
		const newName = prompt('Nouveau nom:', file.name);
		if (!newName || newName === file.name) { contextMenu = null; return; }
		try {
			const parent = file.parent;
			if (file.isDir) {
				await parent.getDirectoryHandle(newName, { create: true });
			} else {
				await parent.getFileHandle(newName, { create: true });
			}
			toast.success(`${file.name} renomme en ${newName}`);
			await refreshTree();
		} catch (e) {
			toast.error(`Erreur rename: ${e.message || e}`);
		}
		contextMenu = null;
	}

	onMount(() => {
		window.addEventListener('keydown', handleGlobalKeydown);
	});

	onDestroy(() => {
		window.removeEventListener('keydown', handleGlobalKeydown);
		if (editorView) editorView.destroy();
	});
</script>

{#if show}
<div class="fixed inset-0 z-50 flex bg-gray-50 dark:bg-gray-950" on:click={() => contextMenu = null}>
	<!-- Sidebar fichier -->
	<div class="w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col h-full flex-shrink-0">
		<div class="p-3 border-b dark:border-gray-800">
			<div class="flex items-center justify-between mb-2">
				<h2 class="font-bold text-gray-800 dark:text-white text-sm">Projet</h2>
				<button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" on:click={closeIDE}>
					<XMark className="w-4 h-4" />
				</button>
			</div>
			<button
				class="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
				on:click={selectFolder}
			>
				<FolderOpen className="w-4 h-4" />
				{folderPath ? 'Changer' : 'Ouvrir dossier'}
			</button>
		</div>

		{#if folderPath}
		<div class="px-2 py-1.5 border-b dark:border-gray-800">
			<div class="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1 px-1">Ouvrir dans</div>
			<div class="grid grid-cols-4 gap-1">
				<button class="flex flex-col items-center gap-0.5 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={() => openInEditor('vscode')} title="VS Code">
					<Code className="w-4 h-4" /><span class="text-[8px] text-gray-500">VS Code</span>
				</button>
				<button class="flex flex-col items-center gap-0.5 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={() => openInEditor('cursor')} title="Cursor">
					<Bolt className="w-4 h-4" /><span class="text-[8px] text-gray-500">Cursor</span>
				</button>
				<button class="flex flex-col items-center gap-0.5 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={() => openInEditor('finder')} title="Explorateur">
					<FolderOpen className="w-4 h-4" /><span class="text-[8px] text-gray-500">Files</span>
				</button>
				<button class="flex flex-col items-center gap-0.5 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={() => openInEditor('powershell')} title="Terminal">
					<CommandLine className="w-4 h-4" /><span class="text-[8px] text-gray-500">PS</span>
				</button>
			</div>
		</div>
		{/if}

		<div class="flex-1 overflow-y-auto p-1.5" on:contextmenu={(e) => e.preventDefault()}>
			{#if files.length === 0}
				<div class="text-center text-gray-400 text-xs mt-8">
					{#if isLoading}
						<Spinner className="w-5 h-5 mx-auto mb-2" />
						Chargement...
					{:else}
						<div class="flex justify-center mb-2 text-gray-300">
							<FolderOpen className="w-7 h-7" />
						</div>
						Cliquez sur "Ouvrir dossier"
					{/if}
				</div>
			{:else}
				{#each files as file}
					<button
						class="w-full flex items-center gap-1.5 px-1.5 py-0.5 rounded text-xs text-left transition-colors
							{selectedFile?.path === file.path ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}"
						on:click={() => openFile(file)}
						on:contextmenu={(e) => showContextMenu(e, file)}
						style="padding-left: {file.isDir ? '0.25rem' : '1rem'}"
					>
						{#if file.isDir}
							<Folder className="w-3.5 h-3.5 flex-shrink-0" />
						{:else}
							<span class="text-[8px] font-bold px-0.5 rounded flex-shrink-0 leading-tight" style="background-color: {getFileIcon(file.name).color}; color: white; min-width: 16px; text-align: center;">{getFileIcon(file.name).label}</span>
						{/if}
						<span class="truncate">{file.name}</span>
					</button>
					{#if file.isDir && expandedDirs.has(file.path) && file.children}
						{#each file.children as child}
							<button
								class="w-full flex items-center gap-1.5 px-1.5 py-0.5 rounded text-xs text-left transition-colors
									{selectedFile?.path === child.path ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}"
								on:click={() => openFile(child)}
								on:contextmenu={(e) => showContextMenu(e, child)}
								style="padding-left: 1.5rem"
							>
								{#if child.isDir}
									<Folder className="w-3.5 h-3.5 flex-shrink-0" />
								{:else}
									<span class="text-[8px] font-bold px-0.5 rounded flex-shrink-0 leading-tight" style="background-color: {getFileIcon(child.name).color}; color: white; min-width: 16px; text-align: center;">{getFileIcon(child.name).label}</span>
								{/if}
								<span class="truncate">{child.name}</span>
							</button>
						{/each}
					{/if}
				{/each}
			{/if}
		</div>

		{#if folderPath}
		<div class="p-2 border-t dark:border-gray-800 text-[10px] text-gray-400 truncate flex items-center gap-1.5">
			<Folder className="w-3 h-3 flex-shrink-0" />
			{folderPath}
		</div>
		{/if}
	</div>

	<!-- Context Menu -->
	{#if contextMenu}
		<div
			class="fixed z-[100] bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-xl py-1 min-w-[140px]"
			style="left: {contextMenu.x}px; top: {contextMenu.y}px;"
			on:click|stopPropagation
		>
			<button class="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
				on:click={() => { navigator.clipboard.writeText(contextMenu.file.path); toast.success('Chemin copie'); contextMenu = null; }}>
				<Clipboard className="w-3 h-3" /> Copier chemin
			</button>
			<button class="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
				on:click={() => renameFileEntry(contextMenu.file)}>
				✏️ Renommer
			</button>
			<div class="border-t dark:border-gray-700 my-1"></div>
			<button class="w-full text-left px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
				on:click={() => deleteFileEntry(contextMenu.file)}>
				🗑️ Supprimer
			</button>
		</div>
	{/if}

	<!-- Main area -->
	<div class="flex-1 flex flex-col h-full min-w-0">
		<!-- Toolbar -->
		<div class="flex items-center justify-between px-3 py-1.5 bg-white dark:bg-gray-900 border-b dark:border-gray-800 flex-shrink-0">
			<div class="flex items-center gap-2 min-w-0">
				{#if selectedFile}
					<span class="text-[9px] font-bold px-1 rounded" style="background-color: {getFileIcon(selectedFile.name).color}; color: white;">{getFileIcon(selectedFile.name).label}</span>
					<span class="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{selectedFile.name}</span>
					<span class="text-[10px] text-gray-400 truncate hidden sm:inline">{selectedFile.path}</span>
				{:else}
					<span class="text-sm text-gray-400">Graden IDE</span>
				{/if}
			</div>
			<div class="flex items-center gap-1 flex-shrink-0">
				{#if selectedFile}
					<button class="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded transition-colors flex items-center gap-1" on:click={saveFile}>
						<FloppyDisk className="w-3 h-3" /> Sauvegarder
					</button>
					<button class="px-2 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs rounded transition-colors flex items-center gap-1" on:click={copyPath} title="Copier chemin">
						<Clipboard className="w-3 h-3" />
					</button>
					<button class="px-2 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs rounded transition-colors flex items-center gap-1" on:click={formatCode} title="Formater le code">
						<Code className="w-3 h-3" /> Formater
					</button>
					<button class="px-2 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs rounded transition-colors flex items-center gap-1" on:click={toggleSearch} title="Rechercher (Ctrl+F)">
						🔍
					</button>
				{/if}
				<button
					class="px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 {showChat ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}"
					on:click={() => { showChat = !showChat; }} title="Chat code (Ctrl+Shift+F)"
				>
					<ChatBubble className="w-3 h-3" /> Chat
				</button>
				<button
					class="px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 {showTerminal ? 'bg-gray-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}"
					on:click={() => { showTerminal = !showTerminal; }} title="Terminal"
				>
					<Terminal className="w-3 h-3" /> Terminal
				</button>
			</div>
		</div>

		<!-- Search bar -->
		{#if showSearch}
		<div class="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700 flex-shrink-0">
			<input
				id="ide-search-input"
				type="text"
				bind:value={searchQuery}
				on:input={performSearch}
				on:keydown={(e) => { if (e.key === 'Enter') { e.shiftKey ? prevMatch() : nextMatch(); } if (e.key === 'Escape') toggleSearch(); }}
				class="flex-1 px-2 py-1 text-xs bg-white dark:bg-gray-700 border dark:border-gray-600 rounded outline-none text-gray-700 dark:text-gray-200"
				placeholder="Rechercher..."
			/>
			<span class="text-[10px] text-gray-400">
				{#if searchMatches.length > 0}
					{currentMatch + 1}/{searchMatches.length}
				{:else if searchQuery}
					0
				{/if}
			</span>
			<button class="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300" on:click={prevMatch} disabled={searchMatches.length === 0}>&#x25B2;</button>
			<button class="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300" on:click={nextMatch} disabled={searchMatches.length === 0}>&#x25BC;</button>
			<button class="px-1.5 py-0.5 text-xs text-gray-400 hover:text-gray-600" on:click={toggleSearch}>
				<XMark className="w-3 h-3" />
			</button>
		</div>
		{/if}

		<!-- Content area -->
		<div class="flex-1 flex min-h-0">
			<!-- Editor -->
			<div class="flex-1 flex flex-col min-w-0">
				{#if selectedFile}
					<div bind:this={editorContainer} class="flex-1 overflow-hidden"></div>
				{:else}
					<div class="flex-1 flex items-center justify-center">
						<div class="text-center">
							{#if folderPath}
								<div class="flex justify-center mb-3 text-blue-400">
									<FolderOpen className="w-10 h-10" />
								</div>
								<h3 class="text-base font-semibold text-gray-700 dark:text-gray-200 mb-1">{folderPath}</h3>
								<p class="text-xs text-gray-400">Selectionnez un fichier</p>
							{:else}
								<div class="flex justify-center mb-3 text-blue-500">
									<Code className="w-12 h-12" />
								</div>
								<h3 class="text-base font-semibold text-gray-700 dark:text-gray-200 mb-1">Graden IDE</h3>
								<p class="text-xs text-gray-400 mb-3">Ouvrez un dossier pour commencer</p>
								<button class="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 mx-auto" on:click={selectFolder}>
									<FolderOpen className="w-4 h-4" />
									Ouvrir un dossier
								</button>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Status Bar -->
				{#if selectedFile}
				<div class="flex items-center justify-between px-3 py-1 bg-blue-600 text-white text-[10px] flex-shrink-0">
					<div class="flex items-center gap-3">
						<span>{getFileLang(selectedFile.name)}</span>
						<span class="opacity-60">UTF-8</span>
					</div>
					<div class="flex items-center gap-3">
						<span class="opacity-60">Ln {cursorPos.line}, Col {cursorPos.col}</span>
						<span class="opacity-60">{(fileContent.length / 1024).toFixed(1)} KB</span>
					</div>
				</div>
				{/if}
			</div>

			<!-- Code Chat Panel -->
			{#if showChat}
				<div class="w-80 border-l dark:border-gray-800 flex flex-col bg-white dark:bg-gray-900 flex-shrink-0">
					<div class="px-3 py-2 border-b dark:border-gray-800 flex items-center gap-2">
						<ChatBubble className="w-4 h-4 text-blue-500" />
						<span class="text-sm font-medium text-gray-700 dark:text-gray-200">Chat Code</span>
						<button class="ml-auto text-gray-400 hover:text-gray-600" on:click={() => showChat = false}>
							<XMark className="w-3.5 h-3.5" />
						</button>
					</div>

					<!-- Quick Actions -->
					<div class="px-2 py-1.5 border-b dark:border-gray-800 flex flex-wrap gap-1">
						{#each QUICK_ACTIONS as action}
							<button
								class="px-1.5 py-0.5 text-[10px] font-medium rounded transition-all hover:opacity-80 disabled:opacity-40"
								style="background-color: {action.color}15; color: {action.color}; border: 1px solid {action.color}30;"
								on:click={() => sendQuickAction(action.key)}
								disabled={chatLoading || !selectedFile}
								title={action.label}
							>
								{action.icon} {action.label}
							</button>
						{/each}
					</div>

					<div bind:this={chatContainer} class="flex-1 overflow-y-auto p-3 space-y-3">
						{#if chatMessages.length === 0}
							<div class="text-center text-gray-400 text-xs mt-8">
								Utilisez les boutons ci-dessus ou posez une question sur votre code
							</div>
						{/if}
						{#each chatMessages as msg, i}
							<div class="text-xs {msg.role === 'user' ? 'text-right' : ''}">
								<div class="inline-block max-w-full px-2.5 py-1.5 rounded-lg {msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}">
									{#if msg.role === 'assistant'}
										<div class="whitespace-pre-wrap text-left">{msg.content}</div>
										{@const blocks = getCodeBlocks(msg.content)}
										{#if blocks.length > 0}
											<div class="mt-2 flex gap-1">
												<button
													class="px-2 py-0.5 text-[10px] font-medium bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
													on:click={() => applyFix(blocks[0])}
												>
													✅ Appliquer
												</button>
												<button
													class="px-2 py-0.5 text-[10px] font-medium bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded transition-colors"
													on:click={() => { navigator.clipboard.writeText(blocks[0]); toast.success('Code copie'); }}
												>
													📋 Copier
												</button>
												{#if blocks.length > 1}
													<span class="text-[9px] text-gray-400 self-center">{blocks.length} blocs</span>
												{/if}
											</div>
										{/if}
									{:else}
										{msg.content}
									{/if}
								</div>
							</div>
						{/each}
						{#if chatLoading}
							<div class="text-xs">
								<div class="inline-block px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
									<Spinner className="w-3 h-3" />
								</div>
							</div>
						{/if}
					</div>
					<div class="p-2 border-t dark:border-gray-800">
						<div class="flex gap-1.5">
							<textarea
								bind:value={chatInput}
								on:keydown={handleChatKeydown}
								rows="2"
								class="flex-1 px-2.5 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg resize-none outline-none text-gray-700 dark:text-gray-200"
								placeholder="Demander de l'aide..."
							></textarea>
							<button
								class="px-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors self-end"
								on:click={sendChatMessage}
								disabled={chatLoading || !chatInput.trim()}
							>
								<ArrowRight className="w-4 h-4" />
							</button>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Terminal Panel -->
		{#if showTerminal}
			<div class="border-t dark:border-gray-800 flex-shrink-0" style="height: {terminalHeight}px;">
				<div
					class="h-1 cursor-row-resize bg-gray-200 dark:bg-gray-700 hover:bg-blue-400 transition-colors"
					on:mousedown={(e) => {
						e.preventDefault();
						const startY = e.clientY;
						const startH = terminalHeight;
						const onMove = (ev) => { terminalHeight = Math.max(80, startH + (startY - ev.clientY)); };
						const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
						window.addEventListener('mousemove', onMove);
						window.addEventListener('mouseup', onUp);
					}}
				></div>
				<div class="h-full overflow-hidden bg-black">
					<XTerminal local={true} />
				</div>
			</div>
		{/if}
	</div>
</div>
{/if}