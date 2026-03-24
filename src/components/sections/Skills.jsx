import { motion } from 'framer-motion'
import styles from './Skills.module.css'

const LANGUAGES = [
  { name: 'Rust',       level: 'EXPERT',     pct: 92, delay: 0.1  },
  { name: 'Go',         level: 'EXPERT',     pct: 88, delay: 0.18 },
  { name: 'TypeScript', level: 'PROFICIENT', pct: 82, delay: 0.26 },
  { name: 'Python',     level: 'PROFICIENT', pct: 74, delay: 0.34 },
  { name: 'SQL',        level: 'ADVANCED',   pct: 78, delay: 0.42 },
]

const DOMAINS = [
  { name: 'Distributed Systems',    level: 'CORE',     pct: 94, delay: 0.12 },
  { name: 'Infrastructure / IaC',   level: 'CORE',     pct: 88, delay: 0.2  },
  { name: 'Backend APIs',           level: 'CORE',     pct: 90, delay: 0.28 },
  { name: 'Observability & SRE',    level: 'ADVANCED', pct: 80, delay: 0.36 },
  { name: 'Frontend',               level: 'WORKING',  pct: 58, delay: 0.44 },
]

const TOOLS = ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Postgres', 'Redis', 'Kafka', 'ClickHouse', 'gRPC']

function SkillBar({ name, level, pct, delay, isActive }) {
  return (
    <motion.div
      className={styles.barRow}
      initial="hidden"
      animate={isActive ? 'visible' : 'hidden'}
      variants={{
        hidden:  { opacity: 0, x: -16 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5, delay } },
      }}
    >
      <div className={styles.barLabel}>
        <span>{name}</span>
        <span className={styles.barLevel}>{level}</span>
      </div>
      <div className={styles.barTrack}>
        <motion.div
          className={styles.barFill}
          initial={{ width: '0%' }}
          animate={isActive ? { width: `${pct}%` } : { width: '0%' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: isActive ? delay : 0 }}
        />
      </div>
    </motion.div>
  )
}

export default function Skills({ isActive }) {
  const anim = isActive ? 'visible' : 'hidden'

  return (
    <section
      className={styles.section}
      style={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? 'all' : 'none' }}
    >
      {/* Section label */}
      <motion.p
        className={styles.secLabel}
        initial="hidden"
        animate={anim}
        variants={{
          hidden:  { opacity: 0, y: 10 },
          visible: { opacity: 1, y: 0, transition: { delay: 0.05 } },
        }}
      >
        004 — CAPABILITIES
      </motion.p>

      <div className={styles.layout}>
        {/* Left column — Languages */}
        <div className={styles.col}>
          <motion.div
            className={styles.colTitle}
            initial="hidden"
            animate={anim}
            variants={{
              hidden:  { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0.5, delay: 0 } },
            }}
          >
            LANGUAGES
          </motion.div>

          {LANGUAGES.map(s => (
            <SkillBar key={s.name} {...s} isActive={isActive} />
          ))}

          {/* Tools row — inside left column */}
          <motion.div
            className={styles.toolsRow}
            initial="hidden"
            animate={anim}
            variants={{
              hidden:  { opacity: 0, y: 14 },
              visible: { opacity: 1, y: 0, transition: { delay: 0.9 } },
            }}
          >
            <div className={styles.toolsLabel}>TOOLS &amp; INFRA</div>
            {TOOLS.map(t => (
              <span key={t} className={styles.pill}>{t}</span>
            ))}
          </motion.div>
        </div>

        {/* Right column — Domains */}
        <div className={styles.col}>
          <motion.div
            className={styles.colTitle}
            initial="hidden"
            animate={anim}
            variants={{
              hidden:  { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0.5, delay: 0.05 } },
            }}
          >
            DOMAINS
          </motion.div>

          {DOMAINS.map(s => (
            <SkillBar key={s.name} {...s} isActive={isActive} />
          ))}
        </div>
      </div>

      {/* Faded section number */}
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
