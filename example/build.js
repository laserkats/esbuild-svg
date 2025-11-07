import esbuild from 'esbuild';
import svgFunctionPlugin from '../src/svgFunctionPlugin.js';

await esbuild.build({
  entryPoints: ['example/index.js'],
  bundle: true,
  outfile: 'example/dist/app.js',
  plugins: [svgFunctionPlugin()],
});

