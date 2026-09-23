import { useRef, useMemo, useEffect, type CSSProperties, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { blit } from '../../lib/blit'
import { usePointerTracking, type PointerState } from '../../lib/usePointer'

import vertexShader from './shaders/vertex.glsl'
import advectionShader from './shaders/advection.glsl'
import splatShader from './shaders/splat.glsl'
import divergenceShader from './shaders/divergence.glsl'
import pressureShader from './shaders/pressure.glsl'
import gradientSubtractShader from './shaders/gradientSubtract.glsl'
import seedShader from './shaders/seed.glsl'
import particleUpdateShader from './shaders/particleUpdate.glsl'
import particleVertexShader from './shaders/particleVertex.glsl'
import particleFragmentShader from './shaders/particleFragment.glsl'

interface DustDriftSimProps {
  pointerRef: RefObject<PointerState>
  simResolution: number
  velocityDissipation: number
  pressureIterations: number
  particleTexSize: number
  pointSize: number
  speed: number
  lifeGain: number
  lifeDecay: number
  color: string
}

function DustDriftSim({
  pointerRef,
  simResolution,
  velocityDissipation,
  pressureIterations,
  particleTexSize,
  pointSize,
  speed,
  lifeGain,
  lifeDecay,
  color,
}: DustDriftSimProps) {
  const { gl } = useThree()

  const simScene = useMemo(() => new THREE.Scene(), [])
  const simCamera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), [])
  const quadGeom = useMemo(() => new THREE.PlaneGeometry(2, 2), [])

  const velocity = useMemo(() => {
    const params = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
      depthBuffer: false,
    }
    return {
      read: new THREE.WebGLRenderTarget(simResolution, simResolution, params),
      write: new THREE.WebGLRenderTarget(simResolution, simResolution, params),
      swap(this: { read: THREE.WebGLRenderTarget; write: THREE.WebGLRenderTarget }) {
        const t = this.read
        this.read = this.write
        this.write = t
      },
    }
  }, [simResolution])

  const pressure = useMemo(() => {
    const params = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
      depthBuffer: false,
    }
    return {
      read: new THREE.WebGLRenderTarget(simResolution, simResolution, params),
      write: new THREE.WebGLRenderTarget(simResolution, simResolution, params),
      swap(this: { read: THREE.WebGLRenderTarget; write: THREE.WebGLRenderTarget }) {
        const t = this.read
        this.read = this.write
        this.write = t
      },
    }
  }, [simResolution])

  const divergenceFBO = useMemo(
    () =>
      new THREE.WebGLRenderTarget(simResolution, simResolution, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.HalfFloatType,
        depthBuffer: false,
      }),
    [simResolution],
  )

  const particles = useMemo(() => {
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

  const advectionMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: advectionShader,
        uniforms: {
          uVelocity: { value: null },
          uSource: { value: null },
          uDt: { value: 0.016 },
          uDissipation: { value: 0.99 },
          uResolution: { value: new THREE.Vector2(simResolution, simResolution) },
        },
      }),
    [simResolution],
  )

  const splatMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: splatShader,
        uniforms: {
          uTarget: { value: null },
          uPoint: { value: new THREE.Vector2(0.5, 0.5) },
          uColor: { value: new THREE.Vector3(0, 0, 0) },
          uRadius: { value: 0.001 },
          uResolution: { value: new THREE.Vector2(simResolution, simResolution) },
        },
      }),
    [simResolution],
  )

  const divergenceMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: divergenceShader,
        uniforms: {
          uVelocity: { value: null },
          uResolution: { value: new THREE.Vector2(simResolution, simResolution) },
        },
      }),
    [simResolution],
  )

  const pressureMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: pressureShader,
        uniforms: {
          uPressure: { value: null },
          uDivergence: { value: null },
          uResolution: { value: new THREE.Vector2(simResolution, simResolution) },
        },
      }),
    [simResolution],
  )

  const gradientSubtractMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: gradientSubtractShader,
        uniforms: {
          uPressure: { value: null },
          uVelocity: { value: null },
          uResolution: { value: new THREE.Vector2(simResolution, simResolution) },
        },
      }),
    [simResolution],
  )

  const seedMat = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader, fragmentShader: seedShader, uniforms: {} }),
    [],
  )

  const particleUpdateMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: particleUpdateShader,
        uniforms: {
          uPositions: { value: null },
          uVelocity: { value: null },
          uDt: { value: 0.016 },
          uSpeed: { value: speed },
          uLifeGain: { value: lifeGain },
          uLifeDecay: { value: lifeDecay },
          uTexel: { value: new THREE.Vector2(1 / simResolution, 1 / simResolution) },
        },
      }),
    [speed, lifeGain, lifeDecay, simResolution],
  )

  const quadMesh = useMemo(() => {
    const mesh = new THREE.Mesh(quadGeom, advectionMat)
    simScene.add(mesh)
    return mesh
  }, [quadGeom, advectionMat, simScene])

  const seeded = useRef(false)
  useEffect(() => {
    if (seeded.current) return
    blit(gl, simScene, simCamera, quadMesh, seedMat, particles.read)
    seeded.current = true
  }, [gl, simScene, simCamera, quadMesh, seedMat, particles])

  const prevPointer = useRef({ x: 0.5, y: 0.5 })

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
      blending: THREE.AdditiveBlending,
      uniforms: {
        uPositions: { value: null },
        uParticleTexSize: { value: new THREE.Vector2(particleTexSize, particleTexSize) },
        uPointSize: { value: pointSize },
        uColor: { value: new THREE.Vector3(c.r, c.g, c.b) },
      },
    })
  }, [particleTexSize, pointSize, color])

  useFrame((_state, delta) => {
    const p = pointerRef.current
    const dt = Math.min(delta, 0.033)

    if (p.active) {
      const dx = (p.x - prevPointer.current.x) * 6
      const dy = (p.y - prevPointer.current.y) * 6

      // A gentler, wider splat than Particle Flow's — a hand waving through
      // dust disturbs a broad soft region rather than punching a narrow jet.
      splatMat.uniforms.uTarget.value = velocity.read.texture
      splatMat.uniforms.uPoint.value.set(p.x, p.y)
      splatMat.uniforms.uColor.value.set(dx * 25, dy * 25, 0)
      // Wide catchment, same reasoning as Particle Flow: sparse point
      // samples need a broad disturbance radius to catch a visible number
      // of motes at once.
      splatMat.uniforms.uRadius.value = 0.035
      blit(gl, simScene, simCamera, quadMesh, splatMat, velocity.write)
      velocity.swap()
    }

    prevPointer.current.x = p.x
    prevPointer.current.y = p.y

    advectionMat.uniforms.uVelocity.value = velocity.read.texture
    advectionMat.uniforms.uSource.value = velocity.read.texture
    advectionMat.uniforms.uDt.value = dt * 60
    advectionMat.uniforms.uDissipation.value = velocityDissipation
    blit(gl, simScene, simCamera, quadMesh, advectionMat, velocity.write)
    velocity.swap()

    divergenceMat.uniforms.uVelocity.value = velocity.read.texture
    blit(gl, simScene, simCamera, quadMesh, divergenceMat, divergenceFBO)

    gl.setRenderTarget(pressure.read)
    gl.clear()
    gl.setRenderTarget(pressure.write)
    gl.clear()

    pressureMat.uniforms.uDivergence.value = divergenceFBO.texture
    for (let i = 0; i < pressureIterations; i++) {
      pressureMat.uniforms.uPressure.value = pressure.read.texture
      blit(gl, simScene, simCamera, quadMesh, pressureMat, pressure.write)
      pressure.swap()
    }

    gradientSubtractMat.uniforms.uPressure.value = pressure.read.texture
    gradientSubtractMat.uniforms.uVelocity.value = velocity.read.texture
    blit(gl, simScene, simCamera, quadMesh, gradientSubtractMat, velocity.write)
    velocity.swap()

    particleUpdateMat.uniforms.uPositions.value = particles.read.texture
    particleUpdateMat.uniforms.uVelocity.value = velocity.read.texture
    particleUpdateMat.uniforms.uDt.value = dt * 60
    particleUpdateMat.uniforms.uTexel.value.set(1 / simResolution, 1 / simResolution)
    blit(gl, simScene, simCamera, quadMesh, particleUpdateMat, particles.write)
    particles.swap()

    gl.setRenderTarget(null)

    pointsMaterial.uniforms.uPositions.value = particles.read.texture
  })

  return <points geometry={pointsGeometry} material={pointsMaterial} frustumCulled={false} />
}

export interface DustDriftProps {
  className?: string
  style?: CSSProperties
  /** Resolution (per axis) of the underlying velocity sim grid. */
  simResolution?: number
  /** How quickly velocity fades out each frame (0-1, closer to 1 = less friction). */
  velocityDissipation?: number
  /** Jacobi iterations for the pressure solve. */
  pressureIterations?: number
  /** Particle pool is this value squared. Sparse by design — far fewer than Particle Flow. */
  particleTexSize?: number
  /** Point sprite size in device pixels. Small by design. */
  pointSize?: number
  /** How strongly motes follow the velocity field. Gentle by design. */
  speed?: number
  /** How quickly a mote brightens when disturbed. */
  lifeGain?: number
  /** How quickly a mote's brightness fades once things settle — slow, for a lazy lingering drift. */
  lifeDecay?: number
  /** Dust color. */
  color?: string
}

export function DustDrift({
  className,
  style,
  simResolution = 192,
  velocityDissipation = 0.992,
  pressureIterations = 14,
  particleTexSize = 48,
  pointSize = 2.2,
  speed = 0.3,
  lifeGain = 0.05,
  lifeDecay = 0.004,
  color = '#fde9c8',
}: DustDriftProps) {
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
        <DustDriftSim
          pointerRef={pointerRef}
          simResolution={simResolution}
          velocityDissipation={velocityDissipation}
          pressureIterations={pressureIterations}
          particleTexSize={particleTexSize}
          pointSize={pointSize}
          speed={speed}
          lifeGain={lifeGain}
          lifeDecay={lifeDecay}
          color={color}
        />
      </Canvas>
    </div>
  )
}

export default DustDrift
