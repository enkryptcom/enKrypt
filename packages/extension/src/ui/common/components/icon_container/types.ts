export type IconContainerTone =
  'default' | 'info' | 'error' | 'success' | 'warning';

/**
 * Glyph colour per tone. One static string each so the Tailwind scan sees
 * every class.
 */
export const ICON_CONTAINER_TONE_CLASS: Record<IconContainerTone, string> = {
  default: 'text-icon-default',
  info: 'text-text-info',
  error: 'text-icon-error',
  success: 'text-icon-success',
  warning: 'text-icon-warning',
};
