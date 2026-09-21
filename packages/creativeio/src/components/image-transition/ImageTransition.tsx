import { useRef, type CSSProperties } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useDisposableTexture } from '../../lib/useTexture'

import vertexShader from './shaders/vertex.glsl'
import rippleShader from './shaders/ripple.glsl'
import pixelateShader from './shaders/pixelate.glsl'
import liquidGridShader from './shaders/liquidGrid.glsl'

export type ImageTransitionEffect = 'ripple' | 'pixelate' | 'liquidGrid'

const EFFECT_SHADERS: Record<ImageTransitionEffect, string> = {
  ripple: rippleShader,
  pixelate: pixelateShader,
  liquidGrid: liquidGridShader,
}

interface TransitionPlaneProps {
  texture1: THREE.Texture
  texture2: THREE.Texture
  effect: ImageTransitionEffect
  progress?: number
  speed: number
}

function TransitionPlane({ texture1, texture2, effect, progress, speed }: TransitionPlaneProps) {
  const { size } = useThree()
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const mat = meshRef.current?.material as THREE.ShaderMaterial | undefined
    if (!mat) return

    const t = state.clock.elapsedTime
    mat.uniforms.uTime.value = t
    mat.uniforms.uSpeed.value = speed
    mat.uniforms.uResolution.value.set(size.width, size.height)
    mat.uniforms.uTexture1.value = texture1
    mat.uniforms.uTexture2.value = texture2
    const img1 = texture1.image as HTMLImageElement
    const img2 = texture2.image as HTMLImageElement
    mat.uniforms.uImageSize1.value.set(img1.width, img1.height)
    mat.uniforms.uImageSize2.value.set(img2.width, img2.height)

    if (progress !== undefined) {
      // Controlled: caller drives the transition (e.g. on scroll or hover).
      mat.uniforms.uProgress.value = progress
      return
    }

    // Uncontrolled: ping-pong between the two images on its own, same idea
    // as Fluid/Gradient's idle drift — a component you can drop in with zero
    // required props and it's already alive.
    mat.uniforms.uProgress.value = (Math.sin(t * speed * 0.4) + 1) / 2
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={EFFECT_SHADERS[effect]}
        uniforms={{
          uTexture1: { value: null },
          uTexture2: { value: null },
          uProgress: { value: 0 },
          uTime: { value: 0 },
          uSpeed: { value: 1 },
          uResolution: { value: new THREE.Vector2(1, 1) },
          uImageSize1: { value: new THREE.Vector2(1, 1) },
          uImageSize2: { value: new THREE.Vector2(1, 1) },
        }}
      />
    </mesh>
  )
}

export interface WebGLImageTransitionProps {
  className?: string
  style?: CSSProperties
  image1?: string
  image2?: string
  effect?: ImageTransitionEffect
  /** 0-1. Omit to let it auto-animate on its own (uncontrolled/idle mode). */
  progress?: number
  /** Ripple frequency / distortion rate / auto-play speed multiplier. */
  speed?: number
  /** Aspect ratio the canvas frame maintains (CSS `aspect-ratio`), e.g. 16/9. */
  aspectRatio?: number
}

const DEFAULT_IMAGE_1 = 'https://picsum.photos/id/1018/1200/900'
const DEFAULT_IMAGE_2 = 'https://picsum.photos/id/1025/1200/900'

export function WebGLImageTransition({
  className,
  style,
  image1 = DEFAULT_IMAGE_1,
  image2 = DEFAULT_IMAGE_2,
  effect = 'ripple',
  progress,
  speed = 1,
  aspectRatio = 16 / 9,
}: WebGLImageTransitionProps) {
  const texture1 = useDisposableTexture(image1)
  const texture2 = useDisposableTexture(image2)

  return (
    <div
      className={className}
      style={{ width: '100%', height: '100%', background: '#000', aspectRatio: String(aspectRatio), ...style }}
    >
      <Canvas
        orthographic
        camera={{ left: -1, right: 1, top: 1, bottom: -1, near: 0.1, far: 10, position: [0, 0, 5] }}
      >
        {texture1 && texture2 && (
          <TransitionPlane texture1={texture1} texture2={texture2} effect={effect} progress={progress} speed={speed} />
        )}
      </Canvas>
    </div>
  )
}

export default WebGLImageTransition
