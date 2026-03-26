# Flashlight Cursor — Loader Screen

## Overview

Replace the blob cursor on the loader screen with a `FlashLight.svg` icon. When the user clicks mouse button 1, the blob cursor appears at a left offset from the actual mouse position and drives the `TextReveal` mask exactly as it does today. A second click hides the blob again.

## Behaviour

| State | FlashLight SVG | Blob cursor | TextReveal |
|---|---|---|---|
| Default (loader active) | Follows mouse at 52px | Hidden | No reveal (radius = 0 since blob hidden) |
| After click 1 | Follows mouse at 52px | Visible at `(mouseX − 80px, mouseY − 40px)` | Driven by blob position |
| After click 2 | Follows mouse at 52px | Hidden | No reveal |

- The toggle resets when the loader exits (ENTER pressed / `FlashCursor` unmounts).
- This effect is **loader screen only**. Once `loaded = true`, normal `Cursor` blob behaviour resumes.

## Components

### `src/hooks/useCursorStore.js` (modified)

Add two flags to `cursorStore`:

```js
loaderActive: false   // true while FlashCursor is mounted
flashOn: false        // toggled by click inside FlashCursor
```

These are plain mutable fields on the store object, consistent with the existing pattern (`x`, `y`, `radius`, `expanded`).

### `src/components/Cursor.jsx` (modified — minimal)

Two targeted changes inside the existing `useEffect`:

1. **`onMove`** — when `cursorStore.loaderActive && cursorStore.flashOn`, position the blob element at `(e.clientX − 80, e.clientY − 40)` and update `cursorStore.x/y` to those offset values so `TextReveal` reads the offset position. Otherwise behave exactly as today.

2. **`tick` RAF** — set `el.style.opacity` to `'0'` when `cursorStore.loaderActive && !cursorStore.flashOn`, else `'1'`. All other tick logic (radius lerp, `notifyCursorListeners`) is unchanged.

### `src/components/FlashCursor.jsx` (new)

Responsibilities:
- On mount: `cursorStore.loaderActive = true; cursorStore.flashOn = false`
- On unmount: `cursorStore.loaderActive = false; cursorStore.flashOn = false`
- Own `mousemove` listener: positions the SVG `div` at actual `(e.clientX, e.clientY)`
- Own `click` listener: toggles `cursorStore.flashOn`; calls `notifyCursorListeners()`
- Renders one `div` (`position: fixed`, `pointer-events: none`, `z-index: 9998`) containing `FlashLight.svg` at 52×104px, translated `(-50%, 0)` so the **beam tip (top-centre)** is the hotspot
- No framer-motion dependency — plain DOM positioning for performance parity with `Cursor.jsx`

### `src/components/Loader.jsx` (modified)

Import and render `<FlashCursor />` inside the loader's root `div`. No other changes.

### `src/components/TextReveal.jsx` (unchanged)

Reads `cursorStore.x`, `cursorStore.y`, `cursorStore.radius` as today. When `flashOn` is true, `Cursor.jsx` will have already written the offset coordinates into `cursorStore.x/y`, so `TextReveal` gets the correct position with zero changes.

## Offset values

- Horizontal: `−80px` (left)
- Vertical: `−40px` (up)

These can be adjusted as constants in `FlashCursor.jsx` after seeing it in the browser.

## SVG asset

`src/assets/FlashLight.svg` — existing file, CC0 licence. Used as an `<img>` or inline SVG inside `FlashCursor`. Already coloured `#ff3c00`.

## Out of scope

- No changes to scroll/keyboard enter behaviour added in the previous session
- No changes to the main-site cursor after loader exits
- No touch/mobile flashlight support (loader is desktop-focused)
