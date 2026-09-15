// Display shader - render density as smoke
uniform sampler2D uDensity;
uniform sampler2D uVelocity;
uniform int uMode; // 0 = grayscale density, 1 = velocity, 2 = raw

varying vec2 vUv;

void main() {
    // Black background
    vec3 bgColor = vec3(0.0);

    // Border
    vec2 border = step(0.005, vUv) * step(0.005, 1.0 - vUv);
    float borderMask = border.x * border.y;

    vec4 density = texture2D(uDensity, vUv);
    vec2 velocity = texture2D(uVelocity, vUv).xy;

    // Grayscale intensity from density
    float d = (density.r + density.g + density.b) / 3.0;

    vec3 color = bgColor;

    if (uMode == 0) {
        // Grayscale smoke
        color = vec3(d);
    } else if (uMode == 1) {
        // Velocity visualization (grayscale magnitude)
        float velMag = length(velocity) * 2.0;
        color = vec3(velMag);
    } else {
        // Raw density (same as mode 0 for now)
        color = vec3(d);
    }

    // Apply border (dark gray edge)
    float edge = 1.0 - borderMask;
    color = mix(color, vec3(0.15), edge);

    gl_FragColor = vec4(color, 1.0);
}
