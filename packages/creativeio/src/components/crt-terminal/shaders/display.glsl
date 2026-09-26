// Display shader - same ASCII-bucket-to-glyph-atlas lookup as ASCII Fluid,
// with a CRT overlay stacked on top at negligible extra cost: per-channel
// atlas sampling offset for chromatic aberration fringing, a moving
// sine-wave scanline darken, a radial vignette, and a slow brightness
// flicker.
uniform sampler2D uDensity;
uniform sampler2D uAtlas;
uniform vec2 uResolution;
uniform float uCellSize;
uniform float uLevels;
uniform vec3 uColor;
uniform float uTime;
varying vec2 vUv;

void main() {
    vec2 cellCoord = floor(gl_FragCoord.xy / uCellSize);
    vec2 cellCenterUv = (cellCoord * uCellSize + uCellSize * 0.5) / uResolution;

    vec4 density = texture2D(uDensity, cellCenterUv);
    float intensity = clamp(max(max(density.r, density.g), density.b), 0.0, 1.0);
    float level = floor(intensity * (uLevels - 1.0) + 0.5);

    vec2 localUv = fract(gl_FragCoord.xy / uCellSize);
    localUv.y = 1.0 - localUv.y;

    float aberration = 0.55;
    float glyphR = texture2D(uAtlas, vec2((level + localUv.x) / uLevels - aberration / (uLevels * 64.0), localUv.y)).r;
    float glyphG = texture2D(uAtlas, vec2((level + localUv.x) / uLevels, localUv.y)).r;
    float glyphB = texture2D(uAtlas, vec2((level + localUv.x) / uLevels + aberration / (uLevels * 64.0), localUv.y)).r;

    vec3 glyphColor = vec3(glyphR, glyphG, glyphB) * uColor;

    float scanline = 0.82 + 0.18 * sin(gl_FragCoord.y * 3.14159 * 0.9 - uTime * 6.0);
    glyphColor *= scanline;

    vec2 centered = vUv - 0.5;
    float vignette = 1.0 - dot(centered, centered) * 0.9;
    glyphColor *= vignette;

    float flicker = 0.97 + 0.03 * sin(uTime * 37.0);
    glyphColor *= flicker;

    gl_FragColor = vec4(glyphColor, 1.0);
}
