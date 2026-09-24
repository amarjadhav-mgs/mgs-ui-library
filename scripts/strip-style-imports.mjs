// tsc copies side-effect imports such as `import './Button.scss'` into the .d.ts files.
// Consumers' TypeScript can't resolve them (TS2882), and types never need styles, so remove them.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const styleImport = /^import ['"][^'"]+\.s?css['"];\r?\n/gm;

for (const entry of readdirSync('dist', { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.d.ts')) continue;
  const file = join(entry.parentPath, entry.name);
  const source = readFileSync(file, 'utf8');
  const cleaned = source.replace(styleImport, '');
  if (cleaned !== source) writeFileSync(file, cleaned);
}
