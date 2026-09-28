// Number logic for NumberInput, separate from React so it can be tested on its own.
// Internal: not exported from '@mgs/ui'.

/**
 * Most significant digits a field accepts. JavaScript numbers are exact up to 15 significant digits; beyond that a
 * typed value would be stored as a different number without warning (12345678901234567 → …568).
 */
export const MAX_DIGITS = 15;

/** -0 → 0, so it's never shown as "-0". */
const withoutNegativeZero = (value: number) => (value === 0 ? 0 : value);

/** Keeps a value within `min` and `max`. */
export function clamp(value: number, min = -Infinity, max = Infinity) {
  return Math.min(max, Math.max(min, value));
}

/** How many decimal places a number has: 0.25 → 2, 1.5e-7 → 8. */
export function decimalPlaces(value: number) {
  const [mantissa, exponent = '0'] = String(value).split('e');
  const fraction = mantissa.split('.')[1]?.length ?? 0;
  return Math.max(0, fraction - Number(exponent));
}

/** Moves the decimal point by `places` in the number's text: shift(1.005, 2) → 100.5 exactly. */
function shift(number: number, places: number) {
  const [mantissa, exponent = '0'] = String(number).split('e');
  return Number(`${mantissa}e${Number(exponent) + places}`);
}

/**
 * Rounds to `decimals` places, half away from zero, as money is rounded: 1.005 → 1.01, 2.675 → 2.68, -1.005 → -1.01.
 * It shifts the decimal point in the number's text instead of multiplying (1.005 is stored as 1.00499…, so toFixed and
 * Math.round(x * 100) give 1.00).
 */
export function round(value: number, decimals: number) {
  const rounded = Math.sign(value) * Math.round(shift(Math.abs(value), decimals));
  return withoutNegativeZero(shift(rounded, -decimals));
}

/** Significant digits in typed text: "0012.50" → 4. */
export function significantDigits(text: string) {
  return text.replace(/\D/g, '').replace(/^0+/, '').length;
}

/**
 * Removes what isn't part of the number from pasted text: currency symbols, units, spaces and grouping, including the
 * field's own prefix and suffix. "₹1,234.50" → "1234.50", "12 kg" → "12".
 */
export function cleanPaste(text: string, affixes: string[] = []) {
  let cleaned = text;
  for (const affix of affixes) if (affix) cleaned = cleaned.split(affix).join('');
  return cleaned.replace(/[^\d.-]/g, '');
}

/**
 * Reads what the user typed. Grouping separators (commas, spaces) are removed, so "1,234.50" works.
 * - `accepted: false`: not a number (letters, two decimal points, more than `maxDigits` digits); the field keeps its
 *   text.
 * - `value: null`: empty, or no digits yet ("-", "."): the field shows the text, and the value is empty.
 * - otherwise `value` is the number ("12." → 12).
 */
export function parseDraft(
  text: string,
  { allowDecimals = true, allowNegative = true, maxDigits = MAX_DIGITS } = {},
) {
  const cleaned = text.replace(/[,\s]/g, '');
  const pattern = new RegExp(
    `^${allowNegative ? '-?' : ''}\\d*${allowDecimals ? '(\\.\\d*)?' : ''}$`,
  );
  if (!pattern.test(cleaned) || significantDigits(cleaned) > maxDigits) {
    return { accepted: false as const };
  }
  if (!/\d/.test(cleaned)) return { accepted: true as const, text: cleaned, value: null };
  return { accepted: true as const, text: cleaned, value: withoutNegativeZero(Number(cleaned)) };
}

/**
 * The editable text for a value while the field is focused: no grouping, never exponent notation (1e21, 1e-7), and
 * `decimals` places if set.
 */
export function toDraft(value: number | null, decimals?: number) {
  if (value === null) return '';
  return new Intl.NumberFormat('en-US', {
    useGrouping: false,
    minimumFractionDigits: decimals ?? 0,
    maximumFractionDigits: decimals ?? 20,
  }).format(withoutNegativeZero(value));
}

/** The display text while the field isn't focused, formatted for the locale ("54,999.00", "12,34,567"). */
export function formatNumber(
  value: number | null,
  { locale, decimals, grouping }: { locale: string; decimals?: number; grouping: boolean },
) {
  if (value === null) return '';
  return new Intl.NumberFormat(locale, {
    useGrouping: grouping,
    minimumFractionDigits: decimals ?? 0,
    maximumFractionDigits: decimals ?? 20,
  }).format(withoutNegativeZero(value));
}
