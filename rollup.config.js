var includePaths = require('rollup-plugin-includepaths');
var commonjs = require('rollup-plugin-commonjs');
var nodeResolve = require('rollup-plugin-node-resolve');

module.exports = {
	input: './dist/index.js',
	output: {
		name: 'AwayjsSwfViewer',
		sourcemap: true,
		format: 'umd',
		file: './bundle/awayjs-swf-viewer.umd.js'
	},
	plugins: [
		nodeResolve({
			jsnext: true,
			main: true,
			module: true
		}),
		commonjs({
			namedExports: {
				'node_modules/random-seed/index.js': [ 'create' ]
			},
			include: /node_modules/
		}) ]
};