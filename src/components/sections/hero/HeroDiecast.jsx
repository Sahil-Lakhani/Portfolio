import { motion } from 'framer-motion'
import styles from './HeroDiecast.module.css'

const ease = [0.16, 1, 0.3, 1]

export default function HeroDiecast({ anim, className }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate={anim}
      variants={{
        hidden:  { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.6, ease, delay: 0.2 } },
      }}
    >
      <span className={styles.diecastText}>D1ecast</span>
    </motion.div>
  )
}
