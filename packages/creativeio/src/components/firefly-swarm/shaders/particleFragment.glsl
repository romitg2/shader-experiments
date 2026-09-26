uniform vec3 uColor;
varying float vGlow;
varying float vSeed;

void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float falloff = smoothstep(0.5, 0.0, d);
    // Slight per-firefly warm/cool tint variance so the swarm isn't a flat
    // single color.
    vec3 tint = mix(uColor, uColor * vec3(1.15, 1.0, 0.7), vSeed);
    float alpha = falloff * (0.3 + 0.7 * vGlow);
    gl_FragColor = vec4(tint, alpha);
}
