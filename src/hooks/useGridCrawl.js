import { useEffect } from 'react'

/**
 * Walks a single crawler across a grid of tiles, lighting each one it steps
 * onto. Touch devices have no hover, so this is what stands in for a cursor
 * sweep on a phone or tablet.
 *
 * The lighting itself is still pure CSS. The crawler only adds `litClass` to
 * the tile it lands on and strips it again on its next step — removing the
 * class hands the tile back to the base rule's one-second fade, so a trail of
 * cooling squares follows the walker exactly the way it follows a cursor.
 * That is also why this reaches for classList on the DOM nodes rather than
 * React state: re-rendering several hundred spans to move one of them would
 * cost more than the whole effect is worth.
 *
 * @param {object}  o
 * @param {object}  o.ref       ref to the grid element; its children are tiles
 * @param {number}  o.cols      tiles per row — also the row-major stride
 * @param {number}  o.rows      tile rows
 * @param {boolean} o.enabled   false stops the loop and clears every lit tile
 * @param {string}  o.litClass  class carrying the lit box-shadow
 */

// One step per this many ms. Slow enough to read as a line being drawn rather
// than something darting about.
const STEP_MS = 260

// How many tiles carry light at once — the lit one plus the tail cooling
// behind it. Tile N steps back is still visible while N * STEP_MS is under the
// fade duration, so the fade is derived from these two rather than written out
// separately in the stylesheet, where it would silently drift out of step the
// first time either number changed.
//
// The half-step lands the fade midway between the durations that would give a
// tile more or fewer than TRAIL_TILES, so rounding can't tip the count either
// way. The stylesheet reads it as --crawl-fade; its 1s fallback is the hover
// path on desktop, which never sets the property.
const TRAIL_TILES = 5
const FADE_MS = Math.round(STEP_MS * (TRAIL_TILES - 0.5))

// Odds a crawler turns instead of carrying straight on. Low, because a walker
// that re-rolls its direction every step reads as jitter rather than a path.
const TURN_CHANCE = 0.25

// Steps before a crawler gives up its position and respawns elsewhere, picked
// per crawler from this range. Without it a walker can spend a long stretch
// worrying at one corner while the rest of the grid sits dark.
const LIFE_MIN = 40
const LIFE_MAX = 90

// One crawler, at every grid size. Two or more read as clutter rather than as
// a single line being traced across the grid.
const WALKERS = 1

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]]

const randInt = (n) => Math.floor(Math.random() * n)
const pick = (arr) => arr[randInt(arr.length)]

function spawn(cols, rows) {
  return {
    col: randInt(cols),
    row: randInt(rows),
    dir: pick(DIRS),
    life: LIFE_MIN + randInt(LIFE_MAX - LIFE_MIN),
    prev: null,
  }
}

function advance(w, cols, rows) {
  if (--w.life <= 0) {
    const fresh = spawn(cols, rows)
    w.col = fresh.col
    w.row = fresh.row
    w.dir = fresh.dir
    w.life = fresh.life
    return
  }

  const inside = ([dc, dr]) => {
    const c = w.col + dc
    const r = w.row + dr
    return c >= 0 && c < cols && r >= 0 && r < rows
  }

  const [dc, dr] = w.dir
  if (Math.random() > TURN_CHANCE && inside(w.dir)) {
    w.col += dc
    w.row += dr
    return
  }

  // Turning, or the grid edge is straight ahead. Reversing is excluded so the
  // crawler never doubles back over its own still-lit trail; the unfiltered
  // list is the fallback for a grid too small to offer anything else.
  const open = DIRS.filter(inside)
  const forward = open.filter(([c, r]) => !(c === -dc && r === -dr))
  w.dir = pick(forward.length ? forward : open.length ? open : DIRS)
  w.col += w.dir[0]
  w.row += w.dir[1]
}

export default function useGridCrawl({ ref, cols, rows, enabled, litClass }) {
  useEffect(() => {
    const el = ref.current
    // Under two tiles on a side there is no room to walk, and a crawling light
    // is exactly the kind of ambient motion reduced-motion asks us to drop.
    if (!enabled || !el || cols < 2 || rows < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const walkers = Array.from({ length: WALKERS }, () => spawn(cols, rows))
    el.style.setProperty('--crawl-fade', `${FADE_MS}ms`)

    const step = () => {
      for (const w of walkers) {
        // Unlight first: this is the moment the tile the crawler is leaving
        // starts its one-second cool-down.
        if (w.prev) w.prev.classList.remove(litClass)
        advance(w, cols, rows)
        const tile = el.children[w.row * cols + w.col]
        if (tile) tile.classList.add(litClass)
        w.prev = tile ?? null
      }
    }

    // Sweep every child rather than just the walker's last tile: stopping can
    // land mid-step, and a tile left lit would sit at full brightness with no
    // crawler around to release it.
    const clear = () => {
      for (const tile of el.children) tile.classList.remove(litClass)
      for (const w of walkers) w.prev = null
    }

    let timer = null
    const start = () => {
      if (timer === null) timer = window.setInterval(step, STEP_MS)
    }
    const stop = () => {
      if (timer === null) return
      window.clearInterval(timer)
      timer = null
      clear()
    }

    // A hidden tab throttles timers to something like once a minute, so the
    // loop stands down entirely rather than limping. Stopping clears the trail
    // too, otherwise the tile under the crawler would still be lit whenever
    // the user came back to the tab.
    const onVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVisibility)
    if (!document.hidden) start()

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      stop()
      clear()
      el.style.removeProperty('--crawl-fade')
    }
  }, [ref, cols, rows, enabled, litClass])
}
