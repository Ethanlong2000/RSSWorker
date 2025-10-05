import esbuild from 'esbuild';
import fs from 'fs/promises';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

function buildWorker({ entry, out, debug, external = [] } = {}) {
	return esbuild.build({
		plugins: [NodeModulesPolyfillPlugin()],
		platform: 'browser',
		conditions: ['worker', 'browser'],
		entryPoints: [entry],
		sourcemap: true,
		outfile: out,
		external: [...external, 'cloudflare:sockets'], // 确保添加到外部依赖
		logLevel: 'warning',
		format: 'esm',
		target: 'es2022',
		bundle: true,
		minify: !debug,
		define: {
			IS_CLOUDFLARE_WORKER: 'true',
			// 可选：如果仍然有问题，可以添加这个定义
			// 'import.meta.env.CLOUDFLARE_WORKER': 'true'
		},
		loader: {
			'.html': 'text',
			'.css': 'text',
			'.txt': 'text',
		},
		metafile: true,
		legalComments: 'external',
	});
}

// 构建时不需要再单独指定 cloudflare:sockets，因为函数内部已经添加
let result = await buildWorker({
	entry: './src/worker.js',
	out: './dist/worker.js',
	debug: false,
	external: [] // 这里可以添加其他外部依赖
});

if (result.metafile) {
	await fs.writeFile('./dist/metafile.json', JSON.stringify(result.metafile));
}
