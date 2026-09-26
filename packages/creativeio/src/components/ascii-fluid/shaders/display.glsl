// Display shader - classic terminal ASCII-art conversion: each grid cell
// samples local density, buckets it into one of a fixed number of
// brightness levels, and looks up the matching pre-rendered glyph from a
// texture atlas (built once via Canvas2D, not drawn per-pixel) — the same
// per-cell cost as Halftone's circle-size lookup, just a texture sample
// instead of an SDF circle.
uniform sampler2D uDensity;
uniform sampler2D uAtlas;
uniform vec2 uResolution;
uniform float uCellSize;
uniform float uLevels;
uniform vec3 uColor;
varying vec2 vUv;

void main() {
    vec2 cellCoord = floor(gl_FragCoord.xy / uCellSize);
    vec2 cellCenterUv = (cellCoord * uCellSize + uCellSize * 0.5) / uResolution;

    vec4 density = texture2D(uDensity, cellCenterUv);
    float intensity = clamp(max(max(density.r, density.g), density.b), 0.0, 1.0);
    float level = floor(intensity * (uLevels - 1.0) + 0.5);

    vec2 localUv = fract(gl_FragCoord.xy / uCellSize);
    localUv.y = 1.0 - localUv.y;
    vec2 atlasUv = vec2((level + localUv.x) / uLevels, localUv.y);
    float glyph = texture2D(uAtlas, atlasUv).r;

    gl_FragColor = vec4(uColor * glyph, 1.0);
}
