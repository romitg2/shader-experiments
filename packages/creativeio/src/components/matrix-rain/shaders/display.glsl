// Display shader - classic falling-code rain. No simulation buffers: each
// column's fall speed/offset comes from a per-column hash, the glyph shown
// in each cell comes from a per-cell hash that re-rolls every few frames,
// and the bright head + fading tail is a closed-form function of how far
// the column has fallen - all fixed, small per-pixel cost regardless of
// screen size. Always visible; the cursor only adds a soft proximity glow.
uniform sampler2D uAtlas;
uniform vec2 uResolution;
uniform float uCellSize;
uniform float uLevels;
uniform float uTime;
uniform vec2 uPointer;
uniform float uEnergy;
varying vec2 vUv;

float hash1(float n) {
    return fract(sin(n) * 43758.5453123);
}

float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
    vec2 cell = floor(gl_FragCoord.xy / uCellSize);
    float gridRows = ceil(uResolution.y / uCellSize);
    float fallRow = gridRows - cell.y;

    float colSeed = hash1(cell.x);
    float speed = mix(4.0, 13.0, colSeed);
    float colOffset = colSeed * (gridRows + 24.0);
    float head = mod(uTime * speed + colOffset, gridRows + 24.0) - 12.0;

    float behind = head - fallRow;
    float trailLen = mix(10.0, 22.0, hash1(cell.x + 100.0));
    float bright = 0.0;
    if (behind >= 0.0 && behind < trailLen) {
        bright = pow(1.0 - behind / trailLen, 1.6);
    }
    float isHead = step(0.0, behind) * step(behind, 1.0);

    float glyphBucket = floor(uTime * 5.0 + hash2(cell) * 12.0);
    float glyphIndex = floor(hash2(cell + glyphBucket) * uLevels);

    vec2 localUv = fract(gl_FragCoord.xy / uCellSize);
    localUv.y = 1.0 - localUv.y;
    vec2 atlasUv = vec2((glyphIndex + localUv.x) / uLevels, localUv.y);
    float glyph = texture2D(uAtlas, atlasUv).r;

    vec3 green = vec3(0.15, 1.0, 0.35);
    vec3 white = vec3(0.85, 1.0, 0.92);
    vec3 color = mix(green, white, isHead) * bright;

    vec2 uv = gl_FragCoord.xy / uResolution;
    float distToPointer = distance(uv, uPointer);
    float glow = smoothstep(0.28, 0.0, distToPointer) * (0.4 + uEnergy * 0.8);
    color += green * glow * 0.35;

    gl_FragColor = vec4(color * glyph, 1.0);
}
