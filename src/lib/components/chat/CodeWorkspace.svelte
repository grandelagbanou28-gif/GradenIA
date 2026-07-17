<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';
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

	export let show = false;

	let folderPath = '';
	let files: any[] = [];
	let selectedFile: any = null;
	let fileContent = '';
	let isLoading = false;
	let expandedDirs = new Set<string>();
	let editorElement: HTMLTextAreaElement;

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
			sql: { label: 'DB', color: '#e48e00' },
			sh: { label: 'SH', color: '#89e051' },
			yml: { label: 'YM', color: '#cb171e' },
			yaml: { label: 'YM', color: '#cb171e' },
			xml: { label: 'XL', color: '#0060ac' },
			svelte: { label: 'SV', color: '#ff3e00' }
		};
		return map[ext || ''] || { label: ext?.toUpperCase().slice(0, 2) || 'FI', color: '#6b7280' };
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
		} catch (e) {
			toast.error('Impossible de lire le fichier');
		}
	}

	function handleInput(e: Event) {
		fileContent = (e.target as HTMLTextAreaElement).value;
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
			powershell: isWindows ? `powershell -Command "cd '${folderPath}'; Start-Process powershell"` : `cd "${folderPath}" && bash`,
			windowsterminal: `wt -d "${folderPath}"`
		};
		const cmd = commands[editor];
		if (cmd) {
			navigator.clipboard.writeText(cmd);
			toast.success(`Commande copiee: ${cmd}`);
		}
	}
</script>

{#if show}
<div class="fixed inset-0 z-50 flex bg-gray-50 dark:bg-gray-950">
	<!-- Sidebar fichier -->
	<div class="w-72 bg-white dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col h-full">
		<!-- Header -->
		<div class="p-4 border-b dark:border-gray-800">
			<div class="flex items-center justify-between mb-3">
				<h2 class="font-bold text-gray-800 dark:text-white text-sm">Projet</h2>
				<button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" on:click={() => show = false}>
					<XMark className="w-5 h-5" />
				</button>
			</div>
			<button
				class="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
				on:click={selectFolder}
			>
				<FolderOpen className="w-4 h-4" />
				{folderPath ? 'Changer de dossier' : 'Ouvrir un dossier'}
			</button>
		</div>

		<!-- Open-in buttons -->
		{#if folderPath}
		<div class="px-3 py-2 border-b dark:border-gray-800">
			<div class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Ouvrir dans</div>
			<div class="grid grid-cols-4 gap-1.5">
				<button class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={() => openInEditor('vscode')} title="VS Code">
					<Code className="w-5 h-5" />
					<span class="text-[9px] text-gray-500">VS Code</span>
				</button>
				<button class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={() => openInEditor('cursor')} title="Cursor">
					<Bolt className="w-5 h-5" />
					<span class="text-[9px] text-gray-500">Cursor</span>
				</button>
				<button class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={() => openInEditor('zed')} title="Zed">
					<Computer className="w-5 h-5" />
					<span class="text-[9px] text-gray-500">Zed</span>
				</button>
				<button class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={() => openInEditor('finder')} title="Explorateur">
					<FolderOpen className="w-5 h-5" />
					<span class="text-[9px] text-gray-500">{isWindows ? 'Explorer' : isMac ? 'Finder' : 'Files'}</span>
				</button>
				<button class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={() => openInEditor('powershell')} title="Terminal">
					<CommandLine className="w-5 h-5" />
					<span class="text-[9px] text-gray-500">{isWindows ? 'PS' : 'Term'}</span>
				</button>
				<button class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={() => openInEditor('windowsterminal')} title="Windows Terminal">
					<Terminal className="w-5 h-5" />
					<span class="text-[9px] text-gray-500">WT</span>
				</button>
				<button class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={copyPath} title="Copier chemin">
					<Clipboard className="w-5 h-5" />
					<span class="text-[9px] text-gray-500">Chemin</span>
				</button>
				<button class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={copyPath} title="Copier chemin format terminal">
					<Link className="w-5 h-5" />
					<span class="text-[9px] text-gray-500">Copy</span>
				</button>
			</div>
		</div>
		{/if}

		<!-- File tree -->
		<div class="flex-1 overflow-y-auto p-2">
			{#if files.length === 0}
				<div class="text-center text-gray-400 text-sm mt-8">
					{#if isLoading}
						<div class="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
						Chargement...
					{:else}
						<div class="flex justify-center mb-2 text-gray-300">
							<FolderOpen className="w-8 h-8" />
						</div>
						Cliquez sur "Ouvrir un dossier" pour commencer
					{/if}
				</div>
			{:else}
				{#each files as file}
					<button
						class="w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-sm text-left transition-colors
							{selectedFile?.path === file.path ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}"
						on:click={() => openFile(file)}
						style="padding-left: {file.isDir ? '0.5rem' : '1.25rem'}"
					>
						{#if file.isDir}
							<Folder className="w-4 h-4 flex-shrink-0" />
						{:else}
							<span class="text-[9px] font-bold px-1 rounded flex-shrink-0" style="background-color: {getFileIcon(file.name).color}; color: white; min-width: 20px; text-align: center;">{getFileIcon(file.name).label}</span>
						{/if}
						<span class="truncate">{file.name}</span>
					</button>
					{#if file.isDir && expandedDirs.has(file.path) && file.children}
						{#each file.children as child}
							<button
								class="w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-sm text-left transition-colors
									{selectedFile?.path === child.path ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}"
								on:click={() => openFile(child)}
								style="padding-left: 2rem"
							>
								{#if child.isDir}
									<Folder className="w-4 h-4 flex-shrink-0" />
								{:else}
									<span class="text-[9px] font-bold px-1 rounded flex-shrink-0" style="background-color: {getFileIcon(child.name).color}; color: white; min-width: 20px; text-align: center;">{getFileIcon(child.name).label}</span>
								{/if}
								<span class="truncate">{child.name}</span>
							</button>
						{/each}
					{/if}
				{/each}
			{/if}
		</div>

		<!-- Footer -->
		{#if folderPath}
		<div class="p-3 border-t dark:border-gray-800 text-xs text-gray-400 truncate flex items-center gap-2">
			<Folder className="w-3 h-3 flex-shrink-0" />
			{folderPath}
		</div>
		{/if}
	</div>

	<!-- Editor area -->
	<div class="flex-1 flex flex-col h-full">
		{#if selectedFile}
			<!-- Tab bar -->
			<div class="flex items-center justify-between px-3 py-1.5 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
				<div class="flex items-center gap-2">
					<span class="text-[9px] font-bold px-1 rounded" style="background-color: {getFileIcon(selectedFile.name).color}; color: white;">{getFileIcon(selectedFile.name).label}</span>
					<span class="text-sm font-medium text-gray-700 dark:text-gray-200">{selectedFile.name}</span>
					<span class="text-xs text-gray-400">{selectedFile.path}</span>
				</div>
				<div class="flex items-center gap-1">
					<button
						class="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1"
						on:click={saveFile}
					>
						<FloppyDisk className="w-3.5 h-3.5" />
						Sauvegarder
					</button>
					<button
						class="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-medium rounded-md transition-colors flex items-center gap-1"
						on:click={copyPath}
					>
						<Clipboard className="w-3.5 h-3.5" />
						Chemin
					</button>
				</div>
			</div>
			<!-- Editor -->
			<textarea
				bind:this={editorElement}
				value={fileContent}
				on:input={handleInput}
				spellcheck="false"
				class="flex-1 w-full h-full resize-none bg-gray-900 text-gray-100 font-mono text-sm p-4 outline-none border-none"
				style="tab-size: 2;"
			></textarea>
		{:else}
			<div class="flex-1 flex items-center justify-center">
				<div class="text-center">
					{#if folderPath}
						<div class="flex justify-center mb-4 text-blue-400">
							<FolderOpen className="w-12 h-12" />
						</div>
						<h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Dossier ouvert: {folderPath}</h3>
						<p class="text-sm text-gray-400">Selectionnez un fichier pour l'editer</p>
					{:else}
						<div class="flex justify-center mb-4 text-blue-500">
							<Code className="w-14 h-14" />
						</div>
						<h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Bienvenue dans Graden IDE</h3>
						<p class="text-sm text-gray-400 mb-4">Ouvrez un dossier pour commencer a coder</p>
						<button
							class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
							on:click={selectFolder}
						>
							<FolderOpen className="w-4 h-4" />
							Ouvrir un dossier
						</button>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
{/if}
