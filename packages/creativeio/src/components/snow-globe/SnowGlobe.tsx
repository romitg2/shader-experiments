import { useRef, useMemo, useEffect, type CSSProperties, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { blit } from '../../lib/blit'
import { usePointerTracking, type PointerState, MotionEnergy } from '../../lib/usePointer'

import vertexShader from './shaders/vertex.glsl'
import seedShader from './shaders/seed.glsl'
import particleUpdateShader from './shaders/particleUpdate.glsl'
import particleVertexShader from './shaders/particleVertex.glsl'
import particleFragmentShader from './shaders/particleFragment.glsl'

interface SnowGlobeSimProps {
  pointerRef: RefObject<PointerState>
  particleTexSize: number
  pointSize: number
  gravity: number
  drag: number
  floorY: number
  kickRadius: number
  kickStrength: number
  color: string
}

function SnowGlobeSim({
  pointerRef,
  particleTexSize,
  pointSize,
  gravity,
  drag,
  floorY,
  kickRadius,
  kickStrength,
  color,
}: SnowGlobeSimProps) {
  const { gl } = useThree()

  const simScene = useMemo(() => new THREE.Scene(), [])
  const simCamera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), [])
  const quadGeom = useMemo(() => new THREE.PlaneGeometry(2, 2), [])

  // Particle state IS the whole simulation here - no separate fluid
  // velocity field to advect through, just position+velocity ping-ponged
  // directly by particleUpdate.glsl every frame.
  const state = useMemo(() => {
    const params = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: false,
    }
    return {
      read: new THREE.WebGLRenderTarget(particleTexSize, particleTexSize, params),
      write: new THREE.WebGLRenderTarget(particleTexSize, particleTexSize, params),
      swap(this: { read: THREE.WebGLRenderTarget; write: THREE.WebGLRenderTarget }) {
        const t = this.read
        this.read = this.write
        this.write = t
      },
    }
  }, [particleTexSize])

  const seedMat = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader, fragmentShader: seedShader, uniforms: {} }),
    [],
  )

  const updateMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: particleUpdateShader,
        uniforms: {
          uState: { value: null },
          uPointer: { value: new THREE.Vector2(0.5, 0.5) },
          uKick: { value: 0 },
          uDt: { value: 0.016 },
          uGravity: { value: gravity },
          uDrag: { value: drag },
          uFloorY: { value: floorY },
          uKickRadius: { value: kickRadius },
          uKickStrength: { value: kickStrength },
        },
      }),
    [gravity, drag, floorY, kickRadius, kickStrength],
  )

  const quadMesh = useMemo(() => {
    const mesh = new THREE.Mesh(quadGeom, seedMat)
    simScene.add(mesh)
    return mesh
  }, [quadGeom, seedMat, simScene])

  const seeded = useRef(false)
  useEffect(() => {
    if (seeded.current) return
    blit(gl, simScene, simCamera, quadMesh, seedMat, state.read)
    seeded.current = true
  }, [gl, simScene, simCamera, quadMesh, seedMat, state])

  const pointsGeometry = useMemo(() => {
    const count = particleTexSize * particleTexSize
    const geom = new THREE.BufferGeometry()
    const indices = new Float32Array(count)
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) indices[i] = i
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geom.setAttribute('aIndex', new THREE.BufferAttribute(indices, 1))
    return geom
  }, [particleTexSize])

  const pointsMaterial = useMemo(() => {
    const c = new THREE.Color(color)
    return new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uState: { value: null },
        uParticleTexSize: { value: new THREE.Vector2(particleTexSize, particleTexSize) },
        uPointSize: { value: pointSize },
        uColor: { value: new THREE.Vector3(c.r, c.g, c.b) },
        uTime: { value: 0 },
      },
    })
  }, [particleTexSize, pointSize, color])

  const motionEnergyRef = useRef<MotionEnergy | null>(null)
  if (!motionEnergyRef.current) motionEnergyRef.current = new MotionEnergy()

  useFrame((frameState, delta) => {
    const p = pointerRef.current
    const dt = Math.min(delta, 0.033)
    const energy = motionEnergyRef.current!.update(p, dt)

    updateMat.uniforms.uState.value = state.read.texture
    updateMat.uniforms.uPointer.value.set(p.x, p.y)
    updateMat.uniforms.uKick.value = p.active ? energy : 0
    updateMat.uniforms.uDt.value = dt
    blit(gl, simScene, simCamera, quadMesh, updateMat, state.write)
    state.swap()

    gl.setRenderTarget(null)

    pointsMaterial.uniforms.uState.value = state.read.texture
    pointsMaterial.uniforms.uTime.value = frameState.clock.elapsedTime
  })

  return <points geometry={pointsGeometry} material={pointsMaterial} frustumCulled={false} />
}

export interface SnowGlobeProps {
  className?: string
  style?: CSSProperties
  /** Particle pool is this value squared. */
  particleTexSize?: number
  /** Point sprite size in device pixels. */
  pointSize?: number
  /** Downward acceleration applied every frame (uv units/s^2). */
  gravity?: number
  /** Velocity damping per second — higher settles flecks faster. */
  drag?: number
  /** Resting floor height in uv space (0 = bottom of the canvas). */
  floorY?: number
  /** How far (uv distance) the cursor's shake reaches. */
  kickRadius?: number
  /** How strong the shake impulse is. */
  kickStrength?: number
  /** Snow color. */
  color?: string
}

export function SnowGlobe({
  className,
  style,
  particleTexSize = 72,
  pointSize = 2.6,
  gravity = 0.5,
  drag = 0.8,
  floorY = 0.05,
  kickRadius = 0.3,
  kickStrength = 0.9,
  color = '#f4f8ff',
}: SnowGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pointerRef = usePointerTracking(containerRef)

  return (
    <div ref={containerRef} className={className} style={{ width: '100%', height: '100%', ...style }}>
      <Canvas
        orthographic
        camera={{ left: -1, right: 1, top: 1, bottom: -1, near: 0.1, far: 10, position: [0, 0, 5] }}
        gl={{ preserveDrawingBuffer: true, alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <SnowGlobeSim
          pointerRef={pointerRef}
          particleTexSize={particleTexSize}
          pointSize={pointSize}
          gravity={gravity}
          drag={drag}
          floorY={floorY}
          kickRadius={kickRadius}
          kickStrength={kickStrength}
          color={color}
        />
      </Canvas>
    </div>
  )
}

export default SnowGlobe
