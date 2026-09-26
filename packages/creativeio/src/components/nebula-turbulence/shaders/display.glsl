// Display shader - the same domain-warped FBM technique as Marble
// Turbulence, but with a larger warp scale for a wispier cosmic-cloud
// look, a purple/blue/pink palette, and a cheap sparse twinkling-star
// layer (a single hashed-cell test per pixel, not a particle system) —
// still a fixed, small per-pixel cost. Always visible — moving the
// cursor injects a local warp bump that ripples outward.
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform float uEnergy;
varying vec2 vUv;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 5; i++) {
        v += amp * noise(p);
        p *= 2.1;
        amp *= 0.5;
    }
    return v;
}

float starLayer(vec2 uv, float cellSize, float density, float twinkleSpeed) {
    vec2 p = uv / cellSize;
    vec2 cell = floor(p);
    vec2 f = fract(p) - 0.5;
    float h = hash(cell);
    if (h > density) return 0.0;
    vec2 starPos = (vec2(hash(cell + 1.7), hash(cell + 9.3)) - 0.5) * 0.8;
    float d = length(f - starPos);
    float twinkle = 0.5 + 0.5 * sin(uTime * twinkleSpeed + h * 30.0);
    return smoothstep(0.06, 0.0, d) * twinkle;
}

void main() {
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 uv = vUv * aspect * 2.2;

    vec2 puv = uPointer * aspect * 2.2;
    float pdist = length(uv - puv);
    float bump = uEnergy * exp(-pdist * pdist * 2.0) * 1.8;

    vec2 q = vec2(fbm(uv + uTime * 0.015), fbm(uv + vec2(3.1, 7.4) + uTime * 0.011));
    vec2 r = vec2(
        fbm(uv + 5.0 * q + vec2(2.3, 5.9) + bump),
        fbm(uv + 5.0 * q + vec2(6.8, 1.4) + bump)
    );
    float f = fbm(uv + 5.0 * r);

    vec3 deep = vec3(0.02, 0.01, 0.06);
    vec3 mid = vec3(0.25, 0.08, 0.35);
    vec3 hot = vec3(0.75, 0.35, 0.55);
    vec3 highlight = vec3(0.45, 0.55, 0.85);

    vec3 color = mix(deep, mid, smoothstep(0.2, 0.55, f));
    color = mix(color, hot, smoothstep(0.55, 0.75, f));
    color = mix(color, highlight, smoothstep(0.35, 0.5, r.y) * 0.4);

    float stars = starLayer(vUv * uResolution.xy, 22.0, 0.06, 1.5);
    stars += starLayer(vUv * uResolution.xy + 71.0, 40.0, 0.03, 0.8) * 0.7;
    color += vec3(0.9, 0.92, 1.0) * stars;

    gl_FragColor = vec4(color, 1.0);
}
