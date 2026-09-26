// Display shader - a domain-warped FBM field (the same cheap technique as
// Marble/Nebula Turbulence) rendered entirely as ASCII: each cell buckets
// the field's value at its own center into a glyph from a texture atlas.
// The cursor doesn't reveal anything hidden - instead it injects a local
// warp bump into the FBM's domain-warp step, so movement visibly pushes a
// flow/ripple through the pattern that dissipates once the cursor stops.
uniform sampler2D uAtlas;
uniform vec2 uResolution;
uniform float uCellSize;
uniform float uLevels;
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

float portrait(vec2 uv, vec2 pointerUv, float energy) {
    float pdist = length(uv - pointerUv);
    float bump = energy * exp(-pdist * pdist * 1.1) * 3.2;
    vec2 q = vec2(fbm(uv + uTime * 0.012 + bump), fbm(uv + vec2(3.1, 1.7) + uTime * 0.009 + bump));
    vec2 r = vec2(
        fbm(uv + 3.0 * q + vec2(1.2, 7.3) + bump),
        fbm(uv + 3.0 * q + vec2(4.8, 2.1) + bump)
    );
    return fbm(uv + 3.0 * r);
}

void main() {
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 scale = aspect * 2.4;
    vec2 pointerUv = uPointer * scale;

    vec2 cellCoord = floor(gl_FragCoord.xy / uCellSize);
    vec2 cellCenterUv = (cellCoord * uCellSize + uCellSize * 0.5) / uResolution;
    float cellVal = clamp(portrait(cellCenterUv * scale, pointerUv, uEnergy), 0.0, 1.0);
    float level = floor(cellVal * (uLevels - 1.0) + 0.5);

    vec2 localUv = fract(gl_FragCoord.xy / uCellSize);
    localUv.y = 1.0 - localUv.y;
    vec2 atlasUv = vec2((level + localUv.x) / uLevels, localUv.y);
    float glyph = texture2D(uAtlas, atlasUv).r;

    gl_FragColor = vec4(vec3(glyph), 1.0);
}
