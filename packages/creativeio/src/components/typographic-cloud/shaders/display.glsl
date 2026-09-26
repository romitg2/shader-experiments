// Display shader - unlike ASCII Fluid (glyph picked by brightness level),
// each cell here gets a fixed RANDOM letter from the atlas, chosen once by
// hashing its grid coordinate - the letters never change, only their
// opacity, which tracks local density. The smoke reads as a drifting cloud
// made of typography instead of a brightness-mapped ASCII-art picture.
uniform sampler2D uDensity;
uniform sampler2D uAtlas;
uniform vec2 uResolution;
uniform float uCellSize;
uniform float uLevels;
uniform vec3 uColor;
varying vec2 vUv;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

void main() {
    vec2 cellCoord = floor(gl_FragCoord.xy / uCellSize);
    vec2 cellCenterUv = (cellCoord * uCellSize + uCellSize * 0.5) / uResolution;

    vec4 density = texture2D(uDensity, cellCenterUv);
    float intensity = clamp(max(max(density.r, density.g), density.b), 0.0, 1.0);

    float glyphIndex = floor(hash(cellCoord) * uLevels);

    vec2 localUv = fract(gl_FragCoord.xy / uCellSize);
    localUv.y = 1.0 - localUv.y;
    vec2 atlasUv = vec2((glyphIndex + localUv.x) / uLevels, localUv.y);
    float glyph = texture2D(uAtlas, atlasUv).r;

    float alpha = glyph * smoothstep(0.02, 0.5, intensity);
    gl_FragColor = vec4(uColor, alpha);
}
