import { useState, useCallback, useEffect } from 'react'
import styles from './App.module.css'
import Cursor from './components/Cursor'
import NavDots from './components/NavDots'
import Overlay from './components/Overlay'
import Loader from './components/Loader'
import Hero from './components/sections/Hero'
import About from './components/sections/About'
import Projects from './components/sections/Projects'
import Skills from './components/sections/Skills'
import Contact from './components/sections/Contact'
// Shelved — see src/_experiments/README.md (gitignored, local only)
// import FallingLetters from './_experiments/FallingLetters'
import ResumeOverlay from './components/ResumeOverlay'
import useScroll from './hooks/useScroll'
import { colors } from './theme'

// The nav used to hardcode its own count, so adding a section here left it
// silently rendering the old number of dots. Names live here too — the dots
// announce these rather than "section 3".
const SECTIONS = ['Home', 'About', 'Selected Work', 'Capabilities', 'Get in Touch']
const TOTAL = SECTIONS.length

// The background each section paints, indexed alongside SECTIONS, fed to
// <meta name="theme-color"> so a browser that tints its chrome uses the
// section's own background. Chrome honours this; iOS Safari ignored it here.
const SECTION_BG = [colors.black, colors.white, colors.black, colors.white, colors.black]

// TEMPORARY — ?tint=00ff00 forces theme-color to an unmistakable value while
// leaving the page itself untouched. If the bars follow it, Safari reads the
// tag and our value is at fault; if they don't, Safari is sampling the page
// and the tag is irrelevant. Delete once that's settled.
const TINT = typeof location !== 'undefined'
  ? (new URLSearchParams(location.search).get('tint') || '')
  : ''

export default function App() {
  const [loaded, setLoaded]               = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [transitioning, setTransitioning]   = useState(false)
  const [overlayPhase, setOverlayPhase]     = useState('idle')
  // Lives here rather than inside Contact because the section navigation is
  // bound at this level: while the dialog is open, wheel, arrows and swipes
  // have to stop moving the page out from under it.
  const [resumeOpen, setResumeOpen]         = useState(false)

  useEffect(() => {
    const log = () => console.log(`viewport: ${window.innerWidth} × ${window.innerHeight}`)
    log()
    window.addEventListener('resize', log)
    return () => window.removeEventListener('resize', log)
  }, [])

  // Keep the browser chrome on the active section's background. The loader is
  // on black, so anything before `loaded` stays black.
  useEffect(() => {
    const bg = TINT ? `#${TINT.replace(/^#/, '')}` : loaded ? SECTION_BG[currentSection] : colors.black
    // Read by the standalone-only safe-area strips in App.module.css.
    document.documentElement.style.setProperty('--section-bg', bg)

    // Only touch the tag when the colour actually changes — replacing it is
    // what makes Safari re-read it, but a needless remove/append leaves a
    // frame with no theme-color at all.
    const existing = document.querySelector('meta[name="theme-color"]')
    if (existing?.content?.toLowerCase() === bg.toLowerCase()) return
    existing?.remove()
    const meta = document.createElement('meta')
    meta.name = 'theme-color'
    meta.content = bg
    document.head.appendChild(meta)
  }, [currentSection, loaded])

  // Called by Loader when ENTER is clicked — same wipe as section transitions
  const handleEnter = useCallback(() => {
    setTransitioning(true)
    setOverlayPhase('in')
    setTimeout(() => {
      setLoaded(true)
      setOverlayPhase('out')
      setTimeout(() => {
        setTransitioning(false)
        setOverlayPhase('idle')
      }, 460)
    }, 420)
  }, [])

  const goTo = useCallback((next) => {
    if (transitioning || next === currentSection || next < 0 || next >= TOTAL) return
    setTransitioning(true)
    setOverlayPhase('in')
    setTimeout(() => {
      setCurrentSection(next)
      setOverlayPhase('out')
      setTimeout(() => {
        setTransitioning(false)
        setOverlayPhase('idle')
      }, 460)
    }, 420)
  }, [transitioning, currentSection])

  const closeResume = useCallback(() => setResumeOpen(false), [])
  const openResume  = useCallback(() => setResumeOpen(true), [])

  useScroll({ goTo, currentSection, loaded, paused: resumeOpen })

  return (
    <>
      {/* Noise grain — always on top of everything except cursor */}
      <div className="noise" />

      {/* Red wipe overlay — shared by loader enter + section transitions */}
      <Overlay phase={overlayPhase} />

      {/* Custom cursor */}
      <Cursor />

      {/* Loader — z-150, hidden under overlay during enter animation */}
      {!loaded && <Loader onEnter={handleEnter} />}

      {/* Main site — always mounted, visible once loader exits */}
      {loaded && (
        <>
          <NavDots currentSection={currentSection} goTo={goTo} sections={SECTIONS} />

          <div className={styles.sections}>
            <Hero     isActive={currentSection === 0} />
            <About    isActive={currentSection === 1} />
            <Projects isActive={currentSection === 2} />
            <Skills   isActive={currentSection === 3} />
            <Contact  isActive={currentSection === 4} onOpenResume={openResume} />
          </div>

          {/* <FallingLetters isActive={currentSection === 2} /> */}
          <div className={styles.counter}>
            <span>{String(currentSection + 1).padStart(2, '0')}</span> / 05
          </div>

          <ResumeOverlay open={resumeOpen} onClose={closeResume} />
        </>
      )}
    </>
  )
}
