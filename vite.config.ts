import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

import { viteStaticCopy } from 'vite-plugin-static-copy';

const xtermSrc = path.resolve(__dirname, 'vendor/xterm.js');

export default defineConfig({
	plugins: [
		sveltekit(),
		viteStaticCopy({
			targets: [
				{
					src: 'node_modules/onnxruntime-web/dist/*.jsep.*',

					dest: 'wasm'
				}
			]
		})
	],
	resolve: {
		alias: [
			{ find: '@xterm/xterm/css/xterm.css', replacement: `${xtermSrc}/css/xterm.css` },
			{ find: '@xterm/xterm', replacement: `${xtermSrc}/src/browser/public/Terminal.ts` },
			{ find: '@xterm/addon-fit', replacement: `${xtermSrc}/addons/addon-fit/src/FitAddon.ts` },
			{ find: '@xterm/addon-web-links', replacement: `${xtermSrc}/addons/addon-web-links/src/WebLinksAddon.ts` },
			{ find: 'browser/', replacement: `${xtermSrc}/src/browser/` },
			{ find: 'common/', replacement: `${xtermSrc}/src/common/` }
		]
	},
	define: {
		APP_VERSION: JSON.stringify(process.env.npm_package_version),
		APP_BUILD_HASH: JSON.stringify(process.env.APP_BUILD_HASH || 'dev-build')
	},
	build: {
		sourcemap: true
	},
	worker: {
		format: 'es'
	},
	esbuild: {
		pure: process.env.ENV === 'dev' ? [] : ['console.log', 'console.debug', 'console.error']
	}
});
