// Display shader - topographic/elevation map look: density intensity is
// treated as "elevation" and colored through a terrain ramp (water ->
// lowland -> highland -> snow peak), with thin contour isolines drawn at
// regular elevation intervals on top, the way a real terrain or weather
// pressure map represents continuous data as banded rings.
uniform sampler2D uDensity;
varying vec2 vUv;

vec3 terrainRamp(float t) {
    vec3 water = vec3(0.05, 0.22, 0.42);
    vec3 lowland = vec3(0.15, 0.42, 0.22);
    vec3 highland = vec3(0.52, 0.42, 0.26);
    vec3 peak = vec3(0.96, 0.96, 0.96);

    if (t < 0.25) return mix(water, lowland, t / 0.25);
    if (t < 0.65) return mix(lowland, highland, (t - 0.25) / 0.4);
    return mix(highland, peak, (t - 0.65) / 0.35);
}

void main() {
    vec4 density = texture2D(uDensity, vUv);
    float d = max(max(density.r, density.g), density.b);

    vec3 fill = terrainRamp(d);

    float bands = d * 14.0;
    float f = fract(bands);
    float lineDist = min(f, 1.0 - f);
    float line = 1.0 - smoothstep(0.0, 0.07, lineDist);
    line *= step(0.015, d);

    vec3 color = mix(fill, vec3(0.04, 0.06, 0.05), line * 0.75);
    gl_FragColor = vec4(color, 1.0);
}
