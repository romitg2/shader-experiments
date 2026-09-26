// Display shader - classic thermal/FLIR "IronBow" palette (black -> deep
// purple -> magenta -> red -> orange -> yellow -> white) mapped from
// density intensity, plus a subtle horizontal scanline pattern and a
// vignette darkening toward the edges — mimicking a real infrared camera
// viewfinder observing an invisible heat plume.
uniform sampler2D uDensity;
varying vec2 vUv;

vec3 ironBow(float t) {
    t = clamp(t, 0.0, 1.0);
    vec3 c0 = vec3(0.02, 0.0, 0.05);
    vec3 c1 = vec3(0.25, 0.0, 0.35);
    vec3 c2 = vec3(0.55, 0.0, 0.45);
    vec3 c3 = vec3(0.85, 0.15, 0.15);
    vec3 c4 = vec3(0.95, 0.45, 0.0);
    vec3 c5 = vec3(1.0, 0.85, 0.1);
    vec3 c6 = vec3(1.0, 1.0, 0.95);

    if (t < 0.16) return mix(c0, c1, t / 0.16);
    if (t < 0.34) return mix(c1, c2, (t - 0.16) / 0.18);
    if (t < 0.52) return mix(c2, c3, (t - 0.34) / 0.18);
    if (t < 0.70) return mix(c3, c4, (t - 0.52) / 0.18);
    if (t < 0.86) return mix(c4, c5, (t - 0.70) / 0.16);
    return mix(c5, c6, (t - 0.86) / 0.14);
}

void main() {
    vec4 density = texture2D(uDensity, vUv);
    float d = max(max(density.r, density.g), density.b);
    vec3 color = ironBow(d);

    float scanline = 0.94 + 0.06 * step(0.5, fract(gl_FragCoord.y * 0.5));
    color *= scanline;

    vec2 centered = vUv - 0.5;
    float vignette = 1.0 - dot(centered, centered) * 0.6;
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
}
