import { useRef, useMemo, type CSSProperties, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { createDoubleFBO } from '../../lib/fbo'
import { blit } from '../../lib/blit'
import { usePointerTracking, type PointerState } from '../../lib/usePointer'

import vertexShader from './shaders/vertex.glsl'
import advectionShader from './shaders/advection.glsl'
import splatShader from './shaders/splat.glsl'
import divergenceShader from './shaders/divergence.glsl'
import pressureShader from './shaders/pressure.glsl'
import gradientSubtractShader from './shaders/gradientSubtract.glsl'
import displayShader from './shaders/display.glsl'

interface InkBloomSimProps {
  pointerRef: RefObject<PointerState>
  simResolution: number
  velocityDissipation: number
  densityDissipation: number
  pressureIterations: number
  colors: string[]
  colorSpeed: number
  edgeBoost: number
}

function InkBloomSim({
  pointerRef,
  simResolution,
  velocityDissipation,
  densityDissipation,
  pressureIterations,
  colors,
  colorSpeed,
  edgeBoost,
}: InkBloomSimProps) {
  const { gl } = useThree()

  const simScene = useMemo(() => new THREE.Scene(), [])
  const simCamera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), [])
  const quadGeom = useMemo(() => new THREE.PlaneGeometry(2, 2), [])

  const velocity = useMemo(() => createDoubleFBO(simResolution, simResolution), [simResolution])
  const density = useMemo(() => createDoubleFBO(simResolution, simResolution), [simResolution])
  const pressure = useMemo(() => createDoubleFBO(simResolution, simResolution), [simResolution])
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
          uRadius: { value: 0.0005 },
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

  const quadMesh = useMemo(() => {
    const mesh = new THREE.Mesh(quadGeom, advectionMat)
    simScene.add(mesh)
    return mesh
  }, [quadGeom, advectionMat, simScene])

  const displayMeshRef = useRef<THREE.Mesh>(null)
  const prevPointer = useRef({ x: 0.5, y: 0.5 })
  const splatColor = useRef(new THREE.Color())
  const palette = useMemo(() => colors.map((c) => new THREE.Color(c)), [colors])

  useFrame((state, delta) => {
    const p = pointerRef.current
    const dt = Math.min(delta, 0.033)

    if (p.active) {
      const dx = (p.x - prevPointer.current.x) * 8
      const dy = (p.y - prevPointer.current.y) * 8

      splatMat.uniforms.uTarget.value = velocity.read.texture
      splatMat.uniforms.uPoint.value.set(p.x, p.y)
      splatMat.uniforms.uColor.value.set(dx * 40, dy * 40, 0)
      splatMat.uniforms.uRadius.value = 0.0015
      blit(gl, simScene, simCamera, quadMesh, splatMat, velocity.write)
      velocity.swap()

      const n = palette.length
      const cyclePos = (((state.clock.elapsedTime * colorSpeed) % n) + n) % n
      const i0 = Math.floor(cyclePos)
      const i1 = (i0 + 1) % n
      const t = cyclePos - i0
      splatColor.current.copy(palette[i0]).lerp(palette[i1], t)

      splatMat.uniforms.uTarget.value = density.read.texture
      splatMat.uniforms.uColor.value.set(splatColor.current.r, splatColor.current.g, splatColor.current.b)
      splatMat.uniforms.uRadius.value = 0.002
      blit(gl, simScene, simCamera, quadMesh, splatMat, density.write)
      density.swap()
    }

    prevPointer.current.x = p.x
    prevPointer.current.y = p.y

    advectionMat.uniforms.uVelocity.value = velocity.read.texture
    advectionMat.uniforms.uSource.value = velocity.read.texture
    advectionMat.uniforms.uDt.value = dt * 60
    advectionMat.uniforms.uDissipation.value = velocityDissipation
    blit(gl, simScene, simCamera, quadMesh, advectionMat, velocity.write)
    velocity.swap()

    advectionMat.uniforms.uVelocity.value = velocity.read.texture
    advectionMat.uniforms.uSource.value = density.read.texture
    advectionMat.uniforms.uDissipation.value = densityDissipation
    blit(gl, simScene, simCamera, quadMesh, advectionMat, density.write)
    density.swap()

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

    gl.setRenderTarget(null)

    const mat = displayMeshRef.current?.material as THREE.ShaderMaterial | undefined
    if (mat) {
      mat.uniforms.uDensity.value = density.read.texture
      mat.uniforms.uTexel.value.set(1 / simResolution, 1 / simResolution)
      mat.uniforms.uEdgeBoost.value = edgeBoost
    }
  })

  return (
    <mesh ref={displayMeshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={displayShader}
        transparent
        depthWrite={false}
        uniforms={{
          uDensity: { value: null },
          uTexel: { value: new THREE.Vector2(1 / simResolution, 1 / simResolution) },
          uEdgeBoost: { value: edgeBoost },
        }}
      />
    </mesh>
  )
}

export interface InkBloomProps {
  className?: string
  style?: CSSProperties
  /** Resolution (per axis) of the simulation grid. Higher = sharper but more expensive. */
  simResolution?: number
  /** How quickly velocity fades out each frame (0-1, closer to 1 = less friction). */
  velocityDissipation?: number
  /** How quickly the ink fades out each frame (0-1). Slower than Fluid, for lingering blooms. */
  densityDissipation?: number
  /** Jacobi iterations for the pressure solve. Higher = more accurate, more expensive. */
  pressureIterations?: number
  /** Palette the ink cycles through over time (2+ colors). */
  colors?: string[]
  /** How fast the injected color walks through the palette. */
  colorSpeed?: number
  /** How strongly pigment pools/darkens at the edge of a bloom. */
  edgeBoost?: number
}

const DEFAULT_COLORS = ['#1e3a8a', '#7c3aed', '#be123c']

export function InkBloom({
  className,
  style,
  simResolution = 256,
  velocityDissipation = 0.99,
  densityDissipation = 0.975,
  pressureIterations = 20,
  colors = DEFAULT_COLORS,
  colorSpeed = 0.1,
  edgeBoost = 2.2,
}: InkBloomProps) {
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
        <InkBloomSim
          pointerRef={pointerRef}
          simResolution={simResolution}
          velocityDissipation={velocityDissipation}
          densityDissipation={densityDissipation}
          pressureIterations={pressureIterations}
          colors={colors}
          colorSpeed={colorSpeed}
          edgeBoost={edgeBoost}
        />
      </Canvas>
    </div>
  )
}

export default InkBloom
