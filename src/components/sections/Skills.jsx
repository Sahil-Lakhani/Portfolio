import { useCallback, useState, useSyncExternalStore } from 'react'
import { motion } from 'framer-motion'
import styles from './Skills.module.css'
import SkillsPile from './skills/SkillsPile'
import SkillsList from './skills/SkillsList'
import { STACK } from './skills/stack'

// Tiers and percentages are deliberately absent. A self-assigned "92%" is
// unverifiable and invites scrutiny; pointing at the project a thing actually
// shipped in says more and can be checked against the Projects section.
//
// The section runs as two halves that share one selection: a readable list of
// the real skills, and the pile you can knock over. Wide viewports get both
// side by side; anything narrower gets a toggle, defaulting to the list — a
// recruiter should land on words, and a phone should not start a 42-body
// physics simulation before being asked to.

const ease = [0.16, 1, 0.3, 1]

// The width at which two columns stop being two columns. Matches the closed
// band already used in the stylesheets, so no new breakpoint is introduced.
const TWO_COL = 1200

const labelVariants = (delay) => ({
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease, delay } },
})

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// The media query is the external store here, so React subscribes to it
// rather than mirroring it into state — which also means the first render
// already knows which layout it is in, with no flash of the wrong one.
function useMinWidth(px) {
  const query = `(min-width: ${px}px)`
  const subscribe = useCallback((onChange) => {
    const mq = window.matchMedia(query)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export default function Skills({ isActive }) {
  const anim = isActive ? 'visible' : 'hidden'
  const [selectedId, setSelectedId] = useState(null)
  const [reduced] = useState(prefersReducedMotion)
  const [view, setView] = useState('skills')     // narrow viewports only
  const twoCol = useMinWidth(TWO_COL)

  // Stable identity — SkillsPile rebuilds its engine if this changes.
  const handleSelect = useCallback((id) => setSelectedId(id), [])

  const selected = STACK.find(s => s.id === selectedId) || null
  const showList = twoCol || view === 'skills'
  const showPlay = twoCol || view === 'play'
  const pileVisible = showPlay && !reduced

  const list = (
    <SkillsList isActive={isActive} selectedId={selectedId} onSelect={handleSelect} />
  )

  /* Canvas text is invisible to assistive tech. When the readable list is on
     screen it already covers the labels, so this only exists to fill the gap
     on the narrow "playground" view. */
  const play = reduced ? (
    <ul className={styles.staticList}>
      {STACK.map(item => (
        <li key={item.id} className={styles.staticRow}>
          <button
            type="button"
            className={styles.pillLg}
            aria-pressed={item.id === selectedId}
            onClick={() => setSelectedId(item.id === selectedId ? null : item.id)}
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  ) : (
    <>
      <SkillsPile
        isActive={isActive && showPlay}
        selectedId={selectedId}
        onSelect={handleSelect}
      />
      {!showList && (
        <ul className={styles.srOnly}>
          {STACK.map(item => (
            <li key={item.id}>{item.label} — {item.where} — {item.truth}</li>
          ))}
        </ul>
      )}
    </>
  )

  const reveal = (
    <motion.div
      className={styles.reveal}
      initial="hidden"
      animate={anim}
      variants={labelVariants(0.12)}
      aria-live="polite"
    >
      {selected ? (
        <>
          <p className={styles.truth}>{selected.truth}</p>
          <p className={styles.where}>
            <span className={styles.whereTech}>{selected.label}</span>
            <span className={styles.whereSep}>·</span>
            {selected.where}
          </p>
        </>
      ) : (
        <p className={styles.prompt}>
          {STACK.length} things I&rsquo;ve shipped with, argued with, or quietly
          avoided.<br />
          <span className={styles.promptHint}>
            {reduced
              ? 'the honest version is below.'
              : pileVisible
                ? 'knock the pile over. pick one.'
                : 'tap any of them.'}
          </span>
        </p>
      )}
    </motion.div>
  )

  return (
    <section
      className={styles.section}
      style={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? 'all' : 'none' }}
    >
      <motion.p
        className={styles.secLabel}
        initial="hidden"
        animate={anim}
        variants={labelVariants(0.05)}
      >
        004 — CAPABILITIES
      </motion.p>

      {twoCol ? (
        <div className={styles.cols}>
          <div className={styles.colLeft}>{list}</div>
          <div className={styles.colRight}>
            {reveal}
            {play}
          </div>
        </div>
      ) : (
        <>
          <motion.div
            className={styles.toggle}
            initial="hidden"
            animate={anim}
            variants={labelVariants(0.08)}
          >
            <button
              type="button"
              className={styles.toggleBtn}
              aria-pressed={view === 'skills'}
              onClick={() => setView('skills')}
            >
              SKILLS
            </button>
            <button
              type="button"
              className={styles.toggleBtn}
              aria-pressed={view === 'play'}
              onClick={() => setView('play')}
            >
              PLAYGROUND
            </button>
          </motion.div>

          {reveal}

          <div className={styles.panel}>
            {showList ? list : play}
          </div>
        </>
      )}

      <motion.div
        className={styles.big04}
        initial="hidden"
        animate={anim}
        variants={{
          hidden:  { opacity: 0 },
          visible: { opacity: 1, transition: { delay: 1 } },
        }}
      >
        04
      </motion.div>
    </section>
  )
}
