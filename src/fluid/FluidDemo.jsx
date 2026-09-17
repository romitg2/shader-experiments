import { useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Import shaders as raw strings
import vertexShader from './shaders/vertex.glsl?raw'
import advectionShader from './shaders/advection.glsl?raw'
import splatShader from './shaders/splat.glsl?raw'
import divergenceShader from './shaders/divergence.glsl?raw'
import pressureShader from './shaders/pressure.glsl?raw'
import gradientSubtractShader from './shaders/gradientSubtract.glsl?raw'
import displayShader from './shaders/display.glsl?raw'

const SIM_RES = 256

// Create a render target pair for ping-pong
function createDoubleFBO(width, height, type = THREE.HalfFloatType) {
    const params = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: type,
        depthBuffer: false,
        stencilBuffer: false,
    }
    return {
        read: new THREE.WebGLRenderTarget(width, height, params),
        write: new THREE.WebGLRenderTarget(width, height, params),
        swap() {
            const temp = this.read
            this.read = this.write
            this.write = temp
        }
    }
}

function FluidSim({ mouseRef }) {
    const { gl, size } = useThree()

    // Scene and camera for rendering to FBOs
    const simScene = useMemo(() => new THREE.Scene(), [])
    const simCamera = useMemo(() => {
        const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
        return cam
    }, [])

    // Fullscreen quad geometry
    const quadGeom = useMemo(() => new THREE.PlaneGeometry(2, 2), [])

    // Create FBOs
    const velocity = useMemo(() => createDoubleFBO(SIM_RES, SIM_RES), [])
    const density = useMemo(() => createDoubleFBO(SIM_RES, SIM_RES), [])
    const pressure = useMemo(() => createDoubleFBO(SIM_RES, SIM_RES), [])
    const divergenceFBO = useMemo(() => {
        return new THREE.WebGLRenderTarget(SIM_RES, SIM_RES, {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            type: THREE.HalfFloatType,
            depthBuffer: false,
        })
    }, [])

    // Create shader materials
    const advectionMat = useMemo(() => new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: advectionShader,
        uniforms: {
            uVelocity: { value: null },
            uSource: { value: null },
            uDt: { value: 0.016 },
            uDissipation: { value: 0.99 },
            uResolution: { value: new THREE.Vector2(SIM_RES, SIM_RES) },
        }
    }), [])

    const splatMat = useMemo(() => new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: splatShader,
        uniforms: {
            uTarget: { value: null },
            uPoint: { value: new THREE.Vector2(0.5, 0.5) },
            uColor: { value: new THREE.Vector3(0, 0, 0) },
            uRadius: { value: 0.0005 },
            uResolution: { value: new THREE.Vector2(SIM_RES, SIM_RES) },
        }
    }), [])

    const divergenceMat = useMemo(() => new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: divergenceShader,
        uniforms: {
            uVelocity: { value: null },
            uResolution: { value: new THREE.Vector2(SIM_RES, SIM_RES) },
        }
    }), [])

    const pressureMat = useMemo(() => new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: pressureShader,
        uniforms: {
            uPressure: { value: null },
            uDivergence: { value: null },
            uResolution: { value: new THREE.Vector2(SIM_RES, SIM_RES) },
        }
    }), [])

    const gradientSubtractMat = useMemo(() => new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: gradientSubtractShader,
        uniforms: {
            uPressure: { value: null },
            uVelocity: { value: null },
            uResolution: { value: new THREE.Vector2(SIM_RES, SIM_RES) },
        }
    }), [])

    const displayMat = useMemo(() => new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: displayShader,
        uniforms: {
            uDensity: { value: null },
            uVelocity: { value: null },
            uMode: { value: 0 },
        }
    }), [])

    // Create quad mesh
    const quadMesh = useMemo(() => {
        const mesh = new THREE.Mesh(quadGeom, advectionMat)
        simScene.add(mesh)
        return mesh
    }, [quadGeom, advectionMat, simScene])

    // Display mesh (visible in main scene)
    const displayMeshRef = useRef()

    // Track previous mouse position
    const prevMouse = useRef({ x: 0.5, y: 0.5 })

    // Helper to render with a specific material to a target
    const blit = (material, target) => {
        quadMesh.material = material
        gl.setRenderTarget(target)
        gl.render(simScene, simCamera)
    }

    useFrame((state, delta) => {
        const m = mouseRef.current
        const dt = Math.min(delta, 0.033) // Cap delta time

        // Step 1: Add velocity and density at mouse position (splat)
        if (m.active) {
            // Calculate mouse velocity
            const dx = (m.x - prevMouse.current.x) * 10
            const dy = (m.y - prevMouse.current.y) * 10

            // Splat velocity
            splatMat.uniforms.uTarget.value = velocity.read.texture
            splatMat.uniforms.uPoint.value.set(m.x, m.y)
            splatMat.uniforms.uColor.value.set(dx * 50, dy * 50, 0)
            splatMat.uniforms.uRadius.value = 0.001
            blit(splatMat, velocity.write)
            velocity.swap()

            // Splat density (white smoke)
            splatMat.uniforms.uTarget.value = density.read.texture
            splatMat.uniforms.uColor.value.set(0.8, 0.8, 0.8)
            splatMat.uniforms.uRadius.value = 0.001
            blit(splatMat, density.write)
            density.swap()
        }

        prevMouse.current.x = m.x
        prevMouse.current.y = m.y

        // Step 2: Advect velocity
        advectionMat.uniforms.uVelocity.value = velocity.read.texture
        advectionMat.uniforms.uSource.value = velocity.read.texture
        advectionMat.uniforms.uDt.value = dt * 60
        advectionMat.uniforms.uDissipation.value = 0.99
        blit(advectionMat, velocity.write)
        velocity.swap()

        // Step 3: Advect density
        advectionMat.uniforms.uVelocity.value = velocity.read.texture
        advectionMat.uniforms.uSource.value = density.read.texture
        advectionMat.uniforms.uDissipation.value = 0.98
        blit(advectionMat, density.write)
        density.swap()

        // Step 4: Compute divergence
        divergenceMat.uniforms.uVelocity.value = velocity.read.texture
        blit(divergenceMat, divergenceFBO)

        // Step 5: Clear pressure
        gl.setRenderTarget(pressure.read)
        gl.clear()
        gl.setRenderTarget(pressure.write)
        gl.clear()

        // Step 6: Solve pressure (Jacobi iterations)
        pressureMat.uniforms.uDivergence.value = divergenceFBO.texture
        for (let i = 0; i < 20; i++) {
            pressureMat.uniforms.uPressure.value = pressure.read.texture
            blit(pressureMat, pressure.write)
            pressure.swap()
        }

        // Step 7: Subtract pressure gradient from velocity
        gradientSubtractMat.uniforms.uPressure.value = pressure.read.texture
        gradientSubtractMat.uniforms.uVelocity.value = velocity.read.texture
        blit(gradientSubtractMat, velocity.write)
        velocity.swap()

        // Reset render target to screen
        gl.setRenderTarget(null)

        // Update display material
        if (displayMeshRef.current) {
            displayMeshRef.current.material.uniforms.uDensity.value = density.read.texture
            displayMeshRef.current.material.uniforms.uVelocity.value = velocity.read.texture
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

export default function FluidDemo() {
    const mouseRef = useRef({ x: 0.5, y: 0.5, active: false })

    useEffect(() => {
        const onMove = (e) => {
            mouseRef.current.x = e.clientX / window.innerWidth
            mouseRef.current.y = 1 - e.clientY / window.innerHeight
            mouseRef.current.active = true
        }
        const onLeave = () => { mouseRef.current.active = false }
        const onDown = () => { mouseRef.current.active = true }
        const onUp = () => { mouseRef.current.active = false }

        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseleave', onLeave)
        window.addEventListener('mousedown', onDown)
        window.addEventListener('mouseup', onUp)
        return () => {
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseleave', onLeave)
            window.removeEventListener('mousedown', onDown)
            window.removeEventListener('mouseup', onUp)
        }
    }, [])

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
            <div style={{
                position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
                zIndex: 10, fontFamily: 'monospace', color: '#fff',
                background: '#222', padding: '8px 16px', borderRadius: 4,
            }}>
                Move mouse to create smoke
            </div>
            <Canvas
                orthographic
                camera={{ left: -1, right: 1, top: 1, bottom: -1, near: 0.1, far: 10, position: [0, 0, 5] }}
                gl={{ preserveDrawingBuffer: true }}
            >
                <FluidSim mouseRef={mouseRef} />
            </Canvas>
        </div>
    )
}
