// Display shader - classic aviation-radar screen: green phosphor density
// fill masked to a circular scope, range rings, a crosshair, and a
// continuously rotating sweep beam with a fading trail behind it — the
// fluid sim becomes "returns" on a radar display instead of smoke.
uniform sampler2D uDensity;
uniform float uSweepAngle;
varying vec2 vUv;

const float PI = 3.14159265359;
const float TAU = 6.28318530718;
const float SCOPE_R = 0.42;

void main() {
    vec2 centered = vUv - 0.5;
    float dist = length(centered);
    float angle = atan(centered.y, centered.x);
    float inScope = step(dist, SCOPE_R);

    vec4 density = texture2D(uDensity, vUv);
    float d = max(max(density.r, density.g), density.b);
    vec3 color = vec3(0.04, 0.28, 0.06) * d * 2.4 * inScope;

    float ring = 0.0;
    for (int i = 1; i <= 4; i++) {
        float r = float(i) * 0.1;
        ring = max(ring, 1.0 - smoothstep(0.0, 0.0015, abs(dist - r)));
    }
    color += vec3(0.0, 0.22, 0.0) * ring * inScope;

    float crosshair = max(
        1.0 - smoothstep(0.0, 0.0015, abs(centered.x)),
        1.0 - smoothstep(0.0, 0.0015, abs(centered.y))
    );
    color += vec3(0.0, 0.18, 0.0) * crosshair * inScope;

    float bezel = 1.0 - smoothstep(0.0, 0.003, abs(dist - SCOPE_R));
    color += vec3(0.1, 0.6, 0.15) * bezel;

    float angleDiff = mod(angle - uSweepAngle + PI, TAU) - PI;
    float trail = 1.0 - smoothstep(0.0, 1.0, max(-angleDiff, 0.0));
    color += vec3(0.05, 0.55, 0.1) * trail * 0.3 * inScope;

    float beamLine = 1.0 - smoothstep(0.0, 0.015, abs(angleDiff));
    color += vec3(0.2, 1.0, 0.3) * beamLine * inScope;

    gl_FragColor = vec4(color, 1.0);
}
