import { useRef, useEffect, type CSSProperties, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useDisposableTexture } from '../../lib/useTexture'

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/distortion.glsl'

interface MouseState {
  x: number
  y: number
  active: boolean
}

interface DistortionPlaneProps {
  mouseRef: RefObject<MouseState>
  texture: THREE.Texture
  intensity: number
  radius: number
  ease: number
  idle: boolean
}

function DistortionPlane({ mouseRef, texture, intensity, radius, ease, idle }: DistortionPlaneProps) {
  const { size } = useThree()
  const meshRef = useRef<THREE.Mesh>(null)
  const lerped = useRef({ x: 0.5, y: 0.5 })

  useFrame((state) => {
    const mat = meshRef.current?.material as THREE.ShaderMaterial | undefined
    if (!mat) return

    mat.uniforms.uResolution.value.set(size.width, size.height)
    mat.uniforms.uIntensity.value = intensity
    mat.uniforms.uRadius.value = radius
    mat.uniforms.uTexture.value = texture
    const img = texture.image as HTMLImageElement
    mat.uniforms.uImageSize.value.set(img.width, img.height)

    const m = mouseRef.current
    let targetX = m.x
    let targetY = m.y
    if (!m.active && idle) {
      const t = state.clock.elapsedTime
      targetX = 0.5 + Math.sin(t * 0.3) * 0.3
      targetY = 0.5 + Math.cos(t * 0.24) * 0.3
    } else if (!m.active) {
      targetX = 0.5
      targetY = 0.5
    }

    // Trailing lerp so the distortion smoothly chases the cursor/target
    // instead of snapping to it every frame.
    lerped.current.x += (targetX - lerped.current.x) * ease
    lerped.current.y += (targetY - lerped.current.y) * ease
    mat.uniforms.uMouse.value.set(lerped.current.x, lerped.current.y)
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTexture: { value: null },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uIntensity: { value: 0 },
          uRadius: { value: 0 },
          uResolution: { value: new THREE.Vector2(1, 1) },
          uImageSize: { value: new THREE.Vector2(1, 1) },
        }}
      />
    </mesh>
  )
}

export interface HoverDistortionCardProps {
  className?: string
  style?: CSSProperties
  image?: string
  /** Strength of the displacement force. */
  intensity?: number
  /** Radius (aspect-corrected UV units, ~0-1) of the cursor's influence area. */
  radius?: number
  /** Lerp factor per frame (0-1). Lower = smoother/slower trailing. */
  ease?: number
  /** Drive a gentle synthetic drift while there's no real pointer interaction. */
  idle?: boolean
}

const DEFAULT_IMAGE = 'https://picsum.photos/id/1035/1200/900'

export function HoverDistortionCard({
  className,
  style,
  image = DEFAULT_IMAGE,
  intensity = 0.5,
  radius = 0.3,
  ease = 0.1,
  idle = true,
}: HoverDistortionCardProps) {
  const mouseRef = useRef<MouseState>({ x: 0.5, y: 0.5, active: false })
  const containerRef = useRef<HTMLDivElement>(null)
  const texture = useDisposableTexture(image)

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
      style={{ width: '100%', height: '100%', background: '#000', overflow: 'hidden', ...style }}
    >
      <Canvas
        orthographic
        camera={{ left: -1, right: 1, top: 1, bottom: -1, near: 0.1, far: 10, position: [0, 0, 5] }}
      >
        {texture && (
          <DistortionPlane mouseRef={mouseRef} texture={texture} intensity={intensity} radius={radius} ease={ease} idle={idle} />
        )}
      </Canvas>
    </div>
  )
}

export default HoverDistortionCard
