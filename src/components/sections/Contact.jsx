import { motion } from 'framer-motion'
import styles from './Contact.module.css'

const ease = [0.16, 1, 0.3, 1]

const LINES = [
  { text: 'GET IN', red: false, delay: 0.05  },
  { text: 'TOUCH',  red: true,  delay: 0.2   },
  { text: 'WITH ME',red: false, delay: 0.35  },
]

const LINKS = [
  { label: 'EMAIL',    display: 'Sahillakhani0106@gmail.com',    href: 'mailto:Sahillakhani0106@gmail.com' },
  { label: 'GITHUB',   display: 'github.com/Sahil-Lakhani',       href: 'https://github.com/Sahil-Lakhani' },
  { label: 'LINKEDIN', display: 'linkedin.com/in/lakhani-sahil',  href: 'https://www.linkedin.com/in/lakhani-sahil/' },
]

export default function Contact({ isActive }) {
  const anim = isActive ? 'visible' : 'hidden'

  return (
    <section
      className={styles.section}
      style={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? 'all' : 'none' }}
    >
      {/* Big heading */}
      <div className={styles.bigContact}>
        {LINES.map(({ text, red, delay }) => (
          <div key={text} className={styles.contactLine}>
            <motion.span
              className={red ? styles.redText : ''}
              initial="hidden"
              animate={anim}
              variants={{
                hidden:  { y: '110%' },
                visible: { y: 0, transition: { duration: 0.9, ease, delay } },
              }}
            >
              {text}
            </motion.span>
          </div>
        ))}
      </div>

      {/* Contact links */}
      <motion.div
        className={styles.links}
        initial="hidden"
        animate={anim}
        variants={{
          hidden:  { opacity: 0, x: -20 },
          visible: { opacity: 1, x: 0, transition: { delay: 0.8 } },
        }}
      >
        {LINKS.map(({ label, display, href }) => (
          <a key={label} href={href} className={styles.link} target="_blank" rel="noreferrer">
            <span className={styles.linkLabel}>{label}</span>
            <span className={styles.linkValue}>{display}</span>
          </a>
        ))}
      </motion.div>

      {/* Red vertical stripe */}
      <motion.div
        className={styles.redStripe}
        initial="hidden"
        animate={anim}
        variants={{
          hidden:  { opacity: 0 },
          visible: { opacity: 1, transition: { delay: 1.2 } },
        }}
      />

      {/* Faded section number */}
      <motion.div
        className={styles.big05}
        initial="hidden"
        animate={anim}
        variants={{
          hidden:  { opacity: 0 },
          visible: { opacity: 1, transition: { delay: 1 } },
        }}
      >
        05
      </motion.div>
    </section>
  )
}
