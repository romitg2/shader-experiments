// Display shader - maps the reaction-diffusion "v" concentration through
// a warm coral palette. Unlike this library's fluid-family components,
// there is no dissipation pass here: the pattern is whatever the Gray-
// Scott reaction has grown into, colored directly.
uniform sampler2D uState;
varying vec2 vUv;

void main() {
    vec2 state = texture2D(uState, vUv).rg;
    float v = state.g;

    vec3 bg = vec3(0.03, 0.05, 0.07);
    vec3 coral = vec3(0.95, 0.45, 0.4);
    vec3 coralDark = vec3(0.6, 0.15, 0.25);

    vec3 color = mix(bg, coralDark, smoothstep(0.1, 0.35, v));
    color = mix(color, coral, smoothstep(0.35, 0.6, v));

    gl_FragColor = vec4(color, 1.0);
}
