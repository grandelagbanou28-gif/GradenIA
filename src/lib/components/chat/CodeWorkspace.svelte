<script lang="ts">
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
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
					<span class="text-lg">💙</span>
					<span class="text-[9px] text-gray-500">VS Code</span>
				</button>
				<button class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={() => openInEditor('cursor')} title="Cursor">
					<span class="text-lg">🔮</span>
					<span class="text-[9px] text-gray-500">Cursor</span>
				</button>
				<button class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={() => openInEditor('zed')} title="Zed">
					<span class="text-lg">⚡</span>
					<span class="text-[9px] text-gray-500">Zed</span>
				</button>
				<button class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={() => openInEditor('finder')} title="Explorateur">
					<span class="text-lg">📁</span>
					<span class="text-[9px] text-gray-500">{isWindows ? 'Explorer' : isMac ? 'Finder' : 'Files'}</span>
				</button>
				<button class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={() => openInEditor('powershell')} title="Terminal">
					<span class="text-lg">🖥️</span>
					<span class="text-[9px] text-gray-500">{isWindows ? 'PowerShell' : 'Terminal'}</span>
				</button>
				<button class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={() => openInEditor('windowsterminal')} title="Windows Terminal">
					<span class="text-lg">⬛</span>
					<span class="text-[9px] text-gray-500">WT</span>
				</button>
				<button class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={copyPath} title="Copier chemin">
					<span class="text-lg">📋</span>
					<span class="text-[9px] text-gray-500">Chemin</span>
				</button>
				<button class="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" on:click={copyPath} title="Copier chemin format terminal">
					<span class="text-lg">📎</span>
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
							<span class="text-xs">{expandedDirs.has(file.path) ? '📂' : '📁'}</span>
						{:else}
							<span class="text-xs">{getFileIcon(file.name)}</span>
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
								<span class="text-xs">{child.isDir ? '📁' : getFileIcon(child.name)}</span>
								<span class="truncate">{child.name}</span>
							</button>
						{/each}
					{/if}
				{/each}
			{/if}
		</div>

		<!-- Footer -->
		{#if folderPath}
		<div class="p-3 border-t dark:border-gray-800 text-xs text-gray-400 truncate">
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
					<span class="text-sm">{getFileIcon(selectedFile.name)}</span>
					<span class="text-sm font-medium text-gray-700 dark:text-gray-200">{selectedFile.name}</span>
					<span class="text-xs text-gray-400">{selectedFile.path}</span>
				</div>
				<div class="flex items-center gap-1">
					<button
						class="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-md transition-colors"
						on:click={saveFile}
					>
						💾 Sauvegarder
					</button>
					<button
						class="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-medium rounded-md transition-colors"
						on:click={copyPath}
					>
						📋 Copier chemin
					</button>
				</div>
			</div>
			<!-- Editor -->
			<div bind:this={editorElement} class="flex-1 overflow-hidden"></div>
		{:else}
			<div class="flex-1 flex items-center justify-center">
				<div class="text-center">
					{#if folderPath}
						<div class="text-6xl mb-4">📂</div>
						<h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Dossier ouvert: {folderPath}</h3>
						<p class="text-sm text-gray-400">Selectionnez un fichier pour l'editer</p>
					{:else}
						<div class="text-6xl mb-4">🚀</div>
						<h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Bienvenue dans Grden IDE</h3>
						<p class="text-sm text-gray-400 mb-4">Ouvrez un dossier pour commencer a coder</p>
						<button
							class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
							on:click={selectFolder}
						>
							📁 Ouvrir un dossier
						</button>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
{/if}
