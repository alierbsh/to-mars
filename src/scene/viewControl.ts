/**
 * The viewer's hand on the camera: drag to orbit (azimuth, elevation), wheel/pinch to zoom.
 * Scenes keep their own framing logic and read these offsets from the shared `view` object;
 * the slow automatic orbit pauses while the viewer is touching it and resumes a few seconds later.
 */
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'

export const view = {
  /** azimuth offset in radians, accumulated from drags */
  az: 0,
  /** elevation offset in radians, −0.6..1.1 */
  el: 0,
  /** distance multiplier, 0.45..3 */
  zoom: 1,
  /** performance.now() of the last drag or wheel */
  lastInput: -1e9,
  dragging: false,
}

/** true while the viewer has been idle for `quiet` seconds, so automatic motion can run */
export function autoOrbit(quiet = 6): boolean {
  return performance.now() - view.lastInput > quiet * 1000
}

/** Attaches the pointer and wheel handlers to the canvas. Render once inside the Canvas. */
export function ViewControls() {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    const el = gl.domElement
    let lastX = 0
    let lastY = 0
    let pinch = 0
    el.style.cursor = 'grab'
    el.style.touchAction = 'none'
    const down = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return
      view.dragging = true
      lastX = e.clientX
      lastY = e.clientY
      el.setPointerCapture(e.pointerId)
      el.style.cursor = 'grabbing'
    }
    const move = (e: PointerEvent) => {
      if (!view.dragging) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
      view.az -= dx * 0.006
      view.el = Math.max(-0.6, Math.min(1.1, view.el + dy * 0.005))
      view.lastInput = performance.now()
    }
    const up = (e: PointerEvent) => {
      view.dragging = false
      el.style.cursor = 'grab'
      try {
        el.releasePointerCapture(e.pointerId)
      } catch {
        /* already released */
      }
      view.lastInput = performance.now()
    }
    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      const k = Math.exp(e.deltaY * 0.0012)
      view.zoom = Math.max(0.45, Math.min(3, view.zoom * k))
      view.lastInput = performance.now()
    }
    // two-finger pinch on touch screens
    const touches = new Map<number, { x: number; y: number }>()
    const tdown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (touches.size === 2) {
        const [a, b] = [...touches.values()]
        pinch = Math.hypot(a.x - b.x, a.y - b.y)
      }
    }
    const tmove = (e: PointerEvent) => {
      if (e.pointerType !== 'touch' || !touches.has(e.pointerId)) return
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (touches.size === 2 && pinch > 0) {
        const [a, b] = [...touches.values()]
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        view.zoom = Math.max(0.45, Math.min(3, view.zoom * (pinch / Math.max(d, 1))))
        pinch = d
        view.dragging = false
        view.lastInput = performance.now()
      }
    }
    const tup = (e: PointerEvent) => {
      touches.delete(e.pointerId)
      if (touches.size < 2) pinch = 0
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointerdown', tdown)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointermove', tmove)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointerup', tup)
    window.addEventListener('pointercancel', up)
    el.addEventListener('wheel', wheel, { passive: false })
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointerdown', tdown)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointermove', tmove)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointerup', tup)
      window.removeEventListener('pointercancel', up)
      el.removeEventListener('wheel', wheel)
    }
  }, [gl])
  return null
}
