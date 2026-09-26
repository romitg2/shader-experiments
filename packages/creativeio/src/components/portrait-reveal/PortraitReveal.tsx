import { useRef, useMemo, type CSSProperties, type RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { usePointerTracking, type PointerState, MotionEnergy } from '../../lib/usePointer'
import { createGlyphAtlas } from '../../lib/textAtlas'

import vertexShader from './shaders/vertex.glsl'
import displayShader from './shaders/display.glsl'

const ASCII_RAMP = [' ', '.', ':', '-', '=', '+', '*', '%', '@']

interface PortraitRevealSceneProps {
  pointerRef: RefObject<PointerState>
  cellSize: number
}

function PortraitRevealScene({ pointerRef, cellSize }: PortraitRevealSceneProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const motionEnergyRef = useRef<MotionEnergy | null>(null)
  if (!motionEnergyRef.current) motionEnergyRef.current = new MotionEnergy()
  const atlas = useMemo(() => createGlyphAtlas(ASCII_RAMP), [])

  useFrame((state, delta) => {
    const p = pointerRef.current
    const energy = motionEnergyRef.current!.update(p, Math.min(delta, 0.033))
    const mat = meshRef.current?.material as THREE.ShaderMaterial | undefined
    if (mat) {
      mat.uniforms.uTime.value = state.clock.elapsedTime
      mat.uniforms.uPointer.value.set(p.x, p.y)
      mat.uniforms.uEnergy.value = energy
      mat.uniforms.uResolution.value.set(state.gl.domElement.width, state.gl.domElement.height)
      mat.uniforms.uCellSize.value = cellSize
    }
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={displayShader}
        uniforms={{
          uAtlas: { value: atlas },
          uTime: { value: 0 },
          uPointer: { value: new THREE.Vector2(0.5, 0.5) },
          uEnergy: { value: 0 },
          uResolution: { value: new THREE.Vector2(1, 1) },
          uCellSize: { value: cellSize },
          uLevels: { value: ASCII_RAMP.length },
        }}
      />
    </mesh>
  )
}

export interface PortraitRevealProps {
  className?: string
  style?: CSSProperties
  /** Size (in screen pixels) of each ASCII glyph cell. */
  cellSize?: number
}

export function PortraitReveal({ className, style, cellSize = 12 }: PortraitRevealProps) {
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
      >
        <PortraitRevealScene pointerRef={pointerRef} cellSize={cellSize} />
      </Canvas>
    </div>
  )
}

export default PortraitReveal
