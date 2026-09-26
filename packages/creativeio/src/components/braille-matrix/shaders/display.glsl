// Display shader - a procedural braille-style dot matrix: each on-screen
// cell is split into a 2x4 grid of sub-dots (8 total, matching a real
// braille cell), and each sub-dot independently samples the density field
// at its own sub-cell position, not the cell center. That gives 8x finer
// effective sampling than a single per-cell lookup (ASCII Fluid's
// approach) while still drawing nothing but flat-shaded circles - no font
// atlas needed. Distance to each dot's center is computed in real screen
// pixels (not axis-normalized subcell space) so the dots stay circular
// even though each subcell rectangle is wider than it is tall.
uniform sampler2D uDensity;
uniform vec2 uResolution;
uniform float uCellSize;
uniform vec3 uColor;
varying vec2 vUv;

const vec2 GRID = vec2(2.0, 4.0);

void main() {
    vec2 cellCoord = floor(gl_FragCoord.xy / uCellSize);
    vec2 subCellSize = uCellSize / GRID;
    vec2 localPx = gl_FragCoord.xy - cellCoord * uCellSize;
    vec2 sub = floor(localPx / subCellSize);

    vec2 subOriginPx = cellCoord * uCellSize + sub * subCellSize;
    vec2 subCenterUv = (subOriginPx + subCellSize * 0.5) / uResolution;
    vec4 density = texture2D(uDensity, subCenterUv);
    float d = clamp(max(max(density.r, density.g), density.b), 0.0, 1.0);
    float lit = step(0.06, d);

    vec2 subCenterPx = subOriginPx + subCellSize * 0.5;
    float distPx = length(gl_FragCoord.xy - subCenterPx);

    float dotRadiusPx = min(subCellSize.x, subCellSize.y) * 0.36;
    float dot = (1.0 - smoothstep(dotRadiusPx - 1.0, dotRadiusPx, distPx)) * lit;

    gl_FragColor = vec4(uColor * dot, 1.0);
}
