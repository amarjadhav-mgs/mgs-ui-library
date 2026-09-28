# Building a UI component library: study guide

A complete guide to how `@mgs/ui` is built and why, written for someone new to UI libraries. It starts with a
one-page summary, then explains 12 topics in detail, each with real code from this repo and answers to common
questions. After reading it, you should understand every part of the library and be ready to build components.

- **The contract** for how the library is built is [ARCHITECTURE.md](../ARCHITECTURE.md). This guide explains the
  _why_ behind it. If the two ever disagree, ARCHITECTURE.md wins.
- Code examples are taken from the repo as of 2026-09-28. File paths are relative to the repo root.

## Contents

- [Summary: the whole picture on one page](#summary-the-whole-picture-on-one-page)
- [1. Why build a UI library at all](#1-why-build-a-ui-library-at-all)
- [2. Build it ourselves, use RSuite directly, or wrap RSuite](#2-build-it-ourselves-use-rsuite-directly-or-wrap-rsuite)
- [3. The public API](#3-the-public-api)
- [4. Design tokens and themes](#4-design-tokens-and-themes)
- [5. Anatomy of one component](#5-anatomy-of-one-component)
- [6. Designing a component's API](#6-designing-a-components-api)
- [7. Accessibility](#7-accessibility)
- [8. Documentation with Storybook](#8-documentation-with-storybook)
- [9. Testing](#9-testing)
- [10. Build and package](#10-build-and-package)
- [11. Versioning and breaking changes](#11-versioning-and-breaking-changes)
- [12. Components vs. patterns](#12-components-vs-patterns)
- [Ready to build: the workflow and checklists](#ready-to-build-the-workflow-and-checklists)
- [Glossary](#glossary)

---

## Summary: the whole picture on one page

A UI library is **a box of ready-made screen parts** (Button, Input, DatePicker…) that every MGS app installs, so all
apps look and behave the same and nobody builds the same part twice.

```text
 ┌──────────────── @mgs/ui (this repo) ────────────────┐
 │ Design tokens   colours, spacing, fonts             │  src/styles/tokens.scss
 │      ↓                                              │
 │ Themes          light / dark / high-contrast        │  src/styles/themes.scss
 │      ↓                                              │
 │ Components      Button, Input, DatePicker…          │  src/components/
 │ Patterns        FormField, ConfirmDialog…           │  src/patterns/
 │ (RSuite does the hard behaviour inside, hidden)     │
 │      ↓                                              │
 │ Public API      the list of what apps can import    │  src/index.ts
 │                                                     │
 │ Docs            Storybook: see and try each part    │  *.stories.tsx, *.mdx
 │ Tests           proves it works and is accessible   │  *.test.tsx
 │ Build           turns the code into a package       │  npm run build → dist/
 │ Versioning      tells apps what changed             │  .changeset/
 └─────────────────────────────────────────────────────┘
                        ↓  npm install @mgs/ui
        MGS app 1      MGS app 2      future apps…
        import { Button } from '@mgs/ui'
```

The 12 topics in one line each:

| #   | Topic                   | The one idea to remember                                                                                                         |
| --- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Why a library           | Solve each UI problem **once**, carefully, and every app gets the answer.                                                        |
| 2   | Build vs. RSuite        | **Wrap RSuite**: RSuite does the hard behaviour, MGS owns the API apps touch.                                                    |
| 3   | Public API              | The API is a **promise**. Make it MGS-owned (RSuite hidden) and **small**.                                                       |
| 4   | Tokens and themes       | **Primitive** = what a colour is, **semantic** = what it's for. A theme is just a different mapping.                             |
| 5   | Anatomy of a component  | A component is **API + logic + styles + door + examples + docs + proof**. Types come first.                                      |
| 6   | API design              | Design from **real needs**, name things **the same everywhere**, keep it **small**. Adding is easy, removing breaks.             |
| 7   | Accessibility           | Right **HTML element**, a **name** for every control, **keyboard** + visible focus, **contrast**, and test in layers.            |
| 8   | Storybook docs          | Stories are examples, MDX adds **judgement** (when, why, do and don't), and tests enforce one standard.                          |
| 9   | Testing                 | Tests are **promises written as code**. Test like a user, test behaviour, and let CI run everything on every PR.                 |
| 10  | Build and package       | The build makes `dist/` (JS, CSS, types). React and RSuite are **not copied**; apps install them once.                           |
| 11  | Versioning              | **Patch** = fix, **minor** = new, **major** = breaking. Deprecate before removing. Big changes are cheapest **before adoption**. |
| 12  | Components vs. patterns | A **pattern** is components always combined the same way, used in several apps, with **no business logic**.                      |

The decisions MGS has made:

- **Option C: wrap RSuite 6.** MGS owns **every** public API; RSuite is an internal detail that apps never see.
- **Nothing is re-exported from `rsuite`**. The existing re-exports are being migrated one at a time, and
  `scripts/check-public-api.mjs` fails the build if RSuite leaks into the types.
- **Every prop is classified** (must have / good to have / later / don't need), and the API is **approved before
  building**.
- **Accessibility target: WCAG 2 AA** in the light, dark and high-contrast themes.
- **No business logic, data fetching or app state** in the library.

Current status: `Button` and `IconButton` are MGS components. Next: the phases of
[IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md), in ERP priority order: 0 foundation (`MgsProvider`, icon props
type), 1 form inputs and `FormField`, 2 date and time, 3 `Table` and data display (including `Badge`/`Avatar`), 4
overlays and feedback, 5 navigation and layout, 6 advanced.

---

## 1. Why build a UI library at all

### The problem, from MGS's own apps

Two MGS apps in `D:/MGS Projects/` were compared (check made on 2026-09-25):

| Area                                                  | `mgs-client-mgt-ui`              | `plotting-crm-ui`                                     |
| ----------------------------------------------------- | -------------------------------- | ----------------------------------------------------- |
| RSuite version                                        | 6.2                              | 5.74 (older)                                          |
| Button                                                | its own Button, used in 36 files | RSuite Button in 26 files, plus its own wrapper in 38 |
| Drawer                                                | built it                         | built it **again** (same API, copied)                 |
| ConfirmDialog, EmptyState, FormField, Toolbar, Loader | built them                       | built them **again**                                  |
| Date format                                           | `dd/MM/yyyy`, `HH:mm`            | `MM/dd/yyyy`, `hh:mm aa`                              |

That shows four problems every company without a library has:

1. **The same work is done twice.** With five apps it would be five times.
2. **Apps look and behave differently.** The same user sees 28/09/2026 in one app and 09/28/2026 in the other. With
   dates, that causes real mistakes.
3. **Fixes don't spread.** A Button bug or accessibility problem fixed in one app stays broken in the other.
4. **Upgrades are painful.** `plotting-crm-ui` is stuck on RSuite 5 because RSuite is used directly in dozens of
   files.

### What a library changes

```text
Without a library:                      With @mgs/ui:

App A → own Button, own Drawer…         App A ─┐
App B → own Button, own Drawer…         App B ─┼→ @mgs/ui → Button, Drawer… (built once)
App C → own Button, own Drawer…         App C ─┘
```

- **Build once, use everywhere.** A new app starts with every part ready on day one.
- **Consistent by default.** Date format, colours and spacing are decided once.
- **Fix once, every app benefits.** Apps just update their `@mgs/ui` version.
- **Upgrades happen in one place.** When RSuite 7 comes out, only the library changes.
- **Quality in one place.** Accessibility, tests and docs are done carefully once.

### The honest costs

| Cost                     | What it means                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------- |
| Slower at first          | Building a Button properly (API, docs, tests, a11y) takes longer than a quick one. |
| Changes affect everyone  | A bad change breaks every app, so versioning and care are needed (topic 11).       |
| It needs an owner        | Someone maintains, reviews, and says "no" to features only one app wants.          |
| Getting apps to adopt it | Old apps must migrate; `plotting-crm-ui` first needs RSuite 6.                     |

That's why the rules say **simple first** and **approve the API before building**: they keep these costs low.

A library is worth it when a company has **several apps, made by several people, over several years**. That describes
MGS.

### Questions and answers

**Name two problems in the two MGS apps that a library would fix.**
Duplicate work (both built Drawer, ConfirmDialog, EmptyState, FormField…), inconsistent behaviour (different date
formats), fixes not spreading, and hard upgrades (RSuite used directly in dozens of files).

**A DatePicker isn't keyboard-accessible. What happens with and without a library?**
Without: each app must find and fix it separately, or never does. With: we fix it once in `@mgs/ui` and add a test so
it can't break again; every app gets the fix by updating its version, with no code changes.

**Why is "changes affect everyone" both a benefit and a risk?**
A good change reaches every app at once, and so does a bad one. That's why the library needs careful API design,
tests and versioning.

**Why can't `plotting-crm-ui` use `@mgs/ui` today?**
`@mgs/ui` depends on `"rsuite": "^6.2.4"`, and that app uses RSuite 5.74. Two RSuite versions in one app would conflict
(duplicate styles, different themes, bigger bundle). It must upgrade to RSuite 6 first. After that, future RSuite
upgrades happen inside the library.

---

## 2. Build it ourselves, use RSuite directly, or wrap RSuite

### The core question: who writes the difficult code?

A DatePicker looks simple, but inside it handles a calendar grid, keyboard control (arrows, Page Up/Down, Home/End,
Esc), a popup that stays on screen, focus moving in and out, screen reader announcements, and locales and formats.
That's thousands of lines and years of bug fixes.

### Option A: build everything ourselves

```text
App → @mgs/ui → our own code only
```

Full control and no outside dependency, but very slow, and we must find and fix every keyboard, focus and browser bug
ourselves. It needs a large team (Atlassian, Shopify and GitHub do this). **Too expensive for MGS.**

### Option B: use RSuite directly, or re-export it

```text
App → rsuite                       (direct)
App → @mgs/ui → rsuite, unchanged  (re-export)
```

Fastest start, but apps depend on **RSuite's API**: an RSuite upgrade or replacement breaks every app, we can't fix
RSuite's gaps, there are too many props (apps use them differently), and the look is limited. A re-export changes the
import line but not the problem, because apps still use RSuite's props.

### Option C: wrap RSuite (the MGS choice)

```text
App → @mgs/ui (MGS API) → RSuite inside (hidden)
```

MGS designs the API; RSuite does the hard work underneath. `src/components/Button/Button.tsx` **translates** the MGS
API into RSuite's:

```tsx
import { Button as RSuiteButton } from 'rsuite'; // RSuite used INSIDE

const rsuiteVariant = {
  primary: { appearance: 'primary' },
  secondary: { appearance: 'default' },
  danger: { appearance: 'primary', color: 'red' }, // MGS "danger" = RSuite primary + red
  ghost: { appearance: 'ghost' },
  link: { appearance: 'link' },
};
```

It also **improves** RSuite where it's weak:

```tsx
ripple: false, // RSuite's click animation ignores "reduce motion"
...(loading && { 'aria-busy': true, 'aria-disabled': true }),
onClick: (event) => {
  if (loading) { event.preventDefault(); return; } // RSuite blocks the mouse only; MGS also blocks Enter/Space
  onClick?.(event);
},
```

### Side by side

|                                            | A. Build ourselves | B. Use / re-export RSuite | **C. Wrap RSuite** |
| ------------------------------------------ | ------------------ | ------------------------- | ------------------ |
| Speed to build                             | Very slow          | Fastest                   | Medium             |
| Who owns the API                           | MGS                | RSuite                    | **MGS**            |
| Replace RSuite later without breaking apps | n/a                | No                        | **Yes**            |
| Can fix accessibility gaps                 | Yes                | No                        | **Yes**            |
| Consistent use across apps                 | Yes                | No                        | **Yes**            |
| Team size needed                           | Large              | Tiny                      | **Small**          |

### Why option C is best for an ERP

- ERP screens are forms, tables, date pickers, selects and dialogs: the **hardest** components, which RSuite already
  does well.
- MGS has a **small team**, so option A is too slow.
- ERP apps **live for years**, so option B is too risky (stuck on one RSuite version).
- ERP needs **consistency** across modules, which one small MGS API enforces.

### A fourth option: headless libraries

**React Aria**, **Radix UI** and **Headless UI** provide only behaviour (keyboard, focus, accessibility) with no
styles. It's a possible later step: because apps only see the MGS API, the inside could someday move from RSuite to a
headless library without apps changing.

### Questions and answers

**What does the wrapper in `Button.tsx` do?**
It **translates** MGS props to RSuite's (`variant="danger"` → `appearance="primary" color="red"`), **improves** RSuite
(no ripple, `aria-busy`, blocks Enter/Space while loading), and **hides** RSuite from apps.

**Why doesn't re-exporting `DatePicker` protect apps?**
Apps still use RSuite's props (`format`, `oneTap`, `shouldDisableDate`). If RSuite changes them, every app breaks.
Only an MGS-owned API protects apps.

**Why not build everything ourselves?**
It would take years and a large team. Pickers, popups, keyboard handling and focus are already solved by RSuite.

**What is a headless library?**
Behaviour only, no styles. MGS could switch to one later without apps changing, because the API stays the same.

---

## 3. The public API

### What "API" means for a UI library

Everything an app can touch and depend on:

| Part          | Example                                                    |
| ------------- | ---------------------------------------------------------- |
| Names         | `Button`, `IconButton`, `PlusIcon`                         |
| Props, values | `variant="primary" \| "secondary" \| …`, `loading`         |
| Events        | `onClick(event)`, `onChange(value, event)`                 |
| Types         | `ButtonProps`, `ButtonVariant`                             |
| Behaviour     | "while loading, Enter/Space do nothing"                    |
| Visible hooks | CSS class `mgs-button`, CSS variable `--mgs-color-primary` |

Once an app uses something from this list, **it's a promise**. Changing it breaks apps.

### The front door: `src/index.ts`

Only what `src/index.ts` exports is public:

```ts
export * from './components/Button'; // → Button, ButtonProps, ButtonSize, ButtonVariant
export * from './components/IconButton';
export * from './icons';
```

`Button.tsx` contains a helper, `toRSuiteButtonProps()`, but `src/components/Button/index.ts` exports only:

```ts
export { Button } from './Button';
export type { ButtonProps, ButtonSize, ButtonVariant } from './types';
```

So the helper is **private**: apps can't use it, and we can change it freely.

> Public = promise (hard to change). Private = freedom (change anytime). Keep the public part small.

### Owned API vs. leaked API

`src/index.ts` today has two halves:

- **Owned by MGS:** `export * from './components/Button'`. `ButtonProps` is written by MGS in `types.ts` and never
  mentions RSuite. If RSuite changes, only `Button.tsx` changes.
- **Leaked from RSuite** (waiting for migration):
  `export { CustomProvider, DatePicker, Input, … } from 'rsuite'`. `@mgs/ui` is just a tunnel; the props are RSuite's.
  This is a **leaky** API.

Why it matters: suppose RSuite 7 renames a DatePicker prop (made-up example: `oneTap` → `singleClick`).

```text
Leaked API:  RSuite renames → @mgs/ui passes it through → every app breaks → every team edits every screen
Owned API:   RSuite renames → one line changes inside @mgs/ui → apps keep working
```

**The API is a wall between apps and RSuite.**

### What apps actually see: `.d.ts` files

`npm run build` creates declaration files (`dist/*.d.ts`) that describe the API to apps' editors (autocomplete, prop
hints, errors). `scripts/check-public-api.mjs` reads them and **fails the build if any mentions `rsuite` or
`@rsuite/icons`**, except the re-exports still waiting for migration. As each is migrated it's removed from that list;
when the list is empty, the wall is complete and the build keeps it that way.

### Keep the API small: Hyrum's Law

> "With enough users, every behaviour of your API will be depended on by somebody." (Hyrum Wright, Google)

Every prop is forever. RSuite's DatePicker has around 50 props; passing them all through means supporting all 50
forever, even after replacing RSuite. So: **expose only what MGS supports.**

### Example: `CustomProvider` vs. `MgsProvider`

A **provider** wraps the whole app once and sets global settings for every component inside:

```tsx
<CustomProvider theme="dark">
  <App />
</CustomProvider>
```

`CustomProvider` is RSuite's, re-exported unchanged today. Its props come from RSuite's types
(`node_modules/rsuite/esm/internals/Provider/CustomContext.d.ts`): `theme`, `locale`, `rtl`, `formatDate`/`parseDate`,
`components`, `classPrefix`, `iconClassPrefix`, `disableRipple`, `disableInlineStyles`, `csp`, `toastContainer`. It's
used in `.storybook/preview.tsx` for the theme switch.

`MgsProvider` will be MGS's own provider (planned, not built), rendering RSuite's `CustomProvider` inside:

|                       | `CustomProvider` (today)                               | `MgsProvider` (planned)                         |
| --------------------- | ------------------------------------------------------ | ----------------------------------------------- |
| API owner             | RSuite (leaked)                                        | MGS (owned)                                     |
| Props                 | ~13 RSuite props (`classPrefix`, `csp`, `components`…) | Only what MGS supports: `theme`, maybe `locale` |
| If RSuite changes     | Every app may break                                    | Only the library changes                        |
| If RSuite is replaced | Every app's root file must change                      | Nothing changes for apps                        |

### Questions and answers

**Can an app use `toRSuiteButtonProps()`?**
No. It isn't exported from `src/components/Button/index.ts` or `src/index.ts`, so it's private and can change any
time.

**What is a leaky API?**
When the inside (RSuite) shows through. Example: `export { DatePicker } from 'rsuite'`. Apps import from `@mgs/ui`
but use RSuite's props.

**What does `check-public-api.mjs` check, and why `.d.ts` files?**
It fails the build if any `dist/*.d.ts` mentions RSuite (except the pending list). `.d.ts` files are exactly what apps
see, so if RSuite isn't there, it can't leak.

**Why not expose all ~50 DatePicker props?**
Every public prop is a promise forever. Apps would use them differently, we'd support all 50 even after replacing
RSuite, and removing any is a breaking change.

---

## 4. Design tokens and themes

### The problem tokens solve

If the brand blue `#2563eb` is written in 200 places, changing it means editing 200 places, and dark mode needs another 200. A **design token** is a **named variable for a design decision**: the value lives in one place and everything
uses the name.

```css
--mgs-blue-600: #2563eb; /* value in ONE place */
background: var(--mgs-blue-600); /* everyone uses the name */
```

Tokens in this repo are **CSS custom properties**, which the browser can change live. That's what makes theme
switching work without reloading.

### Three layers

```text
Layer 1: PRIMITIVE      "what the colour IS"       --mgs-blue-600: #2563eb
         tokens.scss
             ↓
Layer 2: SEMANTIC       "what the colour is FOR"   --mgs-color-primary: var(--mgs-blue-600)
         themes.scss     (different per theme)
             ↓
Layer 3: USED BY        components + RSuite         Button reads --mgs-color-primary
         components/ + rsuite-bridge.scss
```

**Layer 1, `src/styles/tokens.scss`:** raw palettes (`--mgs-blue-50` … `--mgs-blue-950`, `--mgs-red-*`) and fixed scales
(`--mgs-font-size-*`, `--mgs-space-*`, `--mgs-radius-*`, `--mgs-focus-ring-*`). Components **never** read the colour
palettes directly; they may read the scales.

**Layer 2, `src/styles/themes.scss`:** names for purposes, mapped per theme. This is where themes happen:

```css
:root {
  /* Light */
  --mgs-color-primary: var(--mgs-blue-600);
  --mgs-color-link: var(--mgs-blue-800);
  --mgs-color-focus-ring: var(--mgs-blue-600);
}
:is([data-theme='dark'], .rs-theme-dark) {
  --mgs-color-link: var(--mgs-blue-400); /* lighter, readable on dark */
  --mgs-color-focus-ring: var(--mgs-blue-400);
}
```

Components always ask for `--mgs-color-link`; the theme decides which blue it is.

**Layer 3:** MGS components read only semantic tokens and scales (e.g. the focus-ring mixin reads
`--mgs-color-focus-ring`). RSuite reads its own `--rs-*` variables, which the bridge sets.

### The bridge: `src/styles/rsuite-bridge.scss`

It points RSuite's variables at MGS tokens:

```css
:root {
  --rs-font-family-base: var(--mgs-font-family);
  --rs-radius-md: var(--mgs-radius-md);
}
:root:not([data-theme='dark'], [data-theme='high-contrast']) {
  --rs-primary-500: var(--mgs-color-primary);
  --rs-red-500: var(--mgs-color-danger);
  --rs-focus-ring-color: var(--mgs-color-focus-ring);
}
```

So a pure-RSuite DatePicker also shows the MGS brand:

```text
--mgs-blue-600 → --mgs-color-primary ─┬→ MGS Button (focus ring)
                                      └→ --rs-primary-500 → RSuite Button, DatePicker, Calendar…
```

Rule: **only `rsuite-bridge.scss` may set `--rs-*` variables.** The bridge also fixes RSuite's contrast gaps (focus
ring 25% transparent → fully visible, avatar initials 1.4:1 → 4.8:1, badge red 3.7:1 → 4.8:1, input border 1.3:1 →
3:1).

### How theme switching works

1. The provider (`<CustomProvider theme="dark">`) puts `rs-theme-dark` on `<body>`.
2. The `.rs-theme-dark` blocks in `themes.scss` and the bridge now match, so semantic tokens get dark values.
3. The browser repaints everything that uses those tokens, MGS and RSuite, instantly. No component code runs.

**High contrast** (yellow on black) is an accessibility mode, not a brand look, so MGS adopts RSuite's values and only
fixes pairs that fail WCAG AA.

### Why the semantic layer matters

| Change                | Where you edit                                | What updates                           |
| --------------------- | --------------------------------------------- | -------------------------------------- |
| Brand colour          | `tokens.scss` or the mapping in `themes.scss` | Every component, every theme           |
| Dark-mode link colour | One line in `themes.scss`                     | Every link                             |
| Rounder corners       | `--mgs-radius-md` in `tokens.scss`            | MGS and RSuite components (via bridge) |
| A new theme           | One new block in `themes.scss`                | Everything, no component changes       |

### Contrast numbers in the comments

```css
/* White text on primary: 5.2:1, hover 6.7:1, pressed 8.7:1 (WCAG AA 4.5:1). */
```

WCAG AA needs **4.5:1** for normal text and **3:1** for borders, icons and focus rings. RSuite's default blue
`#3498ff` with white text fails, which is one reason MGS uses `blue-600`.

### Questions and answers

**`--mgs-blue-600` vs. `--mgs-color-primary`?**
The first is a primitive: what the colour **is**, same in every theme. The second is semantic: what it's **for**,
mapped per theme. Components read only the semantic one.

**How does a pure-RSuite `DatePicker` show the MGS blue?**
Through the bridge: RSuite reads `--rs-primary-500`, which the bridge sets to `var(--mgs-color-primary)`.

**What happens when the theme switches to dark?**
The provider adds `rs-theme-dark` to `<body>`, the dark blocks match, semantic tokens get dark values, and the browser
repaints everything that uses them.

**Why may only the bridge set `--rs-*`?**
All MGS-to-RSuite styling stays in one place: easy to review, components don't depend on RSuite internals, and
replacing RSuite means deleting one file.

---

## 5. Anatomy of one component

### Seven files for one Button

```text
src/components/Button/
├── types.ts            1. The API: which props exist (the promise)
├── Button.tsx          2. The logic: how it works (RSuite hidden inside)
├── Button.scss         3. The styles: only what MGS adds
├── index.ts            4. The door: what leaves this folder
├── Button.stories.tsx  5. Live examples: see and try it
├── Button.mdx          6. The docs page: how and when to use it
└── Button.test.tsx     7. The proof: it really works
```

Files 1–4 go into the package; 5–7 are for developers and quality. The order is also the working order.

### 1. `types.ts`: the API, written and approved first

```ts
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonBaseProps extends Omit<
  ComponentPropsWithoutRef<'button'>,
  'color' | 'onToggle'
> {
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
}

export interface ButtonProps extends ButtonBaseProps {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}
```

- **Built from HTML, not RSuite:** `ComponentPropsWithoutRef<'button'>` means all native `<button>` attributes. No
  RSuite type anywhere, so no leak.
- `Omit<…, 'color' | 'onToggle'>` removes two native attributes RSuite would misread as its own props.
- Every prop has a doc comment (`/** … @default 'md' */`) that shows in the app developer's editor.
- **Small:** 7 MGS props. RSuite's `appearance`, `color`, `block`, `href`, `toggleable`, `ripple` are hidden on
  purpose.

### 2. `Button.tsx`: the logic

```tsx
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', fullWidth = false, leftIcon, rightIcon, children, ...rest },
  ref,
) {
  return (
    <RSuiteButton
      ref={ref}
      {...toRSuiteButtonProps({ ...rest, variant }, 'mgs-button')}
      block={fullWidth || undefined}
      startIcon={leftIcon ? <span className="mgs-button__icon" aria-hidden="true">{leftIcon}</span> : undefined}
      …
```

Three jobs: **translate** (`variant` → `appearance` + `color`, `fullWidth` → `block`, `leftIcon` → `startIcon`),
**improve** (`aria-busy`, block Enter/Space while loading, no ripple, hide icons from screen readers), and **pass the
rest through** (`...rest` sends `id`, `type`, `aria-*`, `data-*` to the real `<button>`). `forwardRef` lets apps reach
the DOM button (e.g. to focus it); defaults live in one place.

### 3. `Button.scss`: only what MGS owns

```scss
@use '../../styles/mixins';

.mgs-button {
  @include mixins.focus-ring; // focus ring drawn OUTSIDE the button
}
.mgs-button__icon {
  display: inline-flex;
}
```

Only 12 lines, because RSuite draws the button (themed by the bridge). The mixin in `src/styles/_mixins.scss`:

```scss
@mixin focus-ring {
  &:focus-visible {
    outline: var(--mgs-focus-ring-width) solid var(--mgs-color-focus-ring);
    outline-offset: var(--mgs-focus-ring-offset);
  }
}
```

`:focus-visible` shows the ring for keyboard users only; `outline` stays visible in Windows High Contrast. Class names
follow **BEM** (`mgs-button`, `mgs-button__icon`), with the `mgs-` prefix to avoid clashes.

### 4. `index.ts`: the folder's door

```ts
export { Button } from './Button';
export type { ButtonProps, ButtonSize, ButtonVariant } from './types';
```

### 5. `Button.stories.tsx`: live examples

| Story                                             | Shows                                        |
| ------------------------------------------------- | -------------------------------------------- |
| `Playground`                                      | Every prop as a live control                 |
| `Basic`                                           | The simplest use                             |
| `Variants`, `States`, `Sizes`                     | Every visual option                          |
| `Loading`, `Disabled`, `Full Width`, `With Icons` | One feature each                             |
| `Advanced`                                        | Real layouts: page header, form while saving |
| `Accessibility`                                   | Keyboard behaviour, with an automatic test   |

Stories do three jobs: examples, visual checks, and **test cases** (`play` functions act like a user and check the
result).

### 6. `Button.mdx`: the docs page

A fixed section order (enforced by a test): `# Button` + **Component:** line → When to use → Import → Usage →
Examples → Do and don't → Accessibility → API → (Customizing). "When to use" and "Do and don't" create consistency
across apps.

### 7. `Button.test.tsx`: the proof

| Kind               | Example                                                                       |
| ------------------ | ----------------------------------------------------------------------------- |
| Accessibility      | axe on every story, expecting no violations                                   |
| Story interactions | every `play` function runs as a test                                          |
| Behaviour          | "loading ignores clicks, Enter and Space", "loading does not submit its form" |
| API contract       | native attributes pass through, `ref` works, **RSuite props are rejected**    |

The type-level guard:

```tsx
{
  /* @ts-expect-error RSuite's appearance is hidden; use variant */
}
<Button appearance="primary">A</Button>;
```

`@ts-expect-error` means "this line must be a type error". If RSuite props leak into `ButtonProps`, `npm run
typecheck` fails.

### How the files connect

```text
            types.ts  ← the promise (approved first)
               ↓
  Button.tsx + Button.scss  ← make it true (RSuite inside)
               ↓
            index.ts → src/index.ts → apps
               ↓
  Button.stories.tsx  ← examples
       ↙            ↘
Button.mdx        Button.test.tsx
(explains)        (proves: axe, keyboard, types)
```

### Questions and answers

**Why does `ButtonProps` extend `ComponentPropsWithoutRef<'button'>` and not RSuite's props?**
The API describes what MGS promises. Extending RSuite's props would leak `appearance`, `color`, `block`… into the MGS
API, and RSuite could never be replaced.

**Why is `Button.scss` only 12 lines?**
RSuite draws the button and the bridge themes it; MGS only adds what it changes (focus ring, icon layout).

**The three jobs of a story?**
Example for developers, visual check for reviewers, test case in `npm test`.

**What does `@ts-expect-error` protect against?**
RSuite props leaking back into the API: if one becomes allowed, `npm run typecheck` fails.

---

## 6. Designing a component's API

> **Start from what apps need, not from what RSuite offers.**

### Step 1: collect real use cases

For Button: save a form (most important style, submit, busy while saving), cancel (normal style), delete (warning
style), table toolbar (small, icon), mobile form footer (full width). **No use case, no prop.** Evidence from apps
helps: `mgs-client-mgt-ui`'s own Button already had `variant`, `size`, `isLoading`, `leftIcon`, `rightIcon`,
`fullWidth`.

### Step 2: classify every candidate prop

| Label            | Meaning                                            | Build now?           |
| ---------------- | -------------------------------------------------- | -------------------- |
| **Must have**    | Useless or unsafe without it                       | Yes                  |
| **Good to have** | Clear real use, cheap to support                   | Usually, if approved |
| **Later**        | Maybe useful, no real app needs it yet             | No, write it down    |
| **Don't need**   | Internal detail, rare, or conflicts with MGS rules | Never                |

How Button's candidates were classified:

| Candidate                           | Decision     | Why                                                            |
| ----------------------------------- | ------------ | -------------------------------------------------------------- |
| `variant`                           | Must have    | Save / Cancel / Delete need different looks                    |
| `size` (`sm`/`md`/`lg`)             | Must have    | Toolbars vs. forms                                             |
| `loading`                           | Must have    | Prevents double submit                                         |
| `leftIcon` / `rightIcon`            | Good to have | Common in ERP headers                                          |
| `fullWidth`                         | Good to have | Mobile and narrow forms                                        |
| RSuite `xs` size                    | Don't need   | Too small to click; breaks the shared scale                    |
| RSuite `href`                       | Don't need   | Navigation should be a **link** (different for screen readers) |
| RSuite `toggleable`                 | Later        | No real use yet; apps can use `aria-pressed`                   |
| RSuite `ripple`                     | Don't need   | Motion that ignores "reduce motion"                            |
| RSuite `color` (`red`, `violet`, …) | Don't need   | Most fail contrast; `variant="danger"` covers the need         |

**Why less is better:** adding a prop later is a minor release and breaks nothing; removing one is a breaking change.
Fewer props also mean more consistency, easier learning, fewer tests and docs, and less to support when RSuite
changes. When unsure, leave it out.

### Step 3: follow the shared conventions

> "If you know `Button`, you should already know the basics of every other MGS component." (ARCHITECTURE.md)

| Idea         | MGS name                                            | Not                               |
| ------------ | --------------------------------------------------- | --------------------------------- |
| Visual style | `variant`                                           | `appearance`, `type`, `kind`      |
| Size         | `size: 'sm' \| 'md' \| 'lg'`                        | `xs`, `small`, `large`            |
| Booleans     | `disabled`, `loading`, `fullWidth`                  | `isLoading`, `isDisabled`, `hasX` |
| Input value  | `value` / `defaultValue` / `onChange(value, event)` | `selected`, `onSelect`            |
| Open state   | `open` / `defaultOpen` / `onOpenChange(open)`       | `show`, `visible`, `isOpen`       |
| Events       | `on` + verb: `onChange`, `onClose`                  | `changeHandler`                   |
| Content      | nouns: `label`, `description`, `error`              | `labelText`, `errorMsg`           |

### Step 4: one choice prop instead of many booleans

```tsx
<Button primary danger>   {/* ❌ both? what does that mean? */}
<Button variant="danger"> {/* ✅ only one possible */}
```

If options can't be combined, use one prop with a list of values (a union type); TypeScript then blocks impossible
combinations.

### Step 5: controlled and uncontrolled

```tsx
<DatePicker defaultValue={new Date()} />                             // uncontrolled: the component remembers
<DatePicker value={date} onChange={(value) => setDate(value)} />     // controlled: the app owns the value
```

ERP apps are form-heavy (Formik, React Hook Form, validation, reset, editing a loaded record), so controlled use must
always work well.

### Step 6: safe escape hatches

| Escape hatch                                      | Allowed | Why                                 |
| ------------------------------------------------- | ------- | ----------------------------------- |
| `className`, `style`                              | Yes     | Small layout tweaks                 |
| Native attributes (`id`, `aria-*`, `data-testid`) | Yes     | Forms, tests, accessibility         |
| `ref`                                             | Yes     | Focus management                    |
| Token overrides (`--mgs-color-primary`)           | Yes     | The official way to change the look |
| RSuite props, `.rs-*` classes                     | No      | Leak RSuite, break on upgrades      |

### Step 7: make the right thing easy and the wrong thing hard

Safe defaults (`type="button"`, so a Button never submits a form by accident), required where it matters
(`IconButton` requires `aria-label`), behaviour built in (`loading` blocks double submits).

### Worked example: `MgsProvider`

Use cases: switch themes (needed), calendar text in the user's language (likely), right-to-left (no app needs it yet),
custom date parsing (no need seen).

| Prop                                                                                                            | Label        | Reason                                                        |
| --------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------- |
| `children`                                                                                                      | Must have    | Wraps the app                                                 |
| `theme: 'light' \| 'dark' \| 'high-contrast'`                                                                   | Must have    | The theme switch                                              |
| `locale`                                                                                                        | Good to have | Pickers need language text; the type must be MGS's            |
| Default date format (e.g. `dd/MM/yyyy`)                                                                         | Open         | Decided in the `MgsProvider` proposal (plan, open decision 1) |
| `rtl`                                                                                                           | Later        | No app needs it yet                                           |
| `formatDate` / `parseDate` (custom functions)                                                                   | Later        | Wait for a real need                                          |
| `classPrefix`, `iconClassPrefix`, `components`, `csp`, `disableRipple`, `disableInlineStyles`, `toastContainer` | Don't need   | RSuite internals                                              |

Draft (to be proposed and approved):

```ts
export type MgsTheme = 'light' | 'dark' | 'high-contrast';

export interface MgsProviderProps {
  /** Colour theme for every component inside. @default 'light' */
  theme?: MgsTheme;
  /** Language for built-in text (calendar months, "Today", "OK"). @default English */
  locale?: MgsLocale;
  children?: ReactNode;
}
```

Open question for the proposal: what `MgsLocale` looks like (ready-made locales such as `enGB`, or a language code
such as `'en-GB'`).

### Questions and answers

**Why is `variant="danger"` better than `primary danger`?**
Booleans allow impossible combinations; one `variant` allows exactly one value, and TypeScript blocks the rest.

**Why did MGS leave out `href`?**
A button that navigates is really a link. Screen readers announce them differently, and links can be opened in a new
tab.

**`value` vs. `defaultValue`?**
`defaultValue` sets only the start; the component remembers changes. `value` means the app owns it and updates it via
`onChange`. ERP forms need `value` for form libraries, validation, loading a record, reset, and dependent fields.

**Classify `rtl` for `MgsProvider`.**
Later: clear meaning, but no MGS app needs it, and adding it later is non-breaking.

---

## 7. Accessibility

### What it means

Everyone can use the app, including:

| Who                         | How they use it                       | What they need                              |
| --------------------------- | ------------------------------------- | ------------------------------------------- |
| Blind users                 | Screen reader (NVDA, JAWS, VoiceOver) | Every control has a name and role           |
| Low-vision users            | Zoom, high-contrast mode              | Strong contrast, a high-contrast theme      |
| Users who can't use a mouse | Keyboard only                         | Everything works by keyboard, visible focus |
| Colour-blind users          | See colours differently               | Meaning never shown by colour alone         |
| Users sensitive to motion   | "Reduce motion" setting               | No unnecessary animation                    |

For an ERP: users work in it all day, many are keyboard-heavy, enterprise and government customers often require it,
and doing it once in the library is the only practical way.

### The standard: WCAG 2, level AA

Four principles (POUR): **Perceivable** (contrast), **Operable** (keyboard, visible focus), **Understandable** (clear
labels), **Robust** (native elements, correct ARIA).

### Five building blocks

**1. Semantic HTML first.**

```tsx
<div onClick={save}>Save</div>        // ❌ no keyboard, not announced as a button
<button onClick={save}>Save</button>  // ✅ Tab, Enter, Space, "Save, button"
```

**2. Accessible name and role.** Screen readers announce name + role + state ("Save order, button, busy"). Icon-only
buttons have no text, so `IconButton` **requires** a name in its types (`src/components/IconButton/types.ts`):

```ts
export interface IconButtonProps extends Omit<ButtonBaseProps, 'children' | 'aria-label'> {
  /** Required: names the action for screen readers, e.g. "Delete row", not "Trash". */
  'aria-label': string;
```

Decorative icons (`<Button leftIcon={<PlusIcon />}>Add</Button>`) are hidden with `aria-hidden="true"`.

**3. Keyboard.** Tab / Shift+Tab move, Enter / Space activate, arrows move inside widgets, Esc closes, Home/End and
Page Up/Down jump. These patterns come from the **WAI-ARIA Authoring Practices**; complex widgets are why we use
RSuite. Focus must be **visible** (`:focus-visible` ring) and **never lost**: that's why `loading` doesn't use
`disabled` (a disabled button drops focus). Dialogs trap focus and return it on close.

**4. States via ARIA.**

| State               | How                                                 | Where                    |
| ------------------- | --------------------------------------------------- | ------------------------ |
| Busy                | `aria-busy="true"`                                  | Button `loading`         |
| Can't act right now | `aria-disabled="true"`                              | Button `loading`         |
| Toggled             | `aria-pressed`                                      | Apps, for toggle buttons |
| Expanded            | `aria-expanded`                                     | RSuite pickers           |
| Invalid field       | `aria-invalid` + error linked by `aria-describedby` | Future `FormField`       |

ARIA only **describes**; it adds no behaviour.

**5. Colour contrast.** Normal text 4.5:1, large text 3:1, UI parts (borders, icons, focus ring) 3:1. Never use colour
alone for meaning.

| RSuite default                | Problem         | MGS fix (in the bridge) |
| ----------------------------- | --------------- | ----------------------- |
| Primary `#3498ff` + white     | Fails 4.5:1     | `blue-600`: 5.2:1       |
| Input border                  | 1.3:1           | `gray-500`: passes 3:1  |
| Focus ring                    | 25% transparent | Fully visible           |
| Avatar initials on `gray-300` | 1.4:1           | `gray-600`: 4.8:1       |
| Badge red                     | 3.7:1           | MGS danger red: 4.8:1   |

### Testing accessibility in layers

| Layer             | Tool                                      | Catches                                     | Where                |
| ----------------- | ----------------------------------------- | ------------------------------------------- | -------------------- |
| 1. Types          | TypeScript                                | Missing `aria-label`, RSuite props leaking  | `npm run typecheck`  |
| 2. Automatic scan | axe                                       | Missing names, wrong roles, bad ARIA        | every story in tests |
| 3. Behaviour      | Testing Library + user-event              | Keyboard works, focus kept, `aria-busy` set | `*.test.tsx`, `play` |
| 4. Visual         | Storybook a11y panel                      | **Contrast** (needs a real browser)         | `npm run dev`        |
| 5. Manual         | Keyboard + a screen reader (NVDA is free) | Whether it actually makes sense to a human  | before release       |

`src/test/axe.ts` turns off `color-contrast` because jsdom can't render colours; the Storybook panel covers it.
Automatic tools find only part of real problems, so manual checks stay necessary.

**Known gaps:** when RSuite has a gap MGS can't fix yet, mark it ⚠️ in the docs and write a test that pins the current
behaviour, so an RSuite upgrade can't change it silently. Each migration is a chance to fix gaps.

### Questions and answers

**Why `aria-disabled` + `aria-busy` instead of `disabled` while loading?**
`disabled` drops keyboard focus. The ARIA attributes keep focus and announce "busy", and the `onClick` guard blocks
clicks, Enter and Space.

**How does `IconButton` guarantee a name?**
`'aria-label': string` is required in its types, so code without it doesn't compile.

**Why is `color-contrast` off in `src/test/axe.ts`?**
jsdom has no real rendering and can't calculate colours. Contrast is checked in Storybook's a11y panel and documented
in `themes.scss` and each MDX page.

**What's broken in `<div role="button" onClick={save}>Save</div>`?**
It isn't in the Tab order, Enter and Space do nothing, and it doesn't work in forms. Use `<button>` or MGS `Button`.

---

## 8. Documentation with Storybook

### Why docs are half the library

A component nobody understands doesn't get used; developers copy old screens or build their own. Good docs answer
what, when (and when not), how, which props, and how accessible it is, without asking the library team.

### Storybook

A separate website that shows every component in isolation.

```text
npm run dev              → Storybook on http://localhost:6006
npm run build-storybook  → storybook-static/ (a static site that can be hosted for the team)
```

### Configuration

`.storybook/main.ts` loads every `*.mdx` and `*.stories.tsx` and two addons: `@storybook/addon-docs` (MDX, Canvas,
Controls) and `@storybook/addon-a11y` (axe in a real browser, including contrast).

`.storybook/preview.tsx` wraps every story:

```tsx
globalTypes: { theme: { toolbar: { items: ['light', 'dark', 'high-contrast'] } } },
decorators: [
  (Story, context) => (
    <CustomProvider theme={context.globals.theme}>
      <Story />
    </CustomProvider>
  ),
],
parameters: { a11y: { test: 'error' } },
```

The **Theme** toolbar button changes the theme for every story. When `MgsProvider` is built, it replaces
`CustomProvider` here.

### Stories

The `meta` holds settings for all stories in a file:

```tsx
const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['!autodocs'], // Button.mdx is the docs page
  args: { children: 'Button', onClick: fn() }, // default props; fn() records clicks
  parameters: { controls: { include: ['variant', 'size', 'disabled', 'loading', …] } },
  argTypes: { variant: { control: 'inline-radio', options: variants, description: 'Visual style.' } },
};
```

`controls.include` shows only the MGS props; the dozens of native `<button>` attributes would bury them.

A story is one situation. `source()` from `src/stories/shared.tsx` gives short, copyable code under "Show code":

```tsx
export const Variants: Story = {
  parameters: source(`<Button variant="primary">Primary</Button> …`),
  render: (args) => (
    <Row>
      {variants.map((v) => (
        <Button key={v} {...args} variant={v}>
          …
        </Button>
      ))}
    </Row>
  ),
};
```

`shared.tsx` also has `EXAMPLE_DATE`, a fixed date so date examples and tests never change with the real date.
`Playground` has only args, for live experimenting. `play` functions act like a user; they run in the Interactions
panel and in `npm test`.

### MDX pages

Markdown plus live stories:

```mdx
import { Canvas, Controls, Meta } from '@storybook/addon-docs/blocks';
import * as ButtonStories from './Button.stories';

<Meta of={ButtonStories} />

# Button

### Variants

<Canvas of={ButtonStories.Variants} sourceState="shown" />

## API

<Controls of={ButtonStories.Playground} />
```

Hand-written MDX instead of automatic docs, because automatic docs only know props, not judgement (when to use, do
and don't, edge cases, accessibility).

### The standard, enforced by `src/test/docs-structure.test.ts`

For every folder in `src/components/` and `src/patterns/`:

| Check                                                                                                        | Why                               |
| ------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| `Playground`, `Basic`, `Accessibility` stories exist                                                         | Every component has them          |
| `Variants` only if there's a `variant` prop, `Sizes` only if `size`, `States` only if `disabled`/`loading`/… | No missing examples, no fake ones |
| An `Advanced` story (or a written reason why not)                                                            | Real-world layouts                |
| `Accessibility` has a `play` function                                                                        | a11y claims are tested            |
| `tags: ['!autodocs']`                                                                                        | The MDX is the docs page          |
| MDX has exactly the standard `##` sections, in order                                                         | Every page feels the same         |
| MDX contains `<Controls of={…Playground} />`                                                                 | Every page has the props table    |

The RSuite re-exports in `src/stories/<Component>/` aren't checked; when migrated, their docs move to
`src/components/<Name>/` and must pass.

### Writing good docs

Say when **not** to use it, explain **why**, use realistic examples ("Save order", not "foo"), be honest about edge
cases (⚠️ labels don't wrap), give patterns for common screens, and stay generic (no product-specific terms).

### Questions and answers

**What does the decorator in `.storybook/preview.tsx` do?**
Wraps every story in the provider with the theme from the toolbar, so every component can be checked in all three
themes.

**Why `controls.include`?**
To show only the MGS props instead of dozens of native attributes. Docs as small as the API.

**Why hand-written MDX?**
Automatic docs can't say when to use it, why, do and don't, edge cases or accessibility.

**`Switch` has `size` but no `Sizes` story. What happens?**
`npm test` fails: the test sees `size` in `argTypes` and requires a `Sizes` story (and would fail the other way round
too).

---

## 9. Testing

### Why tests matter more in a library

A bug in an app breaks one screen; a bug in a library breaks every screen in every app. Tests answer, every time:
**"Does everything we promised still work?"** A test is a promise written as code.

### Tools

| Tool                   | Job                                               | In the repo                             |
| ---------------------- | ------------------------------------------------- | --------------------------------------- |
| Vitest                 | Runs tests (`npm test`)                           | `vite.config.ts → test`                 |
| jsdom                  | A fake browser in Node                            | `environment: 'jsdom'`                  |
| Testing Library        | Renders components and finds elements like a user | `render`, `screen.getByRole`            |
| user-event             | Real typing, clicking, Tab, Enter                 | `userEvent.tab()`                       |
| jest-dom               | Readable checks                                   | `toHaveFocus()`, `toHaveAttribute()`    |
| axe-core               | Automatic accessibility scan                      | `src/test/axe.ts`                       |
| Storybook test helpers | Run stories and `play` functions as tests         | `composeStories`, `src/test/stories.ts` |
| TypeScript             | Type-level tests                                  | `npm run typecheck`                     |

Tests import `@mgs/ui` like apps do (an alias in `vite.config.ts` points it at `src/index.ts`), so they see only the
public API. `src/test/setup.ts` calls `setProjectAnnotations(preview)` so stories in tests get the same decorators as
in Storybook.

### Test like a user

```ts
screen.getByRole('button', { name: 'Save' }); // ✅ what a screen reader sees; also proves role and name
container.querySelector('.rs-btn'); // ❌ RSuite internal; breaks when RSuite changes
```

Test **behaviour** ("Enter does nothing while loading"), not **implementation** ("the helper returns
`{ loading: true }`"). Behaviour tests survive refactoring, including replacing RSuite.

### Kinds of tests in the repo

1. **Behaviour:** Arrange (render), Act (user action), Assert (result):

   ```ts
   it('ignores clicks, Enter and Space', async () => {
     const onClick = vi.fn();
     render(<Button loading onClick={onClick}>Save</Button>);
     const button = screen.getByRole('button');
     fireEvent.click(button);
     button.focus();
     await userEvent.keyboard('{Enter}');
     await userEvent.keyboard(' ');
     expect(onClick).not.toHaveBeenCalled();
   });
   ```

2. **API contract:** native attributes pass through, `ref` works, defaults are right.
3. **Type-level:** `@ts-expect-error` lines that reject RSuite props.
4. **Accessibility:** axe on every story (`it.each` makes one test per story).
5. **Story interactions:** every `play` function runs in `npm test`.
6. **Docs structure:** `docs-structure.test.ts`.
7. **Build check:** `check-public-api.mjs`.

Plus **pinning tests** for known RSuite behaviour, and **regression tests**: every bug gets a failing test first, then
the fix, and the test stays forever. ("loading does not submit its form" prevents duplicate invoices.)

### What tests can't see

Contrast (Storybook a11y panel), how it looks (review stories in all themes), whether a screen reader experience makes
sense (manual NVDA check). Possible later: visual regression (e.g. Chromatic), tests in a real browser.

### When checks run

```text
Commit  → pre-commit hook (Husky + lint-staged): oxlint --fix, prettier on changed files
PR into dev or main → CI (.github/workflows/ci.yml):
          1. npm run typecheck
          2. npm run lint
          3. npm run format:check
          4. npm test
          5. npm run build            (includes the public API check)
          6. npm run build-storybook
          all green → safe to merge
```

Example: upgrading RSuite 6.2 → 6.5 changes how `loading` works → "Button loading ignores clicks, Enter and Space"
fails in the library, before release, not in five apps.

### Questions and answers

**Why import from `@mgs/ui` and not `./Button`?**
Tests see only the public API, exactly like apps. A missing export fails the tests.

**Why `getByRole` over `querySelector('.rs-btn')`?**
It finds elements like a screen reader, proving role and name; `.rs-btn` is an RSuite internal that can change.

**Behaviour vs. implementation tests?**
Behaviour tests check what users experience and survive refactoring; implementation tests check internals and break
when the inside changes. MGS prefers behaviour tests.

**A PR breaks the `aria-label` requirement. What happens?**
CI fails: `npm run typecheck` fails, and axe fails for any unnamed icon button. The PR is red and shouldn't be merged.

---

## 10. Build and package

### Source isn't what apps install

Browsers don't run TypeScript or Sass, apps don't want our tests and stories, and apps need types. The build turns
`src/` into `dist/`:

```text
dist/
├── index.js       the JavaScript for all components (~5 kB)
├── index.js.map   maps back to source, for debugging
├── styles.css     RSuite + tokens + themes + bridge + component styles
└── *.d.ts         the types (the API description)
```

### The build command

```json
"build": "vite build && tsc -p tsconfig.build.json && node scripts/strip-style-imports.mjs && node scripts/check-public-api.mjs"
```

**Step 1, `vite build`** (settings in `vite.config.ts`):

| Setting                                                 | Meaning                   | Why                                                        |
| ------------------------------------------------------- | ------------------------- | ---------------------------------------------------------- |
| `lib.entry: src/index.ts`                               | Start at the front door   | Only exported things end up in the package                 |
| `formats: ['es']`                                       | Modern ES modules         | Used by every modern bundler; allows tree-shaking          |
| `external: [react, react-dom, rsuite, @rsuite/icons/…]` | Don't copy these in       | The app installs them; two Reacts break hooks              |
| `minify: false`, `sourcemap: true`                      | Readable output with maps | The app's build minifies; readable code is easier to debug |
| `banner: "'use client';"`                               | Adds `'use client'`       | Works in Next.js with React Server Components              |

CSS is combined in the order from `src/index.ts`: RSuite's CSS, then tokens, themes, bridge, then component styles.
The bridge must come after RSuite to override it.

**Step 2, `tsc -p tsconfig.build.json`:** emits only `.d.ts` files (`emitDeclarationOnly`), excluding stories and
tests.

**Step 3, `strip-style-imports.mjs`:** removes `import './Button.scss'` lines that tsc copies into `.d.ts` files, which
caused TS2882 errors in apps. Lesson: check the package the way an app sees it.

**Step 4, `check-public-api.mjs`:** fails if RSuite leaks into the types (topic 3).

### `package.json`: the package's ID card

```json
{
  "name": "@mgs/ui",
  "version": "0.1.0",
  "type": "module",
  "files": ["dist"],
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./styles.css": "./dist/styles.css"
  },
  "sideEffects": ["**/*.css"],
  "peerDependencies": { "react": ">=18", "react-dom": ">=18" },
  "dependencies": { "@rsuite/icons": "^1.4.1", "rsuite": "^6.2.4" }
}
```

| Field         | Meaning                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------- |
| `name`        | What apps install and import; `@mgs/` is a company scope                                 |
| `version`     | Which release this is (topic 11)                                                         |
| `files`       | Only `dist/` goes into the package                                                       |
| `exports`     | The only two doors: `@mgs/ui` and `@mgs/ui/styles.css`; internal files can't be imported |
| `sideEffects` | Only CSS files do something just by being imported, so unused JS can be tree-shaken      |

**Tree-shaking:** if an app imports only `Button`, its bundler drops DatePicker and the rest. Made possible by
`formats: ['es']` and `sideEffects`.

**Three kinds of dependencies:**

| Kind               | Installed by                 | In `@mgs/ui`                | Why                                  |
| ------------------ | ---------------------------- | --------------------------- | ------------------------------------ |
| `dependencies`     | Automatically with `@mgs/ui` | `rsuite`, `@rsuite/icons`   | Used inside; apps don't need to know |
| `peerDependencies` | The app, already             | `react`, `react-dom` (≥ 18) | Exactly one React per app            |
| `devDependencies`  | Only library developers      | Vite, Vitest, Storybook, …  | Apps never download them             |

`^6.2.4` means "6.2.4 or newer, below 7.0.0".

### How an app uses it

```tsx
import '@mgs/ui/styles.css'; // once, in the app entry
import { Button, PlusIcon } from '@mgs/ui';

<Button variant="primary" leftIcon={<PlusIcon />}>
  New order
</Button>;
```

### Delivering the package

| Way                                            | How                                            | Good for                               |
| ---------------------------------------------- | ---------------------------------------------- | -------------------------------------- |
| Private registry (GitHub Packages, Verdaccio…) | `npm publish`, then apps `npm install @mgs/ui` | Real company use (recommended)         |
| Git dependency                                 | `"@mgs/ui": "github:org/repo#v0.2.0"`          | Quick start; build must be handled     |
| Local link                                     | `npm link` or `"file:../…"`                    | Trying it in an app during development |
| Public npm                                     | `npm publish --access public`                  | Open source only, not MGS              |

No publish setup exists yet (version `0.1.0`); that's normal. **GitHub Packages** is the simplest private option since
the repo is on GitHub. Decide when the first app is ready to adopt.

```text
src/ ─(npm run build)→ dist/ ─(npm publish)→ private registry ─(npm install)→ app node_modules
                                                                              → import { Button } from '@mgs/ui'
```

### Questions and answers

**Why are `react` and `rsuite` in `external`?**
So they aren't copied into the package: it stays small, and apps don't get two Reacts (hooks break) or two RSuites
(style conflicts).

**`dependencies` vs. `peerDependencies`?**
Dependencies are installed automatically with the library; peers must already be in the app. React is a peer because
an app must have exactly one React.

**What does `exports` prevent?**
Importing internal files like `@mgs/ui/dist/components/Button/Button.js`, so internals can move freely.

**What is tree-shaking, and what enables it?**
The app's bundler drops unused library code. Enabled by `formats: ['es']` and `"sideEffects": ["**/*.css"]`.

---

## 11. Versioning and breaking changes

### Semantic versioning: MAJOR.MINOR.PATCH

| Part                  | Increase when                     | Safe to update?          | Example                      |
| --------------------- | --------------------------------- | ------------------------ | ---------------------------- |
| PATCH `2.4.1 → 2.4.2` | Bug fix, API unchanged            | Yes                      | Fixed a DatePicker focus bug |
| MINOR `2.4.2 → 2.5.0` | New feature, old code still works | Yes                      | Added `Switch`               |
| MAJOR `2.5.0 → 3.0.0` | Breaking change                   | Read the migration guide | Removed or renamed a prop    |

`^` ranges only work if the library follows SemVer honestly.

### What counts as breaking

| Change                                             | Breaking?          |
| -------------------------------------------------- | ------------------ |
| Add a component, icon or **optional** prop         | No (minor)         |
| Add a value to a union (`variant: … \| 'success'`) | Usually no (minor) |
| Fix a bug so behaviour matches the docs            | No (patch)         |
| Remove or rename a prop, component or export       | **Yes**            |
| Make an optional prop required                     | **Yes**            |
| Change a default value                             | **Yes**            |
| Change an event signature                          | **Yes**            |
| Remove a CSS token apps override                   | **Yes**            |
| Raise the required React version                   | **Yes**            |

### The `0.x` rule

`0.x` means "not stable yet". ARCHITECTURE.md: **"While on `0.x`, a breaking change is a minor release."** That's why
`.changeset/mgs-button.md` is `minor` though it replaced RSuite's Button API, with a full migration table. Release
`1.0.0` when the API is stable and apps depend on it.

### Deprecate before removing

1. Add the new API next to the old one (minor).
2. Mark the old one `@deprecated` with a pointer.
3. Warn once in development.
4. Remove it in the next major, with a migration note.

```ts
export interface DatePickerProps {
  /** @deprecated Use `onChange` instead. Will be removed in 3.0.0. */
  onSelect?: (date: Date) => void;
  onChange?: (value: Date | null, event: SyntheticEvent) => void;
}
```

Exception (ARCHITECTURE.md): **until the first app adopts `@mgs/ui`, migrating a re-export replaces it directly.** Now
is the cheapest time for big changes.

### Changesets

Each PR adds a note:

```bash
npm run changeset   # → .changeset/<name>.md
```

```md
---
'@mgs/ui': patch
---

Remove `.scss` side-effect imports from published type declarations, which caused TS2882 errors in apps with `skipLibCheck: false`.
```

At release:

```text
npx changeset version   → picks the biggest bump, updates package.json version, writes CHANGELOG.md, deletes used notes
npm run build && npx changeset publish   → publishes to the registry
App teams read CHANGELOG.md → update when ready
```

`.changeset/config.json`: `"baseBranch": "dev"`, `"access": "restricted"` (private package). Nine changesets are
waiting; nothing has been released yet. A good changeset (like `mgs-button.md`) describes the change for app
developers, summarises the new API and includes a migration table.

### Questions and answers

**Classify (after 1.0):** add `Switch` = **minor**; change Button's default `variant` to `primary` = **major** (every
default button changes look); fix a DatePicker keyboard bug = **patch**; rename `fullWidth` to `block` = **major** (and
it breaks the naming convention).

**Why was the Button changeset `minor`?**
The library is on `0.x`, where breaking changes are minor releases; it included a migration table.

**The four deprecation steps?**
Add the new API, mark the old `@deprecated`, warn in development, remove in the next major with a migration note.

**Why replace `CustomProvider` now?**
No app uses `@mgs/ui` yet: nothing breaks and no deprecation period is needed. After adoption it would.

---

## 12. Components vs. patterns

### Two kinds

| Kind          | What it is                                      | Example                         |
| ------------- | ----------------------------------------------- | ------------------------------- |
| **Component** | One UI control or element                       | `Button`, `Input`, `DatePicker` |
| **Pattern**   | Several components always combined the same way | `FormField`, `ConfirmDialog`    |

A component is a brick; a pattern is a ready-made wall section.

### Example: `FormField`

Without a pattern, every field is hand-wired:

```tsx
<div>
  <label htmlFor="customer">
    Customer name <span aria-hidden="true">*</span>
  </label>
  <Input
    id="customer"
    required
    aria-invalid={!!errors.customer}
    aria-describedby="customer-help customer-error"
  />
  <div id="customer-help">As shown on invoices</div>
  {errors.customer && (
    <div id="customer-error" role="alert">
      {errors.customer}
    </div>
  )}
</div>
```

Five places to get accessibility wrong: `htmlFor`/`id`, `aria-describedby`, `aria-invalid`, announcing the error, and
marking "required" correctly. With a pattern (illustrative API, not yet designed or approved):

```tsx
<FormField label="Customer name" required help="As shown on invoices" error={errors.customer}>
  <Input />
</FormField>
```

The pattern generates ids and wires the ARIA; every field in every app is accessible and identical.

### Evidence from the apps

Both apps independently built FormField (20 files in `mgs-client-mgt-ui`), ConfirmDialog, EmptyState, a list Toolbar
and a Drawer (identical API, copied). Two teams building the same combination is the clearest signal a pattern
belongs in the library.

### When does something become a pattern?

| Question                             | FormField   | CustomerForm         |
| ------------------------------------ | ----------- | -------------------- |
| A combination of components?         | Yes         | Yes                  |
| Combined the same way everywhere?    | Yes         | No                   |
| Needed in several apps?              | Yes         | No                   |
| Easy to get wrong (a11y, behaviour)? | Yes         | —                    |
| Free of business logic?              | Yes         | No                   |
| **Result**                           | **Pattern** | **Stays in the app** |

**No business logic, data fetching or app state in the library.**

### Layers

```text
┌─────────────────────────────────────────────┐
│ App screens    SalesOrderPage, CustomerForm │  ← in the APP: business logic, data, API calls
├─────────────────────────────────────────────┤
│ Patterns       FormField, ConfirmDialog,    │  ← @mgs/ui
│                EmptyState, Toolbar          │
├─────────────────────────────────────────────┤
│ Components     Button, Input, DatePicker    │  ← @mgs/ui
├─────────────────────────────────────────────┤
│ Tokens/themes  colours, spacing, radius     │  ← @mgs/ui
└─────────────────────────────────────────────┘
```

Each layer uses only the layers below (Atomic Design: atoms, molecules/organisms, templates/pages).

### Same rules as components

A pattern lives in `src/patterns/<Name>/` with the same seven files, an approved MGS-owned API, the accessibility
baseline, stories and MDX checked by `docs-structure.test.ts`, tests, an export in `src/index.ts`, and a changeset.

### Two API styles

```tsx
// Composition: the app passes the control in (good when the inside varies)
<FormField label="Due date" error={error}>
  <DatePicker />
</FormField>

// Configuration: the pattern builds everything from props (good when structure never changes)
<ConfirmDialog
  open={open}
  title="Delete 3 orders?"
  description="This can't be undone."
  confirmLabel="Delete"
  variant="danger"
  onConfirm={remove}
  onOpenChange={setOpen}
/>
```

### Don't build patterns too early

Patterns are more opinionated, so changing them is costly. Build them after the components they need first are MGS
components, based on evidence, and approved like any component. The plan's order: `FormField` after the phase 1
inputs, `EmptyState` in phase 3, `ConfirmDialog` in phase 4, `AppShell` / `Toolbar` / `PageHeader` in phase 5.

### Questions and answers

**Component vs. pattern?**
A component is one control (`Button`); a pattern is several components always combined the same way (`FormField`,
`ConfirmDialog`).

**Why `FormField` in the library but not `CustomerForm`?**
`FormField` is the same everywhere, has no business logic, and is easy to get wrong. `CustomerForm` has business
logic, differs per app, and only some apps need it.

**Three accessibility details `FormField` handles?**
Label ↔ control (`htmlFor`/`id`), `aria-describedby` for help and error, `aria-invalid` plus an announced error and a
correct "required".

**Why not build `FormField` before `Input` is migrated?**
Patterns are built on components; building on RSuite re-exports would mean rework later. Bricks first, then the wall.
So the plan builds `FormField` at the end of phase 1, after the MGS inputs. Because it takes any control as a child
(composition), the date pickers plug into it when they are migrated in phase 2, without changing `FormField`.

---

## Ready to build: the workflow and checklists

### Workflow for every new component or migration

1. **Check** nothing existing covers it; pick the kind (component or pattern).
2. **Propose the API**: use cases, every prop classified (must / good / later / don't need), shared conventions.
   **Get it approved.**
3. Write `types.ts`, then `Component.tsx`, then `Component.scss`.
4. Export through the folder `index.ts` and `src/index.ts`. For a migration, remove it from the pending list in
   `scripts/check-public-api.mjs` and from the RSuite re-exports.
5. Write stories, tests, then MDX (in the standard format).
6. Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`; check all three themes and the a11y panel in
   Storybook.
7. Add a changeset (`npm run changeset`), with a migration table if the API changed.
8. Open a PR into `dev`; CI must be green.

### API checklist

```text
☐ Real use cases listed (with evidence from apps if possible)
☐ Every prop comes from a use case and is classified
☐ Names follow the conventions (variant, size, disabled, value/onChange, open/onOpenChange)
☐ One choice prop instead of combinable booleans
☐ Controlled + uncontrolled for value or open state
☐ Native attributes, className, style and ref pass through
☐ No RSuite type, prop or class name in the public API
☐ Safe defaults; accessibility required by the types where needed
☐ Approved before building
```

### Accessibility checklist

```text
☐ Native element (button, input, label…) first; ARIA only where HTML can't express it
☐ Every control has an accessible name; decorative icons are aria-hidden
☐ Full keyboard support (WAI-ARIA Authoring Practices), visible :focus-visible ring, focus never lost
☐ States announced (aria-busy, aria-invalid, aria-expanded…)
☐ Contrast: text 4.5:1, UI parts 3:1, in light, dark and high-contrast
☐ No meaning by colour alone; no motion that ignores "reduce motion"
☐ axe clean on every story; Accessibility story with a play function
```

### Build order (from IMPLEMENTATION-PLAN.md)

| Phase | Contents                                                                                                                        |
| ----- | ------------------------------------------------------------------------------------------------------------------------------- |
| 0     | Foundation: `MgsProvider`, icon props type, `VisuallyHidden`                                                                    |
| 1     | Form inputs (`Input`, `Textarea`, `Select`, `Checkbox`, …), `ButtonGroup`, `Stack` (replaces `ButtonToolbar`), then `FormField` |
| 2     | Date and time (`DatePicker`, `DateRangePicker`, `TimePicker`, `Calendar`, …); first release and a pilot app                     |
| 3     | `Table` and data display (`Pagination`, `Tag`, `Badge`, `Avatar`, …), `EmptyState`; all original re-exports gone                |
| 4     | Overlays and feedback (`Dialog`, `Drawer`, `Toast`, …), `ConfirmDialog`                                                         |
| 5     | Navigation and layout (`Tabs`, `SideNav`, `Grid`, …), `AppShell`; target for `1.0.0`                                            |
| 6     | Advanced (`TreeSelect`, `Cascader`, `FileUpload`, …)                                                                            |

The full RSuite coverage map, sizes and the tracking checklist are in the plan.

---

## Glossary

| Term                 | Meaning                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------- |
| **a11y**             | Accessibility (a + 11 letters + y)                                                          |
| **API**              | Everything an app can use: names, props, types, events, behaviour, CSS hooks                |
| **ARIA**             | HTML attributes (`aria-*`, `role`) that describe elements to assistive technology           |
| **axe**              | An automatic accessibility scanner                                                          |
| **BEM**              | CSS naming: `block__element--modifier` (`mgs-button__icon`)                                 |
| **Breaking change**  | A change that makes existing app code stop working or behave differently                    |
| **Changeset**        | A small note per change (`.changeset/*.md`) used to set the version and write the changelog |
| **CI**               | Continuous Integration: automatic checks on every PR (`.github/workflows/ci.yml`)           |
| **Composition**      | An API where the app passes components in as children                                       |
| **Controlled**       | The app owns the value (`value` + `onChange`)                                               |
| **`.d.ts`**          | Type declaration files that describe the API to apps' editors                               |
| **Decorator**        | A Storybook wrapper around every story (e.g. the provider)                                  |
| **Deprecate**        | Mark an API as "will be removed", with a replacement, before removing it                    |
| **Design token**     | A named variable for a design decision (`--mgs-color-primary`)                              |
| **Headless library** | Behaviour only, no styles (React Aria, Radix)                                               |
| **jsdom**            | A fake browser in Node, used by tests                                                       |
| **Leaky API**        | An API where the inside (RSuite) shows through to apps                                      |
| **MDX**              | Markdown plus React components; used for docs pages                                         |
| **Pattern**          | Several components always combined the same way (`FormField`)                               |
| **Peer dependency**  | A package the app must already have (React)                                                 |
| **Play function**    | Code in a story that acts like a user and checks the result                                 |
| **Primitive token**  | What a value is (`--mgs-blue-600`)                                                          |
| **Provider**         | A component wrapping the whole app to set global settings (theme, locale)                   |
| **Re-export**        | Passing another library's export through unchanged                                          |
| **Semantic token**   | What a value is for (`--mgs-color-primary`), mapped per theme                               |
| **SemVer**           | Semantic versioning: MAJOR.MINOR.PATCH                                                      |
| **Story**            | One example of a component in one situation, in Storybook                                   |
| **Tree-shaking**     | The app's bundler dropping library code the app doesn't use                                 |
| **Uncontrolled**     | The component remembers its own value (`defaultValue`)                                      |
| **WCAG**             | Web Content Accessibility Guidelines; MGS targets level AA                                  |
