import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'));
const metaPath = path.resolve(__dirname, '../src/app/meta.js');
let meta = fs.readFileSync(metaPath, 'utf8');

meta = meta.replace(/__BUILD_VERSION__/g, pkg.version);

fs.writeFileSync(metaPath, meta);
console.log(`✅ Updated meta.js to version ${pkg.version}`);
