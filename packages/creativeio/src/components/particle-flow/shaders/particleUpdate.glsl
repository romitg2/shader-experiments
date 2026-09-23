// Ping-pongs a position+life texture instead of a continuous density field:
// each texel IS a particle (xy = position in 0-1 uv space, z = life 0-1).
// Every frame each particle samples the fluid velocity field at its own
// current position and drifts along it, wrapping at the edges. Life rises
// with local speed and decays otherwise, so particles are invisible until
// they're actually caught in a moving part of the flow.
uniform sampler2D uPositions;
uniform sampler2D uVelocity;
uniform float uDt;
uniform float uSpeed;
uniform float uLifeGain;
uniform float uLifeDecay;
// Same texel-space scale advection.glsl applies to velocity before moving a
// UV coordinate — without it, particle positions jump by the raw velocity
// magnitude (tens to hundreds) instead of a sane fraction of the canvas,
// and particles appear to teleport randomly instead of following the flow.
uniform vec2 uTexel;
varying vec2 vUv;

void main() {
    vec4 data = texture2D(uPositions, vUv);
    vec2 pos = data.xy;
    float life = data.z;

    vec2 vel = texture2D(uVelocity, pos).xy;
    pos += vel * uDt * uSpeed * uTexel;
    pos = fract(pos);

    // Normalize raw velocity magnitude (tens to hundreds near an active
    // splat) into a 0-1 "energy" before feeding life, same scale Flow
    // Field uses for its stroke visibility — keeps only particles genuinely
    // near real motion lit, instead of every faint residual nudge.
    // A hard-floored cutoff, not a linear ramp from zero: tiny residual
    // velocity reaches almost the entire grid once the pressure solve has
    // smoothed things out, and a linear ramp let that residue slowly light
    // up particles everywhere instead of just near real motion.
    float energy = smoothstep(3.0, 12.0, length(vel));
    life += energy * uLifeGain;
    life = clamp(life - uLifeDecay, 0.0, 1.0);

    gl_FragColor = vec4(pos, life, 0.0);
}
