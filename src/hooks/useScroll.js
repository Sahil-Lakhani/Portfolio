import { useEffect, useRef } from 'react'

// A swipe has to clear this before it counts as navigation. 50px was low
// enough that the small drags you make while reading registered as intent.
const SWIPE_MIN = 90
// Shared by wheel and touch so a fast double gesture can't skip a section.
const NAV_COOLDOWN = 900

/* Opt-out for surfaces that own their gestures outright — the skills pile
   canvas, where a drag throws a tile and must not also change section. */
function ownsGesture(el) {
  return !!(el && el.closest && el.closest('[data-no-nav]'))
}

/* The sections that overflow on a phone (About, Projects, Skills, Contact)
   scroll their own content. Walking up from whatever was touched tells us
   whether this gesture belongs to that inner scroller or to the page nav. */
function scrollableAncestor(el) {
  while (el && el !== document.documentElement) {
    const oy = getComputedStyle(el).overflowY
    if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 1) return el
    el = el.parentElement
  }
  return null
}

export default function useScroll({ goTo, currentSection, loaded, paused = false }) {
  const goToRef = useRef(goTo)
  const currentRef = useRef(currentSection)
  const lastNav = useRef(0)
  const touchY = useRef(0)
  const touchX = useRef(0)
  // Where the inner scroller sat when the gesture began. Read at touchstart,
  // not touchend: a single swipe that runs the content to its end would
  // otherwise also advance the section, skipping past what you just scrolled
  // to. You reach the edge with one swipe, then move on with the next.
  const atStart = useRef({ top: true, bottom: true })
  // Whether the in-flight gesture started on a surface that owns it.
  const ownedRef = useRef(false)
  // Read through a ref rather than re-registering the listeners: the wheel
  // handler is bound non-passive so it can preventDefault, and tearing that
  // down and rebuilding it every time a dialog opens is a lot of churn for a
  // boolean the handlers can simply check.
  const pausedRef = useRef(paused)

  // Keep refs current so wheel/key handlers never have stale closures
  useEffect(() => { goToRef.current = goTo }, [goTo])
  useEffect(() => { currentRef.current = currentSection }, [currentSection])
  useEffect(() => { pausedRef.current = paused }, [paused])

  useEffect(() => {
    if (!loaded) return

    const navigate = (dir) => {
      const now = Date.now()
      if (now - lastNav.current < NAV_COOLDOWN) return
      lastNav.current = now
      goToRef.current(currentRef.current + dir)
    }

    const onWheel = (e) => {
      // Return before preventDefault, not after — a paused nav has to let the
      // scroll through to whatever is on top, not just decline to act on it.
      if (pausedRef.current || ownsGesture(e.target)) return
      const scroller = scrollableAncestor(e.target)
      if (scroller) {
        const down = e.deltaY > 0
        const atEdge = down
          ? scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1
          : scroller.scrollTop <= 0
        if (!atEdge) return // let the inner content scroll
      }
      e.preventDefault()
      navigate(e.deltaY > 0 ? 1 : -1)
    }

    const onKey = (e) => {
      if (pausedRef.current) return
      const cur = currentRef.current
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goToRef.current(cur + 1)
      if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  goToRef.current(cur - 1)
    }

    const onTouchStart = (e) => {
      if (pausedRef.current || e.touches.length > 1) return
      // Remembered for touchend, which sees changedTouches rather than the
      // element the gesture began on.
      ownedRef.current = ownsGesture(e.target)
      if (ownedRef.current) return
      touchY.current = e.touches[0].clientY
      touchX.current = e.touches[0].clientX
      const scroller = scrollableAncestor(e.target)
      atStart.current = scroller
        ? {
            top: scroller.scrollTop <= 0,
            bottom: scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1,
          }
        : { top: true, bottom: true }
    }

    const onTouchEnd = (e) => {
      if (pausedRef.current || ownedRef.current || e.touches.length > 0) return
      const dy = touchY.current - e.changedTouches[0].clientY
      const dx = touchX.current - e.changedTouches[0].clientX
      if (Math.abs(dy) < SWIPE_MIN) return
      // A drag that travelled further sideways than vertically is a horizontal
      // gesture (the project strip), not a section change.
      if (Math.abs(dx) > Math.abs(dy)) return
      // Swiping up moves you forward, but only once the content under your
      // finger had nothing left to scroll in that direction.
      if (dy > 0 && atStart.current.bottom) navigate(1)
      else if (dy < 0 && atStart.current.top) navigate(-1)
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
