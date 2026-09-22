// Display shader - visualize the velocity field itself as short oriented
// strokes on a grid, instead of rendering a density/smoke texture. Each
// cell samples velocity at its center and draws a line segment along that
// direction, growing from a barely-visible dot to a full stroke as local
// speed rises. At zero velocity a cell's stroke length collapses to ~0 and
// visibility is gated to 0 too, so the field reads as fully empty at rest.
uniform sampler2D uVelocity;
uniform vec2 uResolution;
uniform float uCellSize;
uniform vec3 uColor;
varying vec2 vUv;

float sdSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
    return length(pa - ba * h);
}

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 cellCoord = floor(fragCoord / uCellSize);
    vec2 cellCenter = (cellCoord + 0.5) * uCellSize;
    vec2 cellCenterUv = cellCenter / uResolution;

    vec2 vel = texture2D(uVelocity, cellCenterUv).xy;
    float speed = length(vel);
    float mag = clamp(speed * 0.09, 0.0, 1.0);

    vec2 dir = speed > 0.0001 ? vel / speed : vec2(1.0, 0.0);
    float halfLen = mag * uCellSize * 0.46;
    vec2 a = cellCenter - dir * halfLen;
    vec2 b = cellCenter + dir * halfLen;

    float d = sdSegment(fragCoord, a, b);
    float thickness = 2.0;
    float line = 1.0 - smoothstep(thickness - 1.0, thickness, d);

    // Small round cap glow at the leading end so the stroke reads as an
    // arrow-ish flick rather than a plain bar.
    float cap = 1.0 - smoothstep(1.5, 3.5, length(fragCoord - b));
    line = max(line, cap * mag);

    float visibility = smoothstep(0.006, 0.05, mag);
    vec3 color = uColor * line * visibility * (0.7 + 0.3 * mag);
    gl_FragColor = vec4(color, 1.0);
}
