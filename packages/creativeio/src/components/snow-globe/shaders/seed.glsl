// One-shot seed pass: scatters flecks at random positions across the whole
// canvas with zero velocity. Gravity in particleUpdate.glsl pulls them down
// to the floor over the first couple seconds, reading as snow settling.
varying vec2 vUv;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    float x = hash(vUv);
    float y = hash(vUv + vec2(3.7, 1.3));
    gl_FragColor = vec4(x, y, 0.0, 0.0);
}
