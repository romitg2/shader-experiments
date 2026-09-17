import { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import vertexShader from './shaders/vertex.glsl?raw'
import advectionShader from './shaders/advection.glsl?raw'
import splatShader from './shaders/splat.glsl?raw'
import divergenceShader from './shaders/divergence.glsl?raw'
import pressureShader from './shaders/pressure.glsl?raw'
import gradientSubtractShader from './shaders/gradientSubtract.glsl?raw'
import displayShader from './shaders/display.glsl?raw'

const SIM_RESOLUTION = 256
const PRESSURE_ITERATIONS = 20

function createRenderTarget() {
    return new THREE.WebGLRenderTarget(SIM_RESOLUTION, SIM_RESOLUTION, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
    })
}

function createDoubleFBO() {
    return {
        read: createRenderTarget(),
        write: createRenderTarget(),
        swap() {
            const temp = this.read
            this.read = this.write
            this.write = temp
        },
    }
}

function FluidSimCore({ onTextureUpdate, mouseRef }) {
    const { gl } = useThree()

    const velocity = useRef(null)
    const density = useRef(null)
    const pressure = useRef(null)
    const divergence = useRef(null)
    const initialized = useRef(false)

    useEffect(() => {
        velocity.current = createDoubleFBO()
        density.current = createDoubleFBO()
        pressure.current = createDoubleFBO()
        divergence.current = createRenderTarget()
        initialized.current = true

        return () => {
            velocity.current?.read.dispose()
            velocity.current?.write.dispose()
            density.current?.read.dispose()
            density.current?.write.dispose()
            pressure.current?.read.dispose()
            pressure.current?.write.dispose()
            divergence.current?.dispose()
        }
    }, [])

    const materials = useMemo(() => {
        const resolution = new THREE.Vector2(SIM_RESOLUTION, SIM_RESOLUTION)

        return {
            advection: new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader: advectionShader,
                uniforms: {
                    uVelocity: { value: null },
                    uSource: { value: null },
                    uDt: { value: 0.016 },
                    uDissipation: { value: 0.99 },
                    uResolution: { value: resolution },
                },
            }),
            splat: new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader: splatShader,
                uniforms: {
                    uTarget: { value: null },
                    uPoint: { value: new THREE.Vector2() },
                    uColor: { value: new THREE.Vector3() },
                    uRadius: { value: 0.005 },
                    uResolution: { value: resolution },
                },
            }),
            divergence: new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader: divergenceShader,
                uniforms: {
                    uVelocity: { value: null },
                    uResolution: { value: resolution },
                },
            }),
            pressure: new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader: pressureShader,
                uniforms: {
                    uPressure: { value: null },
                    uDivergence: { value: null },
                    uResolution: { value: resolution },
                },
            }),
            gradientSubtract: new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader: gradientSubtractShader,
                uniforms: {
                    uPressure: { value: null },
                    uVelocity: { value: null },
                    uResolution: { value: resolution },
                },
            }),
        }
    }, [])

    const quadGeometry = useMemo(() => new THREE.PlaneGeometry(2, 2), [])
    const quadMesh = useMemo(() => new THREE.Mesh(quadGeometry), [quadGeometry])
    const fboScene = useMemo(() => {
        const scene = new THREE.Scene()
        scene.add(quadMesh)
        return scene
    }, [quadMesh])
    const fboCamera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), [])

    const renderToFBO = (material, target) => {
        quadMesh.material = material
        gl.setRenderTarget(target)
        gl.render(fboScene, fboCamera)
        gl.setRenderTarget(null)
    }

    useFrame((_, delta) => {
        if (!initialized.current || !velocity.current || !density.current || !pressure.current) return

        const dt = Math.min(delta, 0.016)
        const mouse = mouseRef.current

        const dx = mouse.x - mouse.prevX
        const dy = mouse.y - mouse.prevY
        const moved = Math.abs(dx) > 0.0001 || Math.abs(dy) > 0.0001

        if (moved && mouse.active) {
            // Add velocity
            materials.splat.uniforms.uTarget.value = velocity.current.read.texture
            materials.splat.uniforms.uPoint.value.set(mouse.x, mouse.y)
            materials.splat.uniforms.uColor.value.set(dx * 300, dy * 300, 0)
            materials.splat.uniforms.uRadius.value = 0.015
            renderToFBO(materials.splat, velocity.current.write)
            velocity.current.swap()

            // Add density (white/grayscale only)
            materials.splat.uniforms.uTarget.value = density.current.read.texture
            materials.splat.uniforms.uColor.value.set(1.0, 1.0, 1.0)
            materials.splat.uniforms.uRadius.value = 0.015
            renderToFBO(materials.splat, density.current.write)
            density.current.swap()

            mouse.prevX = mouse.x
            mouse.prevY = mouse.y
        }

        // Advect velocity
        materials.advection.uniforms.uVelocity.value = velocity.current.read.texture
        materials.advection.uniforms.uSource.value = velocity.current.read.texture
        materials.advection.uniforms.uDt.value = dt * 25
        materials.advection.uniforms.uDissipation.value = 0.98
        renderToFBO(materials.advection, velocity.current.write)
        velocity.current.swap()

        // Advect density (smooth fade over time)
        materials.advection.uniforms.uSource.value = density.current.read.texture
        materials.advection.uniforms.uDissipation.value = 0.97
        renderToFBO(materials.advection, density.current.write)
        density.current.swap()

        // Compute divergence
        materials.divergence.uniforms.uVelocity.value = velocity.current.read.texture
        renderToFBO(materials.divergence, divergence.current)

        // Solve pressure
        for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
            materials.pressure.uniforms.uPressure.value = pressure.current.read.texture
            materials.pressure.uniforms.uDivergence.value = divergence.current.texture
            renderToFBO(materials.pressure, pressure.current.write)
            pressure.current.swap()
        }

        // Subtract pressure gradient
        materials.gradientSubtract.uniforms.uPressure.value = pressure.current.read.texture
        materials.gradientSubtract.uniforms.uVelocity.value = velocity.current.read.texture
        renderToFBO(materials.gradientSubtract, velocity.current.write)
        velocity.current.swap()

        if (onTextureUpdate) {
            onTextureUpdate(density.current.read.texture, velocity.current.read.texture)
        }
    })

    return null
}

function Divider() {
    const { viewport } = useThree()

    return (
        <mesh position={[0, 0, 0.1]}>
            <planeGeometry args={[0.02, viewport.height]} />
            <meshBasicMaterial color="#ffffff" />
        </mesh>
    )
}

function Scene({ mouseRef, rightMode }) {
    const texturesRef = useRef({ density: null, velocity: null })

    const handleTextureUpdate = (density, velocity) => {
        texturesRef.current = { density, velocity }
    }

    return (
        <>
            <FluidSimCore onTextureUpdate={handleTextureUpdate} mouseRef={mouseRef} />
            <FluidRendererWithRef side="left" displayMode={0} texturesRef={texturesRef} />
            <FluidRendererWithRef side="right" displayMode={rightMode} texturesRef={texturesRef} />
            <Divider />
        </>
    )
}

function FluidRendererWithRef({ side, displayMode, texturesRef }) {
    const materialRef = useRef()
    const { viewport } = useThree()

    useFrame(() => {
        if (!materialRef.current) return
        const { density, velocity } = texturesRef.current
        if (density) materialRef.current.uniforms.uDensity.value = density
        if (velocity) materialRef.current.uniforms.uVelocity.value = velocity
        materialRef.current.uniforms.uMode.value = displayMode
    })

    const panelWidth = viewport.width / 2 - 0.1
    const panelHeight = viewport.height - 0.2
    const xPos = side === 'left' ? -viewport.width / 4 : viewport.width / 4

    return (
        <mesh position={[xPos, 0, 0]}>
            <planeGeometry args={[panelWidth, panelHeight]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={displayShader}
                uniforms={{
                    uDensity: { value: null },
                    uVelocity: { value: null },
                    uMode: { value: displayMode },
                }}
            />
        </mesh>
    )
}

export default function FluidDemo() {
    const mouseRef = useRef({ x: 0.5, y: 0.5, prevX: 0.5, prevY: 0.5, active: false })
    const [rightMode, setRightMode] = useState(0)

    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = e.clientX / window.innerWidth
            const y = 1.0 - e.clientY / window.innerHeight

            if (x < 0.5) {
                mouseRef.current.prevX = mouseRef.current.x
                mouseRef.current.prevY = mouseRef.current.y
                mouseRef.current.x = x * 2
                mouseRef.current.y = y
                mouseRef.current.active = true
            } else {
                mouseRef.current.active = false
            }
        }

        const handleMouseLeave = () => {
            mouseRef.current.active = false
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseleave', handleMouseLeave)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseleave', handleMouseLeave)
        }
    }, [])

    const modeLabels = ['Density', 'Velocity', 'Raw']

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
            <div
                style={{
                    position: 'absolute',
                    top: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    display: 'flex',
                    gap: 20,
                    fontFamily: 'monospace',
                    color: '#fff',
                }}
            >
                <span style={{ background: '#222', padding: '8px 16px', borderRadius: 4 }}>
                    LEFT: Move mouse to add smoke
                </span>
                <span style={{ background: '#222', padding: '8px 16px', borderRadius: 4 }}>
                    RIGHT: {modeLabels[rightMode]}
                </span>
            </div>

            <div
                style={{
                    position: 'absolute',
                    bottom: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    display: 'flex',
                    gap: 10,
                }}
            >
                {modeLabels.map((label, i) => (
                    <button
                        key={i}
                        onClick={() => setRightMode(i)}
                        style={{
                            padding: '8px 16px',
                            background: rightMode === i ? '#4a9eff' : '#222',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontFamily: 'monospace',
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <Canvas
                orthographic
                camera={{
                    zoom: 100,
                    position: [0, 0, 5],
                    near: 0.1,
                    far: 100
                }}
                gl={{ preserveDrawingBuffer: true }}
            >
                <Scene mouseRef={mouseRef} rightMode={rightMode} />
            </Canvas>
        </div>
    )
}
