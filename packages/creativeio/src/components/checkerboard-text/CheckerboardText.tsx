import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Canvas } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'

const WIDTH = 6
const HEIGHT = 2.2

interface TileProps {
  position: [number, number, number]
  size: [number, number]
  delay: number
  trigger: boolean
}

function Tile({ position, size, delay, trigger }: TileProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    gsap.killTweensOf(mesh.scale)
    gsap.killTweensOf(mesh.rotation)

    if (trigger) {
      // Covering tile flips away (X/Y) and scales to 0 to reveal the text
      // underneath, staggered by each tile's diagonal grid delay.
      gsap.to(mesh.scale, { x: 0, y: 0, duration: 0.5, delay, ease: 'power3.inOut' })
      gsap.to(mesh.rotation, { y: Math.PI / 2, duration: 0.5, delay, ease: 'power3.inOut' })
    } else {
      gsap.set(mesh.rotation, { y: -Math.PI / 2 })
      gsap.to(mesh.scale, { x: 1, y: 1, duration: 0.4, delay, ease: 'power3.out' })
      gsap.to(mesh.rotation, { y: 0, duration: 0.4, delay, ease: 'power3.out' })
    }
  }, [trigger, delay])

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial color="#0a0a0a" toneMapped={false} />
    </mesh>
  )
}

interface CheckerboardSceneProps {
  text: string
  gridSize: [number, number]
  stagger: number
  trigger: boolean
}

function CheckerboardScene({ text, gridSize, stagger, trigger }: CheckerboardSceneProps) {
  const [rows, cols] = gridSize
  const tileW = WIDTH / cols
  const tileH = HEIGHT / rows

  const tiles = useMemo(() => {
    const list: { position: [number, number, number]; delay: number }[] = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = -WIDTH / 2 + tileW * (c + 0.5)
        const y = HEIGHT / 2 - tileH * (r + 0.5)
        list.push({ position: [x, y, 0.01], delay: stagger * (r + c) })
      }
    }
    return list
  }, [rows, cols, tileW, tileH, stagger])

  return (
    <>
      <Text fontSize={HEIGHT * 0.4} color="#ffffff" anchorX="center" anchorY="middle" maxWidth={WIDTH}>
        {text}
      </Text>
      {tiles.map((tile, i) => (
        <Tile key={i} position={tile.position} size={[tileW, tileH]} delay={tile.delay} trigger={trigger} />
      ))}
    </>
  )
}

export interface CheckerboardTextTransitionProps {
  className?: string
  style?: CSSProperties
  text?: string
  gridSize?: [number, number]
  stagger?: number
  /** Omit to auto-loop reveal/hide on its own (uncontrolled/idle mode). */
  trigger?: boolean
  /** Seconds between auto-loop toggles when `trigger` is omitted. */
  autoPlayInterval?: number
}

export function CheckerboardTextTransition({
  className,
  style,
  text = 'Checkerboard',
  gridSize = [8, 8],
  stagger = 0.03,
  trigger,
  autoPlayInterval = 2.2,
}: CheckerboardTextTransitionProps) {
  const [autoTrigger, setAutoTrigger] = useState(true)

  useEffect(() => {
    if (trigger !== undefined) return
    const id = setInterval(() => setAutoTrigger((v) => !v), autoPlayInterval * 1000)
    return () => clearInterval(id)
  }, [trigger, autoPlayInterval])

  const resolvedTrigger = trigger ?? autoTrigger

  return (
    <div className={className} style={{ width: '100%', height: '100%', background: '#000', ...style }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <CheckerboardScene text={text} gridSize={gridSize} stagger={stagger} trigger={resolvedTrigger} />
      </Canvas>
    </div>
  )
}

export default CheckerboardTextTransition
