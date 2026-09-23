uniform vec3 uColor;
varying float vLife;

void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float falloff = smoothstep(0.5, 0.0, d);
    float alpha = falloff * vLife;
    gl_FragColor = vec4(uColor, alpha);
}
