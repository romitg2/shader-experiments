// Display shader - CAD/engineering-drawing look: a Sobel edge (same trick
// as Neon Flow) traces the density boundary in white "ink" over a solid
// blueprint-blue backdrop with a technical grid and tick marks, instead of
// the black/transparent background every other component in this family
// uses — reads like a hand-drafted schematic instead of a rendered fluid.
uniform sampler2D uDensity;
uniform vec2 uTexel;
varying vec2 vUv;

float intensityAt(vec2 uv) {
    vec4 c = texture2D(uDensity, uv);
    return max(max(c.r, c.g), c.b);
}

void main() {
    vec3 bg = vec3(0.05, 0.16, 0.38);

    vec2 grid = fract(gl_FragCoord.xy / 24.0);
    float gridLine = max(
        1.0 - smoothstep(0.0, 0.04, min(grid.x, 1.0 - grid.x)),
        1.0 - smoothstep(0.0, 0.04, min(grid.y, 1.0 - grid.y))
    );
    vec3 color = bg + vec3(1.0, 1.0, 1.0) * gridLine * 0.05;

    vec2 tick = fract(gl_FragCoord.xy / 120.0);
    float tickLine = max(
        1.0 - smoothstep(0.0, 0.02, min(tick.x, 1.0 - tick.x)),
        1.0 - smoothstep(0.0, 0.02, min(tick.y, 1.0 - tick.y))
    );
    color += vec3(1.0, 1.0, 1.0) * tickLine * 0.08;

    float l = intensityAt(vUv - vec2(uTexel.x, 0.0));
    float r = intensityAt(vUv + vec2(uTexel.x, 0.0));
    float b = intensityAt(vUv - vec2(0.0, uTexel.y));
    float t = intensityAt(vUv + vec2(0.0, uTexel.y));
    float edge = length(vec2(r - l, t - b));
    float line = smoothstep(0.02, 0.12, edge);

    color = mix(color, vec3(0.95, 0.97, 1.0), line);

    gl_FragColor = vec4(color, 1.0);
}
