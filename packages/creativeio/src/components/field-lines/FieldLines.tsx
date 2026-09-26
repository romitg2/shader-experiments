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

interface FieldLinesSimProps {
  pointerRef: RefObject<PointerState>
  simResolution: number
  velocityDissipation: number
  pressureIterations: number
  cellSize: number
  color: string
}

function FieldLinesSim({
  pointerRef,
  simResolution,
  velocityDissipation,
  pressureIterations,
  cellSize,
  color,
}: FieldLinesSimProps) {
  const { gl } = useThree()

  const simScene = useMemo(() => new THREE.Scene(), [])
  const simCamera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), [])
  const quadGeom = useMemo(() => new THREE.PlaneGeometry(2, 2), [])

  // Velocity-only sim: no density buffer. The field itself, not a
  // transported dye, is what gets rendered — see display.glsl.
  const velocity = useMemo(() => createDoubleFBO(simResolution, simResolution), [simResolution])
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
          uRadius: { value: 0.0008 },
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
  const colorVec = useMemo(() => {
    const c = new THREE.Color(color)
    return new THREE.Vector3(c.r, c.g, c.b)
  }, [color])

  useFrame((_state, delta) => {
    const p = pointerRef.current
    const dt = Math.min(delta, 0.033)

    if (p.active) {
      const dx = (p.x - prevPointer.current.x) * 10
      const dy = (p.y - prevPointer.current.y) * 10

      splatMat.uniforms.uTarget.value = velocity.read.texture
      splatMat.uniforms.uPoint.value.set(p.x, p.y)
      splatMat.uniforms.uColor.value.set(dx * 80, dy * 80, 0)
      splatMat.uniforms.uRadius.value = 0.002
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

    gl.setRenderTarget(null)

    const mat = displayMeshRef.current?.material as THREE.ShaderMaterial | undefined
    if (mat) {
      mat.uniforms.uVelocity.value = velocity.read.texture
      // gl_FragCoord is in device pixels; must match the drawing-buffer size,
      // not R3F's CSS-pixel useThree().size (see City Grid/Pixel Ink for the
      // same devicePixelRatio fix).
      mat.uniforms.uResolution.value.set(gl.domElement.width, gl.domElement.height)
      mat.uniforms.uCellSize.value = cellSize
      mat.uniforms.uColor.value.copy(colorVec)
    }
  })

  return (
    <mesh ref={displayMeshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={displayShader}
        uniforms={{
          uVelocity: { value: null },
          uResolution: { value: new THREE.Vector2(1, 1) },
          uCellSize: { value: cellSize },
          uColor: { value: colorVec.clone() },
        }}
      />
    </mesh>
  )
}

export interface FieldLinesProps {
  className?: string
  style?: CSSProperties
  /** Resolution (per axis) of the simulation grid. Higher = sharper but more expensive. */
  simResolution?: number
  /** How quickly velocity fades out each frame (0-1, closer to 1 = less friction). */
  velocityDissipation?: number
  /** Jacobi iterations for the pressure solve. Higher = more accurate, more expensive. */
  pressureIterations?: number
  /** Size (in screen pixels) of each flow-line grid cell. */
  cellSize?: number
  /** Stroke color. */
  color?: string
}

export function FieldLines({
  className,
  style,
  simResolution = 256,
  velocityDissipation = 0.985,
  pressureIterations = 20,
  cellSize = 12,
  color = '#e5e7eb',
}: FieldLinesProps) {
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
        gl={{ preserveDrawingBuffer: true }}
      >
        <FieldLinesSim
          pointerRef={pointerRef}
          simResolution={simResolution}
          velocityDissipation={velocityDissipation}
          pressureIterations={pressureIterations}
          cellSize={cellSize}
          color={color}
        />
      </Canvas>
    </div>
  )
}

export default FieldLines
