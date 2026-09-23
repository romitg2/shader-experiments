// Splat - add force/color at a point (mouse position)
uniform sampler2D uTarget;
uniform vec2 uPoint;
uniform vec3 uColor;
uniform float uRadius;
uniform vec2 uResolution;

varying vec2 vUv;

void main() {
    vec2 p = vUv - uPoint;
    p.x *= uResolution.x / uResolution.y; // aspect ratio correction

    // Gaussian splat
    float splat = exp(-dot(p, p) / uRadius);

    vec4 base = texture2D(uTarget, vUv);
    gl_FragColor = base + vec4(uColor * splat, splat);
}
