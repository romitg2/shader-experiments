// Display shader - the same Worley cell search as Cell Growth, but
// tracking which cell is nearest (F1) and which is second-nearest (F2)
// instead of just the F1 distance: each pixel is flat-shaded by its
// owning cell's hashed color (true Voronoi region fill), with a thin
// edge line drawn where F2-F1 is small (the cell boundary) — a faceted
// crystal/stained-glass look instead of Cell Growth's soft glow.
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

vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
}

void main() {
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 uv = vUv * aspect * 6.0;

    vec2 ip = floor(uv);
    vec2 fp = fract(uv);
    float f1 = 8.0;
    float f2 = 8.0;
    vec2 bestId = vec2(0.0);

    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 cellId = ip + neighbor;
            vec2 pointHash = hash2(cellId);
            vec2 animatedPoint = neighbor + 0.5 + 0.22 * sin(uTime * 0.2 + pointHash * 6.2831);
            float d = length(animatedPoint - fp);
            if (d < f1) {
                f2 = f1;
                f1 = d;
                bestId = cellId;
            } else if (d < f2) {
                f2 = d;
            }
        }
    }

    float edge = f2 - f1;
    float seed = hash(bestId);

    vec3 c1 = vec3(0.05, 0.15, 0.35);
    vec3 c2 = vec3(0.15, 0.45, 0.55);
    vec3 c3 = vec3(0.55, 0.35, 0.75);
    vec3 facetColor = mix(mix(c1, c2, seed), c3, step(0.66, seed));

    vec2 puv = uPointer * aspect * 6.0;
    float pd = length(uv - puv);
    facetColor += vec3(0.3, 0.5, 0.7) * uEnergy * exp(-pd * pd * 0.3);

    float edgeLine = 1.0 - smoothstep(0.0, 0.04, edge);
    vec3 color = mix(facetColor, vec3(0.02, 0.03, 0.05), edgeLine * 0.85);

    gl_FragColor = vec4(color, 1.0);
}
