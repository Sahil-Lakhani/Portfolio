import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Device-motion input, as a plain subscription. Knows nothing about physics —
 * it reports a normalised tilt vector and a shake impulse, and the caller
 * decides what those mean.
 *
 * Three things about the platform drive the shape of this hook:
 *
 *  1. Motion sensors need a SECURE CONTEXT. localhost counts; a phone hitting
 *     the dev server over a LAN IP does not, and there the event simply never
 *     exists. That is reported as 'unsupported' rather than left to fail
 *     silently, so the caller can decline to render an affordance for a
 *     feature that cannot work.
 *  2. iOS 13+ gates the events behind DeviceMotionEvent.requestPermission(),
 *     which only resolves when called from a real user gesture. Hence `request`
 *     is returned for a tap handler to call rather than fired on mount.
 *  3. Android grants without asking, so status goes straight to 'granted'.
 */

// Roughly one g. Tilt is reported as a fraction of this, so a phone on its
// side reads about 1 on that axis.
const G = 9.81

// Sensor output is noisy enough that feeding it straight to a physics engine
// leaves everything permanently vibrating. Each sample is blended into the
// running value instead.
const SMOOTHING = 0.16

// Jerk, in m/s^2, that separates a deliberate shake from ordinary handling.
const SHAKE_THRESHOLD = 16

// A single shake spans many events; without a floor it would fire dozens of
// times per gesture.
const SHAKE_COOLDOWN_MS = 600

// Axis signs. Per the W3C convention a phone held upright in portrait reports
// accelerationIncludingGravity.y of about +9.81, so +1 here sends gravity down
// the screen. Vendors do vary: if the pile falls upward or slides the wrong
// way on a real device, flip the offending constant and nothing else.
const AXIS_X = 1
const AXIS_Y = 1

// A phone lying flat reads ~0 on both x and y — all of gravity is on z — which
// would leave the pile floating in zero-g on a table. Below this much tilt the
// vector is blended back towards straight down.
const FLAT_TILT = 0.3

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

function detectSupport() {
  if (typeof window === 'undefined') return 'unsupported'
  if (typeof window.DeviceMotionEvent === 'undefined') return 'unsupported'
  // Sensor APIs are inert outside a secure context, and on some browsers the
  // constructor still exists there — so test the context too.
  if (!window.isSecureContext) return 'unsupported'
  return typeof window.DeviceMotionEvent.requestPermission === 'function'
    ? 'prompt'      // iOS: needs a tap before any event arrives
    : 'granted'     // everyone else
}

export default function useShakeGravity({ enabled, onTilt, onShake }) {
  const [status, setStatus] = useState(detectSupport)

  // Callbacks land in refs so a caller passing inline arrows does not tear the
  // listener down and rebuild it on every render.
  const tiltRef = useRef(onTilt)
  const shakeRef = useRef(onShake)
  useEffect(() => { tiltRef.current = onTilt }, [onTilt])
  useEffect(() => { shakeRef.current = onShake }, [onShake])

  const request = useCallback(async () => {
    if (typeof window.DeviceMotionEvent?.requestPermission !== 'function') return
    try {
      const res = await window.DeviceMotionEvent.requestPermission()
      setStatus(res === 'granted' ? 'granted' : 'denied')
    } catch {
      // Thrown when the call did not originate from a user gesture. Nothing to
      // recover from — the affordance stays put so it can be tapped again.
      setStatus('denied')
    }
  }, [])

  useEffect(() => {
    if (!enabled || status !== 'granted') return

    let tiltX = 0
    let tiltY = 0
    let lastMag = null
    let lastShake = 0

    const onMotion = (e) => {
      const a = e.accelerationIncludingGravity
      if (!a || a.x == null || a.y == null) return

      const rawX = clamp((a.x / G) * AXIS_X, -1, 1)
      const rawY = clamp((a.y / G) * AXIS_Y, -1, 1)

      tiltX += (rawX - tiltX) * SMOOTHING
      tiltY += (rawY - tiltY) * SMOOTHING

      // Keep some gravity when the phone is flat, or the pile hangs in mid-air.
      let outX = tiltX
      let outY = tiltY
      const lean = Math.hypot(tiltX, tiltY)
      if (lean < FLAT_TILT) {
        const k = lean / FLAT_TILT
        outX = tiltX * k
        outY = tiltY * k + (1 - k)
      }
      tiltRef.current?.(outX, outY)

      // Shake is the jerk — how fast the magnitude is changing — not the
      // magnitude itself, which sits near 1g whenever the phone is simply held.
      const mag = Math.hypot(a.x, a.y, a.z ?? 0)
      if (lastMag !== null) {
        const jerk = Math.abs(mag - lastMag)
        const now = Date.now()
        if (jerk > SHAKE_THRESHOLD && now - lastShake > SHAKE_COOLDOWN_MS) {
          lastShake = now
          shakeRef.current?.(clamp(jerk / SHAKE_THRESHOLD, 1, 3))
        }
      }
      lastMag = mag
    }

    window.addEventListener('devicemotion', onMotion)
    return () => window.removeEventListener('devicemotion', onMotion)
  }, [enabled, status])

  return { status, request }
}
