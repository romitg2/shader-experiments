// Display shader - instead of filling in the density field, render only
// its edges (a Sobel gradient magnitude) as a glowing outline on black.
// The fill itself stays fully transparent/black, so a splat reads as a
// bright neon contour tracing the boundary of the moving mass rather than
// a solid blob.
uniform sampler2D uDensity;
uniform vec2 uTexel;
uniform float uGlow;
varying vec2 vUv;

float intensityAt(vec2 uv) {
    vec4 c = texture2D(uDensity, uv);
    return max(max(c.r, c.g), c.b);
}

void main() {
    float l = intensityAt(vUv - vec2(uTexel.x, 0.0));
    float r = intensityAt(vUv + vec2(uTexel.x, 0.0));
    float b = intensityAt(vUv - vec2(0.0, uTexel.y));
    float t = intensityAt(vUv + vec2(0.0, uTexel.y));
    float tl = intensityAt(vUv + vec2(-uTexel.x, uTexel.y));
    float trr = intensityAt(vUv + vec2(uTexel.x, uTexel.y));
    float bl = intensityAt(vUv + vec2(-uTexel.x, -uTexel.y));
    float br = intensityAt(vUv + vec2(uTexel.x, -uTexel.y));

    float gx = (tl + 2.0 * l + bl) - (trr + 2.0 * r + br);
    float gy = (tl + 2.0 * t + trr) - (bl + 2.0 * b + br);
    float edge = length(vec2(gx, gy));
    float glow = pow(clamp(edge * uGlow, 0.0, 1.0), 0.65);

    // Tint the outline with whatever color the density carries at this
    // point (palette-cycled per splat, same trick as City Grid) so
    // different gestures trace a different colored contour, normalized so
    // faint density still produces a saturated edge line.
    vec3 tint = texture2D(uDensity, vUv).rgb;
    float tintMag = max(max(tint.r, tint.g), tint.b);
    vec3 normalizedTint = tintMag > 0.001 ? tint / tintMag : vec3(1.0);

    vec3 color = normalizedTint * glow;
    gl_FragColor = vec4(color, 1.0);
}
