// Display shader - a wide multi-tap blur smooths the density field into a
// soft, featureless glow (unlike every other component here, which keeps
// the sim's fine turbulent detail visible), and the alpha channel is
// genuinely used: this renders onto a transparent canvas at low peak
// opacity, so it reads as a faint translucent bloom sitting over whatever
// is behind it rather than an opaque shape on a dark background.
uniform sampler2D uDensity;
uniform vec2 uTexel;
uniform vec3 uColor;
uniform float uOpacity;
varying vec2 vUv;

float sampleIntensity(vec2 uv) {
    vec4 c = texture2D(uDensity, uv);
    return max(max(c.r, c.g), c.b);
}

void main() {
    float sum = 0.0;
    float total = 0.0;
    for (int x = -3; x <= 3; x++) {
        for (int y = -3; y <= 3; y++) {
            vec2 offset = vec2(float(x), float(y)) * uTexel * 2.2;
            float w = 1.0 - length(vec2(x, y)) / 5.0;
            w = max(w, 0.0);
            sum += sampleIntensity(vUv + offset) * w;
            total += w;
        }
    }
    float d = sum / max(total, 0.0001);

    float alpha = d * uOpacity;
    gl_FragColor = vec4(uColor, alpha);
}
