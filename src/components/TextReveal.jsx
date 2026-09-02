import { useRef, useEffect, useState } from 'react'
import { cursorStore } from '../hooks/useCursorStore'
import useTouchReveal from '../hooks/useTouchReveal'
import { isTouchDevice } from '../utils/isTouchDevice'

// Fractal noise, inlined as SVG so the cloud layer costs no request. Blurred
// and screened over the word at the midpoint of each transition, it gives the
// dissolve an actual texture — the mask alone thins evenly, which reads as a
// fade rather than as mist.
const CLOUD = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'>` +
    `<filter id='c'><feTurbulence type='fractalNoise' baseFrequency='0.014' numOctaves='4' seed='7'/></filter>` +
    `<rect width='320' height='320' filter='url(#c)'/>` +
  `</svg>`
)}")`

/**
 * TextReveal — mask reveal driven by the global cursor.
 *
 * The global Cursor element expands to a large circle (BIG_R) when it enters
 * this container (via data-cursor-expand). That same lerped radius + position
 * is read from cursorStore each RAF frame to punch a hole in the front layer,
 * exposing the back layer beneath.
 *
 * Touch devices have no cursor to do that, so useTouchReveal writes the same
 * fields from a synthetic light. Everything below reads the store and neither
 * knows nor cares which one is driving it.
 */
export default function TextReveal({
  frontText  = 'SAHIL',
  backText   = 'D1ECAST',
  frontColor = 'var(--white)',   // warm beige — same as --white: #f0ede6
  backColor  = '#111111',        // near-black text inside the orange circle
  backBg     = '#ff5a1f',        // vivid orange matching reference
  frontFont  = "'Bebas Neue', sans-serif",
  backFont   = "'Rajdhani', sans-serif",
}) {
  const containerRef = useRef(null)
  const frontRef     = useRef(null)
  const cloudRef     = useRef(null)
  const hintRef      = useRef(null)
  const hintGoneRef  = useRef(false)
  const rafRef       = useRef(null)
  const [touch]      = useState(isTouchDevice)

  useTouchReveal({ containerRef, enabled: touch })

  useEffect(() => {
    function tick() {
      const container = containerRef.current
      const frontEl   = frontRef.current
      if (!container || !frontEl) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const rect = container.getBoundingClientRect()
      // Convert global cursor pos to local coordinates
      const lx = cursorStore.x - rect.left
      const ly = cursorStore.y - rect.top
      const r  = cursorStore.radius   // already lerped by Cursor's RAF

      if (r > 1) {
        // Dismiss hint on first real interaction
        if (!hintGoneRef.current && hintRef.current) {
          hintGoneRef.current = true
          hintRef.current.style.opacity = '0'
        }
        // coreAlpha is the alpha at the centre of the hole. At 0 this is the
        // original wide-open gradient; as useTouchReveal raises it toward 1 the
        // hole thins from the middle out and the word closes back over itself.
        const a = cursorStore.coreAlpha
        const core = `rgba(0, 0, 0, ${a})`
        const grad = `radial-gradient(circle ${r}px at ${lx}px ${ly}px, ${core} 0%, ${core} ${cursorStore.corePct}%, black 100%)`
        frontEl.style.WebkitMaskImage = grad
        frontEl.style.maskImage = grad
      } else {
        frontEl.style.WebkitMaskImage = 'none'
        frontEl.style.maskImage = 'none'
      }

      if (cloudRef.current) {
        cloudRef.current.style.opacity = cursorStore.mist
        // Drifts with the light rather than sitting still, so the texture
        // belongs to the hole instead of looking like a stain on the screen.
        cloudRef.current.style.transform = `translate(${lx * 0.06}px, ${ly * 0.06}px)`
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const fontSize = 'clamp(80px, 16vw, 220px)'
  const sharedText = {
    fontFamily: frontFont,
    fontSize,
    lineHeight: 0.88,
    userSelect: 'none',
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap',
  }

  return (
    <div
      ref={containerRef}
      // data-cursor-expand — disabled: loader handles expand via syncVisibility
      style={{ position: 'relative', display: 'inline-block', cursor: 'none' }}
    >
      {/* Back layer — alternate text on solid bg, always fully rendered */}
      <div style={{
        ...sharedText,
        fontFamily: backFont,
        color: backColor,
        background: backBg,
        padding: '0 0.12em',
      }}>
        {backText}
      </div>

      {/* Front layer — covers the back with a circular hole at cursor pos */}
      <div
        ref={frontRef}
        style={{
          ...sharedText,
          position: 'absolute',
          inset: 0,
          color: frontColor,
          background: 'var(--black)',
          WebkitMaskImage: 'none',
          maskImage: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {frontText}
      </div>

      {/* Cloud layer — texture for the dissolve. Sits above both layers and
          takes no input; opacity is driven from cursorStore each frame. */}
      <div
        ref={cloudRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '-12%',
          backgroundImage: CLOUD,
          backgroundSize: 'cover',
          filter: 'blur(7px)',
          mixBlendMode: 'screen',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
