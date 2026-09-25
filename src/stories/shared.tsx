// Helpers shared by the date/time stories (story-only; excluded from the library build).
import { useId, type CSSProperties, type ReactNode } from 'react';

export const row: CSSProperties = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  flexWrap: 'wrap',
};
export const column: CSSProperties = { display: 'grid', gap: 16, maxWidth: 360 };
export const labelStyle: CSSProperties = { display: 'block', marginBottom: 4, fontSize: 14 };

/** A fixed date so examples and tests always show the same month. */
export const EXAMPLE_DATE = new Date(2026, 8, 24, 10, 30);

/** Short, copyable snippet for "Show code" instead of the full story source. */
export function source(code: string) {
  return { docs: { source: { code, language: 'tsx' } } };
}

/** A visible label connected to the control through `htmlFor` / `id`. */
export function Field({ label, children }: { label: string; children: (id: string) => ReactNode }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} style={labelStyle}>
        {label}
      </label>
      {children(id)}
    </div>
  );
}
