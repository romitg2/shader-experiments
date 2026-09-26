uniform vec3 uColor;
uniform float uTime;
varying float vTwinkle;

void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float falloff = smoothstep(0.5, 0.0, d);
    float twinkle = 0.75 + 0.25 * sin(uTime * 2.0 + vTwinkle * 30.0);
    gl_FragColor = vec4(uColor, falloff * twinkle);
}
