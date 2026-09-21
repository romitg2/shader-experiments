varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uMouseRadius;
uniform float uEnergy;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;

// 2D simplex noise (Ashima Arts, MIT) — the standard baseline used across
// most creative-coding noise shaders.
vec3 permute(vec3 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

// Fractal Brownian Motion: stack a couple octaves of noise for soft detail
// without breaking the surface into lots of small blobs.
float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 3; i++) {
        value += amplitude * snoise(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 aspectUv = (vUv - 0.5) * aspect + 0.5;

    // Ambient base: two colors slowly morphing into each other via a
    // domain-warped noise field. Always animating, independent of the mouse.
    vec2 p = aspectUv * 0.8;
    float t = uTime * 0.08;
    vec2 warp = vec2(fbm(p + t), fbm(p - t + 4.2));
    float n = fbm(p + warp * 0.35);
    vec3 col = mix(uColorA, uColorB, smoothstep(-0.9, 0.9, n));

    // Mouse spotlight: the third color glows around the cursor, with its own
    // soft noise-warped edge so it reads as part of the same fluid gradient
    // rather than a flat circle stamped on top. Gated by uEnergy so it's
    // fully absent at rest and only fades in/trails while the pointer is
    // actually moving.
    vec2 mouseAspect = (uMouse - 0.5) * aspect + 0.5;
    float dist = distance(aspectUv, mouseAspect);
    float edgeWobble = fbm(aspectUv * 3.0 + t * 2.0) * 0.08;
    float glow = smoothstep(uMouseRadius + edgeWobble, 0.0, dist) * uEnergy;
    col = mix(col, uColorC, glow);

    gl_FragColor = vec4(col, 1.0);
}
