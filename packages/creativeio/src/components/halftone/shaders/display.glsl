// Display shader - render density as a deterministic grid of circles whose
// radius grows continuously with local density (classic newsprint halftone
// screen), unlike City Grid's squares or Pixel Ink's randomly-dithered
// dots. No per-cell randomness at all: the same density always produces
// the exact same dot size, so a splat reads as a crisp, printed pattern
// expanding outward rather than a grainy or blocky one.
uniform sampler2D uDensity;
uniform vec2 uResolution;
uniform float uCellSize;
varying vec2 vUv;

void main() {
    vec2 cellCoord = floor(gl_FragCoord.xy / uCellSize);
    vec2 cellCenterPx = cellCoord * uCellSize + uCellSize * 0.5;
    vec2 cellCenterUv = cellCenterPx / uResolution;
    vec2 localPx = gl_FragCoord.xy - cellCenterPx;

    vec4 density = texture2D(uDensity, cellCenterUv);
    float intensity = max(max(density.r, density.g), density.b);

    float maxRadius = uCellSize * 0.5 * 0.92;
    float radius = intensity * maxRadius;

    float d = length(localPx) - radius;
    float inCircle = 1.0 - smoothstep(0.0, 1.2, d);

    vec3 color = density.rgb * inCircle;
    gl_FragColor = vec4(color, 1.0);
}
