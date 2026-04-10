import { useEffect, useRef } from 'react'
import Matter from 'matter-js'
import styles from './FallingLetters.module.css'

const LETTER_W = 72
const LETTER_H = 72
const RADIUS   = 8
const GRAVITY  = 2
const CHARSET  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export default function FallingLetters({ isActive }) {
  const canvasRef    = useRef(null)
  const engineRef    = useRef(null)
  const lettersRef   = useRef([])
  const rafRef       = useRef(null)
  const isActiveRef  = useRef(isActive)
  const ctxRef       = useRef(null)

  // Sync immediately during render so keydown fires without delay
  isActiveRef.current = isActive

  // Clear all letters when leaving the Projects section
  useEffect(() => {
    if (!isActive && engineRef.current) {
      const bodies = Matter.Composite.allBodies(engineRef.current.world).filter(b => !b.isStatic)
      bodies.forEach(b => Matter.Composite.remove(engineRef.current.world, b))
      lettersRef.current = []
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

    function draw() {
      const canvas = canvasRef.current
      const ctx = ctxRef.current
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
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
    }

    function animate() {
      rafRef.current = requestAnimationFrame(animate)
      if (!isActiveRef.current) {
        const canvas = canvasRef.current
        const ctx = ctxRef.current
        if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
        return
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
      lettersRef.current = []
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`${styles.canvas} ${isActive ? styles.active : styles.hidden}`}
    />
  )
}
