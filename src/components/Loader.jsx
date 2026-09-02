import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Loader.module.css'
import TextReveal from './TextReveal'
import FlashCursor from './FlashCursor'
import { isTouchDevice } from '../utils/isTouchDevice'

// Animated loading dots — cycles . → .. → ... → repeat
function LoadingDots() {
  const [count, setCount] = useState(1)
  useEffect(() => {
    const t = setInterval(() => setCount(c => (c % 3) + 1), 420)
    return () => clearInterval(t)
  }, [])
  return <span className={styles.dots}>{'.'.repeat(count)}</span>
}

export default function Loader({ onEnter }) {
  // 'loading' → 'reveal' → 'ready'
  const [phase, setPhase] = useState('loading')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('reveal'), 1800)
    const t2 = setTimeout(() => setPhase('ready'),  2500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  useEffect(() => {
    if (phase !== 'ready') return
    const onKey = (e) => { if (e.key === 'Enter' || e.key === ' ') onEnter() }
    const onWheel = (e) => { if (e.deltaY > 0) onEnter() }
    window.addEventListener('keydown', onKey)
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('wheel', onWheel)
    }
  }, [phase, onEnter])

  const showName = phase === 'reveal' || phase === 'ready'
  const touch = isTouchDevice()

  return (
    <div className={styles.loader}>
      {!touch && <FlashCursor />}

      {/* — LOADING phase — */}
      <AnimatePresence>
        {phase === 'loading' && (
          <motion.div
            key="loading"
            className={styles.loadingText}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
            exit={{ opacity: 0, y: -12, transition: { duration: 0.3 } }}
          >
            LOADING<LoadingDots />
          </motion.div>
        )}
      </AnimatePresence>

      {/* — NAME reveal — */}
      <AnimatePresence>
        {showName && (
          <motion.div
            key="name"
            className={styles.nameWrap}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0 }}
          >
            <TextReveal />
          </motion.div>
        )}
      </AnimatePresence>

      {/* — ENTER button — */}
      <AnimatePresence>
        {phase === 'ready' && (
          <motion.button
            key="enter"
            className={styles.enterBtn}
            onClick={onEnter}
            data-cursor-ignore
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.5 } }}
            exit={{ opacity: 0 }}
          >
            ENTER
          </motion.button>
        )}
      </AnimatePresence>

      {/* — FLASHLIGHT HINT — */}
      <AnimatePresence>
        {phase === 'ready' && !touch && (
          <motion.p
            key="flash-hint"
            className={styles.flashHint}
            data-text="click to turn on the flashlight — search the other side"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 1.2, duration: 0.6 } }}
            exit={{ opacity: 0 }}
          >
            click to turn on the flashlight — search the other side
          </motion.p>
        )}
      </AnimatePresence>

    </div>
  )
}
