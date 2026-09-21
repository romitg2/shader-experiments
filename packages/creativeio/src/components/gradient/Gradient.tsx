import { useRef, type CSSProperties, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { usePointerTracking, MotionEnergy, type PointerState } from '../../lib/usePointer'

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/gradient.glsl'

interface GradientPlaneProps {
  pointerRef: RefObject<PointerState>
  colors: [string, string, string]
  speed: number
  mouseRadius: number
}

function GradientPlane({ pointerRef, colors, speed, mouseRadius }: GradientPlaneProps) {
  const { size } = useThree()
  const meshRef = useRef<THREE.Mesh>(null)
  const energy = useRef(new MotionEnergy()).current
  const lerped = useRef({ x: 0.5, y: 0.5 })

  useFrame((state, delta) => {
    const mat = meshRef.current?.material as THREE.ShaderMaterial | undefined
    if (!mat) return

    const t = state.clock.elapsedTime
    mat.uniforms.uTime.value = t * speed
    mat.uniforms.uResolution.value.set(size.width, size.height)
    mat.uniforms.uMouseRadius.value = mouseRadius
    mat.uniforms.uColorA.value.set(colors[0])
    mat.uniforms.uColorB.value.set(colors[1])
    mat.uniforms.uColorC.value.set(colors[2])

    const p = pointerRef.current
    const e = energy.update(p, delta)
    mat.uniforms.uEnergy.value = e

    // Trailing lerp: the spotlight chases the pointer smoothly rather than
    // snapping to it, so it reads as dragging behind real motion.
    lerped.current.x += (p.x - lerped.current.x) * 0.15
    lerped.current.y += (p.y - lerped.current.y) * 0.15
    mat.uniforms.uMouse.value.set(lerped.current.x, lerped.current.y)
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uResolution: { value: new THREE.Vector2(1, 1) },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uMouseRadius: { value: mouseRadius },
          uEnergy: { value: 0 },
          uColorA: { value: new THREE.Color(colors[0]) },
          uColorB: { value: new THREE.Color(colors[1]) },
          uColorC: { value: new THREE.Color(colors[2]) },
        }}
      />
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
}

const DEFAULT_COLORS: [string, string, string] = ['#0f0c29', '#5b21b6', '#22d3ee']

export function Gradient({ className, style, colors = DEFAULT_COLORS, speed = 1, mouseRadius = 0.4 }: GradientProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pointerRef = usePointerTracking(containerRef)

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
        <GradientPlane pointerRef={pointerRef} colors={colors} speed={speed} mouseRadius={mouseRadius} />
      </Canvas>
    </div>
  )
}

export default Gradient
