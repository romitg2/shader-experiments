// Display shader - unlike Soft Spread, this does NOT blur away the sim's
// fine turbulent detail. It renders the density field at full resolution
// with all its curls and wisps intact, but pushed through a narrow output
// curve (uContrast) so it never gets brighter than a faint pale wisp and
// rendered at low alpha on a transparent canvas — real smoke seen from a
// distance keeps its fine structure even when it's barely visible.
uniform sampler2D uDensity;
uniform vec3 uColor;
uniform float uContrast;
uniform float uOpacity;
varying vec2 vUv;

void main() {
    vec4 density = texture2D(uDensity, vUv);
    float d = max(max(density.r, density.g), density.b);
    float shaped = pow(clamp(d, 0.0, 1.0), uContrast);

    float alpha = shaped * uOpacity;
    gl_FragColor = vec4(uColor, alpha);
}
