// Display shader - combines Kaleidoscope's zero-cost UV fold with Ink
// Bloom's edge-pooling technique: the sampling UV is folded into an N-way
// mirrored wedge (with a slow auto-rotation), then the density gradient
// in that folded space is used to pool/darken pigment at each mirrored
// edge, the way wet ink bleeds at a boundary — giving a living, rotating
// mandala with inked edges instead of a flat mirrored smoke image.
uniform sampler2D uDensity;
uniform vec2 uTexel;
uniform float uEdgeBoost;
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

float intensityAt(vec2 uv) {
    vec4 c = texture2D(uDensity, uv);
    return max(max(c.r, c.g), c.b);
}

void main() {
    vec2 foldedUv = kaleido(vUv, uSides, uRotation);
    vec4 density = texture2D(uDensity, foldedUv);
    float d = max(max(density.r, density.g), density.b);

    float l = intensityAt(foldedUv - vec2(uTexel.x, 0.0));
    float r = intensityAt(foldedUv + vec2(uTexel.x, 0.0));
    float b = intensityAt(foldedUv - vec2(0.0, uTexel.y));
    float t = intensityAt(foldedUv + vec2(0.0, uTexel.y));
    float edge = length(vec2(r - l, t - b));

    vec3 pooled = density.rgb * (1.0 + edge * uEdgeBoost);
    float alpha = clamp(d + edge * uEdgeBoost * 0.5, 0.0, 1.0);

    vec3 bg = vec3(0.02, 0.01, 0.03);
    vec3 color = mix(bg, pooled, alpha);
    gl_FragColor = vec4(color, 1.0);
}
