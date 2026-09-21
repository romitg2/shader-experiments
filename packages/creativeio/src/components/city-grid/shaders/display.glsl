// Display shader - render density as a grid of variable-size squares
// ("city grid" / skyline look) instead of smooth smoke or scattered dots.
// Each cell's square grows with local density and shrinks back down as it
// dissipates, so a splat reads as colored blocks expanding outward from
// wherever the pointer moved, then settling back to nothing.
uniform sampler2D uDensity;
uniform vec2 uResolution;
uniform float uCellSize;
uniform float uGap;
varying vec2 vUv;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 cellCoord = floor(gl_FragCoord.xy / uCellSize);
    vec2 cellCenterUv = (cellCoord * uCellSize + uCellSize * 0.5) / uResolution;
    vec2 localUv = fract(gl_FragCoord.xy / uCellSize) - 0.5;

    vec4 density = texture2D(uDensity, cellCenterUv);
    float intensity = max(max(density.r, density.g), density.b);

    // Small per-cell jitter so the grid isn't perfectly uniform even at a
    // flat density value — reads as organic texture rather than a rigid
    // bar chart.
    float jitter = hash(cellCoord) * 0.12;
    float halfSize = clamp(intensity + jitter, 0.0, 1.0) * (0.5 - uGap * 0.5);

    float edge = 0.04;
    float mx = 1.0 - smoothstep(halfSize - edge, halfSize, abs(localUv.x));
    float my = 1.0 - smoothstep(halfSize - edge, halfSize, abs(localUv.y));
    float inSquare = mx * my;

    float brightness = 0.75 + hash(cellCoord + 3.7) * 0.25;

    vec3 color = density.rgb * inSquare * brightness;
    gl_FragColor = vec4(color, 1.0);
}
