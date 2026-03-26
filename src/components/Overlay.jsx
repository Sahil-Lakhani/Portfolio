import { motion } from 'framer-motion'
import { colors } from '../theme'

const variants = {
  idle: { scaleY: 0 },
  in:   { scaleY: 1, transition: { duration: 0.42, ease: [0.7, 0, 0.3, 1] } },
  out:  { scaleY: 0, transition: { duration: 0.42, ease: [0.7, 0, 0.3, 1] } },
}

export default function Overlay({ phase }) {
  return (
    <motion.div
      variants={variants}
      animate={phase}
      initial="idle"
      style={{
        position: 'fixed',
        inset: 0,
        background: colors.red,
        zIndex: 500,
        transformOrigin: phase === 'out' ? 'top' : 'bottom',
      }}
    />
  )
}
