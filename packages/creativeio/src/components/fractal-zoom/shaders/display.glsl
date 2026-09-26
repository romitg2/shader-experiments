// Display shader - a genuine fractal, not a fluid trail: a FIXED, small
// (7-iteration) unrolled fold-and-scale loop, the technique real-time
// fractal shaders use to fake Sierpinski-carpet self-similarity cheaply
// (Mandelbrot-style escape-time needs 100s of iterations per pixel; this
// needs 7, regardless of zoom depth). Colored via orbit-trap: the folded
// point's distance to the fold origin at each step, which — unlike
// dividing by the accumulated zoom scale — stays naturally bounded, so
// detail doesn't wash out after a few iterations. The pattern is always
// visible — moving the cursor perturbs the fold ratio, sending a ripple
// of distortion through the entire structure.
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform float uEnergy;
varying vec2 vUv;

vec3 palette(float t) {
    vec3 a = vec3(0.5);
    vec3 b = vec3(0.5);
    vec3 c = vec3(1.0);
    vec3 d = vec3(0.0, 0.33, 0.67);
    return a + b * cos(6.28318 * (c * t + d));
}

void main() {
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 uv = (vUv - 0.5) * aspect;

    vec2 center = (uPointer - 0.5) * 0.4;
    vec2 p = uv * 1.3 + center;

    float scaleFactor = 2.9 + uEnergy * 0.25;
    float trap = 1e6;
    for (int i = 0; i < 7; i++) {
        p = abs(p);
        p = p * scaleFactor - (scaleFactor - 1.0);
        trap = min(trap, length(p));
    }

    vec3 color = palette(trap * 1.4 + uTime * 0.03);
    color *= smoothstep(1.5, 0.0, trap * 1.9);

    gl_FragColor = vec4(color, 1.0);
}
