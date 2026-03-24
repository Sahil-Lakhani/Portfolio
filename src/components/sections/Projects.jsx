import { motion } from 'framer-motion'
import styles from './Projects.module.css'

const PROJECTS = [
  {
    num: '001', featured: true,
    title: 'DISTRIBUTED TASK QUEUE',
    desc: 'Redis-backed job scheduler handling 10k+ jobs/sec. Zero message loss across 18 months of production. Built for fault tolerance at scale.',
    tags: ['RUST', 'REDIS', 'TOKIO', 'GRPC'],
  },
  {
    num: '002', featured: false,
    title: 'REALTIME COLLAB EDITOR',
    desc: 'CRDT-based document sync with sub-50ms latency across 3 regions. Serves 40k monthly active users with 99.9% uptime.',
    tags: ['TYPESCRIPT', 'WEBSOCKET', 'CRDT'],
  },
  {
    num: '003', featured: false,
    title: 'OBSERVABILITY PLATFORM',
    desc: 'Unified metrics and tracing pipeline built on OpenTelemetry. Replaced three vendor tools, reduced costs by 60%.',
    tags: ['GO', 'OTEL', 'CLICKHOUSE'],
  },
  {
    num: '004', featured: false,
    title: 'CLI DEPLOY TOOLKIT',
    desc: 'Zero-config deployment CLI for any cloud provider. 2,400 GitHub stars. Used by 300+ engineering teams worldwide.',
    tags: ['GO', 'DOCKER', 'K8S'],
  },
]

const DELAYS = [0.1, 0.22, 0.34, 0.46]

export default function Projects({ isActive }) {
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
          hidden:  { opacity: 0, x: -12 },
          visible: { opacity: 1, x: 0, transition: { delay: 0.05 } },
        }}
      >
        003 — SELECTED WORK
      </motion.p>

      {/* 2×2 grid */}
      <div className={styles.grid}>
        {PROJECTS.map(({ num, featured, title, desc, tags }, i) => (
          <motion.div
            key={num}
            className={`${styles.card} ${featured ? styles.featured : ''}`}
            data-cursor-hover
            initial="hidden"
            animate={anim}
            variants={{
              hidden:  { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: DELAYS[i] } },
            }}
          >
            <div className={`${styles.projNum} ${featured ? styles.featuredNum : ''}`}>
              {featured ? `${num} — FEATURED` : num}
            </div>
            <div className={styles.projTitle}>{title}</div>
            <div className={styles.projDesc}>{desc}</div>
            <div className={styles.projTags}>
              {tags.map(t => (
                <span key={t} className={styles.tag}>{t}</span>
              ))}
            </div>
            <span className={styles.arrow}>↗</span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
