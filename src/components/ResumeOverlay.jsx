import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './ResumeOverlay.module.css'

/**
 * The résumé preview, opened from the Contact section.
 *
 * The preview is a flat image of the page, not the PDF itself. Framing the PDF
 * is at the mercy of the host's X-Frame-Options, of whether the reader has
 * Chrome's PDF viewer enabled, and it never works at all in iOS Safari. An
 * <img> has none of those failure modes, so it renders everywhere — phones
 * included. The buttons still hand over the real PDF.
 */

const ease = [0.16, 1, 0.3, 1]

export const RESUME_URL = '/Sahil-Lakhani-Resume.pdf'
export const RESUME_FILE = 'Sahil-Lakhani-Resume.pdf'

// Page 1 rendered to an image. Regenerate this whenever the PDF changes.
const RESUME_PREVIEW = '/resume.png'

export default function ResumeOverlay({ open, onClose }) {
  const closeRef = useRef(null)
  const lastFocused = useRef(null)

  // Focus moves into the dialog on open and back to whatever opened it on
  // close, so a keyboard user is not dropped at the top of the document.
  useEffect(() => {
    if (!open) return
    lastFocused.current = document.activeElement
    closeRef.current?.focus()
    return () => lastFocused.current?.focus?.()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    // Capture phase: the section navigation also listens on window, and this
    // has to win even though nav is already paused while the dialog is open.
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.panel}
            role="dialog"
            aria-modal="true"
            aria-label="Résumé preview"
            /* Slides in from the right, following the band that opened it. */
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%', transition: { duration: 0.35, ease } }}
            transition={{ duration: 0.55, ease }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              ref={closeRef}
              className={styles.close}
              onClick={onClose}
              aria-label="Close résumé preview"
              data-cursor-hover
            >
              ×
            </button>

            <div className={styles.info}>
              <p className={styles.kicker}>RÉSUMÉ</p>

              <p className={styles.line}>
                the same 42 things, in a format an ATS can actually parse.
              </p>

              <p className={styles.meta}>PDF · 88 KB · ONE PAGE</p>

              <div className={styles.actions}>
                <a
                  className={styles.download}
                  href={RESUME_URL}
                  download={RESUME_FILE}
                  data-cursor-hover
                >
                  DOWNLOAD
                </a>
                <a
                  className={styles.newTab}
                  href={RESUME_URL}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor-hover
                >
                  OPEN IN NEW TAB
                </a>
              </div>
            </div>

            <div className={styles.doc}>
              <img
                className={styles.page}
                src={RESUME_PREVIEW}
                alt="Résumé, page one"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
