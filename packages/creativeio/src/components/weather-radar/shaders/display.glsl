// Display shader - classic weather-radar reflectivity look: density is
// quantized into hard discrete bands (not a smooth gradient) and each band
// is mapped through a fixed NEXRAD-style color ramp (green -> yellow ->
// orange -> red -> magenta), the same way real precipitation radar codes
// intensity into a stepped color scale instead of continuous shading.
uniform sampler2D uDensity;
varying vec2 vUv;

vec3 reflectivityRamp(float t) {
    t = clamp(t, 0.0, 1.0);
    vec3 c0 = vec3(0.0, 0.0, 0.0);
    vec3 c1 = vec3(0.02, 0.35, 0.10);
    vec3 c2 = vec3(0.10, 0.55, 0.15);
    vec3 c3 = vec3(0.85, 0.80, 0.10);
    vec3 c4 = vec3(0.95, 0.55, 0.05);
    vec3 c5 = vec3(0.90, 0.10, 0.10);
    vec3 c6 = vec3(0.85, 0.10, 0.75);

    if (t < 0.02) return c0;
    if (t < 0.2) return c1;
    if (t < 0.4) return c2;
    if (t < 0.55) return c3;
    if (t < 0.7) return c4;
    if (t < 0.85) return c5;
    return c6;
}

void main() {
    vec4 density = texture2D(uDensity, vUv);
    float d = max(max(density.r, density.g), density.b);
    vec3 color = reflectivityRamp(d);
    gl_FragColor = vec4(color, 1.0);
}
