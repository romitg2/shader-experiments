import { useEffect, useRef, type RefObject } from 'react'

export interface PointerState {
  x: number
  y: number
  active: boolean
}

/**
 * Tracks pointer position (normalized 0-1, y-up) relative to a container
 * element, plus whether the pointer is currently over/down on it. Shared by
 * every component that reacts to the cursor (Fluid, Gradient,
 * HoverDistortionCard) so the DOM event wiring lives in one place.
 *
 * Returns a ref, not React state — position updates happen every
 * pointermove, far more often than a component should re-render. Consumers
 * read `.current` inside `useFrame`.
 */
export function usePointerTracking(containerRef: RefObject<HTMLElement | null>): RefObject<PointerState> {
  const stateRef = useRef<PointerState>({ x: 0.5, y: 0.5, active: false })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      stateRef.current.x = (e.clientX - rect.left) / rect.width
      stateRef.current.y = 1 - (e.clientY - rect.top) / rect.height
      stateRef.current.active = true
    }
    const onLeave = () => {
      stateRef.current.active = false
    }
    const onDown = () => {
      stateRef.current.active = true
    }
    const onUp = () => {
      stateRef.current.active = false
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointerup', onUp)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointerup', onUp)
    }
  }, [containerRef])

  return stateRef
}

/**
 * A 0-1 scalar that rises with real pointer movement speed and decays back
 * to 0 when the pointer is still or gone — call once per frame inside
 * `useFrame`. Used to gate interactive distortion/glow effects so they're
 * fully absent at rest and fade in/out like a trail around actual motion,
 * rather than snapping on for the entire duration a pointer happens to be
 * present.
 */
export class MotionEnergy {
  value = 0
  private prevX = 0.5
  private prevY = 0.5
  private hasPrev = false

  constructor(
    private gain = 12,
    private decay = 2.5,
  ) {}

  update(pointer: PointerState, delta: number): number {
    if (pointer.active && this.hasPrev) {
      const dx = pointer.x - this.prevX
      const dy = pointer.y - this.prevY
      const speed = Math.hypot(dx, dy) / Math.max(delta, 1 / 240)
      this.value = Math.min(1, this.value + speed * this.gain * delta)
    }
    this.value = Math.max(0, this.value - this.decay * delta)
    this.prevX = pointer.x
    this.prevY = pointer.y
    this.hasPrev = pointer.active
    return this.value
  }
}
