import { useEffect, useRef } from 'react'

export default function useScroll({ goTo, currentSection, loaded }) {
  const goToRef = useRef(goTo)
  const currentRef = useRef(currentSection)
  const lastWheel = useRef(0)
  const touchY = useRef(0)

  // Keep refs current so wheel/key handlers never have stale closures
  useEffect(() => { goToRef.current = goTo }, [goTo])
  useEffect(() => { currentRef.current = currentSection }, [currentSection])

  useEffect(() => {
    if (!loaded) return
    const onWheel = (e) => {
      e.preventDefault()
      const now = Date.now()
      if (now - lastWheel.current < 900) return
      lastWheel.current = now
      const cur = currentRef.current
      if (e.deltaY > 0) goToRef.current(cur + 1)
      else goToRef.current(cur - 1)
    }

    const onKey = (e) => {
      const cur = currentRef.current
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goToRef.current(cur + 1)
      if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  goToRef.current(cur - 1)
    }

    const onTouchStart = (e) => {
      touchY.current = e.touches[0].clientY
    }

    const onTouchEnd = (e) => {
      const delta = touchY.current - e.changedTouches[0].clientY
      const cur = currentRef.current
      if (Math.abs(delta) > 50) {
        if (delta > 0) goToRef.current(cur + 1)
        else goToRef.current(cur - 1)
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [loaded]) // Re-registers when loader exits
}
