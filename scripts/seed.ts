/**
 * Seed R2 bucket with exercise JSON data.
 *
 * Usage:
 *   yarn seed          # seeds local R2 emulation (for wrangler dev)
 *   yarn seed:remote   # seeds production R2 bucket
 */
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isRemote = process.argv.includes('--remote');
const persistFlag = isRemote ? '--remote' : '--local';

const JSON_PACKAGE = path.resolve(__dirname, '../../exercises-json');

const LOCALES = ['en', 'es'];
const FILES = ['exercises.json', 'equipment.json', 'muscle_groups.json'];

const BUCKET = 'kinetic-exercises';

let uploaded = 0;
let skipped = 0;

for (const locale of LOCALES) {
  for (const file of FILES) {
    const filePath = path.join(JSON_PACKAGE, locale, file);

    if (!fs.existsSync(filePath)) {
      console.log(`  ⏭  Skipping ${locale}/${file} (not found)`);
      skipped++;
      continue;
    }

    const key = `${locale}/${file}`;
    console.log(`  📦 Uploading ${key} …`);

    try {
      execSync(
        `npx wrangler r2 object put "${BUCKET}/${key}" --file "${filePath}" --content-type "application/json" ${persistFlag}`,
        { cwd: path.resolve(__dirname, '..'), stdio: 'pipe' }
      );
      uploaded++;
    } catch (err: any) {
      console.error(`  ✘ Failed to upload ${key}: ${err.message}`);
      process.exit(1);
    }
  }
}

console.log(
  `\n✅ Seeded ${uploaded} files to R2 ${isRemote ? '(remote)' : '(local)'}${skipped > 0 ? `, ${skipped} skipped` : ''}`
);
