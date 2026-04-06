import { useEffect, useRef, useState } from 'react'
import styles from './SpotifyPlayer.module.css'

// ── Change these to your preferred track ────────────────────────────────
const SPOTIFY_URI   = 'spotify:track:7EkWXAI1wn8Ii883ecd9xr'
const TRACK_NAME    = 'Freaks'
const TRACK_ARTIST  = 'Surf Curse'
// ────────────────────────────────────────────────────────────────────────

export default function SpotifyPlayer() {
  const containerRef  = useRef(null)
  const controllerRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [artUrl, setArtUrl]       = useState(null)

  // Fetch album art from Spotify oEmbed (no auth required)
  useEffect(() => {
    const [, type, id] = SPOTIFY_URI.split(':')
    fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/${type}/${id}`)
      .then(r => r.json())
      .then(d => { if (d.thumbnail_url) setArtUrl(d.thumbnail_url) })
      .catch(() => {})
  }, [])

  // Inject Spotify iFrame API and create playback controller
  useEffect(() => {
    let mounted = true

    const initController = (IFrameAPI) => {
      if (!mounted || !containerRef.current) return
      IFrameAPI.createController(
        containerRef.current,
        { uri: SPOTIFY_URI, width: 300, height: 80 },
        (ctrl) => {
          if (!mounted) { ctrl.destroy(); return }
          controllerRef.current = ctrl
          ctrl.addListener('ready', () => {
            ctrl.setVolume?.(0.2)
          })
          ctrl.addListener('playback_update', ({ data }) => {
            if (mounted) setIsPlaying(!data.isPaused)
          })
        }
      )
    }

    if (window.SpotifyIframeApi) {
      initController(window.SpotifyIframeApi)
    } else {
      window.onSpotifyIframeApiReady = (IFrameAPI) => {
        window.SpotifyIframeApi = IFrameAPI
        initController(IFrameAPI)
      }
      if (!document.querySelector('script[src*="spotify.com/embed/iframe-api"]')) {
        const script = document.createElement('script')
        script.src = 'https://open.spotify.com/embed/iframe-api/v1'
        script.async = true
        document.head.appendChild(script)
      }
    }

    return () => {
      mounted = false
      if (controllerRef.current) {
        controllerRef.current.destroy()
        controllerRef.current = null
      }
    }
  }, [])

  return (
    <div className={styles.shell}>
      {/* Hidden container — Spotify injects its iframe here */}
      <div ref={containerRef} className={styles.iframeContainer} />

      <div className={styles.capsule}>
        {/* Circular album art */}
        {artUrl
          ? <img src={artUrl} className={styles.art} alt="album art" />
          : <div className={styles.artPlaceholder} />
        }

        {/* Track info */}
        <div className={styles.info}>
          <span className={styles.trackName}>{TRACK_NAME}</span>
          <span className={styles.artist}>{TRACK_ARTIST}</span>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <button
            className={styles.btn}
            onClick={() => controllerRef.current?.previousTrack()}
            aria-label="Previous"
          >⏮</button>
          <button
            className={`${styles.btn} ${styles.btnPlay}`}
            onClick={() => controllerRef.current?.togglePlay()}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >{isPlaying ? '⏸' : '▶'}</button>
          <button
            className={styles.btn}
            onClick={() => controllerRef.current?.nextTrack()}
            aria-label="Next"
          >⏭</button>
        </div>
      </div>
    </div>
  )
}
