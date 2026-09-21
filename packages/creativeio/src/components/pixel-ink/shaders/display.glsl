// Display shader - render density as a dithered pixel/ink grain instead of
// smooth smoke. The density field itself is identical to Fluid/Color Smoke
// (same GPU sim); the difference is purely how it's rendered: quantized to
// a screen-space pixel grid, then each block randomly shows or hides based
// on how much density is there, re-rolled every few frames for a lively
// twinkling grain rather than a static dither pattern.
uniform sampler2D uDensity;
uniform vec2 uResolution;
uniform float uPixelSize;
uniform float uDotDensity;
uniform float uMaxFill;
uniform float uTime;
uniform float uGrainSpeed;
varying vec2 vUv;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 pixelCoord = floor(gl_FragCoord.xy / uPixelSize);
    vec2 blockUv = (pixelCoord * uPixelSize + uPixelSize * 0.5) / uResolution;

    vec4 density = texture2D(uDensity, blockUv);
    float intensity = max(max(density.r, density.g), density.b);

    float frameSeed = floor(uTime * uGrainSpeed);
    float rnd = hash(pixelCoord + frameSeed * 17.0);
    float rnd2 = hash(pixelCoord + frameSeed * 31.0 + 7.0);

    // Cap the maximum fraction of blocks that can show a dot, even at peak
    // density — without this, dense regions solidify into a flat filled
    // shape instead of staying visibly grainy like the reference.
    float fill = min(intensity * uDotDensity, uMaxFill);
    float show = step(1.0 - fill, rnd);
    float brightness = 0.7 + rnd2 * 0.3;

    vec3 color = density.rgb * show * brightness;
    gl_FragColor = vec4(color, 1.0);
}
