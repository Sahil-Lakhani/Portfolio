import { motion } from 'framer-motion'
import styles from './Hero.module.css'

const ease = [0.16, 1, 0.3, 1]

export default function Hero({ isActive }) {
  const anim = isActive ? 'visible' : 'hidden'

  return (
    <section
      className={styles.section}
      style={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? 'all' : 'none' }}
    >
      {/* Scan line */}
      <div className={styles.scanLine} />

      {/* Corner text */}
      <motion.div
        className={styles.cornerText}
        initial="hidden"
        animate={anim}
        variants={{
          hidden:  { opacity: 0 },
          visible: { opacity: 1, transition: { delay: 1.2 } },
        }}
      >
        BASED IN BERLIN<br />UTC+1<br />OPEN TO REMOTE
      </motion.div>

      {/* Sub label */}
      <motion.p
        className={styles.sub}
        initial="hidden"
        animate={anim}
        variants={{
          hidden:  { opacity: 0, x: -20 },
          visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.7 } },
        }}
      >
        FULL-STACK ENGINEER &nbsp;·&nbsp; SYSTEMS &nbsp;·&nbsp; DISTRIBUTED
      </motion.p>

      {/* Big name */}
      <div className={styles.bigName}>
        {/* Line 1: SAHIL */}
        <div className={styles.nameLine}>
          <motion.span
            initial="hidden"
            animate={anim}
            variants={{
              hidden:  { y: '110%' },
              visible: { y: 0, transition: { duration: 0.9, ease, delay: 0.05 } },
            }}
          >
            SAHIL
          </motion.span>
        </div>
        {/* Line 2: LAKHANI. */}
        <div className={styles.nameLine}>
          <motion.span
            initial="hidden"
            animate={anim}
            variants={{
              hidden:  { y: '110%' },
              visible: { y: 0, transition: { duration: 0.9, ease, delay: 0.18 } },
            }}
          >
            LAKHANI<span className={styles.redDot}>.</span>
          </motion.span>
        </div>
      </div>

      {/* Available row */}
      <motion.div
        className={styles.available}
        initial="hidden"
        animate={anim}
        variants={{
          hidden:  { opacity: 0 },
          visible: { opacity: 1, transition: { delay: 1 } },
        }}
      >
        <span className={styles.avDot} />
        AVAILABLE FOR NEW ROLES — 2025
      </motion.div>
    </section>
  )
}
