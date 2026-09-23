// Renders the particle pool as GL points instead of a fullscreen quad. Each
// vertex carries only an index (aIndex); its actual position and life are
// looked up from the position/life texture the sim ping-pongs, exactly the
// way the fullscreen-quad components look up density — just indexed
// per-particle instead of per-pixel.
attribute float aIndex;
uniform sampler2D uPositions;
uniform vec2 uParticleTexSize;
uniform float uPointSize;
varying float vLife;

void main() {
    vec2 texel = vec2(mod(aIndex, uParticleTexSize.x), floor(aIndex / uParticleTexSize.x));
    vec2 uv = (texel + 0.5) / uParticleTexSize;
    vec4 data = texture2D(uPositions, uv);
    vec2 pos = data.xy;
    float life = data.z;
    vLife = life;

    vec2 clip = pos * 2.0 - 1.0;
    gl_Position = vec4(clip, 0.0, 1.0);
    gl_PointSize = uPointSize * (0.3 + 0.7 * life);
}
