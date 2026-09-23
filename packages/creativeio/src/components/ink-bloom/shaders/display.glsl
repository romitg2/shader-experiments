// Display shader - watercolor/ink-in-water look: the density field's own
// color fills the body, but the local gradient magnitude (same neighbor-
// sampling trick as Liquid Metal/Neon Flow) boosts saturation and darkness
// right at the boundary, mimicking how wet pigment pools and darkens at
// the edge of a bloom instead of fading out evenly. Rendered on a
// transparent canvas so it reads as ink bleeding into a page.
uniform sampler2D uDensity;
uniform vec2 uTexel;
uniform float uEdgeBoost;
varying vec2 vUv;

float intensityAt(vec2 uv) {
    vec4 c = texture2D(uDensity, uv);
    return max(max(c.r, c.g), c.b);
}

void main() {
    vec4 density = texture2D(uDensity, vUv);
    float d = max(max(density.r, density.g), density.b);

    float l = intensityAt(vUv - vec2(uTexel.x, 0.0));
    float r = intensityAt(vUv + vec2(uTexel.x, 0.0));
    float b = intensityAt(vUv - vec2(0.0, uTexel.y));
    float t = intensityAt(vUv + vec2(0.0, uTexel.y));
    float edge = length(vec2(r - l, t - b));

    vec3 pooled = density.rgb * (1.0 + edge * uEdgeBoost);
    float alpha = clamp(d + edge * uEdgeBoost * 0.5, 0.0, 1.0);

    gl_FragColor = vec4(pooled, alpha);
}
