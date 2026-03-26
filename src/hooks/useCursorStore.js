/**
 * Singleton cursor store — shared across the whole app without React context.
 * Cursor.jsx writes position + expand state.
 * TextReveal.jsx reads position to drive the mask.
 */

export const cursorStore = {
  x: 0,
  y: 0,
  expanded: false,         // true while over the text zone
  radius: 0,               // lerped radius (written by Cursor's RAF)
  listeners: new Set(),
}

export function notifyCursorListeners() {
  cursorStore.listeners.forEach(fn => fn())
}
