import { motion } from 'framer-motion'
import { GitHubCalendar } from 'react-github-calendar'
import styles from './HeroGithub.module.css'

const ease = [0.16, 1, 0.3, 1]

const GITHUB_THEME = {
  light: ['#111111', '#4d0f00', '#8c1f00', '#c43000', '#ff3c00'],
  dark:  ['#111111', '#4d0f00', '#8c1f00', '#c43000', '#ff3c00'],
}

export default function HeroGithub({ anim, isActive, className }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate={anim}
      variants={{
        hidden:  { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.6, ease, delay: 0.4 } },
      }}
    >
      <span className={styles.cellLabel}>GITHUB</span>
      <div className={styles.githubInner}>
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
        {/* Stats grid — reserved for future use
        <div className={styles.githubStats}>
          {[
            { value: stats.commits,   tag: 'COMMITS / YR' },
            { value: stats.streak,    tag: 'DAY STREAK'   },
            { value: stats.repos,     tag: 'PUBLIC REPOS' },
            { value: stats.followers, tag: 'FOLLOWERS'    },
          ].map(({ value, tag }) => (
            <div key={tag} className={styles.githubStat}>
              <span className={styles.statNumber}>{value ?? '—'}</span>
              <span className={styles.statTag}>{tag}</span>
            </div>
          ))}
        </div> */}
      </div>
    </motion.div>
  )
}
