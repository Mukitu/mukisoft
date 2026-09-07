/**
 * Portrait framing controls shared by admin forms that let editors crop
 * how a person's portrait is positioned inside its card.
 *
 * Used by:
 *   - leadership-manager (founder portrait)
 *   - team-manager (team-member portraits)
 *
 * Values are CSS `object-position` strings, intentionally restricted to a
 * 3×3 grid so admins make a deliberate choice rather than typing free-form
 * offsets. `DEFAULT_IMAGE_FOCUS` is the value seeded for new rows.
 */
export const IMAGE_FOCUS_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'top left', label: 'Top left' },
  { value: 'top', label: 'Top' },
  { value: 'top right', label: 'Top right' },
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
  { value: 'bottom left', label: 'Bottom left' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'bottom right', label: 'Bottom right' },
];

export const DEFAULT_IMAGE_FOCUS = 'center top';

const FOCUS_SET = new Set(IMAGE_FOCUS_OPTIONS.map((o) => o.value));

/** Returns `value` if it is a known focus, otherwise `DEFAULT_IMAGE_FOCUS`. */
export function coerceImageFocus(value: string | null | undefined): string {
  return value && FOCUS_SET.has(value) ? value : DEFAULT_IMAGE_FOCUS;
}
