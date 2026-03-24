import styles from './NavDots.module.css'

export default function NavDots({ currentSection, goTo }) {
  return (
    <nav className={styles.nav}>
      {Array.from({ length: 5 }, (_, i) => (
        <button
          key={i}
          className={`${styles.dot} ${currentSection === i ? styles.active : ''}`}
          onClick={() => goTo(i)}
          data-cursor-hover
          aria-label={`Go to section ${i + 1}`}
        />
      ))}
    </nav>
  )
}
