/**
 * Singleton cursor store — shared across the whole app without React context.
 * Cursor.jsx writes position + expand state.
 * TextReveal.jsx reads position to drive the mask.
 */

export const cursorStore = {
  x: 0,
  y: 0,
  mouseX: 0,               // actual mouse position — always current, never offset
  mouseY: 0,
  expanded: false,         // true while over the text zone
  radius: 0,               // lerped radius (written by Cursor's RAF)
  loaderActive: false,     // true while FlashCursor is mounted
  flashOn: false,          // true when blob should appear at offset
  listeners: new Set(),
}

export function notifyCursorListeners() {
  cursorStore.listeners.forEach(fn => fn())
}
