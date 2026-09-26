// Gray-Scott reaction-diffusion step: two chemical concentrations (u, v)
// diffuse via a cheap 9-tap weighted Laplacian and react with each other,
// producing self-organizing Turing patterns (spots, stripes, coral-like
// branching, cell-division) entirely from local rules — no per-pixel
// escape-time iteration like a true fractal, just a fixed handful of
// texture samples per pixel per frame. Once seeded, the pattern keeps
// evolving on its own; it doesn't need continuous input to keep growing.
uniform sampler2D uState;
uniform vec2 uTexel;
uniform float uDu;
uniform float uDv;
uniform float uFeed;
uniform float uKill;
uniform float uDt;
varying vec2 vUv;

void main() {
    vec2 c = texture2D(uState, vUv).rg;

    vec2 l = texture2D(uState, vUv - vec2(uTexel.x, 0.0)).rg;
    vec2 r = texture2D(uState, vUv + vec2(uTexel.x, 0.0)).rg;
    vec2 b = texture2D(uState, vUv - vec2(0.0, uTexel.y)).rg;
    vec2 t = texture2D(uState, vUv + vec2(0.0, uTexel.y)).rg;
    vec2 bl = texture2D(uState, vUv + vec2(-uTexel.x, -uTexel.y)).rg;
    vec2 brr = texture2D(uState, vUv + vec2(uTexel.x, -uTexel.y)).rg;
    vec2 tl = texture2D(uState, vUv + vec2(-uTexel.x, uTexel.y)).rg;
    vec2 trr = texture2D(uState, vUv + vec2(uTexel.x, uTexel.y)).rg;

    vec2 lap = (l + r + b + t) * 0.2 + (bl + brr + tl + trr) * 0.05 - c;

    float u = c.x;
    float v = c.y;
    float uvv = u * v * v;

    float du = uDu * lap.x - uvv + uFeed * (1.0 - u);
    float dv = uDv * lap.y + uvv - (uFeed + uKill) * v;

    u = clamp(u + du * uDt, 0.0, 1.0);
    v = clamp(v + dv * uDt, 0.0, 1.0);

    gl_FragColor = vec4(u, v, 0.0, 1.0);
}
