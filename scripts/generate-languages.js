import { readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const I18N_DIR = join(__dirname, '../src/i18n');
const OUTPUT_FILE = join(__dirname, '../src/js/config/AUTO_GENERATED_LANGUAGES.js');

async function generateLanguages() {
  try {
    const files = await readdir(I18N_DIR);
    const languageKeys = files
      .filter((file) => file.endsWith('.json') && file !== 'fallback.json')
      .map((file) => file.replace('.json', ''));

    const formattedArray = `[\n  ${languageKeys.map((lang) => `'${lang}'`).join(',\n  ')},\n]`;

    const content = `/**
 * ⚠️ This file is auto-generated.
 * Do not edit manually. Changes will be lost.
 */
export const GENERATED_LANGUAGES = ${formattedArray};
`;

    await fs.promises.writeFile(OUTPUT_FILE, content, 'utf-8');
    console.log('✅ Successfully generated list of available languages:', languageKeys);
  } catch (error) {
    console.error('❌ Error during generation of available languages list:', error);
    process.exit(1);
  }
}

generateLanguages();
