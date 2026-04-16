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
// import FallingLetters from './components/FallingLetters'
import useScroll from './hooks/useScroll'

const TOTAL = 5

export default function App() {
  const [loaded, setLoaded]               = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [transitioning, setTransitioning]   = useState(false)
  const [overlayPhase, setOverlayPhase]     = useState('idle')

  useEffect(() => {
    const log = () => console.log(`viewport: ${window.innerWidth} × ${window.innerHeight}`)
    log()
    window.addEventListener('resize', log)
    return () => window.removeEventListener('resize', log)
  }, [])

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

  useScroll({ goTo, currentSection, loaded })

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
          <NavDots currentSection={currentSection} goTo={goTo} />

          <div className={styles.sections}>
            <Hero     isActive={currentSection === 0} />
            <About    isActive={currentSection === 1} />
            <Projects isActive={currentSection === 2} />
            <Skills   isActive={currentSection === 3} />
            <Contact  isActive={currentSection === 4} />
          </div>

          {/* <FallingLetters isActive={currentSection === 2} /> */}
          <div className={styles.counter}>
            <span>{String(currentSection + 1).padStart(2, '0')}</span> / 05
          </div>
        </>
      )}
    </>
  )
}
