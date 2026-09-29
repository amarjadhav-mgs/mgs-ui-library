import { cloneElement, forwardRef, useId, type ReactElement } from 'react';
import { Checkbox } from '../../components/Checkbox';
import { CheckboxGroup } from '../../components/CheckboxGroup';
import { MultiSelect } from '../../components/MultiSelect';
import { RadioGroup } from '../../components/RadioGroup';
import { Select } from '../../components/Select';
import { Switch } from '../../components/Switch';
import { WarningIcon } from '../../icons';
import type { FormFieldProps } from './types';
import './FormField.scss';

type ControlProps = Record<string, unknown>;

/** Ids separated by spaces, without the empty ones; `undefined` when none is left. */
const ids = (...values: unknown[]) =>
  values.filter((value) => typeof value === 'string' && value !== '').join(' ') || undefined;

/**
 * A control with its label, help text and error message, connected for screen readers: the label names the control,
 * the help and the error describe it, and an error marks it invalid. Put one MGS control inside.
 *
 * How the control is connected depends on what it is:
 * - a text field (`Input`, `Textarea`, `NumberInput`, …): a `<label htmlFor>`, as HTML does it;
 * - a `Select` or `MultiSelect`: the label names the field through `aria-labelledby`, and a click on it focuses it;
 * - a `RadioGroup` or `CheckboxGroup`: the label is the group's heading;
 * - a single `Checkbox` or `Switch`: it keeps its own label, and the FormField's label is a heading above it.
 *
 * @example
 * <FormField label="Email" help="We use it for invoices" error={errors.email} required>
 *   <Input type="email" value={email} onChange={setEmail} />
 * </FormField>
 */
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(function FormField(
  { label, children, help, error, required = false, controlId, className, ...rest },
  ref,
) {
  const generatedId = useId();
  const control = children as ReactElement<ControlProps>;
  const id = controlId ?? (control.props.id as string | undefined) ?? `${generatedId}-control`;
  const labelId = `${id}-label`;
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const hasHelp = help !== undefined && help !== null && help !== false && help !== '';
  const hasError = error !== undefined && error !== null && error !== false && error !== '';

  const type = control.type;
  // Has its own label: the FormField's label is a heading above it, and doesn't rename it.
  const selfLabelled = type === Checkbox || type === Switch;
  // Several controls with one heading.
  const group = type === RadioGroup || type === CheckboxGroup;
  // A field that is not a native form control: a <label htmlFor> can't name it.
  const picker = type === Select || type === MultiSelect;

  const describedBy = ids(
    control.props['aria-describedby'],
    hasError ? errorId : undefined,
    hasHelp ? helpId : undefined,
  );

  const controlProps: ControlProps = { 'aria-describedby': describedBy };
  if (!group) controlProps.id = id;
  if (!selfLabelled)
    controlProps['aria-labelledby'] = ids(labelId, control.props['aria-labelledby']);
  // role="group" (CheckboxGroup) has no invalid state: there, each Checkbox can be marked by the app.
  if (hasError && type !== CheckboxGroup) controlProps['aria-invalid'] = true;
  if (required) {
    if (picker) controlProps['aria-required'] = true;
    else if (type !== CheckboxGroup) controlProps.required = true;
  }

  const labelContent = (
    <>
      {label}
      {required && (
        <span className="mgs-form-field__required" aria-hidden="true">
          {' '}
          *
        </span>
      )}
    </>
  );

  return (
    <div
      ref={ref}
      {...rest}
      className={className ? `mgs-form-field ${className}` : 'mgs-form-field'}
      data-invalid={hasError || undefined}
    >
      {selfLabelled || group ? (
        <span id={labelId} className="mgs-form-field__label">
          {labelContent}
        </span>
      ) : (
        // A picker is not labelable, so the browser doesn't focus it on a click on the label: the FormField does.
        // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
        <label
          id={labelId}
          htmlFor={picker ? undefined : id}
          className="mgs-form-field__label"
          onClick={picker ? () => document.getElementById(id)?.focus() : undefined}
        >
          {labelContent}
        </label>
      )}
      {cloneElement(control, controlProps)}
      {hasError && (
        <p id={errorId} className="mgs-form-field__error">
          <WarningIcon />
          <span>{error}</span>
        </p>
      )}
      {hasHelp && (
        <p id={helpId} className="mgs-form-field__help">
          {help}
        </p>
      )}
    </div>
  );
});
