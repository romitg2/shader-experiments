// Display shader - same Gray-Scott state as Coral Growth, but a lower
// feed rate produces a thinner, continuously winding maze-like growth
// instead of coral's thicker branching. Colored as pale cell membranes
// on a dark cytoplasm instead of coral pink.
uniform sampler2D uState;
varying vec2 vUv;

void main() {
    vec2 state = texture2D(uState, vUv).rg;
    float v = state.g;

    vec3 bg = vec3(0.02, 0.04, 0.08);
    vec3 membrane = vec3(0.55, 0.75, 0.95);
    vec3 core = vec3(0.92, 0.97, 1.0);

    vec3 color = mix(bg, membrane, smoothstep(0.15, 0.4, v));
    color = mix(color, core, smoothstep(0.5, 0.7, v));

    gl_FragColor = vec4(color, 1.0);
}
