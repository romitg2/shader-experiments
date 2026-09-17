import { useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const SIM_RES = 256

const vertShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const splatShader = `
uniform sampler2D uTarget;
uniform vec2 uPoint;
uniform vec3 uColor;
uniform float uRadius;
varying vec2 vUv;
void main() {
    vec2 p = vUv - uPoint;
    float splat = exp(-dot(p, p) / uRadius);
    vec3 base = texture2D(uTarget, vUv).rgb;
    gl_FragColor = vec4(base + uColor * splat, 1.0);
}`

const advectShader = `
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform float uDissipation;
varying vec2 vUv;
void main() {
    vec2 vel = texture2D(uVelocity, vUv).xy;
    vec2 coord = vUv - vel * 0.005;
    vec3 result = texture2D(uSource, coord).rgb * uDissipation;
    gl_FragColor = vec4(result, 1.0);
}`

const displayShader = `
uniform sampler2D uTexture;
uniform float uDebug;
varying vec2 vUv;
void main() {
    vec3 c = texture2D(uTexture, vUv).rgb;
    // Add debug: show UV as color if uDebug > 0
    if (uDebug > 0.5) {
        gl_FragColor = vec4(vUv.x, vUv.y, 0.5, 1.0);
    } else {
        gl_FragColor = vec4(c + 0.02, 1.0); // slight offset to see black
    }
}`

function createFBO() {
    return new THREE.WebGLRenderTarget(SIM_RES, SIM_RES, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
    })
}

function Fluid({ mouseRef }) {
    const { gl } = useThree()
    const displayRef = useRef()
    const frameCount = useRef(0)

    // FBOs
    const densityA = useMemo(() => createFBO(), [])
    const densityB = useMemo(() => createFBO(), [])
    const velA = useMemo(() => createFBO(), [])
    const velB = useMemo(() => createFBO(), [])
    const currentDen = useRef(densityA)
    const currentVel = useRef(velA)

    // Render setup
    const quad = useMemo(() => new THREE.PlaneGeometry(2, 2), [])
    const quadMesh = useMemo(() => new THREE.Mesh(quad), [quad])
    const fboScene = useMemo(() => { const s = new THREE.Scene(); s.add(quadMesh); return s }, [quadMesh])
    const fboCam = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), [])

    // Materials
    const splatMat = useMemo(() => new THREE.ShaderMaterial({
        vertexShader: vertShader,
        fragmentShader: splatShader,
        uniforms: {
            uTarget: { value: null },
            uPoint: { value: new THREE.Vector2() },
            uColor: { value: new THREE.Vector3() },
            uRadius: { value: 0.01 },
        }
    }), [])

    const advectMat = useMemo(() => new THREE.ShaderMaterial({
        vertexShader: vertShader,
        fragmentShader: advectShader,
        uniforms: {
            uVelocity: { value: null },
            uSource: { value: null },
            uDissipation: { value: 0.97 },
        }
    }), [])

    const render = (mat, target) => {
        quadMesh.material = mat
        gl.setRenderTarget(target)
        gl.render(fboScene, fboCam)
        gl.setRenderTarget(null)
    }

    useFrame(() => {
        frameCount.current++
        const m = mouseRef.current
        const dx = m.x - m.prevX
        const dy = m.y - m.prevY

        if ((Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) && m.active) {
            // Splat velocity
            let next = currentVel.current === velA ? velB : velA
            splatMat.uniforms.uTarget.value = currentVel.current.texture
            splatMat.uniforms.uPoint.value.set(m.x, m.y)
            splatMat.uniforms.uColor.value.set(dx * 100, dy * 100, 0)
            splatMat.uniforms.uRadius.value = 0.015
            render(splatMat, next)
            currentVel.current = next

            // Splat density
            next = currentDen.current === densityA ? densityB : densityA
            splatMat.uniforms.uTarget.value = currentDen.current.texture
            splatMat.uniforms.uColor.value.set(1, 1, 1)
            splatMat.uniforms.uRadius.value = 0.012
            render(splatMat, next)
            currentDen.current = next

            m.prevX = m.x
            m.prevY = m.y
        }

        // Advect density
        let next = currentDen.current === densityA ? densityB : densityA
        advectMat.uniforms.uVelocity.value = currentVel.current.texture
        advectMat.uniforms.uSource.value = currentDen.current.texture
        advectMat.uniforms.uDissipation.value = 0.98
        render(advectMat, next)
        currentDen.current = next

        // Advect velocity
        next = currentVel.current === velA ? velB : velA
        advectMat.uniforms.uSource.value = currentVel.current.texture
        advectMat.uniforms.uDissipation.value = 0.99
        render(advectMat, next)
        currentVel.current = next

        // Update display
        if (displayRef.current) {
            displayRef.current.uniforms.uTexture.value = currentDen.current.texture
            // Show debug UV for first 60 frames to verify mesh is visible
            displayRef.current.uniforms.uDebug.value = frameCount.current < 60 ? 1.0 : 0.0
        }
    })

    return (
        <mesh>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                ref={displayRef}
                vertexShader={vertShader}
                fragmentShader={displayShader}
                uniforms={{
                    uTexture: { value: null },
                    uDebug: { value: 1.0 }
                }}
            />
        </mesh>
    )
}

export default function FluidDemo() {
    const mouseRef = useRef({ x: 0.5, y: 0.5, prevX: 0.5, prevY: 0.5, active: false })

    useEffect(() => {
        const onMove = (e) => {
            mouseRef.current.prevX = mouseRef.current.x
            mouseRef.current.prevY = mouseRef.current.y
            mouseRef.current.x = e.clientX / window.innerWidth
            mouseRef.current.y = 1.0 - e.clientY / window.innerHeight
            mouseRef.current.active = true
        }
        window.addEventListener('mousemove', onMove)
        return () => window.removeEventListener('mousemove', onMove)
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
                camera={{
                    left: -1,
                    right: 1,
                    top: 1,
                    bottom: -1,
                    near: 0.1,
                    far: 10,
                    position: [0, 0, 5]
                }}
            >
                <Fluid mouseRef={mouseRef} />
            </Canvas>
        </div>
    )
}
