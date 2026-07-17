<script lang="ts">
	import { onMount, onDestroy, getContext } from 'svelte';
	import { Terminal } from '@xterm/xterm';
	import { FitAddon } from '@xterm/addon-fit';
	import { WebLinksAddon } from '@xterm/addon-web-links';
	import { WebglAddon } from '@xterm/addon-webgl';
	import { SearchAddon } from '@xterm/addon-search';
	import { SerializeAddon } from '@xterm/addon-serialize';
	import '@xterm/xterm/css/xterm.css';

	import { terminalServers, settings, selectedTerminalId, user } from '$lib/stores';
	import { WEBUI_API_BASE_URL } from '$lib/constants';
	import Tooltip from '$lib/components/common/Tooltip.svelte';

	const i18n = getContext('i18n');

	export let overlay = false;
	export let chatId: string | null = null;
	export let local = false;

	let terminalEl: HTMLDivElement;
	let term: Terminal | null = null;
	let fitAddon: FitAddon | null = null;
	let searchAddon: SearchAddon | null = null;
	let serializeAddon: SerializeAddon | null = null;
	let webglAddon: WebglAddon | null = null;
	let ws: WebSocket | null = null;
	export let connected = false;
	export let connecting = false;
	let resizeObserver: ResizeObserver | null = null;
	let pingInterval: ReturnType<typeof setInterval> | null = null;

	// Resolve the active terminal server's info for the WebSocket URL
	const getTerminalInfo = (): { serverId: string; baseUrl: string } | null => {
		// System terminal (admin-configured, has an `id`)
		const systemTerminals = ($terminalServers ?? []).filter((t: any) => t.id);
		const systemMatch = systemTerminals.find((t: any) => t.id === $selectedTerminalId);
		if (systemMatch) {
			return { serverId: systemMatch.id, baseUrl: WEBUI_API_BASE_URL };
		}

		// Direct terminal (user-configured, matched by URL)
		const directTerminals = ($settings?.terminalServers ?? []).filter((s: any) => s.url);
		const directMatch = directTerminals.find((s: any) => s.url === $selectedTerminalId);
		if (directMatch) {
			return { serverId: '__direct__', baseUrl: directMatch.url };
		}

		return null;
	};

	const connect = async () => {
		if (ws) disconnect();

		const info = getTerminalInfo();
		if (!info) return;

		connecting = true;

		const token = localStorage.getItem('token') ?? '';

		try {
			let sessionId: string;
			let wsUrl: string;
			let authToken: string;

			if (info.serverId === '__direct__') {
				const base = info.baseUrl.replace(/\/$/, '');
				const directTerminals = ($settings?.terminalServers ?? []).filter((s: any) => s.url);
				const directMatch = directTerminals.find((s: any) => s.url === $selectedTerminalId);
				const apiKey = directMatch?.key ?? '';
				authToken = apiKey;

				const createHeaders: Record<string, string> = { Authorization: `Bearer ${apiKey}` };
				if (chatId) createHeaders['X-Session-Id'] = chatId;
				const res = await fetch(`${base}/api/terminals`, {
					method: 'POST',
					headers: createHeaders
				});
				if (!res.ok) throw new Error(`Failed to create session: ${res.status}`);
				const session = await res.json();
				sessionId = session.id;

				const wsBase = base.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:');
				wsUrl = `${wsBase}/api/terminals/${sessionId}`;
			} else {
				const base = info.baseUrl.replace(/\/$/, '');
				authToken = token;

				const proxyHeaders: Record<string, string> = { Authorization: `Bearer ${token}` };
				if (chatId) proxyHeaders['X-Session-Id'] = chatId;
				const res = await fetch(`${base}/terminals/${info.serverId}/api/terminals`, {
					method: 'POST',
					headers: proxyHeaders
				});
				if (!res.ok) throw new Error(`Failed to create session: ${res.status}`);
				const session = await res.json();
				sessionId = session.id;

				const wsBase = base.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:');
				wsUrl = `${wsBase}/terminals/${info.serverId}/api/terminals/${sessionId}`;
			}

			attachWs(wsUrl, authToken);
		} catch (err) {
			connecting = false;
			if (term) {
				term.write(`\r\n\x1b[31m[Error: ${err}]\x1b[0m\r\n`);
			}
		}
	};

	const connectLocal = () => {
		if (ws) disconnect();
		connecting = true;
		const base = WEBUI_API_BASE_URL.replace(/\/$/, '');
		const wsBase = base.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:');
		attachWs(`${wsBase}/api/v1/terminal/local`, null);
	};

	const attachWs = (wsUrl: string, authToken: string | null) => {
		try {
			ws = new WebSocket(wsUrl);
			ws.binaryType = 'arraybuffer';

			ws.onopen = () => {
				if (ws && authToken !== null) {
					ws.send(JSON.stringify({ type: 'auth', token: authToken.trim() }));
				}
				connected = true;
				connecting = false;
				term?.focus();
				sendResize();
				if (pingInterval) clearInterval(pingInterval);
				pingInterval = setInterval(() => {
					if (ws && ws.readyState === WebSocket.OPEN) {
						ws.send(JSON.stringify({ type: 'ping' }));
					}
				}, 25000);
			};

			ws.onmessage = (event) => {
				if (term) {
					if (event.data instanceof ArrayBuffer) {
						term.write(new Uint8Array(event.data));
					} else {
						term.write(event.data);
					}
				}
			};

			ws.onclose = () => {
				connected = false;
				connecting = false;
				if (term) {
					term.write('\r\n\x1b[90m[Terminal closed]\x1b[0m\r\n');
				}
			};

			ws.onerror = () => {
				connected = false;
				connecting = false;
			};
		} catch (err) {
			connecting = false;
			if (term) {
				term.write(`\r\n\x1b[31m[Error: ${err}]\x1b[0m\r\n`);
			}
		}
	};

	const disconnect = () => {
		if (pingInterval) {
			clearInterval(pingInterval);
			pingInterval = null;
		}
		if (ws) {
			ws.close();
			ws = null;
		}
		connected = false;
		connecting = false;
	};

	const sendResize = () => {
		if (term && ws && ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
		}
	};

	const initTerminal = () => {
		if (!terminalEl || term) return;

		term = new Terminal({
			cursorBlink: true,
			fontSize: 13,
			fontFamily:
				"'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, 'Courier New', monospace",
			theme: {
				background: '#000000',
				foreground: '#c0c0c0',
				cursor: '#ffffff',
				cursorAccent: '#000000',
				selectionBackground: '#444444',
				selectionForeground: '#ffffff',
				black: '#000000',
				red: '#cd0000',
				green: '#00cd00',
				yellow: '#cdcd00',
				blue: '#0000ee',
				magenta: '#cd00cd',
				cyan: '#00cdcd',
				white: '#e5e5e5',
				brightBlack: '#7f7f7f',
				brightRed: '#ff0000',
				brightGreen: '#00ff00',
				brightYellow: '#ffff00',
				brightBlue: '#5c5cff',
				brightMagenta: '#ff00ff',
				brightCyan: '#00ffff',
				brightWhite: '#ffffff'
			},
			allowProposedApi: true,
			scrollback: 5000
		});

		fitAddon = new FitAddon();
		searchAddon = new SearchAddon();
		serializeAddon = new SerializeAddon();
		term.loadAddon(fitAddon);
		term.loadAddon(searchAddon);
		term.loadAddon(serializeAddon);
		term.loadAddon(new WebLinksAddon());

		// GPU-accelerated renderer (falls back to DOM automatically)
		try {
			webglAddon = new WebglAddon();
			webglAddon.onContextLoss(() => webglAddon?.dispose());
			term.loadAddon(webglAddon);
		} catch {
			webglAddon = null;
		}

		term.open(terminalEl);

		requestAnimationFrame(() => {
			fitAddon?.fit();
		});

		term.onData((data) => {
			if (ws && ws.readyState === WebSocket.OPEN) {
				ws.send(new TextEncoder().encode(data));
			}
		});

		term.onBinary((data) => {
			if (ws && ws.readyState === WebSocket.OPEN) {
				const buffer = new Uint8Array(data.length);
				for (let i = 0; i < data.length; i++) {
					buffer[i] = data.charCodeAt(i) & 0xff;
				}
				ws.send(buffer);
			}
		});

		// Keep all key events inside xterm (fixes vi/vim/PowerShell key handling)
		term.attachCustomKeyEventHandler(() => true);

		term.onResize(({ cols, rows }) => {
			sendResize();
		});

		resizeObserver = new ResizeObserver(() => {
			requestAnimationFrame(() => {
				fitAddon?.fit();
			});
		});
		resizeObserver.observe(terminalEl);
	};

	// Search overlay (Ctrl+Shift+F)
	let showSearch = false;
	let searchQuery = '';
	let searchCaseSensitive = false;
	let searchWholeWord = false;
	let searchRegex = false;

	function toggleSearch() {
		showSearch = !showSearch;
		if (showSearch) setTimeout(() => document.getElementById('xterm-search-input')?.focus(), 50);
		else clearSearch();
	}

	function runSearch(next: boolean) {
		if (!searchAddon) return;
		if (!searchQuery) {
			searchAddon.clearActiveDecoration();
			return;
		}
		const opts = { caseSensitive: searchCaseSensitive, wholeWord: searchWholeWord, regex: searchRegex };
		if (next) searchAddon.findNext(searchQuery, opts);
		else searchAddon.findPrevious(searchQuery, opts);
	}

	function clearSearch() {
		searchAddon?.clearActiveDecoration();
	}

	function copySelection() {
		if (!term) return;
		const sel = term.getSelection();
		if (sel) navigator.clipboard.writeText(sel);
	}

	function clearTerminal() {
		term?.clear();
	}

	function exportTerminal() {
		if (!serializeAddon || !term) return;
		const data = serializeAddon.serialize();
		const blob = new Blob([data], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'terminal-session.txt';
		a.click();
		URL.revokeObjectURL(url);
	}

	$: if (!local && $selectedTerminalId !== undefined && term) {
		disconnect();
		term.clear();
		if ($selectedTerminalId) {
			connect();
		}
	}

	onMount(() => {
		initTerminal();
	});

	$: if (local && term) {
		disconnect();
		term.clear();
		connectLocal();
	}

	// Terminal-level shortcuts (only when focused inside the terminal)
	function onTerminalKeydown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'F' || e.key === 'À' || e.key === 'f')) {
			e.preventDefault();
			toggleSearch();
		} else if (e.key === 'Escape' && showSearch) {
			e.preventDefault();
			showSearch = false;
			clearSearch();
		} else if (e.key === 'Enter' && showSearch) {
			e.preventDefault();
			runSearch(!e.shiftKey);
		} else if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C') && term?.hasSelection()) {
			copySelection();
		}
	}

	onDestroy(() => {
		disconnect();
		resizeObserver?.disconnect();
		webglAddon?.dispose();
		term?.dispose();
		term = null;
		fitAddon = null;
		searchAddon = null;
		serializeAddon = null;
		webglAddon = null;
	});
</script>

<div class="h-full min-h-0 relative" on:keydown={onTerminalKeydown}>
	<div bind:this={terminalEl} class="absolute inset-0 px-0.5" class:pointer-events-none={overlay} />

	{#if showSearch}
		<div
			class="absolute top-0 right-0 z-10 flex items-center gap-1.5 px-2 py-1 bg-slate-800 border border-slate-700 rounded-bl-lg shadow-lg text-xs"
		>
			<input
				id="xterm-search-input"
				type="text"
				bind:value={searchQuery}
				on:input={() => runSearch(true)}
				placeholder="Rechercher..."
				class="w-36 px-2 py-0.5 bg-slate-900 text-slate-100 rounded outline-none border border-slate-700"
			/>
			<button
				class="px-1.5 py-0.5 rounded hover:bg-slate-700 text-slate-300"
				title="Précédent (Shift+Enter)"
				on:click={() => runSearch(false)}>↑</button
			>
			<button
				class="px-1.5 py-0.5 rounded hover:bg-slate-700 text-slate-300"
				title="Suivant (Enter)"
				on:click={() => runSearch(true)}>↓</button
			>
			<label class="flex items-center gap-0.5 text-slate-400" title="Sensible à la casse">
				<input type="checkbox" bind:checked={searchCaseSensitive} on:change={() => runSearch(true)} />Aa
			</label>
			<label class="flex items-center gap-0.5 text-slate-400" title="Mot entier">
				<input type="checkbox" bind:checked={searchWholeWord} on:change={() => runSearch(true)} />Ab
			</label>
			<label class="flex items-center gap-0.5 text-slate-400" title="Expression régulière">
				<input type="checkbox" bind:checked={searchRegex} on:change={() => runSearch(true)} />.*
			</label>
			<button
				class="px-1.5 py-0.5 rounded hover:bg-slate-700 text-slate-400"
				title="Fermer (Esc)"
				on:click={toggleSearch}>✕</button
			>
		</div>
	{/if}

	<div
		class="absolute bottom-1 right-1 z-10 flex items-center gap-0.5 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity"
	>
		<button
			class="px-1.5 py-0.5 rounded bg-slate-800/90 border border-slate-700 text-slate-300 hover:bg-slate-700 text-[10px]"
			title="Rechercher (Ctrl+Shift+F)"
			on:click={toggleSearch}>🔍</button
		>
		<button
			class="px-1.5 py-0.5 rounded bg-slate-800/90 border border-slate-700 text-slate-300 hover:bg-slate-700 text-[10px]"
			title="Copier la sélection"
			on:click={copySelection}>📋</button
		>
		<button
			class="px-1.5 py-0.5 rounded bg-slate-800/90 border border-slate-700 text-slate-300 hover:bg-slate-700 text-[10px]"
			title="Effacer le terminal"
			on:click={clearTerminal}>🧹</button
		>
		<button
			class="px-1.5 py-0.5 rounded bg-slate-800/90 border border-slate-700 text-slate-300 hover:bg-slate-700 text-[10px]"
			title="Exporter la session"
			on:click={exportTerminal}>💾</button
		>
	</div>
</div>
