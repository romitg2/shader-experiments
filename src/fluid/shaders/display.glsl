// Display shader - render density as smoke
uniform sampler2D uDensity;
uniform sampler2D uVelocity;
uniform int uMode; // 0 = grayscale density, 1 = velocity, 2 = raw

varying vec2 vUv;

void main() {
    // Dark background (slightly visible)
    vec3 bgColor = vec3(0.02);

    // Border
    vec2 border = step(0.01, vUv) * step(0.01, 1.0 - vUv);
    float borderMask = border.x * border.y;

    vec4 density = texture2D(uDensity, vUv);
    vec2 velocity = texture2D(uVelocity, vUv).xy;

    // Grayscale intensity from density
    float d = (density.r + density.g + density.b) / 3.0;

    vec3 color = bgColor;

    if (uMode == 0) {
        // Grayscale smoke on dark bg
        color = bgColor + vec3(d);
    } else if (uMode == 1) {
        // Velocity visualization (grayscale magnitude)
        float velMag = length(velocity) * 2.0;
        color = bgColor + vec3(velMag);
    } else {
        // Raw density
        color = bgColor + vec3(d);
    }

    // Apply border (visible gray edge)
    float edge = 1.0 - borderMask;
    color = mix(color, vec3(0.2), edge);

    gl_FragColor = vec4(color, 1.0);
}
