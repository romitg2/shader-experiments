// Display shader - a topology-based variant of City Grid: instead of a
// filled square per active cell, each active cell draws a small square
// "pad" and thin trace lines connecting it to whichever orthogonal
// neighbor cells are also active, snapping the fluid onto a PCB-style
// circuit-board layout of pads and right-angle wires instead of a smooth
// blob or a grid of independent squares.
uniform sampler2D uDensity;
uniform vec2 uResolution;
uniform float uCellSize;
varying vec2 vUv;

vec4 cellSample(vec2 cellCoord) {
    vec2 uv = (cellCoord * uCellSize + uCellSize * 0.5) / uResolution;
    return texture2D(uDensity, uv);
}

float intensity(vec4 c) {
    return max(max(c.r, c.g), c.b);
}

float lineMask(float v, float halfWidth) {
    return 1.0 - smoothstep(halfWidth - 0.03, halfWidth, abs(v));
}

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 cellCoord = floor(fragCoord / uCellSize);
    vec2 localUv = fract(fragCoord / uCellSize) - 0.5;

    const float THRESHOLD = 0.1;
    const float TRACE_HALF_WIDTH = 0.08;
    const float PAD_HALF_SIZE = 0.16;

    vec4 here = cellSample(cellCoord);
    float hereActive = step(THRESHOLD, intensity(here));

    vec4 rightC = cellSample(cellCoord + vec2(1.0, 0.0));
    vec4 leftC = cellSample(cellCoord + vec2(-1.0, 0.0));
    vec4 upC = cellSample(cellCoord + vec2(0.0, 1.0));
    vec4 downC = cellSample(cellCoord + vec2(0.0, -1.0));

    float rightActive = hereActive * step(THRESHOLD, intensity(rightC));
    float leftActive = hereActive * step(THRESHOLD, intensity(leftC));
    float upActive = hereActive * step(THRESHOLD, intensity(upC));
    float downActive = hereActive * step(THRESHOLD, intensity(downC));

    float hTraceR = rightActive * step(0.0, localUv.x) * lineMask(localUv.y, TRACE_HALF_WIDTH);
    float hTraceL = leftActive * step(localUv.x, 0.0) * lineMask(localUv.y, TRACE_HALF_WIDTH);
    float vTraceU = upActive * step(0.0, localUv.y) * lineMask(localUv.x, TRACE_HALF_WIDTH);
    float vTraceD = downActive * step(localUv.y, 0.0) * lineMask(localUv.x, TRACE_HALF_WIDTH);

    float pad = hereActive * step(abs(localUv.x), PAD_HALF_SIZE) * step(abs(localUv.y), PAD_HALF_SIZE);

    float lit = max(max(max(hTraceR, hTraceL), max(vTraceU, vTraceD)), pad);

    vec3 tint = here.rgb;
    float tintMag = max(max(tint.r, tint.g), tint.b);
    vec3 normalizedTint = tintMag > 0.001 ? tint / tintMag : vec3(0.2, 0.9, 0.35);

    vec3 bg = vec3(0.015, 0.03, 0.02);
    vec3 color = mix(bg, normalizedTint, lit);

    gl_FragColor = vec4(color, 1.0);
}
