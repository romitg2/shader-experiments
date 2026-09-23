// One-shot seed pass: fills the particle position/life texture with random
// starting positions and zero life, run once on mount before the ping-pong
// update loop takes over. Life starts at 0 so particles are invisible until
// they're actually caught in a moving part of the velocity field.
varying vec2 vUv;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    float x = hash(vUv);
    float y = hash(vUv + vec2(3.7, 1.3));
    gl_FragColor = vec4(x, y, 0.0, 0.0);
}
