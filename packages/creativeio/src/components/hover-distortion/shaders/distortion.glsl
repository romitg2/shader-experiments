uniform sampler2D uTexture;
uniform sampler2D uVelocity;
uniform float uIntensity;
uniform vec2 uResolution;
uniform vec2 uImageSize;
varying vec2 vUv;

vec2 coverUv(vec2 uv, vec2 imgSize) {
    vec2 s = uResolution / imgSize;
    float scale = max(s.x, s.y);
    vec2 scaledSize = imgSize * scale;
    vec2 offset = (uResolution - scaledSize) * 0.5;
    return (uv * uResolution - offset) / scaledSize;
}

void main() {
    // The velocity field is a real (lightweight) fluid sim — splatted at the
    // pointer, self-advected, pressure-projected for incompressibility, and
    // dissipating over time — so this reads its flow directly as the UV
    // displacement instead of computing an instantaneous analytic falloff.
    // That's what gives it a flowing, swirling, trailing quality rather than
    // a single blob that snaps to the cursor.
    vec2 vel = texture2D(uVelocity, vUv).xy;
    vec2 displacement = vel * uIntensity;
    vec2 uv = coverUv(vUv - displacement, uImageSize);

    gl_FragColor = texture2D(uTexture, uv);
}
