// Gradient Subtract - subtract pressure gradient from velocity
// Makes velocity field divergence-free (incompressible)
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 uResolution;

varying vec2 vUv;

void main() {
    vec2 texelSize = 1.0 / uResolution;

    float left   = texture2D(uPressure, vUv - vec2(texelSize.x, 0.0)).x;
    float right  = texture2D(uPressure, vUv + vec2(texelSize.x, 0.0)).x;
    float bottom = texture2D(uPressure, vUv - vec2(0.0, texelSize.y)).x;
    float top    = texture2D(uPressure, vUv + vec2(0.0, texelSize.y)).x;

    vec2 velocity = texture2D(uVelocity, vUv).xy;

    // Subtract pressure gradient
    velocity -= vec2(right - left, top - bottom) * 0.5;

    gl_FragColor = vec4(velocity, 0.0, 1.0);
}
