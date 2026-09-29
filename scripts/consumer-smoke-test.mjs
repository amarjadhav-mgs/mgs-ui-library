// Consumer smoke test: uses @mgs/ui the way an app does. Packs dist/ (run `npm run build` first), installs the tarball
// into a fresh React + TypeScript + Vite app in a temp folder, then typechecks it with strict settings
// (skipLibCheck: false) and builds it. Catches what the library's own checks can't see: broken package exports, types
// that fail in apps, missing peer dependencies, CSS that doesn't resolve.
import { execSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Type errors inside RSuite's own .d.ts files (and its dom-lib dependency) that apps with skipLibCheck: false get today:
// they reference types RSuite doesn't ship (the test type 'Chai', Node's 'NodeJS'). MGS's own types never reference
// RSuite (scripts/check-public-api.mjs), so these reach apps only through the RSuite re-exports still waiting for
// migration, and go away with them (implementation plan, phases 1 to 3); then delete this allowance.
const knownRSuiteErrors = /^node_modules[\\/](rsuite|dom-lib)[\\/]/;

const library = JSON.parse(readFileSync('package.json', 'utf8'));
const version = (name) => library.devDependencies[name];
// Progress goes to stdout (the lint rule allows console.warn/error only, for problems).
const log = (message) =>
  process.stdout.write(`${message}
`);
const run = (command, cwd) => execSync(command, { cwd, stdio: 'pipe', encoding: 'utf8' });

const root = mkdtempSync(join(tmpdir(), 'mgs-ui-consumer-'));
try {
  const tarball = run(`npm pack --silent --pack-destination "${root}"`).trim().split('\n').pop();
  const app = join(root, 'app');
  mkdirSync(join(app, 'src'), { recursive: true });

  const files = {
    'package.json': {
      name: 'mgs-ui-consumer',
      private: true,
      type: 'module',
      dependencies: {
        '@mgs/ui': `file:../${tarball}`,
        react: version('react'),
        'react-dom': version('react-dom'),
      },
      devDependencies: {
        '@types/react': version('@types/react'),
        '@types/react-dom': version('@types/react-dom'),
        '@vitejs/plugin-react': version('@vitejs/plugin-react'),
        typescript: version('typescript'),
        vite: version('vite'),
      },
    },
    'tsconfig.json': {
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'bundler',
        jsx: 'react-jsx',
        strict: true,
        skipLibCheck: false,
        noEmit: true,
        // As in Vite's React + TypeScript template: Vite's client types, no Node types.
        types: ['vite/client'],
      },
      include: ['src'],
    },
    'vite.config.js': `import react from '@vitejs/plugin-react';\nexport default { plugins: [react()] };\n`,
    'index.html': `<!doctype html><html lang="en-GB"><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n`,
    'src/main.tsx': `import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@mgs/ui/styles.css';
import {
  Button,
  Checkbox,
  CheckboxGroup,
  DatePicker,
  IconButton,
  Input,
  MgsProvider,
  NumberInput,
  PasswordInput,
  PlusIcon,
  Radio,
  RadioGroup,
  Textarea,
  TrashIcon,
  VisuallyHidden,
  type ButtonProps,
  type MgsTheme,
} from '@mgs/ui';

const save: ButtonProps = { variant: 'primary', children: 'Save' };

function App() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | null>(null);
  const [updates, setUpdates] = useState(false);
  const [channels, setChannels] = useState<string[]>([]);
  const [delivery, setDelivery] = useState<string | null>(null);
  const [theme] = useState<MgsTheme>('light');
  return (
    <MgsProvider theme={theme} locale="en-IN">
      <label htmlFor="name">Name</label>
      <Input id="name" value={name} onChange={setName} />
      <PasswordInput aria-label="Password" />
      <NumberInput aria-label="Price" prefix="₹" decimals={2} value={price} onChange={setPrice} />
      <Textarea aria-label="Notes" autosize maxRows={4} />
      <Checkbox checked={updates} onChange={setUpdates}>
        Send me updates
      </Checkbox>
      <CheckboxGroup aria-label="Notify me by" value={channels} onChange={setChannels}>
        <Checkbox value="email">Email</Checkbox>
        <Checkbox value="sms">SMS</Checkbox>
      </CheckboxGroup>
      <RadioGroup aria-label="Delivery" value={delivery} onChange={setDelivery}>
        <Radio value="standard">Standard</Radio>
        <Radio value="express">Express</Radio>
      </RadioGroup>
      <DatePicker label="Due date" />
      <Button leftIcon={<PlusIcon />}>
        Add <VisuallyHidden>order</VisuallyHidden>
      </Button>
      <Button {...save} />
      <IconButton aria-label="Delete" variant="danger">
        <TrashIcon />
      </IconButton>
    </MgsProvider>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
`,
  };
  for (const [file, content] of Object.entries(files)) {
    writeFileSync(
      join(app, file),
      typeof content === 'string' ? content : `${JSON.stringify(content, null, 2)}\n`,
    );
  }

  log('Installing the packed library into a fresh app…');
  run('npm install --no-audit --no-fund --loglevel=error', app);

  log('Typechecking with strict: true, skipLibCheck: false…');
  let typeErrors = '';
  try {
    run('npx tsc -p .', app);
  } catch (error) {
    typeErrors = `${error.stdout ?? ''}${error.stderr ?? ''}`;
  }
  const lines = typeErrors.split(/\r?\n/).filter((line) => /error TS\d+/.test(line));
  const unexpected = lines.filter((line) => !knownRSuiteErrors.test(line));
  if (unexpected.length > 0) {
    console.error('Type errors an app would get from @mgs/ui:');
    for (const line of unexpected) console.error(`  ${line}`);
    process.exitCode = 1;
  } else {
    const known = lines.length;
    log(
      known > 0
        ? `  OK (${known} known errors inside RSuite's own types, allowed until the RSuite re-exports are migrated)`
        : '  OK, no type errors. The known RSuite errors are gone: delete knownRSuiteErrors in this script.',
    );
  }

  log('Building the app with Vite…');
  run('npx vite build --logLevel error', app);
  log('  OK');
} finally {
  rmSync(root, { recursive: true, force: true });
}
