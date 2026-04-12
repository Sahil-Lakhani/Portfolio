import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Projects.module.css'

const PROJECTS = [
  {
    num: '001',
    title: 'DISTRIBUTED TASK QUEUE',
    desc: 'Redis-backed job scheduler handling 10k+ jobs/sec. Zero message loss across 18 months of production. Built for fault tolerance at scale.',
    tags: ['RUST', 'REDIS', 'TOKIO', 'GRPC'],
    stat: '10K+ JOBS/SEC',
    github: '#',
    demo: '#',
  },
  {
    num: '002',
    title: 'REALTIME COLLAB EDITOR',
    desc: 'CRDT-based document sync with sub-50ms latency across 3 regions. Serves 40k monthly active users with 99.9% uptime.',
    tags: ['TYPESCRIPT', 'WEBSOCKET', 'CRDT'],
    stat: '40K MAU',
    github: '#',
    demo: '#',
  },
  {
    num: '003',
    title: 'OBSERVABILITY PLATFORM',
    desc: 'Unified metrics and tracing pipeline built on OpenTelemetry. Replaced three vendor tools, reduced costs by 60%.',
    tags: ['GO', 'OTEL', 'CLICKHOUSE'],
    stat: '60% COST CUT',
    github: '#',
    demo: '#',
  },
  {
    num: '004',
    title: 'CLI DEPLOY TOOLKIT',
    desc: 'Zero-config deployment CLI for any cloud provider. 2,400 GitHub stars. Used by 300+ engineering teams worldwide.',
    tags: ['GO', 'DOCKER', 'K8S'],
    stat: '2.4K STARS',
    github: '#',
    demo: '#',
  },
]

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*+=-~<>/\\|?'
const ITEM_SLOT = 106  // 100px card + 6px gap
const CENTER_OFFSET = 109  // (318 - 100) / 2 — top of vertically-centered card

// ── Slot math ──
// Returns the slot index relative to activeIdx.
// Slot 0 = center, +1 = one below, -1 = one above, ±2 = off-screen.
// For N=4 (even), the ambiguous slot at N/2=2 is resolved by direction:
//   direction ≥ 0 → slot -2 (off-screen above)
//   direction  < 0 → slot +2 (off-screen below)
function getCardSlot(cardIdx, activeIdx, n, direction) {
  const raw = ((cardIdx - activeIdx) % n + n) % n
  if (raw === n / 2) return direction >= 0 ? -(n / 2) : n / 2
  return raw > Math.floor(n / 2) ? raw - n : raw
}

// Finds the card that would jump more than 1 slot during a navigation
// (always exactly one for N=4). Must be pre-positioned before animating.
function findJumpCard(curIdx, targetIdx, n, curDir, newDir) {
  for (let i = 0; i < n; i++) {
    const oldSlot = getCardSlot(i, curIdx, n, curDir)
    const newSlot = getCardSlot(i, targetIdx, n, newDir)
    if (Math.abs(newSlot - oldSlot) > 1) return i
  }
  return null
}

function scrambleTo(el, newText, staggerMs = 18, cyclesPerChar = 7) {
  if (!el) return
  if (el._scrambleInterval) clearInterval(el._scrambleInterval)

  el.innerHTML = [...newText].map(ch =>
    ch === ' ' ? ' ' :
    ch === '\n' ? '<br>' :
    `<span class="sc-char" data-final="${ch}"></span>`
  ).join('')

  const spans = el.querySelectorAll('.sc-char')
  let tick = 0

  el._scrambleInterval = setInterval(() => {
    let allDone = true
    spans.forEach((span, idx) => {
      const resolveAt = Math.floor(idx * staggerMs / 40) + cyclesPerChar
      if (tick < resolveAt) {
        span.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        span.classList.add('scrambling')
        allDone = false
      } else {
        span.textContent = span.dataset.final
        span.classList.remove('scrambling')
      }
    })
    tick++
    if (allDone) clearInterval(el._scrambleInterval)
  }, 40)
}

// ── Framer Motion variants for middle section (body text + tags) ──

const midVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit:    { opacity: 0, transition: { duration: 0.12, ease: 'easeIn' } },
}

const statVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35, delay: 0.05 } },
}

// Word-slide stagger container (same mechanic as About section)
const descContainerVariants = {
  hidden:  {},
  visible: { transition: { delayChildren: 0.12, staggerChildren: 0.03 } },
}

const wordVariants = {
  hidden:  { y: '100%' },
  visible: { y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
}

const tagsContainerVariants = {
  hidden:  {},
  visible: { transition: { delayChildren: 0.32, staggerChildren: 0.07 } },
}

const tagVariants = {
  hidden:  { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
}

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
)

export default function Projects({ isActive }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [direction, setDirection] = useState(1)
  const [preJump, setPreJump]     = useState(null)  // { cardIdx, slot } | null

  const busyRef      = useRef(false)
  const activeIdxRef = useRef(0)
  const directionRef = useRef(1)
  const titleRef     = useRef(null)
  const navigateRef  = useRef(null)

  activeIdxRef.current = activeIdx
  directionRef.current = direction

  const navigate = (targetIdx) => {
    if (targetIdx === activeIdxRef.current || busyRef.current) return
    busyRef.current = true

    const n      = PROJECTS.length
    const cur    = activeIdxRef.current
    const isWrapFwd = cur === n - 1 && targetIdx === 0
    const isWrapBwd = cur === 0     && targetIdx === n - 1
    const newDir = isWrapFwd ? 1 : isWrapBwd ? -1 : (targetIdx > cur ? 1 : -1)

    const jumpCardIdx = findJumpCard(cur, targetIdx, n, directionRef.current, newDir)
    const preSlot     = newDir > 0 ? 2 : -2

    // Phase 1: instantly place the jump card on the correct off-screen side
    if (jumpCardIdx !== null) setPreJump({ cardIdx: jumpCardIdx, slot: preSlot })

    // Phase 2 (next frame): clear pre-jump override and animate all cards
    requestAnimationFrame(() => {
      setPreJump(null)
      setActiveIdx(targetIdx)
      setDirection(newDir)
      scrambleTo(titleRef.current, PROJECTS[targetIdx].title, 18, 7)
      setTimeout(() => { busyRef.current = false }, 650)
    })
  }

  navigateRef.current = navigate

  const prev = () => navigateRef.current((activeIdxRef.current - 1 + PROJECTS.length) % PROJECTS.length)
  const next = () => navigateRef.current((activeIdxRef.current + 1) % PROJECTS.length)

  // Initialise title text on mount
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.textContent = PROJECTS[0].title
    }
  }, [])

  // Scramble title whenever the section becomes active
  useEffect(() => {
    if (isActive && titleRef.current) {
      scrambleTo(titleRef.current, PROJECTS[activeIdxRef.current].title, 18, 7)
    }
  }, [isActive])

  // Keyboard navigation
  // useEffect(() => {
  //   const handler = (e) => {
  //     if (!isActive) return
  //     if (e.key === 'ArrowDown') navigateRef.current((activeIdxRef.current + 1) % PROJECTS.length)
  //     if (e.key === 'ArrowUp')   navigateRef.current((activeIdxRef.current - 1 + PROJECTS.length) % PROJECTS.length)
  //   }
  //   window.addEventListener('keydown', handler)
  //   return () => window.removeEventListener('keydown', handler)
  // }, [isActive])

  const project = PROJECTS[activeIdx]

  return (
    <section
      className={styles.section}
      style={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? 'all' : 'none' }}
    >
      {/* ── LEFT PANEL ── */}
      <div className={styles.left}>
        <div className={styles.sectionLabel}>003 — SELECTED WORK</div>
    
        <button className={styles.navBtnFull} onClick={prev} data-cursor-hover aria-label="Previous">
          <span style={{ position: 'relative', top: '-1px' }}>▲</span>
        </button>

        <div className={styles.reelViewport}>
          <div className={styles.reelStrip}>
            {PROJECTS.map((item, i) => {
              const isPreJumping = preJump?.cardIdx === i
              const slot = isPreJumping
                ? preJump.slot
                : getCardSlot(i, activeIdx, PROJECTS.length, direction)
              const active = i === activeIdx

              return (
                <motion.div
                  key={item.num}
                  className={`${styles.card} ${active ? styles.cardActive : ''}`}
                  animate={{ y: slot * ITEM_SLOT }}
                  transition={isPreJumping
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 220, damping: 22 }
                  }
                  onClick={() => navigate(i)}
                  data-cursor-hover
                  whileHover={active ? {} : { x: 6, transition: { duration: 0.15 } }}
                >
                  <div className={styles.numBox}>
                    <span className={styles.numBoxText}>#{parseInt(item.num, 10)}</span>
                  </div>
                  <div className={styles.cardInfo}>
                    <span className={styles.cardTitle}>{item.title}</span>
                  </div>
                  {active && (
                    <motion.span
                      className={styles.cardArrow}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      ▶
                    </motion.span>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        <button className={styles.navBtnFull} onClick={next} data-cursor-hover aria-label="Next">
          <span style={{ position: 'relative', top: '-1px' }}>▼</span>
        </button>
      </div>

      {/* vertical red divider */}
      <div className={styles.divider} />

      {/* ── RIGHT PANEL ── */}
      <div className={styles.panel}>
        <div className={styles.panelContent}>

          {/* ZONE 1 — title (natural height, never remounts) */}
          <div className={styles.titleZone}>
            <div className={styles.panelTitle} ref={titleRef} />
            <motion.div
              key={activeIdx}
              className={styles.titleUnderline}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
            />
          </div>

          {/* ZONE 2 — image (locked height, never remounts) */}
          <div className={styles.imageZone}>
            <div className={`${styles.imgCorner} ${styles.imgCornerTL}`} />
            <div className={`${styles.imgCorner} ${styles.imgCornerTR}`} />
            <div className={`${styles.imgCorner} ${styles.imgCornerBL}`} />
            <div className={`${styles.imgCorner} ${styles.imgCornerBR}`} />
            <div className={styles.projectImagePlaceholder} />
          </div>

          {/* ZONE 3 — desc + buttons (fills remaining height)
              Only the inner content animates — the zone container never moves */}
          <div className={styles.descZone}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                className={styles.panelMid}
                variants={midVariants}
                initial="hidden"
                animate={isActive ? 'visible' : 'hidden'}
                exit="exit"
              >
                <motion.div className={styles.panelStat} variants={statVariants}>
                  {project.stat}
                </motion.div>

                <motion.div className={styles.panelDesc} variants={descContainerVariants}>
                  {project.desc.split(' ').map((word, i) => (
                    <motion.span key={i} className={styles.descWord}>
                      <motion.span variants={wordVariants}>{word}</motion.span>
                    </motion.span>
                  ))}
                </motion.div>

                <motion.div className={styles.panelTags} variants={tagsContainerVariants}>
                  {project.tags.map((t, i) => (
                    <motion.span
                      key={t}
                      className={`${styles.tag} ${i === 0 ? styles.tagFirst : ''}`}
                      variants={tagVariants}
                    >
                      {t}
                    </motion.span>
                  ))}
                </motion.div>
              </motion.div>
            </AnimatePresence>

            <div className={styles.panelActions}>
              <a
                href={project.github}
                className={styles.btnPrimary}
                data-cursor-hover
                target="_blank"
                rel="noreferrer"
              >
                <GithubIcon /> GITHUB
              </a>
              <a
                href={project.demo}
                className={styles.btnSecondary}
                data-cursor-hover
                target="_blank"
                rel="noreferrer"
              >
                LIVE DEMO
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
