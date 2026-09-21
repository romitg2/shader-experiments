uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform float uProgress;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uResolution;
uniform vec2 uImageSize1;
uniform vec2 uImageSize2;
varying vec2 vUv;

// object-fit: cover, given the texture's real pixel size vs the canvas size.
vec2 coverUv(vec2 uv, vec2 imgSize) {
    vec2 s = uResolution / imgSize;
    float scale = max(s.x, s.y);
    vec2 scaledSize = imgSize * scale;
    vec2 offset = (uResolution - scaledSize) * 0.5;
    return (uv * uResolution - offset) / scaledSize;
}

void main() {
    vec2 center = vec2(0.5);
    float dist = distance(vUv, center);

    // Ripple strongest mid-transition, fades out at both ends so it settles
    // cleanly on the resting image rather than looking distorted at rest.
    float rippleEnvelope = sin(uProgress * 3.14159265);
    float wave = sin(dist * 24.0 - uTime * uSpeed) * 0.5 + 0.5;
    vec2 offset = normalize(vUv - center + 1e-4) * wave * 0.06 * rippleEnvelope;

    vec2 uv1 = coverUv(vUv + offset, uImageSize1);
    vec2 uv2 = coverUv(vUv - offset, uImageSize2);

    vec4 col1 = texture2D(uTexture1, uv1);
    vec4 col2 = texture2D(uTexture2, uv2);

    gl_FragColor = mix(col1, col2, uProgress);
}
