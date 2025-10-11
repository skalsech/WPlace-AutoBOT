import esbuild from 'esbuild';
import fs from 'fs';
import { glob } from 'glob';

const isProd = process.env.NODE_ENV === 'production';

async function build() {
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
    logLevel: 'info',
    define: {
      __DEV__: isProd ? 'false' : 'true',
      __CSS_URL__: isProd 
        ? '"https://skalsech.github.io/WPlace-AutoBOT/custom-main/dist/css/main.css"'
        : '"http://localhost:8000/dist/css/main.css"',
    },
  });

  await esbuild.build({
    entryPoints: ['src/css/main.css'],
    outdir: 'dist',
    minify: isProd,
    bundle: true,
    write: true,
    outbase: 'src',
    logLevel: 'info',
  });

  const themeEntries = await glob('src/css/themes/*.css');
  await esbuild.build({
    entryPoints: themeEntries,
    outdir: 'dist/css/themes',
    minify: isProd,
    bundle: true,
    write: true,
    outbase: 'src/css/themes',
    logLevel: 'info',
  });

  fs.cpSync('src/i18n', 'dist/i18n', { recursive: true, force: true });

  console.log('✅ Build completed!');
}

build()

export { build };