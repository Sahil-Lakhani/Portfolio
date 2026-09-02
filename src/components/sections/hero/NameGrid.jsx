import { useEffect, useRef, useState } from 'react'
import styles from './NameGrid.module.css'

/**
 * Faint grid behind the name, whose squares light under the cursor and cool
 * back to dark over about a second.
 *
 * The lighting is pure CSS — see NameGrid.module.css for the asymmetric
 * transition that does it. JavaScript does two things only, both at render
 * time rather than on hover:
 *
 *   1. Counts tiles. A fixed number would waste hundreds of nodes on a phone
 *      or run out of them on a wide monitor, so the layer measures itself.
 *   2. Assigns each tile a hue, held in a CSS custom property. Fixing the hue
 *      per tile rather than re-rolling on entry keeps the hover path free of
 *      JavaScript, and still reads as random because no two neighbours match.
 */

const TILE = 54

// Hue from the tile's index. A hash rather than Math.random because rendering
// has to be pure — a random call here would hand the same tile a new colour
// every time React re-ran the component. Multiply-and-xor scatters adjacent
// indices to far-apart hues, so neighbours never share a colour.
function hueFor(i) {
  let h = Math.imul(i + 1, 2654435761)
  h ^= h >>> 15
  return Math.abs(h) % 360
}

export default function NameGrid() {
  const ref = useRef(null)
  const [{ cols, rows }, setGrid] = useState({ cols: 0, rows: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const measure = () => {
      const { width, height } = el.getBoundingClientRect()
      if (!width || !height) return
      setGrid((prev) => {
        const next = {
          cols: Math.ceil(width / TILE),
          rows: Math.ceil(height / TILE),
        }
        // Bail out when nothing changed: the observer fires on every layout
        // pass, and setting identical state would re-render the whole tile set
        // for no reason.
        return prev.cols === next.cols && prev.rows === next.rows ? prev : next
      })
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const count = cols * rows

  return (
    <div
      ref={ref}
      className={styles.grid}
      aria-hidden="true"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={styles.tile} style={{ '--hue': hueFor(i) }} />
      ))}
    </div>
  )
}
