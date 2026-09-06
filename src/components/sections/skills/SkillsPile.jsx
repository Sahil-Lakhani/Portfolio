import { useCallback, useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'
import { STACK, PROJECT_IDS } from './stack'
import { isTouchDevice } from '../../../utils/isTouchDevice'
import useShakeGravity from '../../../hooks/useShakeGravity'
import styles from './SkillsPile.module.css'

/*
 * Physics pile for the Skills section. Adapted from the shelved
 * _experiments/FallingLetters component — the engine setup, boundary walls and
 * wormhole reset come from there. Three things differ:
 *
 *  1. Tiles are word-width (measured from the text) rather than fixed squares,
 *     so DJANGO REST is a slab and SQL is a stub. That is what makes it read as
 *     a stack instead of a brick wall.
 *  2. Skills is a WHITE section, so the tiles invert — cream fill, black
 *     border, black type — matching the .pillLg they replace.
 *  3. It sizes to its own container, not the window, and the RAF is genuinely
 *     cancelled when the section is inactive. All five sections stay mounted
 *     and are only faded with opacity, so a loop left running here would burn
 *     frames on every other section.
 */

const RADIUS       = 3
const GRAVITY      = 1.6
const SPAWN_STAGGER = 55       // ms between tile drops (~2.3s for the full stack)
const CLICK_SLOP   = 6         // px of movement still counted as a click, not a drag

// Tile type scales with the container, not the viewport — a 32px tile that
// looks right on a desktop pile is unreadable clutter in a phone-width one.
//
// Width picks the base size. Height then caps it: the settled pile is roughly
// (total tile area) / (packing density x container width), and total tile area
// scales with the SQUARE of the type size — so a short container overflows at
// a size a tall one handles comfortably. Solving that for the size which keeps
// the pile under ~80% of the container height gives the cap below. AREA_K is
// fitted from measurement: 42 tiles at size 31 in a 620px-wide container
// settle to about 537px.
const AREA_K = 346
const PILE_TARGET = 0.8

function metricsFor(w, h) {
  const base = w < 560 ? { size: 21, tileH: 42, padX: 16 }
             : w < 900 ? { size: 31, tileH: 60, padX: 24 }
             :           { size: 32, tileH: 58, padX: 25 }
  if (!h) return base

  const fits = Math.floor(Math.sqrt((PILE_TARGET * h * w) / AREA_K))
  const size = Math.max(11, Math.min(base.size, fits))
  if (size === base.size) return base

  const k = size / base.size
  return { size, tileH: Math.round(base.tileH * k), padX: Math.round(base.padX * k) }
}

// Per-entry size multiplier. Mixed sizes let small pieces fall into the gaps
// between big ones, which settles into a heap rather than a brick wall — and
// it implies importance without printing a rating anywhere.
const WEIGHT_SCALE = { core: 1, tool: 0.78, aside: 0.62 }

const LINK_IDLE = 'rgba(8, 8, 8, 0.07)'
const LINK_HOT  = 'rgba(255, 60, 0, 0.55)'

const fontOf = (size) => `${size}px "Bebas Neue", "Space Mono", monospace`

const CREAM = '#f0ede6'
const INK   = '#080808'
const RED   = '#ff3c00'

export default function SkillsPile({ isActive, selectedId, onSelect }) {
  const wrapRef      = useRef(null)
  const canvasRef    = useRef(null)
  const ctxRef       = useRef(null)
  const engineRef    = useRef(null)
  const tilesRef     = useRef([])          // { body, entry, w, h }
  const suckRef      = useRef([])          // tiles in wormhole shrink phase
  const suckActive   = useRef(false)
  const wormholeRef  = useRef({ x: 0, y: 0 })
  const rafRef       = useRef(null)
  const timersRef    = useRef([])
  const sizeRef      = useRef({ w: 0, h: 0 })
  const metricsRef   = useRef(metricsFor(1200, 560))
  const boundsRef    = useRef([])
  const activeRef    = useRef(isActive)
  const selectedRef  = useRef(selectedId)
  const resetRef     = useRef(null)
  const [settled, setSettled] = useState(false)
  const [hintDone, setHintDone] = useState(false)

  // Motion is a phone affordance only: there is no sensor on a laptop, and
  // someone who asked for reduced motion did not ask for this.
  const motionWanted =
    isActive &&
    isTouchDevice() &&
    typeof window !== 'undefined' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const handleTilt = useCallback((x, y) => engineRef.current?.__tilt?.(x, y), [])
  const handleShake = useCallback((power) => engineRef.current?.__shake?.(power), [])

  const { status: motionStatus, request: requestMotion } = useShakeGravity({
    enabled: motionWanted,
    onTilt: handleTilt,
    onShake: handleShake,
  })

  // The hint is discovery, not decoration — nobody guesses the pile responds to
  // being shaken. It says its piece once and then gets out of the way.
  useEffect(() => {
    if (motionStatus !== 'granted' || !motionWanted || hintDone) return
    const t = setTimeout(() => setHintDone(true), 4200)
    return () => clearTimeout(t)
  }, [motionStatus, motionWanted, hintDone])

  // Mirrored into refs so the RAF loop and the fonts.ready callback can read
  // current values without being torn down and rebuilt on every change.
  // Declared before the setup effect so they are already correct on mount.
  useEffect(() => { activeRef.current = isActive }, [isActive])
  useEffect(() => { selectedRef.current = selectedId }, [selectedId])

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return

    let disposed = false

    // ── canvas sizing ────────────────────────────────────────────────
    // Polled from the top of every frame rather than driven by a
    // ResizeObserver. RO callbacks are only delivered during the rendering
    // steps, so a backgrounded or otherwise non-rendering tab can leave the
    // canvas stale against its container. Comparing two integers per frame
    // costs nothing and self-heals from any cause — including the container
    // changing size while the section was inactive and the loop stopped.
    // Returns true if the canvas actually changed.
    function syncSize() {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      if (!w || !h) return false
      const cur = sizeRef.current
      if (cur.w === w && cur.h === h) return false

      const prevTypeSize = metricsRef.current.size
      const dpr = window.devicePixelRatio || 1
      sizeRef.current = { w, h }
      metricsRef.current = metricsFor(w, h)
      canvas.width  = w * dpr
      canvas.height = h * dpr
      canvas.style.width  = w + 'px'
      canvas.style.height = h + 'px'
      const ctx = canvas.getContext('2d')
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
      ctxRef.current = ctx
      if (engineRef.current) rebuildWalls()

      // Tile bodies are built at a fixed type size. If the size tier changed,
      // every existing body is now the wrong shape for its label, so the pile
      // has to be rebuilt rather than rescaled.
      if (metricsRef.current.size !== prevTypeSize && tilesRef.current.length > 0) {
        clearTimers()
        clearTiles()
        dropAll()
        return true
      }

      // Shrinking the container raises the floor and narrows the walls. Any
      // body that was resting in the area that just disappeared is now outside
      // the world and never comes back on its own — it simply stops being
      // drawn. Clamp everything back inside instead, which keeps the settled
      // pile rather than resetting it on every rotation or resize.
      for (const t of tilesRef.current) {
        const halfW = t.w / 2
        const halfH = t.h / 2
        const p = t.body.position
        const x = Math.min(Math.max(p.x, halfW + 2), w - halfW - 2)
        const y = Math.min(p.y, h - halfH - 2)
        if (x !== p.x || y !== p.y) {
          Matter.Body.setPosition(t.body, { x, y })
          Matter.Body.setVelocity(t.body, { x: 0, y: 0 })
        }
      }
      return true
    }

    function rebuildWalls() {
      const engine = engineRef.current
      const { w, h } = sizeRef.current
      boundsRef.current.forEach(b => Matter.Composite.remove(engine.world, b))
      const floor = Matter.Bodies.rectangle(w / 2, h + 25, w + 200, 50, { isStatic: true })
      const left  = Matter.Bodies.rectangle(-25, h / 2, 50, h * 4, { isStatic: true })
      const right = Matter.Bodies.rectangle(w + 25, h / 2, 50, h * 4, { isStatic: true })
      boundsRef.current = [floor, left, right]
      Matter.Composite.add(engine.world, boundsRef.current)
    }

    syncSize()

    const engine = Matter.Engine.create({ gravity: { x: 0, y: GRAVITY } })
    engineRef.current = engine
    rebuildWalls()

    // ── drag ─────────────────────────────────────────────────────────
    // Touch included. Matter binds its own touch handlers, but they only get
    // the gesture if the compositor hasn't already claimed it for panning —
    // hence touch-action: none on the canvas, and data-no-nav so a throw
    // isn't also read as a swipe to the next section.
    let mouseConstraint = null
    {
      const mouse = Matter.Mouse.create(canvas)
      mouse.pixelRatio = window.devicePixelRatio || 1
      mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.2, damping: 0.1 },
      })
      Matter.Composite.add(engine.world, mouseConstraint)
      // Matter binds wheel by default and would swallow section scrolling.
      mouse.element.removeEventListener('wheel', mouse.mousewheel)
    }

    // ── tile construction ────────────────────────────────────────────
    function measure(entry) {
      const ctx = ctxRef.current
      const m = metricsRef.current
      const k = WEIGHT_SCALE[entry.weight] ?? 1
      let size = Math.round(m.size * k)
      let padX = Math.round(m.padX * k)
      ctx.font = fontOf(size)
      let w = Math.ceil(ctx.measureText(entry.label).width) + padX * 2

      // A long label in a narrow container (WORKS ON MY MACHINE on a phone)
      // would build a body wider than the walls it has to fall between, which
      // wedges it. Shrink the type until the tile fits instead.
      const maxW = sizeRef.current.w - 16
      if (maxW > 0 && w > maxW) {
        size = Math.max(9, Math.floor(size * (maxW / w)))
        padX = Math.round(padX * (maxW / w))
        ctx.font = fontOf(size)
        w = Math.min(maxW, Math.ceil(ctx.measureText(entry.label).width) + padX * 2)
      }
      return { w, h: Math.round(m.tileH * k), size }
    }

    function spawn(entry) {
      if (disposed || suckActive.current) return
      const { w: W } = sizeRef.current
      const { w, h, size } = measure(entry)
      const x = Math.min(Math.max(w / 2 + 8, Math.random() * W), W - w / 2 - 8)
      const body = Matter.Bodies.rectangle(x, -h, w, h, {
        restitution: 0.18,
        friction: 0.55,
        frictionAir: 0.012,
        angle: (Math.random() - 0.5) * 0.35,
      })
      Matter.Composite.add(engine.world, body)
      tilesRef.current.push({ body, entry, w, h, size })
    }

    function dropAll() {
      clearTimers()
      STACK.forEach((entry, i) => {
        timersRef.current.push(setTimeout(() => spawn(entry), i * SPAWN_STAGGER))
      })
      timersRef.current.push(
        setTimeout(() => !disposed && setSettled(true), STACK.length * SPAWN_STAGGER + 400)
      )
    }

    function clearTimers() {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }

    function clearTiles() {
      tilesRef.current.forEach(({ body }) => Matter.Composite.remove(engine.world, body))
      tilesRef.current = []
      suckRef.current = []
      suckActive.current = false
      engine.gravity.y = GRAVITY
      setSettled(false)
    }

    // ── wormhole reset (from FallingLetters) ─────────────────────────
    resetRef.current = () => {
      if (suckActive.current || tilesRef.current.length === 0) return
      const { w, h } = sizeRef.current
      wormholeRef.current = { x: w / 2, y: h / 2 }
      engine.gravity.y = 0
      suckActive.current = true
      setSettled(false)
      onSelect?.(null)
    }

    // ── drawing ──────────────────────────────────────────────────────
    function roundedRect(ctx, x, y, w, h, r) {
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.arcTo(x + w, y, x + w, y + h, r)
      ctx.arcTo(x + w, y + h, x, y + h, r)
      ctx.arcTo(x, y + h, x, y, r)
      ctx.arcTo(x, y, x + w, y, r)
      ctx.closePath()
    }

    function drawTile(ctx, label, w, h, size, isSel, alpha = 1, scale = 1) {
      ctx.globalAlpha = alpha
      ctx.scale(scale, scale)
      roundedRect(ctx, -w / 2, -h / 2, w, h, RADIUS)
      ctx.fillStyle = isSel ? RED : CREAM
      ctx.fill()
      ctx.strokeStyle = isSel ? RED : INK
      ctx.lineWidth = 1.25
      ctx.stroke()
      ctx.fillStyle = isSel ? CREAM : INK
      ctx.font = fontOf(size)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(label, 0, 2)
    }

    function drawWormhole(ctx, x, y) {
      const t = Date.now() * 0.004
      const grd = ctx.createRadialGradient(x, y, 4, x, y, 110)
      grd.addColorStop(0, 'rgba(255, 60, 0, 0.5)')
      grd.addColorStop(0.45, 'rgba(255, 60, 0, 0.12)')
      grd.addColorStop(1, 'rgba(255, 60, 0, 0)')
      ctx.beginPath()
      ctx.arc(x, y, 110, 0, Math.PI * 2)
      ctx.fillStyle = grd
      ctx.fill()
      for (let i = 5; i >= 1; i--) {
        const r = i * 10 + Math.sin(t * 1.5 + i) * 3
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.strokeStyle = i % 2 === 0
          ? `rgba(8, 8, 8, ${0.16 * (i / 5)})`
          : `rgba(255, 60, 0, ${0.24 * (i / 5)})`
        ctx.lineWidth = i === 5 ? 1 : 2
        ctx.stroke()
      }
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
      ctx.beginPath()
      ctx.arc(x, y, 13, 0, Math.PI * 2)
      ctx.fillStyle = INK
      ctx.fill()
    }

    // Constellation: tiles that shipped in the same project get linked.
    // Drawn as one polyline per project through its members sorted by x —
    // n-1 segments rather than the n(n-1)/2 an all-pairs mesh would give,
    // which is the difference between a constellation and spaghetti.
    // Selecting a tile lights every project it belongs to.
    function drawLinks(ctx) {
      const sel = selectedRef.current
      const selProjects = sel
        ? (STACK.find(s => s.id === sel)?.projects ?? [])
        : []

      for (const proj of PROJECT_IDS) {
        const members = tilesRef.current.filter(t => t.entry.projects?.includes(proj))
        if (members.length < 2) continue
        members.sort((a, b) => a.body.position.x - b.body.position.x)

        const hot = selProjects.includes(proj)
        ctx.beginPath()
        ctx.moveTo(members[0].body.position.x, members[0].body.position.y)
        for (let i = 1; i < members.length; i++) {
          ctx.lineTo(members[i].body.position.x, members[i].body.position.y)
        }
        ctx.strokeStyle = hot ? LINK_HOT : LINK_IDLE
        ctx.lineWidth = hot ? 1.5 : 1
        ctx.stroke()

        // Small node dot at each junction, so a link reads as deliberate
        // rather than as a stray stroke passing behind the tiles.
        if (hot) {
          for (const m of members) {
            ctx.beginPath()
            ctx.arc(m.body.position.x, m.body.position.y, 2.5, 0, Math.PI * 2)
            ctx.fillStyle = LINK_HOT
            ctx.fill()
          }
        }
      }
    }

    function draw() {
      const ctx = ctxRef.current
      const { w, h } = sizeRef.current
      if (!ctx) return
      ctx.clearRect(0, 0, w, h)

      // Behind the tiles, so links appear to pass under the pile.
      if (!suckActive.current) drawLinks(ctx)

      if (suckActive.current || suckRef.current.length > 0) {
        drawWormhole(ctx, wormholeRef.current.x, wormholeRef.current.y)
      }

      tilesRef.current.forEach(({ body, entry, w: tw, h: th, size }) => {
        ctx.save()
        ctx.translate(body.position.x, body.position.y)
        ctx.rotate(body.angle)
        drawTile(ctx, entry.label, tw, th, size, entry.id === selectedRef.current)
        ctx.restore()
      })

      const { x: wx, y: wy } = wormholeRef.current
      const alive = []
      suckRef.current.forEach(item => {
        item.x += (wx - item.x) * 0.22
        item.y += (wy - item.y) * 0.22
        item.scale *= 0.82
        item.alpha -= 0.06
        if (item.alpha <= 0 || item.scale < 0.02) return
        ctx.save()
        ctx.translate(item.x, item.y)
        drawTile(ctx, item.label, item.w, item.h, item.size, false, Math.max(0, item.alpha), item.scale)
        ctx.restore()
        alive.push(item)
      })
      suckRef.current = alive
    }

    // ── loop — started and stopped by the isActive effect below ──────
    function frame() {
      if (disposed) return
      rafRef.current = requestAnimationFrame(frame)
      syncSize()

      if (suckActive.current && tilesRef.current.length > 0) {
        const { x: wx, y: wy } = wormholeRef.current
        const remaining = []
        tilesRef.current.forEach(t => {
          const dx = wx - t.body.position.x
          const dy = wy - t.body.position.y
          const dist = Math.hypot(dx, dy) || 1
          if (dist < 40) {
            Matter.Composite.remove(engine.world, t.body)
            suckRef.current.push({
              x: t.body.position.x, y: t.body.position.y,
              label: t.entry.label, w: t.w, h: t.h, size: t.size, scale: 1, alpha: 1,
            })
          } else {
            const speed = Math.min(80, 1400 / dist)
            Matter.Body.setVelocity(t.body, {
              x: t.body.velocity.x * 0.35 + (dx / dist) * speed * 1.5,
              y: t.body.velocity.y * 0.35 + (dy / dist) * speed * 1.5,
            })
            remaining.push(t)
          }
        })
        tilesRef.current = remaining
        if (remaining.length === 0) {
          suckActive.current = false
          engine.gravity.y = GRAVITY
          dropAll()
        }
      }

      Matter.Engine.update(engine, 1000 / 60)
      draw()
    }

    // expose loop control to the isActive effect
    engineRef.current.__start = () => {
      if (rafRef.current == null) frame()
    }
    engineRef.current.__stop = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      const ctx = ctxRef.current
      if (ctx) ctx.clearRect(0, 0, sizeRef.current.w, sizeRef.current.h)
    }
    engineRef.current.__drop = dropAll
    engineRef.current.__clear = () => { clearTimers(); clearTiles() }

    // ── device motion ────────────────────────────────────────────────
    // Both bail while the wormhole is running: that animation drives the
    // bodies itself and having gravity fight it looks like a glitch.
    engineRef.current.__tilt = (x, y) => {
      if (suckActive.current) return
      engine.gravity.x = x * GRAVITY
      engine.gravity.y = y * GRAVITY
    }

    engineRef.current.__shake = (power) => {
      if (suckActive.current) return
      tilesRef.current.forEach(({ body }) => {
        // Biased upward — a shake should throw the pile off the floor, and an
        // evenly random direction mostly just presses it down again.
        Matter.Body.setVelocity(body, {
          x: (Math.random() - 0.5) * 22 * power,
          y: (Math.random() * -1.1 - 0.25) * 14 * power,
        })
        Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.5 * power)
      })
      setSettled(true)
    }

    // ── tap / click to reveal ────────────────────────────────────────
    let downAt = null
    const onDown = (e) => {
      downAt = { x: e.clientX, y: e.clientY }
    }
    const onUp = (e) => {
      if (!downAt) return
      const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y)
      downAt = null
      if (moved > CLICK_SLOP) return               // that was a drag
      const r = canvas.getBoundingClientRect()
      const p = { x: e.clientX - r.left, y: e.clientY - r.top }
      const hit = Matter.Query.point(tilesRef.current.map(t => t.body), p)[0]
      if (!hit) { onSelect?.(null); return }
      const tile = tilesRef.current.find(t => t.body === hit)
      if (!tile) return
      onSelect?.(tile.entry.id === selectedRef.current ? null : tile.entry.id)
    }
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointerup', onUp)

    // Fonts must be loaded before measureText, or every tile is sized wrong.
    let started = false
    document.fonts.ready.then(() => {
      if (disposed) return
      started = true
      if (activeRef.current) { dropAll(); engineRef.current.__start() }
    })

    return () => {
      disposed = true
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      clearTimers()
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerup', onUp)
      if (mouseConstraint) {
        mouseConstraint.mouse.element.removeEventListener('mousemove', mouseConstraint.mouse.mousemove)
        mouseConstraint.mouse.element.removeEventListener('mousedown', mouseConstraint.mouse.mousedown)
        mouseConstraint.mouse.element.removeEventListener('mouseup', mouseConstraint.mouse.mouseup)
        mouseConstraint.mouse.element.removeEventListener('touchmove', mouseConstraint.mouse.mousemove)
        mouseConstraint.mouse.element.removeEventListener('touchstart', mouseConstraint.mouse.mousedown)
        mouseConstraint.mouse.element.removeEventListener('touchend', mouseConstraint.mouse.mouseup)
      }
      Matter.World.clear(engine.world, false)
      Matter.Engine.clear(engine)
      tilesRef.current = []
      suckRef.current = []
      void started
    }
  }, [onSelect])

  // Start/stop the simulation with section visibility. Every section stays
  // mounted, so this is what keeps the loop off the other four.
  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return
    if (isActive) {
      if (tilesRef.current.length === 0) engine.__drop?.()
      engine.__start?.()
    } else {
      engine.__stop?.()
      engine.__clear?.()
      onSelect?.(null)
    }
  }, [isActive, onSelect])

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <canvas ref={canvasRef} className={styles.canvas} data-no-nav />
      {isActive && settled && (
        <button
          type="button"
          className={styles.reset}
          onClick={() => resetRef.current?.()}
        >
          RESET PILE
        </button>
      )}

      {/* Nothing is rendered when motion is unavailable or refused — an inert
          button for a feature that cannot work is worse than no button. */}
      {motionWanted && motionStatus === 'prompt' && (
        <button
          type="button"
          className={styles.motionBtn}
          onClick={requestMotion}
        >
          ENABLE MOTION
        </button>
      )}

      {motionWanted && motionStatus === 'granted' && !hintDone && (
        <p className={styles.motionHint}>SHAKE THE PHONE</p>
      )}
    </div>
  )
}
