import { motion } from 'framer-motion'
// import SpotifyPlayer from '../../SpotifyPlayer'

const ease = [0.16, 1, 0.3, 1]

export default function HeroStrip({ anim, className }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate={anim}
      variants={{
        hidden:  { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease, delay: 0.5 } },
      }}
    >
      {/* <SpotifyPlayer /> */}
    </motion.div>
  )
}
