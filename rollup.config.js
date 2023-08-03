import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default {
	input: './dist/index.js',
	output: {
		name: 'AwayflSwfLoader',
		globals: {
			'@awayjs/core': 'AwayjsCore',
			'@awayjs/stage': 'AwayjsStage',
			'@awayjs/view': 'AwayjsView',
			'@awayjs/renderer': 'AwayjsRenderer',
			'@awayjs/graphics': 'AwayjsGraphics',
			'@awayjs/materials': 'AwayjsMaterials',
			'@awayjs/scene': 'AwayjsScene'
		},
		sourcemap: true,
		format: 'umd',
		file: './bundle/awayfl-swf-loader.umd.js'
	},
	external: [
		'@awayjs/core',
		'@awayjs/stage',
		'@awayjs/view',
		'@awayjs/renderer',
		'@awayjs/graphics',
		'@awayjs/materials',
		'@awayjs/scene'
	],
	plugins: [
		nodeResolve(),
		commonjs(),
		terser(),
	]
};