// A self-contained particle physics step - no fluid-sim velocity field
// behind this one, just per-particle state (xy = position, zw = velocity)
// ping-ponged directly: gravity pulls down every frame, drag bleeds
// velocity off, and hitting the floor/walls bounces with heavy damping.
// The cursor doesn't move dust with a velocity field like Dust Drift -
// instead it injects a direct outward+upward kick scaled by how fast the
// cursor is moving (uKick, a 0-1 MotionEnergy value), so waving the mouse
// through the snow reads like shaking the globe.
uniform sampler2D uState;
uniform vec2 uPointer;
uniform float uKick;
uniform float uDt;
uniform float uGravity;
uniform float uDrag;
uniform float uFloorY;
uniform float uKickRadius;
uniform float uKickStrength;
varying vec2 vUv;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec4 state = texture2D(uState, vUv);
    vec2 pos = state.xy;
    vec2 vel = state.zw;

    float d = distance(pos, uPointer);
    float influence = smoothstep(uKickRadius, 0.0, d) * uKick;
    vec2 toParticle = pos - uPointer;
    float len = length(toParticle);
    vec2 outward = len > 0.0001 ? toParticle / len : vec2(0.0, 1.0);
    float jitter = hash(vUv + pos) - 0.5;
    vec2 kick = (outward * 0.5 + vec2(jitter * 0.5, 0.75)) * influence * uKickStrength;
    vel += kick * uDt * 20.0;

    vel.y -= uGravity * uDt;
    vel *= max(0.0, 1.0 - uDrag * uDt);

    float speed = length(vel);
    float maxSpeed = 1.5;
    if (speed > maxSpeed) vel = vel / speed * maxSpeed;

    pos += vel * uDt;

    if (pos.y < uFloorY) {
        pos.y = uFloorY;
        vel.y = abs(vel.y) * 0.25;
        vel.x *= 0.85;
    }
    if (pos.x < 0.0) {
        pos.x = 0.0;
        vel.x = abs(vel.x) * 0.4;
    }
    if (pos.x > 1.0) {
        pos.x = 1.0;
        vel.x = -abs(vel.x) * 0.4;
    }
    if (pos.y > 1.0) {
        pos.y = 1.0;
        vel.y = -abs(vel.y) * 0.2;
    }

    gl_FragColor = vec4(pos, vel);
}
