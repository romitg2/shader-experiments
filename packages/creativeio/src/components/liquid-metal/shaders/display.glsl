// Display shader - render density not as smoke but as a lit metallic
// blob. The density field's local gradient (sampled via neighboring
// texels, same trick as divergence/pressure) is treated as a fake surface
// normal, then shaded with a diffuse term, a specular highlight, and a
// fresnel-style rim — giving the same underlying fluid sim a shiny
// liquid-mercury/chrome look instead of a soft haze.
uniform sampler2D uDensity;
uniform vec2 uTexel;
uniform vec3 uBaseColor;
uniform float uBumpStrength;
varying vec2 vUv;

float intensityAt(vec2 uv) {
    vec4 c = texture2D(uDensity, uv);
    return max(max(c.r, c.g), c.b);
}

void main() {
    float d = intensityAt(vUv);

    float l = intensityAt(vUv - vec2(uTexel.x, 0.0));
    float r = intensityAt(vUv + vec2(uTexel.x, 0.0));
    float b = intensityAt(vUv - vec2(0.0, uTexel.y));
    float t = intensityAt(vUv + vec2(0.0, uTexel.y));

    float gx = r - l;
    float gy = t - b;

    vec3 normal = normalize(vec3(-gx * uBumpStrength, -gy * uBumpStrength, 1.0));
    vec3 lightDir = normalize(vec3(-0.4, 0.6, 0.8));
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfDir = normalize(lightDir + viewDir);

    float diffuse = max(dot(normal, lightDir), 0.0);
    float specular = pow(max(dot(normal, halfDir), 0.0), 48.0);
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

    vec3 metal = uBaseColor * (0.15 + 0.85 * diffuse)
        + vec3(1.0) * specular * 1.6
        + uBaseColor * fresnel * 0.7;

    vec3 bg = vec3(0.02);
    float mask = smoothstep(0.03, 0.25, d);
    vec3 color = mix(bg, metal, mask);

    gl_FragColor = vec4(color, 1.0);
}
