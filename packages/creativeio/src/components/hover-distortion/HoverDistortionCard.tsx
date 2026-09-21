import { useRef, type CSSProperties, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useDisposableTexture } from '../../lib/useTexture'
import { usePointerTracking, MotionEnergy, type PointerState } from '../../lib/usePointer'

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/distortion.glsl'

interface DistortionPlaneProps {
  pointerRef: RefObject<PointerState>
  texture: THREE.Texture
  intensity: number
  radius: number
  ease: number
}

function DistortionPlane({ pointerRef, texture, intensity, radius, ease }: DistortionPlaneProps) {
  const { size } = useThree()
  const meshRef = useRef<THREE.Mesh>(null)
  const energy = useRef(new MotionEnergy()).current
  const lerped = useRef({ x: 0.5, y: 0.5 })

  useFrame((_state, delta) => {
    const mat = meshRef.current?.material as THREE.ShaderMaterial | undefined
    if (!mat) return

    mat.uniforms.uResolution.value.set(size.width, size.height)
    mat.uniforms.uRadius.value = radius
    mat.uniforms.uTexture.value = texture
    const img = texture.image as HTMLImageElement
    mat.uniforms.uImageSize.value.set(img.width, img.height)

    const p = pointerRef.current
    const e = energy.update(p, delta)
    // Fully flat/undistorted at rest; intensity ramps in with real pointer
    // movement and trails off (decaying energy) once it stops.
    mat.uniforms.uIntensity.value = intensity * e

    // Trailing lerp so the distortion smoothly chases the cursor/target
    // instead of snapping to it every frame.
    lerped.current.x += (p.x - lerped.current.x) * ease
    lerped.current.y += (p.y - lerped.current.y) * ease
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
  /** Strength of the displacement force while the pointer is actively moving. */
  intensity?: number
  /** Radius (aspect-corrected UV units, ~0-1) of the cursor's influence area. */
  radius?: number
  /** Lerp factor per frame (0-1). Lower = smoother/slower trailing. */
  ease?: number
}

const DEFAULT_IMAGE = 'https://picsum.photos/id/1035/1200/900'

export function HoverDistortionCard({
  className,
  style,
  image = DEFAULT_IMAGE,
  intensity = 0.5,
  radius = 0.3,
  ease = 0.1,
}: HoverDistortionCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pointerRef = usePointerTracking(containerRef)
  const texture = useDisposableTexture(image)

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
          <DistortionPlane pointerRef={pointerRef} texture={texture} intensity={intensity} radius={radius} ease={ease} />
        )}
      </Canvas>
    </div>
  )
}

export default HoverDistortionCard
