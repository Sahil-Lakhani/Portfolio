import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import styles from './Cursor.module.css'
import { cursorStore, notifyCursorListeners } from '../hooks/useCursorStore'

const SMALL_R  = 9    // px radius when idle
const BIG_R    = 120  // px radius when over text-reveal zone

const HOVER_R = 52  // px diameter when over interactive elements

export default function Cursor() {
  const ref = useRef(null)
  const [expanded, setExpanded] = useState(false) // text-reveal zone
  const [hovered, setHovered]   = useState(false) // regular interactive elements
  const rafRef = useRef(null)

  useEffect(() => {
    const el = ref.current
    let targetR = SMALL_R

    function tick() {
      cursorStore.radius = cursorStore.radius + (targetR - cursorStore.radius) * 0.1
      notifyCursorListeners()
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    const onMove = (e) => {
      cursorStore.x = e.clientX
      cursorStore.y = e.clientY
      el.style.left = e.clientX + 'px'
      el.style.top  = e.clientY + 'px'
    }

    const onOver = (e) => {
      const isText  = !!e.target.closest('[data-cursor-expand]')
      const isHover = !!e.target.closest('a, button, [data-cursor-hover]') && !e.target.closest('[data-cursor-ignore]')
      cursorStore.expanded = isText
      setExpanded(isText)
      setHovered(!isText && isHover)
      targetR = isText ? BIG_R : SMALL_R
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <motion.div
      ref={ref}
      className={styles.cursor}
      animate={
        expanded ? {
          width: BIG_R * 2, height: BIG_R * 2,
          borderRadius: '50%',
          opacity: 0.15,
        } : hovered ? {
          width: HOVER_R, height: HOVER_R,
          borderRadius: undefined,
          opacity: 1,
        } : {
          width: 18, height: 18,
          borderRadius: undefined,
          opacity: 1,
        }
      }
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    />
  )
}
