uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform float uProgress;
uniform vec2 uResolution;
uniform vec2 uImageSize1;
uniform vec2 uImageSize2;
varying vec2 vUv;

vec2 coverUv(vec2 uv, vec2 imgSize) {
    vec2 s = uResolution / imgSize;
    float scale = max(s.x, s.y);
    vec2 scaledSize = imgSize * scale;
    vec2 offset = (uResolution - scaledSize) * 0.5;
    return (uv * uResolution - offset) / scaledSize;
}

void main() {
    // Quantize UVs dynamically: sharp at both ends of the transition, most
    // pixelated in the middle, so the block size itself carries the motion.
    float pixelAmount = sin(uProgress * 3.14159265);
    float pixels = mix(1.0, 56.0, pixelAmount);
    vec2 grid = uResolution / pixels;
    vec2 blockUv = (floor(vUv * grid) + 0.5) / grid;

    vec2 uv1 = coverUv(blockUv, uImageSize1);
    vec2 uv2 = coverUv(blockUv, uImageSize2);

    vec4 col1 = texture2D(uTexture1, uv1);
    vec4 col2 = texture2D(uTexture2, uv2);

    gl_FragColor = mix(col1, col2, uProgress);
}
