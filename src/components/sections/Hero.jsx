import styles from './Hero.module.css'
import HeroName from './hero/HeroName'
import HeroDiecast from './hero/HeroDiecast'
import HeroMap from './hero/HeroMap'
import HeroGithub from './hero/HeroGithub'
import HeroStrip from './hero/HeroStrip'

export default function Hero({ isActive }) {
  const anim = isActive ? 'visible' : 'hidden'

  return (
    <section
      className={styles.section}
      style={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? 'all' : 'none' }}
    >
      <div className={styles.dots} />
      <div className={styles.vignette} />

      <div className={styles.grid}>
        <HeroName    anim={anim} isActive={isActive} className={`${styles.cell} ${styles.cellName}`} />
        <HeroDiecast anim={anim} className={`${styles.cell} ${styles.cellDiecast}`} />
        <HeroMap     anim={anim} className={`${styles.cell} ${styles.cellMap}`} />
        <HeroGithub  anim={anim} isActive={isActive} className={`${styles.cell} ${styles.cellGithub}`} />
        <HeroStrip   anim={anim} className={`${styles.cell} ${styles.cellStrip}`} />
      </div>
    </section>
  )
}
