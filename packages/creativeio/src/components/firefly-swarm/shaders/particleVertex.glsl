// No simulation buffers at all - each firefly's position is a closed-form
// function of its fixed home point (aHome), a per-particle random phase
// (aSeed), and time, computed fresh every vertex every frame. Nothing to
// ping-pong, nothing to seed: an idle elliptical orbit around home, gently
// pulled toward the cursor when it's nearby.
attribute vec2 aHome;
attribute float aSeed;
uniform float uTime;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform float uAttractRadius;
uniform float uAttractStrength;
uniform float uOrbitRadius;
uniform float uOrbitSpeed;
uniform float uPointSize;
varying float vGlow;
varying float vSeed;

void main() {
    vec2 home = aHome;
    float d = distance(home, uPointer);
    float pull = smoothstep(uAttractRadius, 0.0, d) * uPointerActive * uAttractStrength;
    home = mix(home, uPointer, pull);

    float angle = uTime * uOrbitSpeed * (0.6 + aSeed) + aSeed * 6.28318;
    vec2 orbit = vec2(cos(angle), sin(angle) * 0.6) * uOrbitRadius * (0.5 + 0.5 * aSeed);
    vec2 pos = home + orbit;

    vGlow = 0.5 + 0.5 * sin(uTime * (1.4 + aSeed * 2.2) + aSeed * 30.0);
    vSeed = aSeed;

    vec2 clip = pos * 2.0 - 1.0;
    gl_Position = vec4(clip, 0.0, 1.0);
    gl_PointSize = uPointSize * (0.55 + 0.45 * vGlow);
}
