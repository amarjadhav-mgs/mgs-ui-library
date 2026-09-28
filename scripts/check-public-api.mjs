// MGS owns every public API (ARCHITECTURE.md → Kinds): no .d.ts in dist/ may reference rsuite or @rsuite/icons.
// The only exceptions are the re-exports still waiting for migration, listed below. Remove each one when it is
// migrated; when the lists are empty, delete them.
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

/** Names dist/index.d.ts may still export from 'rsuite' (ARCHITECTURE.md → Migrating the RSuite re-exports). */
const pendingRsuiteExports = new Set([
  // Phase 0: provider
  'CustomProvider',
  'CustomProviderProps',
  // Phase 1: inputs and button groups
  'Input',
  'InputProps',
  'InputGroup',
  'InputGroupProps',
  'PasswordInput',
  'PasswordInputProps',
  'Textarea',
  'TextareaProps',
  'ButtonGroup',
  'ButtonGroupProps',
  'ButtonToolbar',
  'ButtonToolbarProps',
  // Phase 2: date and time
  'Calendar',
  'CalendarProps',
  'DateInput',
  'DateInputProps',
  'DatePicker',
  'DatePickerProps',
  'DateRangeInput',
  'DateRangeInputProps',
  'DateRangePicker',
  'DateRangePickerProps',
  'TimePicker',
  'TimePickerProps',
  'TimeRangePicker',
  'TimeRangePickerProps',
  'DateRange',
  'after',
  'afterToday',
  'allowedDays',
  'allowedMaxDays',
  'allowedRange',
  'before',
  'beforeToday',
  'combine',
  // Phase 3: badge and avatar
  'Badge',
  'BadgeProps',
  'Avatar',
  'AvatarProps',
  'AvatarGroup',
  'AvatarGroupProps',
]);

/** Files that may still reference @rsuite/icons (phase 0: icons). */
const pendingIconFiles = new Set(['icons/index.d.ts']);

const rsuiteModule = /['"](rsuite|@rsuite\/icons)(\/[^'"]*)?['"]/;
const rsuiteExport = /export\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['"]rsuite['"]/g;
const problems = [];

for (const entry of readdirSync('dist', { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.d.ts')) continue;
  const path = join(entry.parentPath, entry.name);
  const file = relative('dist', path).replaceAll('\\', '/');
  let source = readFileSync(path, 'utf8');

  if (file === 'index.d.ts') {
    source = source.replace(rsuiteExport, (statement, names) => {
      const unexpected = names
        .split(',')
        .map((name) => name.trim())
        .filter((name) => name && !pendingRsuiteExports.has(name));
      return unexpected.length > 0 ? `export { ${unexpected.join(', ')} } from 'rsuite'` : '';
    });
  }
  if (pendingIconFiles.has(file)) {
    source = source.replace(/^.*['"]@rsuite\/icons\/[^'"]+['"].*$/gm, '');
  }

  source.split(/\r?\n/).forEach((line, index) => {
    if (rsuiteModule.test(line)) problems.push(`dist/${file}:${index + 1}: ${line.trim()}`);
  });
}

if (problems.length > 0) {
  console.error('The public API must not expose RSuite (ARCHITECTURE.md → Kinds). Found:');
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}
