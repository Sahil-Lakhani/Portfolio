import { useRef, useEffect } from 'react'
import { cursorStore } from '../hooks/useCursorStore'

/**
 * TextReveal — mask reveal driven by the global cursor.
 *
 * The global Cursor element expands to a large circle (BIG_R) when it enters
 * this container (via data-cursor-expand). That same lerped radius + position
 * is read from cursorStore each RAF frame to punch a hole in the front layer,
 * exposing the back layer beneath.
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
  const hintRef      = useRef(null)
  const hintGoneRef  = useRef(false)
  const rafRef       = useRef(null)

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
        const grad = `radial-gradient(circle ${r}px at ${lx}px ${ly}px, transparent 0%, transparent 82%, black 100%)`
        frontEl.style.WebkitMaskImage = grad
        frontEl.style.maskImage = grad
      } else {
        frontEl.style.WebkitMaskImage = 'none'
        frontEl.style.maskImage = 'none'
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

      {/* HOVER hint removed */}
    </div>
  )
}
