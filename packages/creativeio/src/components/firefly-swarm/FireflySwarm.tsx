import { useRef, useMemo, type CSSProperties, type RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { usePointerTracking, type PointerState } from '../../lib/usePointer'

import particleVertexShader from './shaders/particleVertex.glsl'
import particleFragmentShader from './shaders/particleFragment.glsl'

interface FireflySwarmSceneProps {
  pointerRef: RefObject<PointerState>
  count: number
  pointSize: number
  orbitRadius: number
  orbitSpeed: number
  attractRadius: number
  attractStrength: number
  color: string
}

function FireflySwarmScene({
  pointerRef,
  count,
  pointSize,
  orbitRadius,
  orbitSpeed,
  attractRadius,
  attractStrength,
  color,
}: FireflySwarmSceneProps) {
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    const homes = new Float32Array(count * 2)
    const seeds = new Float32Array(count)
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      homes[i * 2] = Math.random()
      homes[i * 2 + 1] = Math.random()
      seeds[i] = Math.random()
    }
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geom.setAttribute('aHome', new THREE.BufferAttribute(homes, 2))
    geom.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    return geom
  }, [count])

  const material = useMemo(() => {
    const c = new THREE.Color(color)
    return new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPointer: { value: new THREE.Vector2(0.5, 0.5) },
        uPointerActive: { value: 0 },
        uAttractRadius: { value: attractRadius },
        uAttractStrength: { value: attractStrength },
        uOrbitRadius: { value: orbitRadius },
        uOrbitSpeed: { value: orbitSpeed },
        uPointSize: { value: pointSize },
        uColor: { value: new THREE.Vector3(c.r, c.g, c.b) },
      },
    })
  }, [color, attractRadius, attractStrength, orbitRadius, orbitSpeed, pointSize])

  useFrame((state) => {
    const p = pointerRef.current
    material.uniforms.uTime.value = state.clock.elapsedTime
    material.uniforms.uPointer.value.set(p.x, p.y)
    material.uniforms.uPointerActive.value = p.active ? 1 : 0
  })

  return <points geometry={geometry} material={material} frustumCulled={false} />
}

export interface FireflySwarmProps {
  className?: string
  style?: CSSProperties
  /** Number of fireflies. */
  count?: number
  /** Point sprite base size in device pixels. */
  pointSize?: number
  /** Radius of each firefly's idle orbit around its home point. */
  orbitRadius?: number
  /** Idle orbit angular speed. */
  orbitSpeed?: number
  /** How close (uv distance) the cursor must be to gently draw a firefly toward it. */
  attractRadius?: number
  /** How strongly a nearby firefly's home point is pulled toward the cursor (0-1). */
  attractStrength?: number
  /** Firefly color. */
  color?: string
}

export function FireflySwarm({
  className,
  style,
  count = 90,
  pointSize = 5,
  orbitRadius = 0.02,
  orbitSpeed = 0.8,
  attractRadius = 0.3,
  attractStrength = 0.9,
  color = '#baff5c',
}: FireflySwarmProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pointerRef = usePointerTracking(containerRef)

  return (
    <div ref={containerRef} className={className} style={{ width: '100%', height: '100%', ...style }}>
      <Canvas
        orthographic
        camera={{ left: -1, right: 1, top: 1, bottom: -1, near: 0.1, far: 10, position: [0, 0, 5] }}
        gl={{ alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <FireflySwarmScene
          pointerRef={pointerRef}
          count={count}
          pointSize={pointSize}
          orbitRadius={orbitRadius}
          orbitSpeed={orbitSpeed}
          attractRadius={attractRadius}
          attractStrength={attractStrength}
          color={color}
        />
      </Canvas>
    </div>
  )
}

export default FireflySwarm
