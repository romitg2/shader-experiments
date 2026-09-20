import { useRef, useEffect, useMemo, type CSSProperties, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { createDoubleFBO } from '../../lib/fbo'
import { blit } from '../../lib/blit'

import vertexShader from './shaders/vertex.glsl'
import advectionShader from './shaders/advection.glsl'
import splatShader from './shaders/splat.glsl'
import divergenceShader from './shaders/divergence.glsl'
import pressureShader from './shaders/pressure.glsl'
import gradientSubtractShader from './shaders/gradientSubtract.glsl'
import displayShader from './shaders/display.glsl'

interface MouseState {
  x: number
  y: number
  active: boolean
}

interface FluidSimProps {
  mouseRef: RefObject<MouseState>
  simResolution: number
  velocityDissipation: number
  densityDissipation: number
  pressureIterations: number
}

function FluidSim({ mouseRef, simResolution, velocityDissipation, densityDissipation, pressureIterations }: FluidSimProps) {
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
  const prevMouse = useRef({ x: 0.5, y: 0.5 })

  useFrame((_state, delta) => {
    const m = mouseRef.current
    const dt = Math.min(delta, 0.033)

    if (m.active) {
      const dx = (m.x - prevMouse.current.x) * 10
      const dy = (m.y - prevMouse.current.y) * 10

      splatMat.uniforms.uTarget.value = velocity.read.texture
      splatMat.uniforms.uPoint.value.set(m.x, m.y)
      splatMat.uniforms.uColor.value.set(dx * 50, dy * 50, 0)
      splatMat.uniforms.uRadius.value = 0.001
      blit(gl, simScene, simCamera, quadMesh, splatMat, velocity.write)
      velocity.swap()

      splatMat.uniforms.uTarget.value = density.read.texture
      splatMat.uniforms.uColor.value.set(0.8, 0.8, 0.8)
      splatMat.uniforms.uRadius.value = 0.001
      blit(gl, simScene, simCamera, quadMesh, splatMat, density.write)
      density.swap()
    }

    prevMouse.current.x = m.x
    prevMouse.current.y = m.y

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

    if (displayMeshRef.current) {
      const mat = displayMeshRef.current.material as THREE.ShaderMaterial
      mat.uniforms.uDensity.value = density.read.texture
      mat.uniforms.uVelocity.value = velocity.read.texture
    }
  })

  return (
    <mesh ref={displayMeshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={displayShader}
        uniforms={{
          uDensity: { value: null },
          uVelocity: { value: null },
          uMode: { value: 0 },
        }}
      />
    </mesh>
  )
}

export interface FluidProps {
  className?: string
  style?: CSSProperties
  /** Resolution (per axis) of the simulation grid. Higher = sharper but more expensive. */
  simResolution?: number
  /** How quickly velocity fades out each frame (0-1, closer to 1 = less friction). */
  velocityDissipation?: number
  /** How quickly the smoke/density fades out each frame (0-1). */
  densityDissipation?: number
  /** Jacobi iterations for the pressure solve. Higher = more accurate, more expensive. */
  pressureIterations?: number
}

export function Fluid({
  className,
  style,
  simResolution = 256,
  velocityDissipation = 0.99,
  densityDissipation = 0.98,
  pressureIterations = 20,
}: FluidProps) {
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
    const onDown = () => {
      mouseRef.current.active = true
    }
    const onUp = () => {
      mouseRef.current.active = false
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
        gl={{ preserveDrawingBuffer: true }}
      >
        <FluidSim
          mouseRef={mouseRef}
          simResolution={simResolution}
          velocityDissipation={velocityDissipation}
          densityDissipation={densityDissipation}
          pressureIterations={pressureIterations}
        />
      </Canvas>
    </div>
  )
}

export default Fluid
