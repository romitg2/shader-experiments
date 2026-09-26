// Display shader - classic domain-warped fractional Brownian motion
// (fixed 5-octave value noise, warped through itself twice): each octave
// and warp level is a handful of hash/lerp ops, so total cost is fixed
// and small (~15-20 noise evaluations per pixel) regardless of the
// apparent swirl complexity — the standard cheap technique for
// marbled/painterly turbulence. Always visible — moving the cursor
// injects a local warp bump that ripples outward and settles.
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
        p *= 2.03;
        amp *= 0.5;
    }
    return v;
}

void main() {
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 uv = vUv * aspect * 3.0;

    vec2 puv = uPointer * aspect * 3.0;
    float pdist = length(uv - puv);
    float bump = uEnergy * exp(-pdist * pdist * 2.5) * 1.4;

    vec2 q = vec2(fbm(uv + uTime * 0.02), fbm(uv + vec2(5.2, 1.3) + uTime * 0.015));
    vec2 r = vec2(
        fbm(uv + 4.0 * q + vec2(1.7, 9.2) + bump),
        fbm(uv + 4.0 * q + vec2(8.3, 2.8) + bump)
    );
    float f = fbm(uv + 4.0 * r);

    vec3 marbleA = vec3(0.04, 0.04, 0.06);
    vec3 marbleB = vec3(0.88, 0.86, 0.82);
    vec3 vein = vec3(0.3, 0.2, 0.13);

    vec3 color = mix(marbleA, marbleB, f);
    color = mix(color, vein, smoothstep(0.45, 0.5, r.x) * smoothstep(0.55, 0.5, r.x));

    gl_FragColor = vec4(color, 1.0);
}
