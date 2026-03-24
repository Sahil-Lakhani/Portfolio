# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR on localhost:5173)
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

## Stack

- **React 19** + **Vite 8** (no TypeScript, plain JSX)
- No routing library — single-page app
- No CSS framework — vanilla CSS with native nesting and CSS variables
- No UI component library

## Architecture

This is a minimal React/Vite starter currently structured as a single component. Key points:

- `src/main.jsx` — entry point, mounts `<App>` to `#root`
- `src/App.jsx` — entire app lives here; one functional component with local state
- `src/index.css` — global CSS variables for theming (colors, shadows), light/dark mode via `prefers-color-scheme`, responsive breakpoint at 1024px
- `src/App.css` — component-scoped styles using native CSS nesting
- `public/icons.svg` — SVG sprite used for doc/social icons; reference with `<use href="/icons.svg#icon-name">`
- `src/assets/` — static images (hero.png, logos)

## ESLint Config

Uses flat config (`eslint.config.js`). The `no-unused-vars` rule ignores variables matching `^[A-Z_]` (uppercase or underscore-prefixed).
