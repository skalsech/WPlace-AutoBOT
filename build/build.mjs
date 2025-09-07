// build/build.mjs
import esbuild from 'esbuild';
import fs from 'fs';


const isProd = process.env.NODE_ENV === 'production';

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
let meta = fs.readFileSync(new URL('../src/meta.js', import.meta.url), 'utf8');
meta = meta.replace('__BUILD_VERSION__', pkg.version);

await esbuild.build({
  entryPoints: ['src/js/main.js'],
  outfile: 'dist/script.user.js',
  format: 'iife',
  minify: isProd,
  bundle: true,
  sourcemap: !isProd,
  target: 'es2020',
  banner: {
    js: meta,
  },
});

await esbuild.build({
  entryPoints: ['src/css/main.css'],
  outfile: 'dist/css/main.css',
  minify: isProd,
  bundle: true,
  write: true,
});

fs.cpSync('src/i18n', 'dist/i18n', { recursive: true });

console.log('✅ Build completed!');