<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';

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

	function getFileIcon(name: string): string {
		const ext = name.split('.').pop()?.toLowerCase();
		const icons: Record<string, string> = {
			js: 'JS', jsx: 'JX', ts: 'TS', tsx: 'TX', py: 'PY', html: 'HT',
			css: 'CS', json: 'JS', md: 'MD', txt: 'TX', png: 'IM', jpg: 'IM',
			svg: 'SV', gif: 'IM', sql: 'DB', sh: 'SH', bat: 'BT', yml: 'YM',
			yaml: 'YM', xml: 'XL', csv: 'CS', toml: 'TM', ini: 'CF', env: 'CF'
		};
		return icons[ext || ''] || 'FI';
	}

	function getFileColor(name: string): string {
		const ext = name.split('.').pop()?.toLowerCase();
		const colors: Record<string, string> = {
			js: '#f7df1e', jsx: '#61dafb', ts: '#3178c6', tsx: '#3178c6',
			py: '#3776ab', html: '#e34f26', css: '#1572b6', json: '#000000',
			md: '#083fa1', sql: '#e48e00', sh: '#89e051', yml: '#cb171e'
		};
		return colors[ext || ''] || '#6b7280';
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
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
				</button>
			</div>
			<button
				class="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
				on:click={selectFolder}
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
				{folderPath ? 'Changer de dossier' : 'Ouvrir un dossier'}
			</button>
		</div>

		<!-- Open-in buttons -->
		{#if folderPath}
		<div class="px-3 py-2 border-b dark:border-gray-800">
			<div class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Ouvrir dans</div>
			<div class="grid grid-cols-4 gap-1.5">
				<button class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={() => openInEditor('vscode')} title="VS Code">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007acc" stroke-width="2"><path d="M16 18l6-6-6-6"/><path d="M8 6l-6 6 6 6"/></svg>
					<span class="text-[9px] text-gray-500">VS Code</span>
				</button>
				<button class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={() => openInEditor('cursor')} title="Cursor">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
					<span class="text-[9px] text-gray-500">Cursor</span>
				</button>
				<button class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={() => openInEditor('zed')} title="Zed">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
					<span class="text-[9px] text-gray-500">Zed</span>
				</button>
				<button class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={() => openInEditor('finder')} title="Explorateur">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
					<span class="text-[9px] text-gray-500">{isWindows ? 'Explorer' : isMac ? 'Finder' : 'Files'}</span>
				</button>
				<button class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={() => openInEditor('powershell')} title="Terminal">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
					<span class="text-[9px] text-gray-500">{isWindows ? 'PS' : 'Term'}</span>
				</button>
				<button class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={() => openInEditor('windowsterminal')} title="Windows Terminal">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
					<span class="text-[9px] text-gray-500">WT</span>
				</button>
				<button class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={copyPath} title="Copier chemin">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
					<span class="text-[9px] text-gray-500">Chemin</span>
				</button>
				<button class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={copyPath} title="Copier chemin format terminal">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
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
						<svg class="mx-auto mb-2 text-gray-300" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
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
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
						{:else}
							<span class="text-[9px] font-bold px-1 rounded" style="background-color: {getFileColor(file.name)}; color: white; min-width: 20px; text-align: center;">{getFileIcon(file.name)}</span>
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
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
								{:else}
									<span class="text-[9px] font-bold px-1 rounded" style="background-color: {getFileColor(child.name)}; color: white; min-width: 20px; text-align: center;">{getFileIcon(child.name)}</span>
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
			<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
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
					<span class="text-[9px] font-bold px-1 rounded" style="background-color: {getFileColor(selectedFile.name)}; color: white;">{getFileIcon(selectedFile.name)}</span>
					<span class="text-sm font-medium text-gray-700 dark:text-gray-200">{selectedFile.name}</span>
					<span class="text-xs text-gray-400">{selectedFile.path}</span>
				</div>
				<div class="flex items-center gap-1">
					<button
						class="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1"
						on:click={saveFile}
					>
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
						Sauvegarder
					</button>
					<button
						class="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-medium rounded-md transition-colors flex items-center gap-1"
						on:click={copyPath}
					>
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
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
						<svg class="mx-auto mb-4 text-blue-400" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
						<h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Dossier ouvert: {folderPath}</h3>
						<p class="text-sm text-gray-400">Selectionnez un fichier pour l'editer</p>
					{:else}
						<svg class="mx-auto mb-4 text-blue-500" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
						<h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Bienvenue dans Graden IDE</h3>
						<p class="text-sm text-gray-400 mb-4">Ouvrez un dossier pour commencer a coder</p>
						<button
							class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
							on:click={selectFolder}
						>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
							Ouvrir un dossier
						</button>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
{/if}
