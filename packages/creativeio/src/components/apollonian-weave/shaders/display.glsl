// Display shader - the same fixed-iteration IFS trick as Fractal Zoom, but
// folding by circle inversion (p *= k / dot(p,p)) instead of abs-fold —
// the classic Apollonian-gasket construction, which produces a curved,
// web-like weave instead of Fractal Zoom's angular carpet, at the same
// fixed 8-iteration cost. Colored via orbit-trap (bounded by construction,
// no division by an exploding accumulated scale) so detail stays crisp
// instead of washing into a blur. Always visible — moving the cursor
// perturbs the inversion radius, rippling through the weave.
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform float uEnergy;
varying vec2 vUv;

vec3 palette(float t) {
    vec3 a = vec3(0.5);
    vec3 b = vec3(0.5);
    vec3 c = vec3(1.0);
    vec3 d = vec3(0.3, 0.2, 0.5);
    return a + b * cos(6.28318 * (c * t + d));
}

void main() {
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 uv = (vUv - 0.5) * aspect;

    vec2 center = (uPointer - 0.5) * 0.4;
    vec2 p = uv * 1.6 + center;

    float k = 1.15 + uEnergy * 0.1;
    float trap = 1e6;
    for (int i = 0; i < 8; i++) {
        p = abs(p);
        float invLen = k / max(dot(p, p), 0.15);
        p *= invLen;
        p -= vec2(0.92, 0.32 + sin(uTime * 0.08) * 0.04);
        trap = min(trap, length(p));
    }

    vec3 color = palette(trap * 1.6 - uTime * 0.02);
    color *= smoothstep(1.3, 0.0, trap * 2.0);

    gl_FragColor = vec4(color, 1.0);
}
