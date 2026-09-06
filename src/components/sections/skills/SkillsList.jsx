import { Fragment } from 'react'
import { motion } from 'framer-motion'
import styles from './SkillsList.module.css'
import { GROUPS, STACK } from './stack'

/**
 * The readable half of the Capabilities section.
 *
 * Same data as the pile, minus the asides — the jokes are true, but a list a
 * recruiter scans in five seconds is not the place for CONSOLE.LOG. Every word
 * here is also a tile over in the pile, so clicking one selects it there and a
 * tile selected there highlights the word here.
 */

const ease = [0.16, 1, 0.3, 1]

// Built once. The grouping never changes at runtime.
const BLOCKS = GROUPS.map(g => ({
  ...g,
  items: STACK.filter(s => s.group === g.id),
}))

const blockVariants = (i) => ({
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease, delay: 0.18 + i * 0.07 } },
})

export default function SkillsList({ isActive, selectedId, onSelect }) {
  const anim = isActive ? 'visible' : 'hidden'

  return (
    <div className={styles.list}>
      {BLOCKS.map((block, i) => (
        <motion.div
          key={block.id}
          className={styles.group}
          initial="hidden"
          animate={anim}
          variants={blockVariants(i)}
        >
          <h3 className={styles.heading}>{block.heading}</h3>

          <p className={styles.words}>
            {block.items.map((item, j) => (
              <Fragment key={item.id}>
                {j > 0 && <span className={styles.sep} aria-hidden="true">·</span>}
                <button
                  type="button"
                  className={styles.word}
                  aria-pressed={item.id === selectedId}
                  onClick={() => onSelect?.(item.id === selectedId ? null : item.id)}
                >
                  {item.name}
                </button>
              </Fragment>
            ))}
          </p>

          <p className={styles.evidence}>{block.evidence}</p>
        </motion.div>
      ))}
    </div>
  )
}
