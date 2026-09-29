---
'@mgs/ui': minor
---

Add `FormField`, the first MGS pattern: a control with its label, help text and error message, connected for screen
readers.

**FormField** (type `FormFieldProps`), built by MGS:

- `label`, one control as its child, `help`, `error`, `required` and `controlId`.
- The label names the control, the error and the help describe it (the error first), and an error sets
  `aria-invalid`, which gives the control its error border. The app writes no `id`, `htmlFor` or `aria-*`.
- Works with every MGS control, each connected in the way that fits it: a `<label>` for text fields, a name and a
  click-to-focus for `Select` and `MultiSelect`, a heading for `RadioGroup` and `CheckboxGroup`. A `Checkbox` or
  `Switch` keeps its own label.
- The error is shown with an icon and as text. The help stays while there is an error.
- Validation stays in the app or its form library: `error` is the message to show.

New behaviour of the token `--mgs-color-text-error`: MGS now sets it in every theme (6.5:1 on white, 7.9:1 in dark,
5.3:1 in high contrast). Before, it was RSuite's error colour, which is 3.7:1 in light and 2.9:1 in high contrast.

It replaces RSuite's `Form.Group`, `Form.Control`, `Form.ControlLabel`, `Form.HelpText` and `Form.ErrorMessage`:

| RSuite                                             | MGS                                                  |
| -------------------------------------------------- | ---------------------------------------------------- |
| `<Form.Group controlId="email">`                   | `<FormField label="Email" controlId="email">`        |
| `<Form.ControlLabel>Email</Form.ControlLabel>`     | `label="Email"`                                      |
| `<Form.Control name="email" accepter={Input} />`   | the control itself as the child: `<Input name="email" />` |
| `<Form.HelpText>…</Form.HelpText>`                 | `help="…"`                                           |
| `errorMessage="…"` or `<Form.ErrorMessage>`        | `error="…"`                                          |
| `Schema`, `Form` with `formValue` and `onCheck`    | not available: use React Hook Form, Formik or your own state |
