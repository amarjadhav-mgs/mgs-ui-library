# @mgs/ui architecture

The contract for how `@mgs/ui` is built. Read it before adding or changing a component.

## Decision

`@mgs/ui` is the UI library for every MGS project, present and future, of any kind. **MGS owns every public API**:
each component, prop, type, helper and icon an application can import is designed by MGS. RSuite 6 provides proven
behaviour (keyboard, focus, popups, calendars, pickers) underneath, as an **implementation detail** that applications
never see, so it can be upgraded or replaced without changing application code.

```text
                     Application
                          │  import { Button } from '@mgs/ui'
                          ↓
              @mgs/ui public API (MGS-owned)
             ┌────────────┴────────────┐
             ↓                         ↓
        Components                 Patterns
             └────────────┬────────────┘
                          ↓  internal only
               RSuite, or MGS's own code
```

Apps import only from `@mgs/ui`, never from `rsuite` or `@rsuite/icons`.

## Kinds

| Kind          | What it is                                                                         | Example                      |
| ------------- | ---------------------------------------------------------------------------------- | ---------------------------- |
| **Component** | One UI control or element with an MGS API, built on RSuite or by MGS               | `Button`, `DatePicker`       |
| **Pattern**   | Several components always combined the same way, e.g. label + control + error text | `FormField`, `ConfirmDialog` |

How much MGS code a component needs varies. Some add behaviour, accessibility or styling RSuite doesn't give (`Button`'s
`loading`); others mainly map an MGS API onto RSuite. Both are fine: the API is what MGS owns.

Rules:

- **Nothing is re-exported from `rsuite` or `@rsuite/icons`.** Every export is an MGS component, pattern, type,
  helper or icon.
- **Each component declares its own `Props` interface:** the MGS props plus the native attributes of its root element.
  It never extends, picks from or re-exports an RSuite props type, and its public types, class names and CSS variables
  never mention RSuite.
- **Expose only what MGS supports.** Don't add a prop because RSuite (or MUI, AntD, …) has one; classify each proposed
  prop as must have, good to have, later or don't need, and build only what's agreed. Adding a prop later is easy;
  removing one is a breaking change.
- Use RSuite inside a component when it provides difficult behaviour. Build it ourselves only when RSuite doesn't.
- No business logic, data fetching or app state in the library.
- **Enforced by the build:** `npm run build` runs `scripts/check-public-api.mjs`, which fails when a `.d.ts` file in
  `dist/` references `rsuite` or `@rsuite/icons`. The only exceptions are the re-exports still waiting for migration,
  listed in that script (see [Migrating the RSuite re-exports](#migrating-the-rsuite-re-exports)).

## Folder structure

Folders are created when the first file needs them.

```text
src/
├── styles/            tokens.scss → themes.scss → rsuite-bridge.scss → motion.scss (see Styling), _mixins.scss,
│                      rsuite-icons.scss
├── components/        components, one folder each
├── patterns/          patterns, one folder each
├── icons/             curated icon exports
├── stories/           shared story helpers (shared.tsx); docs of the re-exports until they are migrated
└── index.ts           the public API: nothing is public unless it's exported here
```

A component or pattern:

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
motion.scss          reduced motion for MGS and RSuite elements
      ↓
MGS component styles (read semantic tokens only)  +  RSuite internals (read --rs-*)
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
- **One exception, `rsuite-icons.scss`:** a verbatim copy of the base `.rs-icon` rules that `@rsuite/icons` would
  otherwise inject with a `<style>` tag at runtime (blocked by strict Content Security Policies, and missing before
  hydration in server rendering). `MgsProvider` turns the injection off. Check the copy when upgrading `@rsuite/icons`.
- **Tokens that are the same in every theme are declared once, on `:root`** (brand primary and danger), so an app that
  overrides them on `:root` gets its colours in every theme. A theme block only declares what differs.
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
| All           | Invalid field border (`aria-invalid="true"`)      | no style     | 4.8:1, 3.5:1, 4.8:1         |
| Light         | Button loading spinner, secondary                 | 2.8:1        | 11.6:1                      |
| High contrast | Button loading spinner, primary                   | 1.1:1        | 17.3:1                      |
| All           | Button loading spinner, every variant             | —            | 4.8:1 or more               |

## Icons

- Apps import icons from `@mgs/ui` (`PlusIcon`, `TrashIcon`, ...), never from `@rsuite/icons`. `src/icons/index.ts`
  exports a curated set under MGS names that say what the icon shows or means (`FilterIcon`, not `Funnel`). Each is an
  `MgsIcon` with `MgsIconProps` (SVG attributes only), made by `createIcon` in `src/icons/createIcon.tsx`; the SVG
  artwork comes from `@rsuite/icons` internally. Add an icon when a screen needs it, with `/* @__PURE__ */` so unused
  icons are tree-shaken, and check it in the Icons gallery story.
- Icons need no runtime `<style>` tag: their base styles ship in `styles.css` (`src/styles/rsuite-icons.scss`).
- Icons are decorative: they render `aria-hidden="true"` with no `aria-label`, sized `1em` in `currentColor`, and take
  no `aria-label` or `role`. Size them with `font-size` and colour them with `color`. The control or text next to an
  icon carries the meaning. Components hide any icon passed to them, including custom ones.

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
    controlled and uncontrolled use, and `onChange(value, event)`. This matches RSuite's signature, so components built on
    RSuite inputs pass it straight through.
  - **Other components** use native event signatures: `onClick(event)`, `onFocus(event)`, `onBlur(event)`.
  - **Open/close state** uses `open` / `defaultOpen` / `onOpenChange(open)`.
- **Event names** are `on` + verb (`onChange`, `onOpenChange`, `onClose`), and props that hold content are nouns
  (`label`, `description`, `error`).
- **State vocabulary:** `default`, `hover`, `focus`, `active`, `disabled`, `loading`, `error`, `success`, `selected`,
  `open`, `closed`. Components expose them to CSS as `data-*` attributes (`data-loading`, `data-disabled`), not as new
  names.
- **Icon-only controls require an accessible name:** the TypeScript types require `aria-label`. `aria-labelledby` may
  also point at visible text (it takes precedence). Props types are interfaces, not unions, so apps can extend them.

### Accessibility baseline

Every component and pattern:

- uses semantic HTML first and ARIA only where HTML can't express it
- works with the keyboard, with a visible `:focus-visible` ring (3:1 or more): **outside** buttons (2px offset, the
  `focus-ring` mixin), and **inset** on fields and input groups, so rings in a dense form don't overlap the field
  below. Buttons inside a field (a clear or Show password button) get their own inset ring
- supports labels, descriptions and error messages through `aria-describedby` / `aria-invalid`
- respects `prefers-reduced-motion`: `src/styles/motion.scss` turns off transitions and slows spinners for MGS and
  RSuite elements
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

1. `# ComponentName`, a one-paragraph overview, and a **Component:** line: its kind (component built on RSuite X or by MGS,
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

Documentation describes the MGS API only. RSuite may be named on the **Component:** line (what the component is built
on, for maintainers), but examples, Controls and prop docs never show RSuite props.

## Versioning

- **Public MGS APIs are contracts.** Semantic versioning, one Changeset per change. While on `0.x`, a breaking change
  is a minor release.
- **Deprecate before removing:** mark the old API `@deprecated` in the types with a pointer to the replacement, warn
  once in development, remove it in the next breaking release, and write a migration note in the changeset.
- **Until the first application adopts `@mgs/ui`**, migrating a re-export replaces it directly (a Changeset still
  records the change); there is nobody to deprecate for.

## Adding a component

1. Pick the kind (component or pattern) and check nothing existing already covers it.
2. Propose the API against the conventions above, with each prop classified (must have, good to have, later, don't
   need), and get it approved.
3. Write types, component, styles, stories, tests and docs, and export it from `src/index.ts`.
4. Add a Changeset.

## Migrating the RSuite re-exports

The library started by re-exporting some RSuite components unchanged. Each is migrated to an MGS component, one at a
time, with an approved API for each. When one is done, remove it from the pending list in
`scripts/check-public-api.mjs`, move its docs from `src/stories/<Component>/` into its component folder in the standard
documentation format, and tick it in the tracking checklist of
[docs/IMPLEMENTATION-PLAN.md](./docs/IMPLEMENTATION-PLAN.md).

The migrations follow the plan's phases, which also cover every other RSuite component:

| Phase | Re-exports migrated                                                                                                                                                | Status                     |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| 0     | `CustomProvider` → `MgsProvider`; icons typed with `MgsIconProps` instead of `@rsuite/icons` types                                                                 | Done                       |
| 1     | `Input`, `Textarea`, `PasswordInput`, `InputGroup` (done); `ButtonGroup`; `ButtonToolbar` → `Stack`                                                                | Inputs and InputGroup done |
| 2     | `Calendar`, `DateInput`, `DatePicker`, `DateRangeInput`, `DateRangePicker`, `TimePicker`, `TimeRangePicker`, date helpers (`after`, `beforeToday`, …), `DateRange` | Pending                    |
| 3     | `Badge`, `Avatar`, `AvatarGroup`                                                                                                                                   | Pending                    |

Until a re-export is migrated, its docs in `src/stories/<Component>/` describe RSuite's API as it is: `Playground`,
`Basic`, fitting examples and `Accessibility` stories; an MDX page with a hand-written `## Props` table (Storybook's
docgen doesn't read `node_modules`); known RSuite gaps marked ⚠️ with a test that pins them; axe on every story.
`docs-structure.test.ts` doesn't check them.

## Future candidates

Recorded, not built. Each goes through an approved API design before it's built.

| Candidate                   | Why it came up                                                                                                              | Status                                |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `LinkButton`                | `Button` always renders a `<button>` (no `href` / `as`), so "go to page" actions need a link styled as a button             | Candidate                             |
| IconButton `subtle` variant | Table row and toolbar actions often want a quiet, borderless icon button                                                    | Candidate, driven by real usage       |
| Button label wrapping       | A label wider than its button is cut off at both ends (RSuite's `nowrap` + `overflow: hidden`); documented in Button's docs | Known limitation, awaiting a decision |
