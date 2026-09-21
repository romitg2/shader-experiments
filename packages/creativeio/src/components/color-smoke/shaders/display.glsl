// Display shader - render density as colored smoke. Unlike Fluid's display
// shader (which collapses density to grayscale), the density buffer here
// already holds real color per-texel — each splat injects whatever hue was
// "in rotation" at that moment (see ColorSmoke.tsx), so different parts of
// the trail carry different colors as they persist and blend together.
uniform sampler2D uDensity;
varying vec2 vUv;

void main() {
    vec3 bgColor = vec3(0.01, 0.01, 0.02);

    vec4 density = texture2D(uDensity, vUv);

    // Screen blend (not straight alpha-over) so overlapping colored smoke
    // brightens and mixes like light/glow rather than muddying into gray —
    // this is what gives it the soft luminous haze look instead of flat
    // painted color.
    vec3 color = 1.0 - (1.0 - bgColor) * (1.0 - density.rgb);

    gl_FragColor = vec4(color, 1.0);
}
