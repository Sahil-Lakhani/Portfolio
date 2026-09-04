import styles from './NavDots.module.css'

export default function NavDots({ currentSection, goTo, sections }) {
  return (
    <nav className={styles.nav} aria-label="Section navigation">
      {sections.map((name, i) => (
        <button
          key={name}
          type="button"
          className={`${styles.dot} ${currentSection === i ? styles.active : ''}`}
          onClick={() => goTo(i)}
          data-cursor-hover
          /* The active state was colour only, so assistive tech had no way to
             tell which section the reader was on. */
          aria-current={currentSection === i ? 'true' : undefined}
          aria-label={`Go to ${name}`}
        />
      ))}
    </nav>
  )
}
