import { motion } from 'framer-motion'
import styles from './About.module.css'

const BIO = `I'm Sahil. I build the parts of an app users never see — and would immediately notice if they broke.

Most of my work lives in backend systems, APIs, and data flows. Not glamorous, but it's where the real decisions happen: how data moves, what fails gracefully, what doesn't fall over at 2am. I like thinking through how things should work before writing how they work.

I've built across Frontend frameworks, Node, and Django. I tend to end up on the backend side of things — architecture, performance, making sure what's behind the scenes actually holds together.`

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
  const paragraphs = BIO.split('\n\n')

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
        {paragraphs.map((para, pi) => (
          <p key={pi} className={styles.aboutPara}>
            {para.split(' ').map((word, i) => (
              <motion.span key={i} className={styles.word}>
                <motion.span variants={wordVariants}>{word}</motion.span>
              </motion.span>
            ))}
          </p>
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
