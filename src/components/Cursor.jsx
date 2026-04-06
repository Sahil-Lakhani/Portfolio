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
      // Always track real mouse — syncVisibility needs it on click
      cursorStore.mouseX = e.clientX
      cursorStore.mouseY = e.clientY
      if (cursorStore.loaderActive) {
        if (cursorStore.flashOn) {
          const ox = e.clientX - 150
          const oy = e.clientY - 100
          cursorStore.x = ox
          cursorStore.y = oy
          el.style.left = ox + 'px'
          el.style.top  = oy + 'px'
        } else {
          cursorStore.x = e.clientX
          cursorStore.y = e.clientY
        }
      } else {
        cursorStore.x = e.clientX
        cursorStore.y = e.clientY
        el.style.left = e.clientX + 'px'
        el.style.top  = e.clientY + 'px'
      }
    }

    const onOver = (e) => {
      if (cursorStore.loaderActive) return // syncVisibility owns all state during loader
      const isText = !!e.target.closest('[data-cursor-expand]')
      cursorStore.expanded = isText
      setExpanded(isText)
      targetR = isText ? BIG_R : SMALL_R
      const isHover = !!e.target.closest('a, button, [data-cursor-hover]') && !e.target.closest('[data-cursor-ignore]')
      setHovered(!isText && isHover)
    }

    const syncVisibility = () => {
      if (cursorStore.loaderActive && cursorStore.flashOn) {
        // Immediately position blob at offset using current real mouse pos —
        // avoids the one-frame jump while waiting for the next mousemove
        const ox = cursorStore.mouseX - 150
        const oy = cursorStore.mouseY - 100
        cursorStore.x  = ox
        cursorStore.y  = oy
        el.style.left  = ox + 'px'
        el.style.top   = oy + 'px'
        // Snap radius to full size — eliminates lerp delay and fast-toggle ghost
        cursorStore.radius = BIG_R
        targetR = BIG_R
        setExpanded(true)
        setHovered(false)
        el.style.animation    = 'none'
        el.style.borderRadius = '50%'
        el.style.visibility   = ''
      } else if (cursorStore.loaderActive && !cursorStore.flashOn) {
        // Snap radius to 0 instantly — no lerp ghost on fast toggle
        cursorStore.radius = 0
        targetR = 0
        cursorStore.x = cursorStore.mouseX
        cursorStore.y = cursorStore.mouseY
        setExpanded(false)
        setHovered(false)
        el.style.animation    = ''
        el.style.borderRadius = ''
        el.style.visibility   = 'hidden'
      } else {
        // Loader exited — full reset regardless of what flashOn was
        cursorStore.radius = 0
        targetR = SMALL_R
        cursorStore.x = cursorStore.mouseX
        cursorStore.y = cursorStore.mouseY
        el.style.left         = cursorStore.mouseX + 'px'
        el.style.top          = cursorStore.mouseY + 'px'
        el.style.visibility   = ''
        el.style.animation    = ''
        el.style.borderRadius = ''
        setExpanded(false)
        setHovered(false)
      }
    }
    cursorStore.listeners.add(syncVisibility)

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)

    return () => {
      cursorStore.listeners.delete(syncVisibility)
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
