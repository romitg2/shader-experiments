// Display shader - zero extra simulation cost: fold the sampling UV into
// an N-way mirrored wedge before reading the density field, the same
// trick real-time kaleidoscope effects use. The underlying fluid sim is
// identical to Color Smoke's; only the sampling coordinate is different,
// turning any cursor gesture into a symmetric mandala.
uniform sampler2D uDensity;
uniform float uSides;
uniform float uRotation;
varying vec2 vUv;

vec2 kaleido(vec2 uv, float sides, float rotation) {
    vec2 centered = uv - 0.5;
    float r = length(centered);
    float a = atan(centered.y, centered.x) + rotation;
    float wedge = 6.28318530718 / sides;
    a = mod(a, wedge);
    a = abs(a - wedge * 0.5);
    return vec2(cos(a), sin(a)) * r + 0.5;
}

void main() {
    vec2 foldedUv = kaleido(vUv, uSides, uRotation);
    vec4 density = texture2D(uDensity, foldedUv);

    vec3 bgColor = vec3(0.01, 0.01, 0.02);
    vec3 color = 1.0 - (1.0 - bgColor) * (1.0 - density.rgb);

    gl_FragColor = vec4(color, 1.0);
}
