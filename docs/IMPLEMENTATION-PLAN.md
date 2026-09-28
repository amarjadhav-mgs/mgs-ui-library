# `@mgs/ui` implementation plan

How `@mgs/ui` goes from today's state (two MGS components plus RSuite re-exports) to a complete UI library that wraps
all of RSuite 6 behind MGS-owned APIs, in the order that serves ERP applications best.

- **The contract** is [ARCHITECTURE.md](../ARCHITECTURE.md): rules, conventions, documentation standard. This plan is
  the **roadmap**: what gets built, in which order, and how we know it's done. If the two disagree, ARCHITECTURE.md
  wins, and this plan is corrected.
- **Background** for every concept used here is in [STUDY-GUIDE.md](./STUDY-GUIDE.md).
- Written 2026-09-28, against RSuite 6.2.4 (`node_modules/rsuite/esm`). Update the tracking checklist as work lands.

## Contents

1. [Goal and decisions](#1-goal-and-decisions)
2. [Current state](#2-current-state)
3. [RSuite coverage map](#3-rsuite-coverage-map)
4. [Phases](#4-phases)
5. [Per-component workflow and definition of done](#5-per-component-workflow-and-definition-of-done)
6. [ERP rules that apply to every component](#6-erp-rules-that-apply-to-every-component)
7. [Releases and delivery](#7-releases-and-delivery)
8. [Adoption](#8-adoption)
9. [Risks](#9-risks)
10. [Open decisions](#10-open-decisions)
11. [Tracking checklist](#11-tracking-checklist)

---

## 1. Goal and decisions

**Goal:** one library that every MGS application uses for all of its UI, so apps look and behave the same, accessibility
and fixes are done once, and RSuite can be upgraded or replaced without changing app code.

**Decisions already made** (see ARCHITECTURE.md → Decision, Kinds):

| Decision            | What it means                                                                                            |
| ------------------- | -------------------------------------------------------------------------------------------------------- |
| Wrap RSuite 6       | RSuite provides behaviour (keyboard, focus, popups, pickers, tables) as an internal detail               |
| MGS owns every API  | Every export is an MGS component, pattern, type, helper or icon; nothing is re-exported from `rsuite`    |
| Cover all of RSuite | Every RSuite capability gets a decision (section 3); **not** one MGS component per RSuite export         |
| Small APIs          | Every prop classified must have / good to have / later / don't need; the API is approved before building |
| WCAG 2 AA           | In the light, dark and high-contrast themes                                                              |
| No business logic   | No data fetching, app state or domain rules in the library                                               |
| General library     | Built for every MGS project; ERP is the main use case and sets the priorities                            |

**Why not one MGS component per RSuite export?** RSuite 6 has about 110 exports. Many overlap (`SelectPicker`,
`InputPicker`, `CheckPicker` and `TagPicker` all pick from a list), some are internals (`Animation`, `DOMHelper`,
`Whisper`), and some are layout primitives that do the same job (`Grid`, `FlexboxGrid`, `Row`/`Col`). Copying all of
them would give apps a huge API that's hard to learn and impossible to keep stable. Merging them gives about 60 MGS
components and patterns with every RSuite capability still available.

---

## 2. Current state

| Area                   | Status                                                                                                                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tokens and themes      | Done: `src/styles/tokens.scss`, `themes.scss`, `rsuite-bridge.scss`; light, dark, high contrast                                                                                                    |
| MGS components         | `Button`, `IconButton`                                                                                                                                                                             |
| Icons                  | 34 curated icons in `src/icons/index.ts`; still typed with `@rsuite/icons` types                                                                                                                   |
| RSuite re-exports      | 17 components + date helpers + `DateRange`, listed in `scripts/check-public-api.mjs` by phase, waiting for migration; ARCHITECTURE.md → Migrating the RSuite re-exports follows this plan's phases |
| Documentation standard | Done, enforced by `src/test/docs-structure.test.ts`                                                                                                                                                |
| Quality gates          | CI (typecheck, lint, format, test, build with public API check, build-storybook), pre-commit hook                                                                                                  |
| Releases               | Nothing published; version `0.1.0`; 9 changesets waiting                                                                                                                                           |
| Adoption               | No app uses `@mgs/ui` yet (so re-exports can be replaced directly, without deprecation)                                                                                                            |

---

## 3. RSuite coverage map

Every export of RSuite 6.2.4 and what it becomes. **Decisions:**

- **Wrap:** becomes one MGS component with an MGS API.
- **Merge:** folded into another MGS component (named in the MGS column).
- **Pattern:** replaced by an MGS pattern.
- **Internal:** used inside MGS components only, never exported.
- **Later:** recorded, built when a real need appears (section 4, phase 7).
- **Don't need:** not planned; reason given.

The MGS names and merges are **proposals**: each is confirmed in its component's API proposal (section 5).

### Foundation

| RSuite                                | Decision | MGS               | Phase | Notes                                                                 |
| ------------------------------------- | -------- | ----------------- | ----- | --------------------------------------------------------------------- |
| `CustomProvider`                      | Wrap     | `MgsProvider`     | 0     | theme, locale (date format: open decision 1); RSuite internals hidden |
| `locales`                             | Internal | via `MgsProvider` | 0     | MGS locale type; RSuite's locale objects stay inside                  |
| `VisuallyHidden`                      | Wrap     | `VisuallyHidden`  | 0     | Screen-reader-only text                                               |
| `Animation`, `DOMHelper`              | Internal | —                 | —     | Implementation helpers                                                |
| `useMediaQuery`, `useBreakpointValue` | Later    | `useMediaQuery`   | 7     | Only if apps need responsive logic in JS                              |
| `Affix`                               | Later    | —                 | 7     | Sticky positioning; CSS `position: sticky` usually suffices           |

### Buttons

| RSuite          | Decision | MGS           | Phase | Notes                                      |
| --------------- | -------- | ------------- | ----- | ------------------------------------------ |
| `Button`        | Done     | `Button`      | —     |                                            |
| `IconButton`    | Done     | `IconButton`  | —     |                                            |
| `ButtonGroup`   | Wrap     | `ButtonGroup` | 1     | Attached buttons; group `size`             |
| `ButtonToolbar` | Merge    | `Stack`       | 1     | A row of buttons with spacing is a `Stack` |

### Form inputs

| RSuite                        | Decision   | MGS                         | Phase | Notes                                                             |
| ----------------------------- | ---------- | --------------------------- | ----- | ----------------------------------------------------------------- |
| `Input`                       | Wrap       | `Input`                     | 1     |                                                                   |
| `Textarea`                    | Wrap       | `Textarea`                  | 1     |                                                                   |
| `PasswordInput`               | Wrap       | `PasswordInput`             | 1     | Show/hide toggle                                                  |
| `InputGroup`                  | Wrap       | `InputGroup`                | 1     | Addons (prefix, suffix, buttons)                                  |
| `InputNumber`, `NumberInput`  | Merge      | `NumberInput`               | 1     | Locale-aware number formatting                                    |
| `Checkbox`, `CheckboxGroup`   | Wrap       | `Checkbox`, `CheckboxGroup` | 1     |                                                                   |
| `Radio`, `RadioGroup`         | Wrap       | `Radio`, `RadioGroup`       | 1     |                                                                   |
| `Toggle`                      | Wrap       | `Switch`                    | 1     | Common name for an on/off control                                 |
| `SelectPicker`, `InputPicker` | Merge      | `Select`                    | 1     | One value; searchable option                                      |
| `CheckPicker`, `TagPicker`    | Merge      | `MultiSelect`               | 1     | Several values; display as checks or tags decided in the proposal |
| `AutoComplete`                | Wrap       | `AutoComplete`              | 1     | Free text with suggestions                                        |
| `TagInput`                    | Wrap       | `TagInput`                  | 6     | Free-form list of values                                          |
| `MaskedInput`                 | Wrap       | `MaskedInput`               | 6     | Phone, IDs, codes                                                 |
| `PinInput`                    | Wrap       | `PinInput`                  | 6     | One-time codes                                                    |
| `SegmentedControl`            | Wrap       | `SegmentedControl`          | 6     |                                                                   |
| `Slider`, `RangeSlider`       | Merge      | `Slider`                    | 6     | Single or range value, decided in the proposal                    |
| `RadioTile`, `RadioTileGroup` | Later      | —                           | 7     | Card-style radios                                                 |
| `PasswordStrengthMeter`       | Later      | —                           | 7     |                                                                   |
| `Rate`                        | Don't need | —                           | —     | Star ratings are rare in business apps                            |

### Forms

| RSuite                                                                                               | Decision   | MGS          | Phase | Notes                                                                                             |
| ---------------------------------------------------------------------------------------------------- | ---------- | ------------ | ----- | ------------------------------------------------------------------------------------------------- |
| `FormGroup`, `FormControl`, `FormControlLabel`, `FormErrorMessage`, `FormHelpText`, `useFormControl` | Pattern    | `FormField`  | 1     | Label + control + help + error, with ids and ARIA wired automatically                             |
| `Form`, `FormStack`                                                                                  | Pattern    | `FormLayout` | 1     | Layout only (vertical / horizontal / columns); decided in the `FormField` proposal whether needed |
| `Schema`                                                                                             | Don't need | —            | —     | Validation belongs to the app's form library (React Hook Form, Formik, zod, yup)                  |

### Date and time

| RSuite                                                                                                                    | Decision | MGS                                               | Phase | Notes                                                              |
| ------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------- | ----- | ------------------------------------------------------------------ |
| `DatePicker`                                                                                                              | Wrap     | `DatePicker`                                      | 2     | Uses the MGS date format from `MgsProvider`                        |
| `DateRangePicker`                                                                                                         | Wrap     | `DateRangePicker`                                 | 2     | Includes range presets (Today, Last 7 days, This month…)           |
| `DateInput`, `DateRangeInput`                                                                                             | Wrap     | `DateInput`, `DateRangeInput`                     | 2     | Typed dates without a popup; keep or merge decided in the proposal |
| `TimePicker`, `TimeRangePicker`                                                                                           | Wrap     | `TimePicker`, `TimeRangePicker`                   | 2     |                                                                    |
| `Calendar`                                                                                                                | Wrap     | `Calendar`                                        | 2     | Inline month view                                                  |
| Date helpers (`after`, `afterToday`, `allowedDays`, `allowedMaxDays`, `allowedRange`, `before`, `beforeToday`, `combine`) | Merge    | MGS props (`minDate`, `maxDate`, `maxRangeDays`…) | 2     | Simple props instead of RSuite's function helpers                  |
| `DateRange` type                                                                                                          | Merge    | MGS `DateRange` type                              | 2     |                                                                    |

### Data display

| RSuite                       | Decision   | MGS                     | Phase | Notes                                             |
| ---------------------------- | ---------- | ----------------------- | ----- | ------------------------------------------------- |
| `Table`                      | Wrap       | `Table`                 | 3     | The largest item; see phase 3                     |
| `Pagination`                 | Wrap       | `Pagination`            | 3     |                                                   |
| `Tag`, `TagGroup`            | Wrap       | `Tag`                   | 3     | Status pills use `Tag` with semantic variants     |
| `Badge`                      | Wrap       | `Badge`                 | 3     | Count or dot                                      |
| `Avatar`, `AvatarGroup`      | Wrap       | `Avatar`, `AvatarGroup` | 3     |                                                   |
| `Stat`, `StatGroup`          | Wrap       | `Stat`                  | 3     | Dashboard numbers                                 |
| `Loader`                     | Wrap       | `Spinner`               | 3     | Common name                                       |
| `Placeholder`                | Wrap       | `Skeleton`              | 3     | Common name                                       |
| `Progress`, `ProgressCircle` | Merge      | `Progress`              | 3     | Bar or circle as a variant                        |
| `List`                       | Wrap       | `List`                  | 5     |                                                   |
| `Timeline`                   | Wrap       | `Timeline`              | 6     | Audit history, order status history               |
| `Tree`, `CheckTree`          | Merge      | `Tree`                  | 6     | Checkable as an option                            |
| `InlineEdit`                 | Wrap       | `InlineEdit`            | 6     |                                                   |
| `Highlight`                  | Later      | —                       | 7     | Search-match highlighting                         |
| `Kbd`                        | Later      | —                       | 7     | Keyboard shortcut hints                           |
| `Image`                      | Don't need | —                       | —     | Native `<img>` is enough                          |
| `Carousel`                   | Don't need | —                       | —     | Rare in business apps and hard to make accessible |

### Pickers with hierarchy

| RSuite                                                         | Decision | MGS          | Phase | Notes                                 |
| -------------------------------------------------------------- | -------- | ------------ | ----- | ------------------------------------- |
| `TreePicker`, `CheckTreePicker`                                | Merge    | `TreeSelect` | 6     | Single or multiple                    |
| `Cascader`, `MultiCascader`, `CascadeTree`, `MultiCascadeTree` | Merge    | `Cascader`   | 6     | Region → city, category → subcategory |

### Overlays and feedback

| RSuite                                  | Decision | MGS                 | Phase | Notes                                         |
| --------------------------------------- | -------- | ------------------- | ----- | --------------------------------------------- |
| `Modal`                                 | Wrap     | `Dialog`            | 4     | Common name; focus trap and return            |
| `Drawer`                                | Wrap     | `Drawer`            | 4     | Side panel for create/edit forms              |
| `Tooltip` + `Whisper`                   | Merge    | `Tooltip`           | 4     | `Whisper` stays internal                      |
| `Popover` + `Whisper`                   | Merge    | `Popover`           | 4     |                                               |
| `Dropdown`, `Menu`                      | Merge    | `Menu`              | 4     | Action menus ("More ⋯")                       |
| `Message`                               | Wrap     | `Alert`             | 4     | Inline message in the page                    |
| `Notification`, `toaster`, `useToaster` | Merge    | `Toast` + `toast()` | 4     | Temporary messages ("Order saved")            |
| `useDialog`                             | Pattern  | `ConfirmDialog`     | 4     | Imperative confirm is replaced by the pattern |

### Navigation and layout

| RSuite                                                | Decision | MGS                 | Phase | Notes                                                    |
| ----------------------------------------------------- | -------- | ------------------- | ----- | -------------------------------------------------------- |
| `Tabs`, `Nav` (tabs style)                            | Merge    | `Tabs`              | 5     |                                                          |
| `Breadcrumb`                                          | Wrap     | `Breadcrumb`        | 5     |                                                          |
| `Steps`                                               | Wrap     | `Steps`             | 5     | Multi-step forms, approval flows                         |
| `Sidenav`, `Navbar`, `Nav`                            | Merge    | `SideNav`, `TopNav` | 5     | App navigation                                           |
| `Container`, `Header`, `Content`, `Footer`, `Sidebar` | Pattern  | `AppShell`          | 5     | Standard page frame: top bar, side nav, content          |
| `Stack`, `Box`, `Center`                              | Merge    | `Stack`             | 5     | Stack is also used earlier for `ButtonToolbar` (phase 1) |
| `Grid`, `Row`, `Col`, `FlexboxGrid`                   | Merge    | `Grid`              | 5     | One grid API                                             |
| `Card`, `CardGroup`, `Panel`                          | Merge    | `Card`              | 5     |                                                          |
| `PanelGroup`, `Accordion`                             | Merge    | `Accordion`         | 5     |                                                          |
| `Divider`                                             | Wrap     | `Divider`           | 5     |                                                          |
| `Text`, `Heading`, `HeadingGroup`                     | Merge    | `Text`, `Heading`   | 5     | Typography with MGS tokens                               |
| `Link`                                                | Wrap     | `Link`              | 5     | Also answers the `LinkButton` candidate                  |

### Files

| RSuite     | Decision | MGS          | Phase | Notes                            |
| ---------- | -------- | ------------ | ----- | -------------------------------- |
| `Uploader` | Wrap     | `FileUpload` | 6     | Attachments on orders, invoices… |

### Icons

| RSuite                  | Decision | MGS                       | Phase | Notes                                                         |
| ----------------------- | -------- | ------------------------- | ----- | ------------------------------------------------------------- |
| `@rsuite/icons` artwork | Internal | curated `...Icon` exports | 0     | Keep the artwork; replace the public type with `MgsIconProps` |

---

## 4. Phases

Each phase ends with a usable, released state. Sizes: **S** (a day or two), **M** (about a week), **L** (two weeks or
more), for one developer including stories, tests and docs.

### Phase 0: foundation

Everything else depends on these.

| Item                     | Size | Notes                                                                                                                                                                       |
| ------------------------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MgsProvider`            | M    | `theme`, `locale`; whether it also sets a default date format is decided in its proposal (open decision 1). Replaces `CustomProvider` in `.storybook/preview.tsx` and tests |
| `MgsIconProps` for icons | S    | `src/icons/index.ts` exports typed with MGS's own props; remove icons from the pending list                                                                                 |
| `VisuallyHidden`         | S    |                                                                                                                                                                             |
| Density decision         | S    | See section 6 and open decision 2                                                                                                                                           |
| Publishing setup         | S    | GitHub Packages config and a release workflow (section 7), not used until phase 2. Needs the GitHub organization `mgs` first (open decision 7)                              |

**Done when:** `MgsProvider` replaces `CustomProvider` everywhere and the icons pass the public API check.

### Phase 1: form inputs and `FormField`

Every ERP screen is a form or a table; forms come first.

| Item                                 | Size | Notes                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared internals                     | S    | Helpers the wrappers reuse (id generation for labels, class name joining, dev-only warnings), created when the first input needs them, not before                                                                                                                                                                            |
| `Input`, `Textarea`, `PasswordInput` | M    | Migrations of existing re-exports                                                                                                                                                                                                                                                                                            |
| `InputGroup`                         | S    | Migration                                                                                                                                                                                                                                                                                                                    |
| `NumberInput`                        | M    | Locale-aware formatting; decimal and currency behaviour decided in proposal                                                                                                                                                                                                                                                  |
| `Checkbox`, `CheckboxGroup`          | M    |                                                                                                                                                                                                                                                                                                                              |
| `Radio`, `RadioGroup`                | M    |                                                                                                                                                                                                                                                                                                                              |
| `Switch`                             | S    |                                                                                                                                                                                                                                                                                                                              |
| `Select`                             | L    | Search, async options, clearable; keyboard and screen reader behaviour                                                                                                                                                                                                                                                       |
| `MultiSelect`                        | L    | Shares most of `Select`                                                                                                                                                                                                                                                                                                      |
| `AutoComplete`                       | M    |                                                                                                                                                                                                                                                                                                                              |
| `ButtonGroup`, `Stack`               | M    | Migration of `ButtonGroup`; `Stack` replaces `ButtonToolbar`                                                                                                                                                                                                                                                                 |
| **`FormField`** pattern              | L    | Built last in the phase, after the inputs above. Takes any control as a child, so the phase 2 date pickers plug in without changes; `required`, `help`, `error`. Needs an error **text** colour token: RSuite's `--rs-text-error` (adopted as `--mgs-color-text-error`) fails 4.5:1 (3.7:1 in light, 2.9:1 in high contrast) |

**Done when:** a complete create/edit form can be built from `@mgs/ui` only, with React Hook Form and with Formik,
fully keyboard-operable and axe-clean. Add an "ERP form" example story that proves it.

### Phase 2: date and time

| Item                                          | Size | Notes                                                                  |
| --------------------------------------------- | ---- | ---------------------------------------------------------------------- |
| `DatePicker`, `DateInput`                     | L    | MGS date format; `minDate` / `maxDate` instead of RSuite helpers       |
| `DateRangePicker`, `DateRangeInput`           | L    | Standard presets                                                       |
| `TimePicker`, `TimeRangePicker`               | M    | 24 h / 12 h from the provider                                          |
| `Calendar`                                    | M    |                                                                        |
| Remove date helpers and `DateRange` re-export | S    | Pending list in `scripts/check-public-api.mjs` becomes empty for dates |

**Done when:** every date in every app can use one consistent format, and the pending re-export list in
`scripts/check-public-api.mjs` contains only phase 3 items. **First release to the registry** (`0.2.0` or later) and
the **pilot** starts (section 8).

### Phase 3: data display

The ERP list screen: filters, a table, pagination, statuses.

| Item                              | Size | Notes                                                                    |
| --------------------------------- | ---- | ------------------------------------------------------------------------ |
| **`Table`**                       | L+   | See below                                                                |
| `Pagination`                      | M    | Page size selector, total count                                          |
| `Tag`                             | S    | Semantic variants (success, warning, danger, info, neutral) for statuses |
| `Badge`, `Avatar`, `AvatarGroup`  | M    | Migrations of existing re-exports                                        |
| `Stat`                            | S    |                                                                          |
| `Spinner`, `Skeleton`, `Progress` | M    |                                                                          |
| **`EmptyState`** pattern          | S    | Icon + message + action for empty lists and no search results            |

**`Table` approach:** wrap RSuite `Table` behind a column-definition API (columns as data, not RSuite's
`<Column>`/`<Cell>` children), so the inside can change later. Must have: sorting (controlled, so the server can
sort), row selection, loading and empty states, fixed header, horizontal scroll, row actions column. Good to have:
virtualization for large lists, column resize, fixed columns. Later: inline editing, tree rows, column reorder. Split
into several PRs.

**Done when:** a standard list screen (toolbar, table, pagination, statuses, empty state) can be built from `@mgs/ui`
only. All original RSuite re-exports are migrated: the pending list in `scripts/check-public-api.mjs` is **empty** and
is deleted.

### Phase 4: overlays and feedback

| Item                        | Size | Notes                                         |
| --------------------------- | ---- | --------------------------------------------- |
| `Dialog`                    | M    | Focus trap and return; sizes                  |
| `Drawer`                    | M    | Create/edit side panel                        |
| `Tooltip`, `Popover`        | M    |                                               |
| `Menu`                      | M    | Action menus, keyboard navigation             |
| `Alert`                     | S    | Inline messages                               |
| `Toast` + `toast()`         | M    | Announced to screen readers (`role="status"`) |
| **`ConfirmDialog`** pattern | S    | "Delete 3 orders?" with `danger` confirm      |

**Done when:** create, edit and delete flows (drawer form, confirm, toast) can be built from `@mgs/ui` only.

### Phase 5: navigation and layout

| Item                                   | Size | Notes                                    |
| -------------------------------------- | ---- | ---------------------------------------- |
| `Tabs`, `Breadcrumb`, `Steps`          | M    |                                          |
| `SideNav`, `TopNav`                    | L    |                                          |
| `Grid`, `Card`, `Accordion`, `Divider` | M    | `Stack` exists from phase 1              |
| `Text`, `Heading`, `Link`, `List`      | M    |                                          |
| **`AppShell`** pattern                 | M    | Top bar, side nav, content, responsive   |
| **`Toolbar`** pattern                  | S    | Search + filters + actions above a table |
| **`PageHeader`** pattern               | S    | Title, breadcrumb, primary action        |

**Done when:** a complete application frame and page can be built from `@mgs/ui` only. Candidate for **`1.0.0`**
(section 7).

### Phase 6: advanced

Built in the order apps ask for them: `TreeSelect`, `Tree`, `Cascader`, `FileUpload`, `TagInput`, `InlineEdit`,
`Timeline`, `Slider`, `SegmentedControl`, `MaskedInput`, `PinInput`. Sizes M–L each.

### Phase 7: later

Recorded in section 3 with the reason. Each item is built only when a real need appears, through a normal API proposal.
Also includes ARCHITECTURE.md → Future candidates (`LinkButton`, IconButton `subtle` variant, Button label wrapping).

---

## 5. Per-component workflow and definition of done

### Workflow

1. **Proposal** (a PR comment or `docs/proposals/<Name>.md`), using the template below.
2. **Approval** of the proposal. Nothing is built before this.
3. Branch from `dev`: `feat/<name>`.
4. `types.ts` → `<Name>.tsx` → `<Name>.scss` → `index.ts` → export from `src/index.ts`.
5. For a migration: remove the RSuite re-export from `src/index.ts`, its names from `scripts/check-public-api.mjs`,
   and move its docs from `src/stories/<Name>/` into the component folder in the standard format.
6. Stories → tests → MDX.
7. `npm run typecheck && npm run lint && npm test && npm run build`; check all three themes and the a11y panel in
   Storybook.
8. `npm run changeset`, with a migration table when an API changed.
9. PR into `dev`; CI green; review; merge.
10. Tick the item in section 11.

### Proposal template

```md
# <Name> proposal

**Kind:** component | pattern · **Built on:** RSuite <X> | MGS · **Replaces:** <RSuite exports>

## Use cases

- …

## Props

| Prop | Type | Default | Label (must / good / later / don't need) | Why |
| ---- | ---- | ------- | ---------------------------------------- | --- |

## RSuite props not exposed

| RSuite prop | Why not |
| ----------- | ------- |

## Accessibility

Role, name, keyboard (WAI-ARIA Authoring Practices pattern), states, known RSuite gaps and how MGS fixes them.

## Stories

Playground, Basic, (Variants / Sizes / States if the concepts exist), feature stories, Advanced, Accessibility.

## Open questions
```

### Definition of done

```text
☐ API approved; implemented exactly as approved
☐ Props type is MGS's own (no RSuite types); native attributes, className, style, ref pass through
☐ Follows the shared conventions (variant, size, disabled, value/onChange, open/onOpenChange)
☐ @ts-expect-error tests reject the main RSuite props that are not exposed
☐ Keyboard support per the WAI-ARIA pattern; visible focus; focus never lost
☐ Contrast AA in light, dark and high contrast (checked in the Storybook a11y panel)
☐ Stories per the documentation standard; Accessibility story with a play function
☐ Tests: behaviour, API contract, axe on every story, play functions
☐ MDX with the standard sections; docs-structure test passes
☐ Exported from src/index.ts; public API check passes
☐ Changeset written for app developers
☐ CI green
```

---

## 6. ERP rules that apply to every component

| Rule                              | What it means                                                                                                              |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Density**                       | ERP screens show a lot of data. Sizes `sm`/`md`/`lg` stay; the default density is an open decision (section 10)            |
| **Keyboard-first**                | Data-entry users rarely touch the mouse: logical tab order, Enter submits forms, Esc closes overlays, shortcuts documented |
| **Form-library agnostic**         | Every input works controlled (`value` / `onChange`) and forwards `ref`, so React Hook Form and Formik both work            |
| **One date format**               | Set once in `MgsProvider`; every date component uses it; no per-screen formats                                             |
| **Numbers and currency**          | Formatting from the provider locale (`Intl.NumberFormat`); `NumberInput` and `Table` cells use it                          |
| **Large data**                    | `Table`, `Select` and `TreeSelect` handle thousands of rows or options (virtualization, async search)                      |
| **Server-driven data**            | Sorting, filtering, pagination and option search can be controlled by the app, so the server can do the work               |
| **Status colours**                | One semantic set (success, warning, danger, info, neutral) used by `Tag`, `Badge`, `Alert`, `Toast`                        |
| **Empty, loading, error**         | Every data component has a defined look for all three states                                                               |
| **Stable across RSuite upgrades** | Upgrade RSuite in the library only; the test suite must pass before release                                                |

---

## 7. Releases and delivery

| Step                  | When           | What                                                                                                |
| --------------------- | -------------- | --------------------------------------------------------------------------------------------------- |
| Publishing setup      | Phase 0        | GitHub Packages (`@mgs` scope, private), `publishConfig` in `package.json`, a release GitHub Action |
| First release `0.2.0` | End of phase 2 | `changeset version` + `changeset publish`; CHANGELOG.md starts                                      |
| `0.x` releases        | Every phase    | Breaking changes allowed as minor releases, always with a migration table                           |
| `1.0.0`               | End of phase 5 | Criteria: phases 0–5 done, used in production by at least one app, no known accessibility blockers  |
| After `1.0.0`         | —              | Strict SemVer; deprecate before removing (ARCHITECTURE.md → Versioning)                             |

Storybook is built in CI; host it (GitHub Pages or an internal server) from phase 2 so app teams can use it.

---

## 8. Adoption

| Step              | When             | What                                                                                     |
| ----------------- | ---------------- | ---------------------------------------------------------------------------------------- |
| Pilot             | After phase 2    | One app on RSuite 6 installs `@mgs/ui` and uses it for new screens and one migrated form |
| Feedback loop     | During the pilot | Issues and missing props go through proposals, not quick additions                       |
| Migration guides  | Each component   | The changeset's migration table (RSuite prop → MGS prop) is the guide                    |
| Wider rollout     | After phase 3    | Other RSuite 6 apps; new projects start on `@mgs/ui` from day one                        |
| RSuite 5 apps     | When planned     | Must upgrade to RSuite 6 before adopting                                                 |
| Lint rule in apps | With adoption    | Block direct `rsuite` / `@rsuite/icons` imports in apps (`no-restricted-imports`)        |

---

## 9. Risks

| Risk                                         | Impact                             | Mitigation                                                                                           |
| -------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `Table` is much larger than other components | Phase 3 slips                      | Column-definition API decided first; split into PRs; must-haves only for the first release           |
| RSuite accessibility gaps                    | Components fail AA                 | Fix in the wrapper or bridge; if not fixable, ⚠️ in docs + pinning test; consider building that part |
| An RSuite prop is needed that MGS hid        | Apps blocked                       | Proposal to add it as an MGS prop (minor release); never pass RSuite props through                   |
| RSuite major upgrade (7)                     | Internal rework                    | Only wrappers and the bridge change; behaviour tests prove apps are unaffected                       |
| Scope creep                                  | Library grows big and inconsistent | Every prop classified and approved; "later" list; one-app-only needs stay in the app                 |
| Merged components are too clever             | Hard to learn                      | Prefer two simple components (`Select`, `MultiSelect`) over one with many modes                      |
| Adoption stalls                              | Library unused                     | Pilot early (after phase 2), hosted Storybook, migration tables, block direct RSuite imports         |

---

## 10. Open decisions

Each needs an answer before the phase that uses it starts.

| #   | Decision                                                        | Needed by | Recommendation                                                                                                                                                         |
| --- | --------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Default date format                                             | Phase 0   | **Decided:** the locale sets the format; default `en-GB` = `dd/MM/yyyy`, 24 h. No separate date format prop                                                            |
| 2   | Default density: keep `md`, or make ERP screens compact         | Phase 0   | **Decided:** keep `md`; no density prop for now                                                                                                                        |
| 3   | `MgsLocale` shape: ready-made locale objects or a language code | Phase 0   | **Decided:** a language code (`'en-GB' \| 'en-US'`), mapped internally to RSuite locales                                                                               |
| 4   | `Select` + `MultiSelect`, or one `Select` with `multiple`       | Phase 1   | Two components: simpler types (`string` vs `string[]`) and docs                                                                                                        |
| 5   | `FormLayout`: needed, or is `Stack` / `Grid` enough             | Phase 1   | Decide in the `FormField` proposal                                                                                                                                     |
| 6   | `Table` API: column definitions (data) or children (`<Column>`) | Phase 3   | Column definitions                                                                                                                                                     |
| 7   | Registry: GitHub Packages or another private registry           | Phase 0   | **Decided:** GitHub Packages under a GitHub organization named `mgs` (the scope must match the owner), keeping the name `@mgs/ui`; the repo moves to that organization |
| 8   | Storybook hosting                                               | Phase 2   | GitHub Pages (private) or an internal server                                                                                                                           |

---

## 11. Tracking checklist

Tick items as they merge into `dev`.

**Phase 0: foundation**

- [x] `MgsProvider`
- [x] `MgsIconProps` for icons
- [x] `VisuallyHidden`
- [x] Density and date format decided (density: keep `md`; date format from the locale, default `en-GB`)
- [ ] Publishing setup

**Phase 1: form inputs**

- [ ] Shared internals
- [x] `Input`, `Textarea`, `PasswordInput`
- [ ] `InputGroup`
- [ ] `NumberInput`
- [ ] `Checkbox`, `CheckboxGroup`
- [ ] `Radio`, `RadioGroup`
- [ ] `Switch`
- [ ] `Select`
- [ ] `MultiSelect`
- [ ] `AutoComplete`
- [ ] `ButtonGroup`, `Stack`
- [ ] `FormField` pattern
- [ ] ERP form example story

**Phase 2: date and time**

- [ ] `DatePicker`, `DateInput`
- [ ] `DateRangePicker`, `DateRangeInput`
- [ ] `TimePicker`, `TimeRangePicker`
- [ ] `Calendar`
- [ ] Date helpers replaced
- [ ] First release published; pilot started

**Phase 3: data display**

- [ ] `Table`
- [ ] `Pagination`
- [ ] `Tag`
- [ ] `Badge`, `Avatar`, `AvatarGroup`
- [ ] `Stat`
- [ ] `Spinner`, `Skeleton`, `Progress`
- [ ] `EmptyState` pattern
- [ ] Pending re-export list deleted from `scripts/check-public-api.mjs`

**Phase 4: overlays and feedback**

- [ ] `Dialog`
- [ ] `Drawer`
- [ ] `Tooltip`, `Popover`
- [ ] `Menu`
- [ ] `Alert`
- [ ] `Toast`
- [ ] `ConfirmDialog` pattern

**Phase 5: navigation and layout**

- [ ] `Tabs`, `Breadcrumb`, `Steps`
- [ ] `SideNav`, `TopNav`
- [ ] `Grid`, `Card`, `Accordion`, `Divider`
- [ ] `Text`, `Heading`, `Link`, `List`
- [ ] `AppShell`, `Toolbar`, `PageHeader` patterns
- [ ] `1.0.0` released

**Phase 6: advanced**

- [ ] `TreeSelect`
- [ ] `Tree`
- [ ] `Cascader`
- [ ] `FileUpload`
- [ ] `TagInput`
- [ ] `InlineEdit`
- [ ] `Timeline`
- [ ] `Slider`
- [ ] `SegmentedControl`
- [ ] `MaskedInput`
- [ ] `PinInput`

**Quality follow-ups** (from the phase 0 review, 2026-09-28)

- [x] Consumer smoke test in CI (`npm run test:consumer`): strict TypeScript app, typecheck and build
- [x] Dark theme inherits brand tokens from `:root` (app overrides work in every theme)
- [x] Button spinner contrast in every theme and variant
- [x] Reduced motion (`src/styles/motion.scss`)
- [x] Icon styles ship in `styles.css`; no runtime `<style>` tag (CSP-safe)
- [ ] Remove the known-RSuite-errors allowance in `scripts/consumer-smoke-test.mjs` once the re-exports are migrated
- [ ] Bundle size budget in CI (today: about 35 KB gzipped of RSuite locales with `MgsProvider`, 60 KB gzipped CSS)
- [ ] Axe in a real browser, in all three themes, for every story (jsdom can't check contrast or hover and pressed
      states)
- [ ] Report to RSuite: its published types reference `Chai` and `NodeJS` without shipping them
