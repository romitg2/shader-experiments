// Divergence - compute how much fluid is "created" at each point
// (should be zero for incompressible fluid)
uniform sampler2D uVelocity;
uniform vec2 uResolution;

varying vec2 vUv;

void main() {
    vec2 texelSize = 1.0 / uResolution;

    float left   = texture2D(uVelocity, vUv - vec2(texelSize.x, 0.0)).x;
    float right  = texture2D(uVelocity, vUv + vec2(texelSize.x, 0.0)).x;
    float bottom = texture2D(uVelocity, vUv - vec2(0.0, texelSize.y)).y;
    float top    = texture2D(uVelocity, vUv + vec2(0.0, texelSize.y)).y;

    float divergence = 0.5 * (right - left + top - bottom);

    gl_FragColor = vec4(divergence, 0.0, 0.0, 1.0);
}
