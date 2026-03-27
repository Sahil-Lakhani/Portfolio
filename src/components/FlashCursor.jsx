import { useEffect, useRef } from 'react'
import { cursorStore, notifyCursorListeners } from '../hooks/useCursorStore'
import styles from './FlashCursor.module.css'
import flashlightSrc from '../assets/FlashLight.svg'

export default function FlashCursor() {
  const ref = useRef(null)

  useEffect(() => {
    cursorStore.loaderActive = true
    cursorStore.flashOn = false
    notifyCursorListeners()

    const el = ref.current

    const onMove = (e) => {
      el.style.left = e.clientX + 'px'
      el.style.top  = e.clientY + 'px'
    }

    const onClick = (e) => {
      if (e.target.closest('[data-cursor-ignore]')) return
      cursorStore.flashOn = !cursorStore.flashOn
      notifyCursorListeners()
      el.style.transform = cursorStore.flashOn
        ? 'translate(-50%, 0) rotate(-45deg)'
        : 'translate(-50%, 0)'
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('click', onClick)

    return () => {
      cursorStore.loaderActive = false
      cursorStore.flashOn = false
      notifyCursorListeners()
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <img
      ref={ref}
      src={flashlightSrc}
      className={styles.cursor}
      alt=""
      draggable={false}
    />
  )
}
