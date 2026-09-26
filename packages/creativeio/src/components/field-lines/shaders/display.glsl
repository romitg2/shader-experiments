// Display shader - "iron filings around a magnet" look: a denser, thinner
// variant of Flow Field's velocity-stroke technique, monochrome, layered
// over a faint reference grid, the way a physics textbook diagram shows
// field lines instead of a rendered vector-field visualization.
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

    vec2 gridCell = fract(fragCoord / (uCellSize * 4.0));
    float gridLine = max(
        1.0 - smoothstep(0.0, 0.02, min(gridCell.x, 1.0 - gridCell.x)),
        1.0 - smoothstep(0.0, 0.02, min(gridCell.y, 1.0 - gridCell.y))
    );
    vec3 color = uColor * gridLine * 0.06;

    vec2 cellCoord = floor(fragCoord / uCellSize);
    vec2 cellCenter = (cellCoord + 0.5) * uCellSize;
    vec2 cellCenterUv = cellCenter / uResolution;

    vec2 vel = texture2D(uVelocity, cellCenterUv).xy;
    float speed = length(vel);
    float mag = clamp(speed * 0.2, 0.0, 1.0);

    vec2 dir = speed > 0.0001 ? vel / speed : vec2(1.0, 0.0);
    float halfLen = mix(0.22, 0.48, mag) * uCellSize;
    vec2 a = cellCenter - dir * halfLen;
    vec2 b = cellCenter + dir * halfLen;

    float d = sdSegment(fragCoord, a, b);
    float thickness = 1.6;
    float line = 1.0 - smoothstep(thickness - 0.7, thickness, d);

    float visibility = smoothstep(0.006, 0.05, mag);
    color += uColor * line * visibility * (0.85 + 0.15 * mag);

    gl_FragColor = vec4(color, 1.0);
}
