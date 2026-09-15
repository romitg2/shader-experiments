// Pressure solver - Jacobi iteration
// Solves: Laplacian(pressure) = divergence
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 uResolution;

varying vec2 vUv;

void main() {
    vec2 texelSize = 1.0 / uResolution;

    float left   = texture2D(uPressure, vUv - vec2(texelSize.x, 0.0)).x;
    float right  = texture2D(uPressure, vUv + vec2(texelSize.x, 0.0)).x;
    float bottom = texture2D(uPressure, vUv - vec2(0.0, texelSize.y)).x;
    float top    = texture2D(uPressure, vUv + vec2(0.0, texelSize.y)).x;

    float divergence = texture2D(uDivergence, vUv).x;

    // Jacobi iteration
    float pressure = (left + right + bottom + top - divergence) * 0.25;

    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}
