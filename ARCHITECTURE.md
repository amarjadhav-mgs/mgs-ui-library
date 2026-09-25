# @mgs/ui architecture

The contract for how `@mgs/ui` is built. Read it before adding or changing a component.

## Decision

`@mgs/ui` is a **hybrid** library. MGS owns the public API, types, styles, documentation, tests and exports. RSuite 6
provides proven behaviour (keyboard, focus, popups, calendars, pickers) underneath, wherever it is useful.

```text
                     Application
                          │  import { Button } from '@mgs/ui'
                          ↓
                       @mgs/ui
          ┌───────────────┼────────────────┐
          ↓               ↓                ↓
      MGS-owned       RSuite-based     MGS patterns
      components      re-exports
          └───────────────┼────────────────┘
                          ↓
                       RSuite
```

Apps import only from `@mgs/ui`, never from `rsuite` or `@rsuite/icons`.

## What does MGS own here?

Ask this for every component. The answer decides where it goes:

| Answer                                                                                         | Kind                    | Example                               |
| ---------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------- |
| Nothing: RSuite's API, behaviour and look are right, and the MGS theme covers the colours      | **RSuite re-export**    | `DatePicker`, `Calendar`, `Input`     |
| A simpler or safer API, MGS defaults, behaviour or accessibility RSuite doesn't give, MGS look | **MGS-owned component** | `Button` (accessible `variant`s only) |
| Several components always combined the same way across applications                            | **MGS pattern**         | `FormField`, `ConfirmDialog`          |

Rules:

- Never create a wrapper that only renames an RSuite component.
- Don't migrate RSuite components automatically. Promote one when a real need appears; apps don't change, because they
  already import it from `@mgs/ui`.
- Use RSuite inside an MGS component when it provides difficult behaviour. Build it ourselves only when RSuite doesn't.
- An MGS component never exposes RSuite props, types or class names in its public API.
- No business logic, data fetching or app state in the library.

## Folder structure

Folders are created when the first file needs them.

```text
src/
├── styles/            tokens.scss → themes.scss → rsuite-bridge.scss (see Styling), _mixins.scss
├── components/        MGS-owned components, one folder each
├── patterns/          MGS patterns
├── icons/             curated icon exports
├── stories/           docs, stories and tests for the RSuite re-exports
└── index.ts           the public API: nothing is public unless it's exported here
```

An MGS-owned component or pattern:

```text
ComponentName/
├── ComponentName.tsx          React behaviour and composition
├── ComponentName.scss         styles, using --mgs-* semantic tokens only
├── types.ts                   public props types, with JSDoc on every prop
├── ComponentName.stories.tsx  interactive examples (see Documentation)
├── ComponentName.test.tsx     behaviour, keyboard, states, axe on every story
├── ComponentName.mdx          the Docs page (see Documentation)
└── index.ts                   export { ComponentName } and its types
```

## Styling

```text
tokens.scss          raw primitives: colour palettes (--mgs-blue-600, --mgs-red-500)
                     + semantic scale tokens, the same in every theme (--mgs-space-sm, --mgs-radius-md, ...)
      ↓
themes.scss          semantic colour tokens per theme (--mgs-color-primary, --mgs-color-border-control, ...)
      ↓
rsuite-bridge.scss   sets RSuite's --rs-* variables from MGS tokens
      ↓
MGS components (read semantic tokens only)  +  RSuite components (read --rs-*)
```

**What components may read.** MGS components use semantic MGS tokens for every design value:

| Kind       | Tokens                                                                        | Defined in    |
| ---------- | ----------------------------------------------------------------------------- | ------------- |
| Colour     | `--mgs-color-*` (primary, danger, text, surface, border, link, ...)           | `themes.scss` |
| Spacing    | `--mgs-space-xs` … `--mgs-space-xl`                                           | `tokens.scss` |
| Radius     | `--mgs-radius-sm` … `--mgs-radius-full`                                       | `tokens.scss` |
| Typography | `--mgs-font-family`, `--mgs-font-size-sm` … `--mgs-font-size-lg`              | `tokens.scss` |
| Focus      | `--mgs-color-focus-ring`, `--mgs-focus-ring-width`, `--mgs-focus-ring-offset` | both          |

- **No hard-coded design values** in component styles: no colours, pixel sizes, radii, font sizes or font families.
  Layout keywords (`display: inline-flex`) are fine.
- **Never read raw primitives:** the colour palettes (`--mgs-blue-*`, `--mgs-red-*`) exist only for `themes.scss` to
  pick from per theme. A component reading one would ignore dark and high-contrast mode.
- The scale tokens live in `tokens.scss` because they don't change per theme. They are still semantic (a named step
  on a scale, or a role like the focus ring width), so a scale can change without touching components.
- **Owned vs adopted tokens.** An _owned_ token has an MGS value (brand blue, danger red, focus ring), and the bridge
  passes it on to RSuite. An _adopted_ token gives an MGS name to RSuite's value (text, surface and border neutrals).
  Components can't tell the difference, so an adopted token can become owned later without touching them.
- **Only `rsuite-bridge.scss` sets `--rs-*` variables.** Apps customize with `--mgs-*` tokens. Nobody styles `.rs-*`
  classes.
- **Add a token only when a component needs it.**
- **Foundation CSS is not in a cascade layer:** `rsuite.css` is unlayered, and layered rules would lose to it.

### Component styles

- **An MGS component built on an RSuite component gets its colours, sizes and states from RSuite**, themed through the
  bridge. Its `.scss` adds only what MGS owns (for example the focus ring), on its own classes: `.mgs-<component>` and
  `.mgs-<component>__<part>`. It never targets `.rs-*` classes or sets `--rs-*` variables; a colour fix for an RSuite
  element goes in the bridge.
- Shared rules are Sass mixins in `src/styles/_mixins.scss` (`@include mixins.focus-ring;`).
- Component styles load after `rsuite.css` (see `src/index.ts`), so a `.mgs-*` rule wins over an RSuite rule of the
  same specificity.

### Themes

| Theme         | Switch                                                                    | Brand                                                              |
| ------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Light         | default                                                                   | Owned                                                              |
| Dark          | `.rs-theme-dark` (set on `<body>` by the provider) or `data-theme="dark"` | Owned: same brand fills as light; lighter blue for links and focus |
| High contrast | `.rs-theme-high-contrast` or `data-theme="high-contrast"`                 | Retained: RSuite's accessibility theme (see below)                 |

A semantic token whose value points at a theme-dependent variable is declared in every theme block. CSS resolves
`var()` inside a custom property where it is declared, then inherits the result as a fixed value.

Every colour pair must meet WCAG AA in every theme and state (default, hover, pressed): 4.5:1 for text, 3:1 for
borders, focus rings and icons. Write the ratio in a comment next to the token or bridge rule. Measure in the browser
(Storybook, each theme), not by reading the CSS: RSuite changes which palette step a role uses per theme.

### High contrast

RSuite's high-contrast theme (yellow on black) is an accessibility mode, so MGS **retains it**: no brand colours, and
the MGS semantic tokens adopt its values. The one exception is the MGS WCAG requirement above: when one of its colour
pairs fails, the bridge fixes **that specific pair**, and nothing else in the theme.

### Contrast fixes in the bridge

Every place where `rsuite-bridge.scss` changes RSuite's colours for contrast, measured in the browser:

| Theme         | Element                                           | RSuite       | MGS                         |
| ------------- | ------------------------------------------------- | ------------ | --------------------------- |
| Light         | Primary fill (brand blue), white text             | 3.0:1        | 5.2:1                       |
| Light         | Danger / red fill, white text                     | 3.7:1        | 4.8:1                       |
| Light, dark   | Input borders                                     | 1.3:1, 1.6:1 | 3:1 or more                 |
| Light, dark   | Default badge, white text                         | 3.7:1, 3.6:1 | 4.8:1                       |
| Light         | Avatar initials                                   | 1.4:1        | 4.8:1                       |
| Light, dark   | Focus ring                                        | 25% opaque   | fully opaque                |
| Dark          | Primary fills (buttons, selected and today dates) | 3.0:1        | 5.2:1                       |
| Dark          | Danger button, hover and pressed                  | below 4.5:1  | 6.5:1, 8.3:1                |
| Dark          | Secondary (default) button, pressed               | 3.4:1        | 5.1:1                       |
| High contrast | Danger button text (dark text on dark red)        | 2.4:1        | 5.0:1 to 7.8:1 (white text) |

## Icons

- Apps import icons from `@mgs/ui` (`PlusIcon`, `TrashIcon`, ...), never from `@rsuite/icons`. `src/icons/index.ts`
  re-exports a curated set from `@rsuite/icons` under MGS names that say what the icon shows or means
  (`FilterIcon`, not `Funnel`). Add an icon when a screen needs it, and check it in the Icons gallery story.
- Icons are decorative: they render `aria-hidden="true"`, sized `1em` in `currentColor`. The control or text next to
  an icon carries the meaning. Components hide any icon passed to them, including custom ones.

## API conventions

If you know `Button`, you should already know the basics of every other MGS component.

### Shared prop names

| Prop                             | Meaning                                                                            |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| `variant`                        | Visual style. Button: `primary \| secondary \| danger \| ghost \| link`            |
| `size`                           | `sm \| md \| lg`, default `md`                                                     |
| `disabled`                       | Not interactive, and removed from the tab order where the platform does that       |
| `loading`                        | Busy: shows a spinner, sets `aria-busy`, blocks activation, keeps focus            |
| `fullWidth`                      | Fills the container width                                                          |
| `leftIcon` / `rightIcon`         | Decorative icons around the label (hidden from screen readers)                     |
| `className`, `style`, `children` | As in React; `className` is added to the root element, never replacing MGS classes |

### Rules

- **Booleans are plain adjectives** (`disabled`, `loading`, `fullWidth`), default `false`, never `isX`/`hasX`.
- **Native attributes pass through** to the root element (`id`, `aria-*`, `data-*`, event handlers). **`ref` is
  forwarded** to the root DOM element.
- **Values:**
  - **Input-like components** (text inputs, selects, pickers, checkboxes, switches) use `value` / `defaultValue` for
    controlled and uncontrolled use, and `onChange(value, event)`. This matches RSuite, so MGS-owned and re-exported
    inputs behave the same.
  - **Other components** use native event signatures: `onClick(event)`, `onFocus(event)`, `onBlur(event)`.
  - **Open/close state** uses `open` / `defaultOpen` / `onOpenChange(open)`.
- **Event names** are `on` + verb (`onChange`, `onOpenChange`, `onClose`), and props that hold content are nouns
  (`label`, `description`, `error`).
- **State vocabulary:** `default`, `hover`, `focus`, `active`, `disabled`, `loading`, `error`, `success`, `selected`,
  `open`, `closed`. Components expose them to CSS as `data-*` attributes (`data-loading`, `data-disabled`), not as new
  names.
- **Icon-only controls require an accessible name:** `aria-label` is required by the TypeScript types.

### Accessibility baseline

Every MGS-owned component:

- uses semantic HTML first and ARIA only where HTML can't express it
- works with the keyboard, with a visible `:focus-visible` ring
- supports labels, descriptions and error messages through `aria-describedby` / `aria-invalid`
- respects `prefers-reduced-motion`
- has a test that runs axe on every story, plus keyboard and state tests

## Documentation

Every MGS component and pattern has both a `.stories.tsx` file and an `.mdx` Docs page, in the same style.
`src/test/docs-structure.test.ts` fails when one is missing or incomplete.

```text
ComponentName              (Storybook sidebar)
├── Docs                   ComponentName.mdx
├── Playground
├── Basic
├── Variants               ("Types" when the component has types, not visual variants)
├── States
├── Sizes
├── …                      component-specific stories: Loading, Disabled, With Icons, Controlled, Uncontrolled, …
├── Advanced examples      realistic usage and edge cases
└── Accessibility
```

### `ComponentName.stories.tsx`: interactive examples

- **Always required:** `Playground`, `Basic` and `Accessibility`.
- **Required when the component has the concept.** The test reads the props documented in the stories' `argTypes`:
  - `Variants` (or `Types`) when it has a `variant` (or `type`) prop;
  - `States` when it has a state prop (`disabled`, `loading`, `readOnly`, `invalid`, `selected`, `checked`,
    `open`);
  - `Sizes` when it has a `size` prop.
- **`Advanced`** (named "Advanced examples") is required too, unless the component has no realistic composed usage
  to show; such an exemption is listed, with its reason, in `docs-structure.test.ts`.
- Don't create a story for a concept the component doesn't have.
- **Order:** `Playground`, `Basic`, `Variants` / `Types`, `States`, `Sizes`, component-specific stories,
  `Advanced`, `Accessibility`.
- `Playground` has Controls for the MGS props only (`parameters.controls.include`); native attributes also work but
  aren't listed. Never expose RSuite props in Controls or examples.
- `Advanced` shows realistic usage (a form, a table row, a toolbar, where they apply) and edge cases.
- `Accessibility` has a `play` function that checks keyboard use and accessible names; the test file runs it.
- Event props use Storybook actions (`fn()`) so clicks show in the Actions panel.
- Each story sets a short "Show code" snippet with `source()` from `src/stories/shared.tsx`.
- `tags: ['!autodocs']`: the MDX file is the Docs page, and a second auto-generated page would duplicate it.

### `ComponentName.mdx`: developer documentation

Sections in this order (`##` headings, exactly these names, and no others):

1. `# ComponentName`, a one-paragraph overview, and a **Component:** line: its kind (MGS-owned built on RSuite X,
   MGS pattern) and links to related components.
2. `## When to use`: situations it is for, and what to use instead when it isn't.
3. `## Import`
4. `## Usage`: the smallest real example.
5. `## Examples`: a `<Canvas of={…} />` for the stories, each with the guidance a developer needs (what each variant or
   state is for). Don't repeat what the story already shows. Common usage patterns (forms, toolbars, dialogs, tables)
   go here as a `###` subsection, where they apply.
6. `## Do and don't`
7. `## Accessibility`: the Accessibility story, keyboard table, and what the component does or the developer must do.
8. `## API`: the Playground with `<Controls />`, which Storybook generates from the types and `argTypes`, then native
   attributes and `ref`. No hand-written props table.
9. Optional `## Customizing`: tokens to override, only when useful.

Documentation describes reusable UI concepts. It doesn't assume a product domain or a particular application.

### RSuite re-exports

A re-export keeps RSuite's API, so its docs describe that API as it is, with a contract that fits the component
instead of the MGS-owned story set. Each lives in `src/stories/<Component>/` with `.stories.tsx`, `.mdx` and
`.test.tsx`. (`docs-structure.test.ts` does not check them.)

- **Stories:** `Playground` first (Controls for the documented props), `Basic`, then the examples that fit the
  component (no forced Variants, States, Sizes or Advanced stories), and `Accessibility` last. The Accessibility story
  has a `play` function that checks what the MDX Accessibility section promises: names, roles, keyboard.
- **MDX,** in this order: `# ComponentName`, a one-paragraph overview, and a **Component:** line (the RSuite version,
  "re-exported by `@mgs/ui`", and a link to RSuite's reference); then `## Usage`, `## Examples`, `## Accessibility`
  (starting with the Accessibility story), `## Playground` (with `<Controls />`), `## Props`, and an optional
  `## Customizing`.
- **`## Props` is hand-written:** RSuite's types come from `node_modules`, which Storybook's docgen doesn't read, so the
  generated Controls list only the props a story declares. The table lists the props MGS documents and supports.
- **Known RSuite gaps** (keyboard, contrast, value quirks) are marked ⚠️ in the MDX, with a test that pins the
  behaviour, so an RSuite upgrade that changes it fails the tests.
- **Tests:** axe on every story, every story's `play` function, and "RSuite behaviour documented in X.mdx" tests.

## Versioning

- **Public MGS APIs are contracts.** Semantic versioning, one Changeset per change. While on `0.x`, a breaking change
  is a minor release.
- **Deprecate before removing:** mark the old API `@deprecated` in the types with a pointer to the replacement, warn
  once in development, remove it in the next breaking release, and write a migration note in the changeset.

## Adding or migrating a component

1. Answer "What does MGS own here?" and pick the kind.
2. **RSuite re-export:** export it and its `...Props` type from `src/index.ts`, and document it in
   `src/stories/<Component>/`.
3. **MGS-owned component or pattern:** design the API against the conventions above, then write types, component,
   styles, stories, tests and docs, export it, and deprecate the old re-export if there was one.
4. Add a Changeset.

## Future candidates

Recorded, not built. Each is added only when a real application needs it, through "What does MGS own here?" and an
approved design.

| Candidate                   | Why it came up                                                                                                              | Status                                |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `LinkButton`                | `Button` always renders a `<button>` (no `href` / `as`), so "go to page" actions need a link styled as a button             | Candidate                             |
| IconButton `subtle` variant | Table row and toolbar actions often want a quiet, borderless icon button                                                    | Candidate, driven by real usage       |
| Button label wrapping       | A label wider than its button is cut off at both ends (RSuite's `nowrap` + `overflow: hidden`); documented in Button's docs | Known limitation, awaiting a decision |
