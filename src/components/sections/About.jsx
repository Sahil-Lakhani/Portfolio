import { motion } from 'framer-motion'
import styles from './About.module.css'

const BIO = 'I build the systems that other engineers rely on. Fast, fault-tolerant, boring in the best possible way. Six years of distributed systems, infrastructure, and backend work across startups and scale-ups.'

const STATS = [
  { num: '6+',   label: 'YEARS EXP' },
  { num: '12',   label: 'PROJECTS SHIPPED' },
  { num: '0',    label: 'P0 INCIDENTS' },
  { num: '2.4K', label: 'OSS STARS' },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.15, staggerChildren: 0.04 } },
}

const wordVariants = {
  hidden:  { y: '100%', transition: { duration: 0 } },
  visible: { y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

export default function About({ isActive }) {
  const anim = isActive ? 'visible' : 'hidden'
  const words = BIO.split(' ')

  return (
    <section
      className={styles.section}
      style={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? 'all' : 'none' }}
    >
      {/* Section label */}
      <motion.p
        className={styles.label}
        initial="hidden"
        animate={anim}
        variants={{
          hidden:  { opacity: 0, y: 10 },
          visible: { opacity: 1, y: 0, transition: { delay: 0.1 } },
        }}
      >
        002 — ABOUT
      </motion.p>

      {/* Bio text — word-by-word stagger */}
      <motion.div
        className={styles.aboutText}
        variants={containerVariants}
        initial="hidden"
        animate={anim}
      >
        {words.map((word, i) => (
          <motion.span key={i} className={styles.word}>
            <motion.span variants={wordVariants}>{word}</motion.span>
          </motion.span>
        ))}
      </motion.div>

      {/* Stats row */}
      <motion.div
        className={styles.statRow}
        initial="hidden"
        animate={anim}
        variants={{
          hidden:  { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { delay: 0.8 } },
        }}
      >
        {STATS.map(({ num, label }) => (
          <div key={label}>
            <div className={styles.statNum}>{num}</div>
            <div className={styles.statLabel}>{label}</div>
          </div>
        ))}
      </motion.div>

      {/* Faded section number */}
      <motion.div
        className={styles.big02}
        initial="hidden"
        animate={anim}
        variants={{
          hidden:  { opacity: 0 },
          visible: { opacity: 1, transition: { delay: 1 } },
        }}
      >
        02
      </motion.div>
    </section>
  )
}
