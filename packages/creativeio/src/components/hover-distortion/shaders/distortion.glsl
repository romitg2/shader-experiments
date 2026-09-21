uniform sampler2D uTexture;
uniform vec2 uMouse;
uniform float uIntensity;
uniform float uRadius;
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
    float aspect = uResolution.x / uResolution.y;

    // Correct for a non-square canvas so the influence area reads as a
    // circle around the cursor, not a squashed ellipse.
    vec2 diff = vUv - uMouse;
    diff.x *= aspect;

    float dist = length(diff);
    float falloff = smoothstep(uRadius, 0.0, dist);
    vec2 dir = dist > 0.0001 ? diff / dist : vec2(0.0);
    dir.x /= aspect;

    vec2 displacement = dir * falloff * uIntensity * 0.15;
    vec2 uv = coverUv(vUv - displacement, uImageSize);

    gl_FragColor = texture2D(uTexture, uv);
}
