// Display shader - map density intensity through a classic fire color
// ramp (black -> dark red -> orange -> yellow -> white) instead of
// grayscale smoke or a flat tint. Combined with the upward buoyancy bias
// baked into this component's splat (see FireFlow.tsx), the result reads
// as rising flame/embers rather than neutral smoke.
uniform sampler2D uDensity;
varying vec2 vUv;

vec3 fireRamp(float t) {
    t = clamp(t, 0.0, 1.0);
    vec3 black = vec3(0.0);
    vec3 darkRed = vec3(0.5, 0.0, 0.0);
    vec3 orange = vec3(1.0, 0.45, 0.0);
    vec3 yellow = vec3(1.0, 0.9, 0.2);
    vec3 white = vec3(1.0);

    if (t < 0.33) {
        return mix(black, darkRed, t / 0.33);
    } else if (t < 0.66) {
        return mix(darkRed, orange, (t - 0.33) / 0.33);
    } else if (t < 0.9) {
        return mix(orange, yellow, (t - 0.66) / 0.24);
    }
    return mix(yellow, white, (t - 0.9) / 0.1);
}

void main() {
    vec4 density = texture2D(uDensity, vUv);
    float d = max(max(density.r, density.g), density.b);
    vec3 color = fireRamp(d);
    gl_FragColor = vec4(color, 1.0);
}
