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

	const isWindows = navigator.platform.includes('Win');
	const isMac = navigator.platform.includes('Mac');

	function getFileIcon(name: string): { label: string; color: string } {
		const ext = name.split('.').pop()?.toLowerCase();
		const map: Record<string, { label: string; color: string }> = {
			js: { label: 'JS', color: '#f7df1e' },
			jsx: { label: 'JX', color: '#61dafb' },
			ts: { label: 'TS', color: '#3178c6' },
			tsx: { label: 'TX', color: '#3178c6' },
			py: { label: 'PY', color: '#3776ab' },
			html: { label: 'HT', color: '#e34f26' },
			css: { label: 'CS', color: '#1572b6' },
			json: { label: 'JS', color: '#000000' },
			md: { label: 'MD', color: '#083fa1' },
			svelte: { label: 'SV', color: '#ff3e00' },
			sh: { label: 'SH', color: '#89e051' },
			yml: { label: 'YM', color: '#cb171e' },
			xml: { label: 'XL', color: '#0060ac' }
		};
		return map[ext || ''] || { label: ext?.toUpperCase().slice(0, 2) || 'FI', color: '#6b7280' };
	}

	async function initEditor() {
		if (!editorContainer) return;
		if (editorView) {
			editorView.destroy();
			editorView = null;
		}

		const { EditorView, basicSetup } = await import('codemirror');
		const { EditorState } = await import('@codemirror/state');
		const { oneDark } = await import('@codemirror/theme-one-dark');

		const ext = selectedFile?.name.split('.').pop()?.toLowerCase();
		let langExtension = [];
		if (['js', 'jsx', 'ts', 'tsx', 'svelte'].includes(ext)) {
			const { javascript } = await import('@codemirror/lang-javascript');
			langExtension = [javascript({ jsx: ext === 'jsx' || ext === 'tsx', typescript: ext === 'ts' || ext === 'tsx' })];
		} else if (ext === 'py') {
			const { python } = await import('@codemirror/lang-python');
			langExtension = [python()];
		} else if (ext === 'html' || ext === 'htm') {
			const { html } = await import('@codemirror/lang-html');
			langExtension = [html()];
		} else if (ext === 'css' || ext === 'scss') {
			const { css } = await import('@codemirror/lang-css');
			langExtension = [css()];
		} else if (ext === 'json') {
			const { json } = await import('@codemirror/lang-json');
			langExtension = [json()];
		}

		const updateListener = EditorView.updateListener.of((update) => {
			if (update.docChanged) {
				fileContent = update.state.doc.toString();
			}
		});

		const state = EditorState.create({
			doc: fileContent,
			extensions: [basicSetup, oneDark, ...langExtension, updateListener, EditorView.lineWrapping]
		});

		editorView = new EditorView({ state, parent: editorContainer });
	}

	async function selectFolder() {
		if ('showDirectoryPicker' in window) {
			try {
				const dirHandle = await (window as any).showDirectoryPicker();
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
				entries.push({ name, path: fullPath, isDir: true, handle, children });
			} else {
				entries.push({ name, path: fullPath, isDir: false, handle });
			}
		}
		return entries.sort((a, b) => {
			if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
			return a.name.localeCompare(b.name);
		});
	}

	async function openFile(file: any) {
		if (file.isDir) {
			if (expandedDirs.has(file.path)) {
				expandedDirs.delete(file.path);
			} else {
				expandedDirs.add(file.path);
			}
			expandedDirs = expandedDirs;
			return;
		}
		try {
			const content = await file.handle.getFile();
			fileContent = await content.text();
			selectedFile = file;
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
			vscode: `code "${folderPath}"`,
			cursor: `cursor "${folderPath}"`,
			zed: `zed "${folderPath}"`,
			finder: isWindows ? `explorer "${folderPath}"` : isMac ? `open "${folderPath}"` : `xdg-open "${folderPath}"`,
			powershell: `powershell -NoExit -Command "cd '${folderPath}'"`,
			windowsterminal: `wt -d "${folderPath}"`
		};
		const cmd = commands[editor];
		if (cmd) {
			navigator.clipboard.writeText(cmd);
			toast.success(`Commande copiee: ${cmd}`);
		}
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
			const systemPrompt = `Tu es un assistant de code. Tu aides le developpeur avec son code. Le fichier actuel est: ${selectedFile?.name || 'aucun'}. Le contenu du fichier est:\n\`\`\`\n${fileContent || 'vide'}\n\`\`\`\nReponds de facon concise et technique. Tu peux suggerer du code, expliquer, corriger, etc.`;

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
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendChatMessage();
		}
	}

	onDestroy(() => {
		if (editorView) editorView.destroy();
	});
</script>

{#if show}
<div class="fixed inset-0 z-50 flex bg-gray-50 dark:bg-gray-950">
	<!-- Sidebar fichier -->
	<div class="w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col h-full flex-shrink-0">
		<div class="p-3 border-b dark:border-gray-800">
			<div class="flex items-center justify-between mb-2">
				<h2 class="font-bold text-gray-800 dark:text-white text-sm">Projet</h2>
				<button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" on:click={() => show = false}>
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
					<Code className="w-4 h-4" />
					<span class="text-[8px] text-gray-500">VS Code</span>
				</button>
				<button class="flex flex-col items-center gap-0.5 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={() => openInEditor('cursor')} title="Cursor">
					<Bolt className="w-4 h-4" />
					<span class="text-[8px] text-gray-500">Cursor</span>
				</button>
				<button class="flex flex-col items-center gap-0.5 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={() => openInEditor('finder')} title="Explorateur">
					<FolderOpen className="w-4 h-4" />
					<span class="text-[8px] text-gray-500">Files</span>
				</button>
				<button class="flex flex-col items-center gap-0.5 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={() => openInEditor('powershell')} title="Terminal">
					<CommandLine className="w-4 h-4" />
					<span class="text-[8px] text-gray-500">PS</span>
				</button>
			</div>
		</div>
		{/if}

		<div class="flex-1 overflow-y-auto p-1.5">
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

	<!-- Main area: Editor + Terminal + Chat -->
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
						<FloppyDisk className="w-3 h-3" />
						Sauvegarder
					</button>
					<button class="px-2 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs rounded transition-colors flex items-center gap-1" on:click={copyPath}>
						<Clipboard className="w-3 h-3" />
					</button>
				{/if}
				<button
					class="px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 {showChat ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}"
					on:click={() => { showChat = !showChat; }}
					title="Chat code"
				>
					<ChatBubble className="w-3 h-3" />
					Chat
				</button>
				<button
					class="px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 {showTerminal ? 'bg-gray-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}"
					on:click={() => { showTerminal = !showTerminal; }}
					title="Terminal"
				>
					<Terminal className="w-3 h-3" />
					Terminal
				</button>
			</div>
		</div>

		<!-- Content area: Editor + optional Chat sidebar -->
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
					<div bind:this={chatContainer} class="flex-1 overflow-y-auto p-3 space-y-3">
						{#if chatMessages.length === 0}
							<div class="text-center text-gray-400 text-xs mt-8">
								Demandez de l'aide sur votre code
							</div>
						{/if}
						{#each chatMessages as msg}
							<div class="text-xs {msg.role === 'user' ? 'text-right' : ''}">
								<div class="inline-block max-w-full px-2.5 py-1.5 rounded-lg {msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}">
									{#if msg.role === 'assistant'}
										<div class="whitespace-pre-wrap">{msg.content}</div>
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
