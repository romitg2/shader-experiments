varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uColorD;

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
    vec2 aspectUv = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0) + 0.5;

    vec2 mouseOffset = (uMouse - 0.5) * uMouseInfluence;
    // Low base frequency -> a few large soft shapes instead of dense marbling.
    vec2 p = aspectUv * 0.8 + mouseOffset;

    float t = uTime * 0.08;

    // Domain warp: distort the sampling coordinates with noise before
    // sampling noise again, which is what gives this its organic,
    // slowly-morphing "mesh gradient" look instead of static noise. Kept
    // gentle so it drifts rather than churns.
    vec2 warp = vec2(fbm(p + t), fbm(p - t + 4.2));
    float n1 = fbm(p + warp * 0.35);
    float n2 = fbm(p * 1.1 - warp * 0.3 + 8.3);

    float mixA = smoothstep(-0.9, 0.9, n1);
    float mixB = smoothstep(-0.9, 0.9, n2);

    vec3 col = mix(uColorA, uColorB, mixA);
    col = mix(col, uColorC, mixB * 0.6);
    col = mix(col, uColorD, smoothstep(0.3, 0.9, n1 * n2 + 0.3));

    gl_FragColor = vec4(col, 1.0);
}
