import { forwardRef, useId, type ChangeEvent } from 'react';
import { useDevWarning } from '../../internal/devWarning';
import { useRadioGroup } from '../RadioGroup/context';
import type { RadioCardProps } from './types';
import './RadioCard.scss';

const isContent = (node: unknown) =>
  node !== undefined && node !== null && node !== false && node !== '';

/**
 * One option of a `RadioGroup`, shown as a card: a title, with an optional description and icon. The whole card can be
 * clicked. Like `Radio`, it must be inside a `RadioGroup`, which holds the value.
 *
 * Built by MGS on a native `<input type="radio">` instead of on RSuite's RadioTile, which shows no focus ring, gives
 * its radios no shared name, and always points `aria-describedby` at a description, also when there is none.
 *
 * `className` and `style` go to the root element (the `<label>`); every other attribute, and `ref`, go to the `<input>`.
 *
 * @example
 * <RadioGroup aria-label="Plan" value={plan} onChange={setPlan}>
 *   <RadioCard value="basic" description="5 users, 10 GB">Basic</RadioCard>
 *   <RadioCard value="team" description="25 users, 100 GB">Team</RadioCard>
 * </RadioGroup>
 */
export const RadioCard = forwardRef<HTMLInputElement, RadioCardProps>(function RadioCard(
  {
    children,
    description,
    icon,
    value,
    disabled: disabledProp = false,
    className,
    style,
    'aria-labelledby': labelledBy,
    'aria-describedby': describedBy,
    ...rest
  },
  ref,
) {
  const group = useRadioGroup();
  const disabled = disabledProp || (group?.disabled ?? false);
  const checked = group !== null && group.value === value;
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const hasTitle = isContent(children);
  const hasDescription = isContent(description);

  useDevWarning(
    group === null,
    'a RadioCard must be inside a RadioGroup: the group holds the value and makes the arrow keys work.',
  );
  // The app names it: an aria-label, aria-labelledby or title, or (with an id) maybe a <label htmlFor> elsewhere.
  const namedByApp =
    rest['aria-label'] !== undefined ||
    labelledBy !== undefined ||
    rest.title !== undefined ||
    rest.id !== undefined;
  useDevWarning(
    !hasTitle && !namedByApp,
    'a RadioCard without a title needs an accessible name: add children, aria-label or aria-labelledby.',
  );
  // Without a title, aria-label or aria-labelledby, the <label> makes the description the name: describing the radio
  // with it too would read it twice.
  const describedByDescription =
    hasDescription && (hasTitle || rest['aria-label'] !== undefined || labelledBy !== undefined);

  return (
    <label
      className={className ? `mgs-radio-card ${className}` : 'mgs-radio-card'}
      style={style}
      data-checked={checked || undefined}
      data-disabled={disabled || undefined}
    >
      <span className="mgs-radio-card__control">
        <input
          ref={ref}
          {...rest}
          type="radio"
          className="mgs-radio-card__input"
          // The title names the radio and the description describes it. Without these, the <label> would make the
          // name "title + description" in one run. An aria-label or aria-labelledby from the app wins.
          aria-labelledby={
            labelledBy ?? (hasTitle && rest['aria-label'] === undefined ? titleId : undefined)
          }
          aria-describedby={
            [describedBy, describedByDescription ? descriptionId : undefined]
              .filter(Boolean)
              .join(' ') || undefined
          }
          name={group?.name}
          value={value}
          disabled={disabled}
          required={group?.required}
          // Outside a group (a mistake, warned about above) it is a plain radio that the browser manages.
          {...(group && {
            checked,
            onChange: (event: ChangeEvent<HTMLInputElement>) => group.select(value, event),
          })}
        />
        <span className="mgs-radio-card__circle" aria-hidden="true" />
      </span>
      {isContent(icon) && (
        <span className="mgs-radio-card__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="mgs-radio-card__label">
        {hasTitle && (
          <span id={titleId} className="mgs-radio-card__title">
            {children}
          </span>
        )}
        {hasDescription && (
          <span id={descriptionId} className="mgs-radio-card__description">
            {description}
          </span>
        )}
      </span>
    </label>
  );
});
