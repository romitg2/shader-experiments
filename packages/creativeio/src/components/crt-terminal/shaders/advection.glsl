// Advection - move quantity along velocity field
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform float uDt;
uniform float uDissipation;
uniform vec2 uResolution;

varying vec2 vUv;

void main() {
    vec2 texelSize = 1.0 / uResolution;

    // Get velocity at this point
    vec2 velocity = texture2D(uVelocity, vUv).xy;

    // Trace backwards along velocity
    vec2 prevUv = vUv - velocity * uDt * texelSize;

    // Sample the source at previous position
    vec4 result = texture2D(uSource, prevUv);

    // Apply dissipation (fade over time)
    gl_FragColor = result * uDissipation;
}
