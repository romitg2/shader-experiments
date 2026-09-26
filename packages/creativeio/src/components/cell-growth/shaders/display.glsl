// Display shader - Worley (cellular) noise: for each pixel, search only
// the 3x3 grid of cells around it (9 distance checks) for the nearest of
// one pseudo-random point per cell — fixed cost regardless of scale,
// unlike a real particle system. Each cell's point gently orbits over
// time for a "living tissue" pulse, and glows brighter near the cursor.
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform float uEnergy;
varying vec2 vUv;

vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
}

float worleyF1(vec2 p) {
    vec2 ip = floor(p);
    vec2 fp = fract(p);
    float minDist = 8.0;
    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 pointHash = hash2(ip + neighbor);
            vec2 animatedPoint = neighbor + 0.5 + 0.35 * sin(uTime * 0.3 + pointHash * 6.2831);
            float d = length(animatedPoint - fp);
            minDist = min(minDist, d);
        }
    }
    return minDist;
}

void main() {
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 uv = vUv * aspect * 7.0;

    float d = worleyF1(uv);

    vec3 bg = vec3(0.02, 0.05, 0.06);
    vec3 cellColor = vec3(0.1, 0.55, 0.5);
    vec3 color = mix(cellColor, bg, smoothstep(0.0, 0.5, d));

    vec2 puv = uPointer * aspect * 7.0;
    float pd = length(uv - puv);
    color += vec3(0.3, 0.75, 0.65) * uEnergy * exp(-pd * pd * 0.5) * 0.7;

    gl_FragColor = vec4(color, 1.0);
}
