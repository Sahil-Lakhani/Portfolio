import { motion } from 'framer-motion'
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet'
import { GitHubCalendar } from 'react-github-calendar'
import styles from './Hero.module.css'
// import SpotifyPlayer from '../SpotifyPlayer'

const ease = [0.16, 1, 0.3, 1]

const GITHUB_THEME = {
  light: ['#111111', '#4d0f00', '#8c1f00', '#c43000', '#ff3c00'],
  dark:  ['#111111', '#4d0f00', '#8c1f00', '#c43000', '#ff3c00'],
}

const MUNICH = [48.1351, 11.5820]

export default function Hero({ isActive }) {
  const anim = isActive ? 'visible' : 'hidden'

  return (
    <section
      className={styles.section}
      style={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? 'all' : 'none' }}
    >
      {/* Background layers */}
      <div className={styles.dots} />
      <div className={styles.vignette} />

      {/* Bento grid */}
      <div className={styles.grid}>

        {/* ── Name cell ── */}
        <motion.div
          className={`${styles.cell} ${styles.cellName}`}
          initial="hidden"
          animate={anim}
          variants={{
            hidden:  { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease, delay: 0.05 } },
          }}
        >
          <div className={styles.nameInner}>
            <div className={styles.bigName}>
              <div className={styles.nameLine}><span>SAHIL</span></div>
              <div className={styles.nameLine}>
                <span>LAKHANI<span className={styles.redDot}>.</span></span>
              </div>
            </div>
            <p className={styles.nameSub}>FULL-STACK ENGINEER &nbsp;·&nbsp; SYSTEMS &nbsp;·&nbsp; DISTRIBUTED</p>
          </div>
        </motion.div>

        {/* ── D1ECAST cell ── */}
        <motion.div
          className={`${styles.cell} ${styles.cellDiecast}`}
          initial="hidden"
          animate={anim}
          variants={{
            hidden:  { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.6, ease, delay: 0.2 } },
          }}
        >
          <div className={styles.diecastInner}>
            <button type="button" className={styles.diecastBtn}>D1ECAST</button>
          </div>
        </motion.div>

        {/* ── Map cell ── */}
        <motion.div
          className={`${styles.cell} ${styles.cellMap}`}
          initial="hidden"
          animate={anim}
          variants={{
            hidden:  { opacity: 0, scale: 0.97 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease, delay: 0.3 } },
          }}
        >
          <span className={styles.cellLabel}>MUNICH · UTC+1</span>
          <div className={styles.mapInner} style={{ visibility: isActive ? 'visible' : 'hidden' }}>
            <MapContainer
              center={MUNICH}
              zoom={11}
              style={{ width: '100%', height: '100%' }}
              scrollWheelZoom={false}
              dragging={false}
              zoomControl={false}
              doubleClickZoom={false}
              keyboard={false}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <CircleMarker
                center={MUNICH}
                radius={6}
                pathOptions={{ color: '#ff3c00', fillColor: '#ff3c00', fillOpacity: 1 }}
              />
            </MapContainer>
          </div>
        </motion.div>

        {/* ── GitHub graph cell ── */}
        <motion.div
          className={`${styles.cell} ${styles.cellGithub}`}
          initial="hidden"
          animate={anim}
          variants={{
            hidden:  { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.6, ease, delay: 0.4 } },
          }}
        >
          <span className={styles.cellLabel}>GITHUB</span>
          <div className={styles.githubInner}>
            {/* Graph — top, full width */}
            <div className={styles.githubGraph}>
              {isActive && (
                <GitHubCalendar
                  username="Sahil-Lakhani"
                  theme={GITHUB_THEME}
                  blockSize={14}
                  blockMargin={4}
                  fontSize={11}
                  hideColorLegend
                  hideMonthLabels={false}
                  labels={{ totalCount: '' }}
                />
              )}
            </div>
            {/* Stats — bottom, 2-column grid (commented out) */}
            {/* <div className={styles.githubStats}>
              {[
                { value: stats.commits, tag: 'COMMITS / YR' },
                { value: stats.streak,  tag: 'DAY STREAK'   },
                { value: stats.repos,   tag: 'PUBLIC REPOS' },
                { value: stats.followers, tag: 'FOLLOWERS'  },
              ].map(({ value, tag }) => (
                <div key={tag} className={styles.githubStat}>
                  <span className={styles.statNumber}>{value ?? '—'}</span>
                  <span className={styles.statTag}>{tag}</span>
                </div>
              ))}
            </div> */}
          </div>
        </motion.div>

        {/* ── Bottom strip ── */}
        <motion.div
          className={`${styles.cell} ${styles.cellStrip}`}
          initial="hidden"
          animate={anim}
          variants={{
            hidden:  { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease, delay: 0.5 } },
          }}
        >
          {/* BACKUP IDEA — Spotify capsule player */}
          {/* <SpotifyPlayer /> */}
        </motion.div>

      </div>
    </section>
  )
}
