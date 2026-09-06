import { useEffect, useState } from 'react'
import styles from './GlitchFlash.module.css'

/**
 * Flashes the hidden name over the whole screen for a moment, then vanishes.
 *
 * This is the touch counterpart to FlashCursor. On a phone there is no cursor
 * to sweep TextReveal's mask, so the loader would otherwise show a plain SAHIL
 * with no sign that anything sits behind it. Rather than invent a gesture on a
 * screen most people cross in about three seconds, the reveal happens by
 * itself: SAHIL is the resting state and the glitch is the interruption.
 *
 * All of the motion lives in the stylesheet. Mounting the element is what
 * starts it — conditional rendering restarts the animations each time, where
 * toggling a class on a permanent node would need an explicit reflow to
 * replay them.
 */

// Gap between flashes. Randomised inside this range so it never settles into a
// rhythm — a glitch that arrives on a beat reads as an animation, not a fault.
const GAP_MIN_MS = 3000
const GAP_MAX_MS = 5000

// Total time on screen. The tearing in GlitchFlash.module.css occupies the
// first and last eighth, which leaves a steady hold of roughly a second in the
// middle — long enough to actually read the name rather than just register that
// something happened. Must match the `shutter` duration in that stylesheet.
const FLASH_MS = 1400

export default function GlitchFlash({ text = 'D1ECAST' }) {
  const [on, setOn] = useState(false)

  useEffect(() => {
    // A hard full-screen colour flash on a repeating cycle is exactly what
    // reduced-motion is for. Without it the loader simply stays on SAHIL.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let timer = null
    const schedule = () => {
      timer = setTimeout(() => {
        setOn(true)
        timer = setTimeout(() => {
          setOn(false)
          schedule()
        }, FLASH_MS)
      }, GAP_MIN_MS + Math.random() * (GAP_MAX_MS - GAP_MIN_MS))
    }
    schedule()

    return () => clearTimeout(timer)
  }, [])

  if (!on) return null

  return (
    <div className={styles.flash} aria-hidden="true">
      <span className={styles.word} data-text={text}>{text}</span>
      {/* Absolutely positioned, so it stays out of the grid that centres the
          word rather than becoming a second cell beside it. */}
      <span className={styles.tracking} />
    </div>
  )
}
