import { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'
import styles from './FallingLetters.module.css'

const LETTER_W = 72
const LETTER_H = 72
const RADIUS   = 8
const GRAVITY  = 2
const CHARSET  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export default function FallingLetters({ isActive }) {
  const canvasRef      = useRef(null)
  const engineRef      = useRef(null)
  const lettersRef     = useRef([])
  const particlesRef   = useRef([])   // explosion particles
  const finalSuckRef   = useRef([])   // letters in wormhole shrink phase
  const suckActiveRef  = useRef(false)
  const wormholeRef    = useRef({ x: 0, y: 0 })
  const rafRef         = useRef(null)
  const isActiveRef    = useRef(isActive)
  const ctxRef         = useRef(null)
  const resetRef       = useRef(null)
  const [hasLetters, setHasLetters] = useState(false)

  isActiveRef.current = isActive

  useEffect(() => {
    if (!isActive && engineRef.current) {
      // Clear canvas immediately — don't wait for the next RAF frame
      const ctx = ctxRef.current
      const canvas = canvasRef.current
      if (ctx && canvas) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      const bodies = Matter.Composite.allBodies(engineRef.current.world).filter(b => !b.isStatic)
      bodies.forEach(b => Matter.Composite.remove(engineRef.current.world, b))
      lettersRef.current   = []
      particlesRef.current = []
      finalSuckRef.current = []
      suckActiveRef.current = false
      engineRef.current.gravity.y = GRAVITY
      setHasLetters(false)
    }
  }, [isActive])

  useEffect(() => {
    function roundedRect(ctx, x, y, w, h, r) {
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + w - r, y)
      ctx.quadraticCurveTo(x + w, y, x + w, y + r)
      ctx.lineTo(x + w, y + h - r)
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
      ctx.lineTo(x + r, y + h)
      ctx.quadraticCurveTo(x, y + h, x, y + h - r)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.closePath()
    }

    function drawWormhole(ctx, x, y) {
      const t = Date.now() * 0.004

      // Outer glow — red → black
      const grd = ctx.createRadialGradient(x, y, 4, x, y, 110)
      grd.addColorStop(0,   'rgba(255, 60, 0, 0.65)')
      grd.addColorStop(0.45, 'rgba(255, 60, 0, 0.15)')
      grd.addColorStop(1,   'rgba(0, 0, 0, 0)')
      ctx.beginPath()
      ctx.arc(x, y, 110, 0, Math.PI * 2)
      ctx.fillStyle = grd
      ctx.fill()

      // Concentric pulsing rings — alternating red / cream
      for (let i = 5; i >= 1; i--) {
        const r = i * 10 + Math.sin(t * 1.5 + i) * 3
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.strokeStyle = i % 2 === 0
          ? `rgba(240, 237, 230, ${0.18 * (i / 5)})`   // cream
          : `rgba(255, 60, 0, ${0.22 * (i / 5)})`       // red
        ctx.lineWidth = i === 5 ? 1 : 2
        ctx.stroke()
      }

      // Rotating arc segments — red
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(t * 2)
      for (let i = 0; i < 3; i++) {
        ctx.rotate((Math.PI * 2) / 3)
        ctx.beginPath()
        ctx.arc(0, 0, 28, 0, Math.PI * 0.6)
        ctx.strokeStyle = 'rgba(255, 60, 0, 0.55)'
        ctx.lineWidth = 2.5
        ctx.stroke()
      }
      ctx.restore()

      // Inner cream ring
      ctx.beginPath()
      ctx.arc(x, y, 18, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(240, 237, 230, 0.4)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Dark void center
      ctx.beginPath()
      ctx.arc(x, y, 13, 0, Math.PI * 2)
      ctx.fillStyle = '#000'
      ctx.fill()
    }

    function draw() {
      const canvas = canvasRef.current
      const ctx = ctxRef.current
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      // Wormhole
      if (suckActiveRef.current || finalSuckRef.current.length > 0) {
        const { x, y } = wormholeRef.current
        drawWormhole(ctx, x, y)
      }

      // Physics letters
      lettersRef.current.forEach(({ body, char, accent }) => {
        const { x, y } = body.position
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(body.angle)
        roundedRect(ctx, -LETTER_W / 2, -LETTER_H / 2, LETTER_W, LETTER_H, RADIUS)
        ctx.fillStyle = '#2a2a2a'
        ctx.fill()
        ctx.strokeStyle = '#3a3a3a'
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.fillStyle = accent ? '#ff3c00' : '#f0ede6'
        ctx.font = `bold ${Math.floor(LETTER_H * 0.58)}px "Bebas Neue", "Space Mono", monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(char, 0, 2)
        ctx.restore()
      })

      // Final suck phase — letters shrink into wormhole
      const { x: wx, y: wy } = wormholeRef.current
      const aliveFinal = []
      finalSuckRef.current.forEach(item => {
        item.x    += (wx - item.x) * 0.22
        item.y    += (wy - item.y) * 0.22
        item.scale *= 0.82
        item.alpha -= 0.06
        if (item.alpha <= 0 || item.scale < 0.015) return
        ctx.save()
        ctx.translate(item.x, item.y)
        ctx.scale(item.scale, item.scale)
        ctx.globalAlpha = Math.max(0, item.alpha)
        roundedRect(ctx, -LETTER_W / 2, -LETTER_H / 2, LETTER_W, LETTER_H, RADIUS)
        ctx.fillStyle = '#2a2a2a'
        ctx.fill()
        ctx.fillStyle = item.accent ? '#ff3c00' : '#f0ede6'
        ctx.font = `bold ${Math.floor(LETTER_H * 0.58)}px "Bebas Neue", "Space Mono", monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(item.char, 0, 2)
        ctx.restore()
        aliveFinal.push(item)
      })
      finalSuckRef.current = aliveFinal

      // Explosion particles
      const alive = []
      particlesRef.current.forEach(p => {
        p.x  += p.vx
        p.y  += p.vy
        p.vy += 0.3
        p.alpha -= 0.022
        p.size  *= 0.95
        if (p.alpha <= 0) return
        ctx.save()
        ctx.globalAlpha = Math.max(0, p.alpha)
        ctx.fillStyle = p.color
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)
        ctx.restore()
        alive.push(p)
      })
      particlesRef.current = alive
    }

    function addBoundaries(engine, W, H) {
      const floor = Matter.Bodies.rectangle(W / 2, H + 25, W + 100, 50, { isStatic: true, label: 'wall' })
      const left  = Matter.Bodies.rectangle(-25,   H / 2, 50, H * 3, { isStatic: true, label: 'wall' })
      const right = Matter.Bodies.rectangle(W + 25, H / 2, 50, H * 3, { isStatic: true, label: 'wall' })
      Matter.Composite.add(engine.world, [floor, left, right])
      return [floor, left, right]
    }

    const canvas = canvasRef.current
    const dpr = window.devicePixelRatio || 1
    canvas.width  = window.innerWidth  * dpr
    canvas.height = window.innerHeight * dpr
    canvas.style.width  = window.innerWidth  + 'px'
    canvas.style.height = window.innerHeight + 'px'
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    ctxRef.current = ctx

    const engine = Matter.Engine.create({ gravity: { x: 0, y: GRAVITY } })
    engineRef.current = engine

    let boundaries = addBoundaries(engine, window.innerWidth, window.innerHeight)

    const mouse = Matter.Mouse.create(canvas)
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, damping: 0.1 },
    })
    Matter.Composite.add(engine.world, mouseConstraint)
    mouseConstraint.mouse.element.removeEventListener('wheel', mouseConstraint.mouse.mousewheel)
    mouse.pixelRatio = window.devicePixelRatio || 1

    function spawnLetter(char) {
      const W = window.innerWidth
      if (suckActiveRef.current) return

      const nonStatic = Matter.Composite.allBodies(engine.world).filter(b => !b.isStatic)
      if (nonStatic.some(b => b.bounds.min.y <= 0)) return

      const x = LETTER_W + Math.random() * (W - LETTER_W * 2)
      const y = LETTER_H / 2
      const body = Matter.Bodies.rectangle(x, y, LETTER_W, LETTER_H, {
        restitution: 0.2,
        friction: 0.5,
        frictionAir: 0.01,
        angle: (Math.random() - 0.5) * 0.3,
        velocity: { x: (Math.random() - 0.5) * 3, y: 1 + Math.random() * 2 },
      })
      Matter.Composite.add(engine.world, body)
      lettersRef.current.push({ body, char, accent: Math.random() < 0.1 })
      if (lettersRef.current.length === 1) setHasLetters(true)
    }

    // ── EXPLOSION mode (swap resetRef.current below to use this) ────────────
    function handleReset() {
      lettersRef.current.forEach(({ body, accent }) => {
        const { x, y } = body.position
        for (let i = 0; i < 10; i++) {
          particlesRef.current.push({
            x, y,
            vx: (Math.random() - 0.5) * 16,
            vy: (Math.random() - 0.5) * 16 - 3,
            alpha: 1,
            size: 5 + Math.random() * 7,
            color: (accent || Math.random() < 0.25) ? '#ff3c00' : '#f0ede6',
          })
        }
        Matter.Composite.remove(engine.world, body)
      })
      lettersRef.current = []
      setHasLetters(false)
    }

    // ── WORMHOLE mode ─────────────────────────────────────────────────────────
    function handleSuckReset() {
      wormholeRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
      engine.gravity.y = 0
      suckActiveRef.current = true
      setHasLetters(false)
    }

    // handleReset to go back to explosion
    resetRef.current = handleReset

    function animate() {
      rafRef.current = requestAnimationFrame(animate)
      if (!isActiveRef.current) {
        const canvas = canvasRef.current
        const ctx = ctxRef.current
        if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
        return
      }

      // Wormhole suck physics
      if (suckActiveRef.current && lettersRef.current.length > 0) {
        const { x: wx, y: wy } = wormholeRef.current
        const remaining = []
        lettersRef.current.forEach(entry => {
          const { body } = entry
          const dx = wx - body.position.x
          const dy = wy - body.position.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 38) {
            // Hand off to shrink animation
            Matter.Composite.remove(engine.world, body)
            finalSuckRef.current.push({
              x: body.position.x,
              y: body.position.y,
              char:  entry.char,
              accent: entry.accent,
              scale: 1,
              alpha: 1,
            })
          } else {
            // Pull toward wormhole — speed scales with proximity
            const speed = Math.min(80, 1400 / dist)
            Matter.Body.setVelocity(body, {
              x: body.velocity.x * 0.35 + (dx / dist) * speed * 1.5,
              y: body.velocity.y * 0.35 + (dy / dist) * speed * 1.5,
            })
            remaining.push(entry)
          }
        })
        lettersRef.current = remaining

        if (remaining.length === 0) {
          suckActiveRef.current = false
          engine.gravity.y = GRAVITY
        }
      }

      Matter.Engine.update(engine, 1000 / 60)
      draw()
    }
    animate()

    const onKey = (e) => {
      if (!isActiveRef.current) return
      const ch = e.key.toUpperCase()
      if (e.key.length === 1 && CHARSET.includes(ch)) spawnLetter(ch)
    }
    window.addEventListener('keydown', onKey)

    const onResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const dpr = window.devicePixelRatio || 1
      canvas.width  = window.innerWidth  * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width  = window.innerWidth  + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctxRef.current.setTransform(1, 0, 0, 1, 0, 0)
      ctxRef.current.scale(dpr, dpr)
      boundaries.forEach(b => Matter.Composite.remove(engine.world, b))
      boundaries = addBoundaries(engine, window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
      Matter.World.clear(engineRef.current.world, false)
      Matter.Engine.clear(engineRef.current)
      lettersRef.current   = []
      particlesRef.current = []
      finalSuckRef.current = []
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`${styles.canvas} ${isActive ? styles.active : styles.hidden}`}
      />
      {isActive && hasLetters && (
        <button
          className={styles.resetBtn}
          onClick={() => resetRef.current?.()}
          aria-label="Clear letters"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </button>
      )}
    </>
  )
}
