import { useRef, useMemo, useEffect, type CSSProperties, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { createDoubleFBO } from '../../lib/fbo'
import { blit } from '../../lib/blit'
import { usePointerTracking, type PointerState, MotionEnergy } from '../../lib/usePointer'

import vertexShader from './shaders/vertex.glsl'
import splatShader from './shaders/splat.glsl'
import rdStepShader from './shaders/rdStep.glsl'
import displayShader from './shaders/display.glsl'

interface MitosisSimProps {
  pointerRef: RefObject<PointerState>
  simResolution: number
  feed: number
  kill: number
  diffusionU: number
  diffusionV: number
  substeps: number
  seedRadius: number
}

function MitosisSim({
  pointerRef,
  simResolution,
  feed,
  kill,
  diffusionU,
  diffusionV,
  substeps,
  seedRadius,
}: MitosisSimProps) {
  const { gl } = useThree()

  const simScene = useMemo(() => new THREE.Scene(), [])
  const simCamera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), [])
  const quadGeom = useMemo(() => new THREE.PlaneGeometry(2, 2), [])

  // State FBO: r = u (substrate, starts abundant), g = v (activator,
  // starts absent). No third velocity/density pair here — reaction-
  // diffusion is a genuinely different simulation model, not the
  // Navier-Stokes sim every other component in this family shares.
  const state = useMemo(() => createDoubleFBO(simResolution, simResolution), [simResolution])

  const rdStepMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: rdStepShader,
        uniforms: {
          uState: { value: null },
          uTexel: { value: new THREE.Vector2(1 / simResolution, 1 / simResolution) },
          uDu: { value: diffusionU },
          uDv: { value: diffusionV },
          uFeed: { value: feed },
          uKill: { value: kill },
          uDt: { value: 1.0 },
        },
      }),
    [simResolution, diffusionU, diffusionV, feed, kill],
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

  const quadMesh = useMemo(() => {
    const mesh = new THREE.Mesh(quadGeom, rdStepMat)
    simScene.add(mesh)
    return mesh
  }, [quadGeom, rdStepMat, simScene])

  const seeded = useRef(false)
  useEffect(() => {
    if (seeded.current) return
    // Uniform initial state: u = 1 (abundant substrate), v = 0 (no
    // activator anywhere) — a blank canvas until the first splat ignites
    // a reaction site.
    gl.setClearColor(new THREE.Color(1, 0, 0), 1)
    gl.setRenderTarget(state.read)
    gl.clear()
    gl.setRenderTarget(state.write)
    gl.clear()
    gl.setRenderTarget(null)
    gl.setClearColor(new THREE.Color(0, 0, 0), 1)
    seeded.current = true
  }, [gl, state])

  const displayMeshRef = useRef<THREE.Mesh>(null)
  const prevPointer = useRef({ x: 0.5, y: 0.5 })
  const motionEnergyRef = useRef<MotionEnergy | null>(null)
  if (!motionEnergyRef.current) motionEnergyRef.current = new MotionEnergy()

  useFrame((_state, delta) => {
    const p = pointerRef.current
    const dt = Math.min(delta, 0.033)
    const energy = motionEnergyRef.current!.update(p, dt)

    if (p.active && energy > 0.05) {
      const dx = (p.x - prevPointer.current.x) * 10
      const dy = (p.y - prevPointer.current.y) * 10
      const dragDist = Math.hypot(dx, dy)

      splatMat.uniforms.uTarget.value = state.read.texture
      splatMat.uniforms.uPoint.value.set(p.x, p.y)
      splatMat.uniforms.uColor.value.set(-0.5 * energy, 0.5 * energy, 0)
      splatMat.uniforms.uRadius.value = seedRadius * (1.0 + Math.min(dragDist, 3))
      blit(gl, simScene, simCamera, quadMesh, splatMat, state.write)
      state.swap()
    }

    prevPointer.current.x = p.x
    prevPointer.current.y = p.y

    // The reaction keeps evolving every frame regardless of pointer
    // activity — that's the point of reaction-diffusion: once seeded, a
    // pattern grows and stabilizes on its own without needing to keep
    // being fed, unlike this library's fluid-family siblings.
    for (let i = 0; i < substeps; i++) {
      rdStepMat.uniforms.uState.value = state.read.texture
      blit(gl, simScene, simCamera, quadMesh, rdStepMat, state.write)
      state.swap()
    }

    gl.setRenderTarget(null)

    const mat = displayMeshRef.current?.material as THREE.ShaderMaterial | undefined
    if (mat) {
      mat.uniforms.uState.value = state.read.texture
    }
  })

  return (
    <mesh ref={displayMeshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={displayShader}
        uniforms={{
          uState: { value: null },
        }}
      />
    </mesh>
  )
}

export interface MitosisProps {
  className?: string
  style?: CSSProperties
  /** Resolution (per axis) of the reaction-diffusion grid. Higher = finer detail, more expensive. */
  simResolution?: number
  /** Gray-Scott feed rate — how fast substrate (u) is replenished. */
  feed?: number
  /** Gray-Scott kill rate — how fast activator (v) is removed. Feed/kill together select the pattern family. */
  kill?: number
  /** Diffusion rate of the substrate (u) channel. */
  diffusionU?: number
  /** Diffusion rate of the activator (v) channel. */
  diffusionV?: number
  /** Reaction-diffusion steps computed per rendered frame — higher evolves the pattern faster. */
  substeps?: number
  /** Base radius of the seed patch injected while dragging. */
  seedRadius?: number
}

export function Mitosis({
  className,
  style,
  simResolution = 256,
  feed = 0.033,
  kill = 0.06,
  diffusionU = 1.0,
  diffusionV = 0.5,
  substeps = 2,
  seedRadius = 0.002,
}: MitosisProps) {
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
        <MitosisSim
          pointerRef={pointerRef}
          simResolution={simResolution}
          feed={feed}
          kill={kill}
          diffusionU={diffusionU}
          diffusionV={diffusionV}
          substeps={substeps}
          seedRadius={seedRadius}
        />
      </Canvas>
    </div>
  )
}

export default Mitosis
