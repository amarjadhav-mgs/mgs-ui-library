export type ClassValue = string | false | null | undefined;

/** Joins truthy class names: `cx('a', cond && 'b', undefined)` → `'a b'`. */
export function cx(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}
