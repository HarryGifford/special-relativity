#extension GL_OES_standard_derivatives : require
precision highp float;

uniform mat4 view;

varying vec4 vPosition;
varying vec3 vNormal;
varying vec2 vUV;

uniform sampler2D textureSampler;

// Hardcoded directional light source.
const vec3 light_dir = vec3(-3.0, 5., -4.);

vec3 white = vec3(0.0);

vec4 gammaCorrect(vec4 color) {
    return vec4(pow(color.rgb, vec3(2.2)), color.a);
}

vec4 unGammaCorrect(vec4 color) {
    return vec4(pow(color.rgb, vec3(1.0/2.2)), color.a);
}

vec3 computeNormal() {
    return normalize(vNormal);
}

void main(void) {
    // Light direction.
    vec3 light = normalize(mat3(view) * light_dir);
    // Surface normal.
    vec3 n = computeNormal();
    // Let's just assume a diffuse surface.
    float intensity = clamp(dot(light, n), 0.1, 1.);

    vec4 rawAlbedoColor = gammaCorrect(texture2D(textureSampler, vUV));
    vec3 albedoColor = abs(rawAlbedoColor.w) != 0.0
        ? rawAlbedoColor.xyz
        : white;

    vec3 base = intensity * albedoColor;
    vec4 color = vec4(base, 1.0);
    color = unGammaCorrect(color);
    gl_FragColor = color;
}
