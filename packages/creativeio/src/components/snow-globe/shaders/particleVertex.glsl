// Renders the particle pool as GL points, looking position up from the
// state texture the sim ping-pongs — same indexed-lookup pattern as Dust
// Drift/Particle Flow, just reading (pos, vel) state instead of (pos, life).
attribute float aIndex;
uniform sampler2D uState;
uniform vec2 uParticleTexSize;
uniform float uPointSize;
varying float vTwinkle;

void main() {
    vec2 texel = vec2(mod(aIndex, uParticleTexSize.x), floor(aIndex / uParticleTexSize.x));
    vec2 uv = (texel + 0.5) / uParticleTexSize;
    vec4 state = texture2D(uState, uv);
    vec2 pos = state.xy;

    vTwinkle = fract(sin(aIndex * 12.9898) * 43758.5453);

    vec2 clip = pos * 2.0 - 1.0;
    gl_Position = vec4(clip, 0.0, 1.0);
    gl_PointSize = uPointSize;
}
