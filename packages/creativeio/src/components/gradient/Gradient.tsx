import { useRef, useEffect, useMemo, type CSSProperties, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/gradient.glsl'

interface MouseState {
  x: number
  y: number
  active: boolean
}

interface GradientPlaneProps {
  mouseRef: RefObject<MouseState>
  colors: [string, string, string]
  speed: number
  mouseRadius: number
  idle: boolean
}

function GradientPlane({ mouseRef, colors, speed, mouseRadius, idle }: GradientPlaneProps) {
  const { size } = useThree()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uMouseRadius: { value: mouseRadius },
      uColorA: { value: new THREE.Color(colors[0]) },
      uColorB: { value: new THREE.Color(colors[1]) },
      uColorC: { value: new THREE.Color(colors[2]) },
    }),
    [colors, mouseRadius],
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    uniforms.uTime.value = t * speed
    uniforms.uResolution.value.set(size.width, size.height)

    const m = mouseRef.current
    if (m.active) {
      uniforms.uMouse.value.set(m.x, m.y)
    } else if (idle) {
      // Same idea as Fluid's idle drift: keep the spotlight visually alive
      // with a gentle synthetic wander whenever nobody's actually hovering.
      uniforms.uMouse.value.set(0.5 + Math.sin(t * 0.25) * 0.4, 0.5 + Math.cos(t * 0.2) * 0.4)
    } else {
      uniforms.uMouse.value.set(0.5, 0.5)
    }
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
    </mesh>
  )
}

export interface GradientProps {
  className?: string
  style?: CSSProperties
  /** Three colors: base, base-blend-target, and the mouse-spotlight accent. */
  colors?: [string, string, string]
  /** Animation speed multiplier for the ambient base gradient. */
  speed?: number
  /** Radius (in aspect-corrected UV units, ~0-1) of the glow around the pointer. */
  mouseRadius?: number
  /** Drive a gentle synthetic drift while there's no real pointer interaction. */
  idle?: boolean
}

const DEFAULT_COLORS: [string, string, string] = ['#0f0c29', '#5b21b6', '#22d3ee']

export function Gradient({
  className,
  style,
  colors = DEFAULT_COLORS,
  speed = 1,
  mouseRadius = 0.4,
  idle = true,
}: GradientProps) {
  const mouseRef = useRef<MouseState>({ x: 0.5, y: 0.5, active: false })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      mouseRef.current.x = (e.clientX - rect.left) / rect.width
      mouseRef.current.y = 1 - (e.clientY - rect.top) / rect.height
      mouseRef.current.active = true
    }
    const onLeave = () => {
      mouseRef.current.active = false
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', background: '#000', ...style }}
    >
      <Canvas
        orthographic
        camera={{ left: -1, right: 1, top: 1, bottom: -1, near: 0.1, far: 10, position: [0, 0, 5] }}
      >
        <GradientPlane mouseRef={mouseRef} colors={colors} speed={speed} mouseRadius={mouseRadius} idle={idle} />
      </Canvas>
    </div>
  )
}

export default Gradient
