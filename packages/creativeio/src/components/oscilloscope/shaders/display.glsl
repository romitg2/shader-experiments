// Display shader - samples the 2D density field along one horizontal
// scanline and plots it as a live glowing 1D waveform trace over a CRT
// graticule, the way an oscilloscope or seismograph turns a continuous
// signal into a line reading instead of showing the field itself.
uniform sampler2D uDensity;
varying vec2 vUv;

const float SCAN_Y = 0.5;
const float AMPLITUDE = 0.34;

float sampleTrace(float x) {
    vec4 c = texture2D(uDensity, vec2(x, SCAN_Y));
    return max(max(c.r, c.g), c.b);
}

void main() {
    vec2 grid = fract(vUv * 10.0);
    float gridLine = max(
        1.0 - smoothstep(0.0, 0.02, min(grid.x, 1.0 - grid.x)),
        1.0 - smoothstep(0.0, 0.02, min(grid.y, 1.0 - grid.y))
    );
    vec3 color = vec3(0.0, 0.18, 0.06) * gridLine * 0.35;

    float centerLine = 1.0 - smoothstep(0.0, 0.0015, abs(vUv.y - 0.5));
    color += vec3(0.0, 0.22, 0.06) * centerLine * 0.5;

    float trace = sampleTrace(vUv.x);
    float waveY = 0.5 + trace * AMPLITUDE;

    float dist = abs(vUv.y - waveY);
    float line = 1.0 - smoothstep(0.0, 0.006, dist);
    float glow = exp(-dist * 40.0) * 0.5;

    vec3 traceColor = vec3(0.15, 1.0, 0.35);
    color += traceColor * (line + glow);

    gl_FragColor = vec4(color, 1.0);
}
