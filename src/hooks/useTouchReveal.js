import { useEffect } from 'react'
import { cursorStore } from './useCursorStore'

/**
 * The touch stand-in for the flashlight cursor on the loader.
 *
 * Touch has no hover, so on a phone the mask in TextReveal never opened and
 * D1ECAST sat permanently hidden behind SAHIL with nothing to suggest it was
 * there. This drives the same mask from a synthetic light instead: it writes
 * the very fields Cursor.jsx would have written, so TextReveal cannot tell the
 * difference and needed no changes to read from it.
 *
 * The light is autonomous. It opens on its own, wanders the word so the second
 * layer is visible without anyone having to discover a gesture, and a few
 * seconds later evaporates back to a clean SAHIL. A finger reopens it and takes
 * it over for as long as it is held.
 *
 * Cursor.jsx returns early on touch, so nothing else writes this store here.
 */

// How long the light lingers after the last touch (and after first opening)
// before it starts to go. Long enough to read the word, short enough that the
// loader settles rather than churning.
const DWELL_MS = 5000

// Transition durations. Dissolving is much slower than opening — the fade back
// is the part meant to be watched.
const OPEN_MS = 900
const DISSOLVE_MS = 2200

// Idle drift, as two sine periods with no common multiple short enough to
// notice, so the path never visibly repeats while a loader is on screen.
const DRIFT_X_MS = 7300
const DRIFT_Y_MS = 11700

// How much of the box the drift covers, as a fraction from the centre. Kept
// under 1 so the light stays over the letters instead of wandering off them.
const DRIFT_SPAN = 0.34

// Follow rates. Idle is floaty; under a finger the light tracks tightly, since
// a laggy hole feels broken rather than atmospheric.
const LERP_IDLE = 0.045
const LERP_TOUCH = 0.3

// Hole radius, derived from the rendered box: the desktop's fixed 120px is
// tuned for a monitor and would swallow the whole word at phone type sizes.
const R_MIN = 70
const R_MAX = 120
const R_SCALE = 0.55

// How far the hole swells as it dies. Mist disperses outward as it thins, so
// the radius grows on the way out rather than contracting.
const SPREAD = 0.35

// Peak opacity of the cloud layer, reached mid-transition.
const MIST_PEAK = 0.5

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

export default function useTouchReveal({ containerRef, enabled }) {
  useEffect(() => {
    const container = containerRef.current
    if (!enabled || !container) return
    // A light that drifts and pulses on its own is exactly the ambient motion
    // reduced-motion asks us to drop.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = null
    let x = null      // current hole position, local to the container
    let y = null
    let light = 0     // 0 sealed, 1 fully open — everything else derives from this
    let holding = false
    let touch = null  // viewport coords of the finger, while held
    let lastAwake = performance.now()
    let prev = performance.now()

    const wake = () => { lastAwake = performance.now() }

    const onStart = (e) => {
      holding = true
      const t = e.touches[0]
      touch = { x: t.clientX, y: t.clientY }
      wake()
    }
    const onMove = (e) => {
      if (!holding) return
      const t = e.touches[0]
      touch = { x: t.clientX, y: t.clientY }
      wake()
    }
    const onEnd = () => {
      // No easing special case on release: the target simply reverts to the
      // drift point and the same lerp carries the light back to it.
      holding = false
      touch = null
      wake()
    }

    container.addEventListener('touchstart', onStart, { passive: true })
    container.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onEnd, { passive: true })
    window.addEventListener('touchcancel', onEnd, { passive: true })

    const tick = (now) => {
      const dt = Math.min(now - prev, 64)   // a backgrounded tab can hand us a huge gap
      prev = now
      const rect = container.getBoundingClientRect()

      // Drive `light` toward its target at a rate that depends on which way it
      // is going. Moving a value rather than replaying a timeline from a phase
      // start means a touch mid-dissolve reopens from wherever it had got to,
      // with no jump.
      const awake = holding || now - lastAwake < DWELL_MS
      const span = dt / (awake ? OPEN_MS : DISSOLVE_MS)
      light = awake ? Math.min(1, light + span) : Math.max(0, light - span)

      // Idle target: a Lissajous path over the box.
      const dx = Math.sin((now / DRIFT_X_MS) * Math.PI * 2) * rect.width * DRIFT_SPAN
      const dy = Math.cos((now / DRIFT_Y_MS) * Math.PI * 2) * rect.height * DRIFT_SPAN
      let tx = rect.width / 2 + dx
      let ty = rect.height / 2 + dy
      if (holding && touch) {
        tx = touch.x - rect.left
        ty = touch.y - rect.top
      }

      // First frame starts on target, so the light fades up in place instead of
      // flying in from the origin.
      if (x === null) { x = tx; y = ty }
      const k = holding ? LERP_TOUCH : LERP_IDLE
      x += (tx - x) * k
      y += (ty - y) * k

      cursorStore.x = rect.left + x
      cursorStore.y = rect.top + y

      if (light < 0.01) {
        // Fully sealed. TextReveal drops the mask entirely below r = 1, which
        // is what leaves a clean SAHIL with no gradient still being composited.
        cursorStore.radius = 0
        cursorStore.coreAlpha = 1
        cursorStore.mist = 0
      } else {
        const r = clamp(rect.height * R_SCALE, R_MIN, R_MAX)
        // The three that make it read as mist rather than an iris: the hole
        // swells, its centre thins toward opaque, and the flat core shrinks so
        // the ramp to the edge grows ever longer and softer.
        cursorStore.radius = r * (1 + SPREAD * (1 - light))
        cursorStore.coreAlpha = 1 - light
        cursorStore.corePct = 82 * light
        // Peaks halfway through either transition and is absent at both ends —
        // cloud is what the light passes through, not a state it rests in.
        cursorStore.mist = Math.sin(light * Math.PI) * MIST_PEAK
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      container.removeEventListener('touchstart', onStart)
      container.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
      window.removeEventListener('touchcancel', onEnd)
      cursorStore.radius = 0
      cursorStore.mist = 0
      cursorStore.coreAlpha = 0
      cursorStore.corePct = 82
    }
  }, [containerRef, enabled])
}
