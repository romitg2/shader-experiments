uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform float uProgress;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uResolution;
uniform vec2 uImageSize1;
uniform vec2 uImageSize2;
varying vec2 vUv;

vec2 coverUv(vec2 uv, vec2 imgSize) {
    vec2 s = uResolution / imgSize;
    float scale = max(s.x, s.y);
    vec2 scaledSize = imgSize * scale;
    vec2 offset = (uResolution - scaledSize) * 0.5;
    return (uv * uResolution - offset) / scaledSize;
}

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
    // Slice the frame into a grid; each cell gets its own randomized delay
    // and displacement direction, so the transition reads as a matrix of
    // tiles sliding/liquifying at slightly different times.
    float cells = 10.0;
    vec2 cellId = floor(vUv * cells);

    float rand = hash(cellId);
    float delay = rand * 0.55;
    float cellProgress = clamp((uProgress - delay) / (1.0 - delay), 0.0, 1.0);

    vec2 dir = normalize(vec2(hash(cellId + 3.7), hash(cellId + 9.1)) - 0.5 + 1e-4);
    float wobble = sin(uTime * uSpeed + rand * 12.0) * 0.5 + 0.5;
    float remaining = 1.0 - smoothstep(0.0, 1.0, cellProgress);
    vec2 displacement = dir * remaining * 0.18 * wobble;

    vec2 uv1 = coverUv(vUv + displacement, uImageSize1);
    vec2 uv2 = coverUv(vUv - displacement * 0.6, uImageSize2);

    vec4 col1 = texture2D(uTexture1, uv1);
    vec4 col2 = texture2D(uTexture2, uv2);

    gl_FragColor = mix(col1, col2, smoothstep(0.0, 1.0, cellProgress));
}
