import { motion } from 'framer-motion'
import styles from './Contact.module.css'

const ease = [0.16, 1, 0.3, 1]

const LINES = [
  { text: 'GET IN', red: false, delay: 0.05  },
  { text: 'TOUCH',  red: true,  delay: 0.2   },
  { text: 'WITH ME',red: false, delay: 0.35  },
]

/* Inlined rather than pulled from public/icons.svg: the sprite carries a
   GitHub mark but no mail or LinkedIn, and half a set from the sprite plus
   half inlined is worse than one consistent source.

   GitHub and LinkedIn use their official marks. Mail is not a brand, so it
   stays on the section's own accent. */
const ICONS = {
  EMAIL: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2.5" y="4.5" width="19" height="15" rx="1.5" />
      <path d="m3 6.5 9 6 9-6" />
    </svg>
  ),
  GITHUB: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  ),
  LINKEDIN: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5ZM3 9.75h4v11.5H3zM9.5 9.75h3.83v1.57h.05a4.2 4.2 0 0 1 3.78-2.08c4.04 0 4.79 2.66 4.79 6.12v5.89h-4v-5.22c0-1.25-.02-2.85-1.74-2.85-1.74 0-2.01 1.36-2.01 2.76v5.31h-4z" />
    </svg>
  ),
}

/* Official brand colours. GitHub's mark is #181717, which is invisible on this
   section — its own guidance is a white mark on dark, so that is what it gets. */
const BRAND = {
  GITHUB:   '#ffffff',
  LINKEDIN: '#0a66c2',
}

const LINKS = [
  { label: 'EMAIL',    display: 'Sahillakhani0106@gmail.com',    href: 'mailto:Sahillakhani0106@gmail.com' },
  { label: 'GITHUB',   display: 'github.com/Sahil-Lakhani',       href: 'https://github.com/Sahil-Lakhani' },
  { label: 'LINKEDIN', display: 'linkedin.com/in/lakhani-sahil',  href: 'https://www.linkedin.com/in/lakhani-sahil/' },
]

const fadeUp = (delay, y = 16) => ({
  hidden:  { opacity: 0, y },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease, delay } },
})

export default function Contact({ isActive, onOpenResume }) {
  const anim = isActive ? 'visible' : 'hidden'

  return (
    <section
      className={styles.section}
      style={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? 'all' : 'none' }}
    >
      <div className={styles.cols}>
        <div className={styles.colLeft}>
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

          <motion.p
            className={styles.intro}
            initial="hidden"
            animate={anim}
            variants={fadeUp(0.6)}
          >
            Have a project in mind, a collaboration idea, or just want to say
            hello? I&rsquo;d love to hear from you.
          </motion.p>

          <div className={styles.links}>
            {LINKS.map(({ label, display, href }, i) => (
              <motion.a
                key={label}
                href={href}
                className={styles.link}
                style={BRAND[label] ? { '--brand': BRAND[label] } : undefined}
                target="_blank"
                rel="noreferrer"
                data-cursor-hover
                initial="hidden"
                animate={anim}
                variants={fadeUp(0.75 + i * 0.1, 14)}
              >
                <span className={styles.linkIcon}>{ICONS[label]}</span>
                <span className={styles.linkValue}>{display}</span>
                <span className={styles.linkArrow} aria-hidden="true">↗</span>
              </motion.a>
            ))}
          </div>

          <motion.p
            className={styles.copyright}
            initial="hidden"
            animate={anim}
            variants={fadeUp(1.15, 8)}
          >
            © 2026 Sahil Lakhani
          </motion.p>
        </div>

        <motion.div
          className={styles.colRight}
          initial="hidden"
          animate={anim}
          variants={fadeUp(0.55, 20)}
        >
          <p className={styles.resumeKicker}>RÉSUMÉ</p>

          <p className={styles.resumeHeading}>
            Prefer the short version?
          </p>

          <p className={styles.resumeLine}>
            One page. Everything on this site, minus the scrolling &mdash;
            written for the ten seconds someone actually spends on it.
          </p>

          <button
            type="button"
            className={styles.resumeBtn}
            onClick={onOpenResume}
            aria-label="Preview résumé"
            aria-haspopup="dialog"
            data-cursor-hover
          >
            VIEW RÉSUMÉ
            <span className={styles.btnArrow} aria-hidden="true">↓</span>
          </button>

          <p className={styles.resumeMeta}>PDF · 88 KB · ONE PAGE</p>
        </motion.div>
      </div>

    </section>
  )
}
