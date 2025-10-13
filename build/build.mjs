import esbuild from 'esbuild';
import fs from 'fs';
import { glob } from 'glob';
import * as path from 'node:path';

const isProd = process.env.NODE_ENV === 'production';

async function build() {
  const distDir = path.resolve('dist');

  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
    console.log('🧹 dist cleaned up before build');
  }

  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  let meta = fs.readFileSync(new URL('../src/app/meta.js', import.meta.url), 'utf8');
  meta = meta.replace('__BUILD_VERSION__', pkg.version);

  await esbuild.build({
    entryPoints: ['src/app/main.js'],
    outfile: 'dist/script.user.js',
    format: 'iife',
    minify: isProd,
    bundle: true,
    sourcemap: isProd ? false : 'inline',
    target: 'es2020',
    banner: {
      js: meta,
    },
    logLevel: 'info',
    define: {
      __DEV__: isProd ? 'false' : 'true',
      __CSS_BASE_URL__: isProd
        ? '"https://skalsech.github.io/WPlace-AutoBOT/custom-main/dist/css"'
        : '"http://localhost:8000/dist/css"',
    },
  });

  await esbuild.build({
    entryPoints: ['src/assets/css/main.css'],
    outdir: 'dist/css/',
    minify: isProd,
    bundle: true,
    write: true,
    logLevel: 'info',
  });

  const themeEntries = await glob('src/assets/css/themes/*.css');
  await esbuild.build({
    entryPoints: themeEntries,
    outdir: 'dist/css/themes',
    bundle: true,
    minify: isProd,
    write: true,
    logLevel: 'info',
  });

  try {
    fs.cpSync('src/i18n/locales', 'dist/i18n', {
      recursive: true,
      force: true,
      filter: (src) => {
        try {
          const st = fs.statSync(src);
          if (st.isDirectory()) return true;
        } catch (e) {
        }
        return src.toLowerCase().endsWith('.json');
      }
    });
  } catch (err) {
    console.warn('fs.cpSync with filter is not supported', err.message);
  }
  console.log('✅ Build completed!');
}

await build()
