import { motion } from 'framer-motion'
import NameGrid from './NameGrid'
import styles from './HeroName.module.css'

const ease = [0.16, 1, 0.3, 1]

export default function HeroName({ anim, isActive, className }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate={anim}
      variants={{
        hidden:  { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease, delay: 0.05 } },
      }}
    >
      <NameGrid isActive={isActive} />

      <div className={styles.nameInner}>
        <div className={styles.bigName}>
          <div className={styles.nameLine}><span>SAHIL</span></div>
          <div className={styles.nameLine}>
            <span>LAKHANI<span className={styles.redDot}>.</span></span>
          </div>
        </div>
        <p className={styles.nameSub}>FULL-STACK ENGINEER &nbsp;·&nbsp; SYSTEMS &nbsp;·&nbsp; DISTRIBUTED</p>
      </div>
    </motion.div>
  )
}
