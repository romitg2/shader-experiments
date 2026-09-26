import { useRef, useMemo, type CSSProperties } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createGlyphAtlas } from '../../lib/textAtlas'

import vertexShader from './shaders/vertex.glsl'
import displayShader from './shaders/display.glsl'

const ASCII_RAMP = [' ', '.', ':', '-', '=', '+', '*', '%', '@']

interface PortraitRevealSceneProps {
  cellSize: number
}

function PortraitRevealScene({ cellSize }: PortraitRevealSceneProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const atlas = useMemo(() => createGlyphAtlas(ASCII_RAMP), [])

  useFrame((state) => {
    const mat = meshRef.current?.material as THREE.ShaderMaterial | undefined
    if (mat) {
      mat.uniforms.uTime.value = state.clock.elapsedTime
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
  return (
    <div className={className} style={{ width: '100%', height: '100%', background: '#000', ...style }}>
      <Canvas
        orthographic
        camera={{ left: -1, right: 1, top: 1, bottom: -1, near: 0.1, far: 10, position: [0, 0, 5] }}
      >
        <PortraitRevealScene cellSize={cellSize} />
      </Canvas>
    </div>
  )
}

export default PortraitReveal
