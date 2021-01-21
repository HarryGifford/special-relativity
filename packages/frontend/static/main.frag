#extension GL_OES_standard_derivatives : require
precision highp float;

uniform mat4 view;
uniform int relativisticBeaming;
uniform int dopplerEffect;

varying vec4 vPosition;
varying vec3 vNormal;
varying vec2 vUV;

varying float abberationFactor;
// See https://en.wikipedia.org/wiki/Relativistic_beaming
// Spectral index normally between 0 and 2. Depends on material.
#define SPECTRAL_INDEX 1.

// These are defined based on where the solid R, G, B colors are in the
// RGB map sampler. i.e. the (626 - 380)th pixl will be solid red.
#define R_WAVELENGTH 626.
#define G_WAVELENGTH 534.
#define B_WAVELENGTH 465.

uniform sampler2D textureSampler;
uniform sampler2D rgbMapSampler;

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

float transformWavelength(float lambda) {
    return clamp(1. / abberationFactor * lambda, 0., 1.);
}

vec3 lookupWavelengthColor(float lambda) {
    float x = (lambda - 380.)/(780. - 380. + 1.);
    vec2 coord = vec2(transformWavelength(x), 0.5);
    vec3 color = gammaCorrect(texture2D(rgbMapSampler, coord)).rgb;
    return color;
}

vec3 transformColor(vec3 color) {
    vec3 rrbgValue = lookupWavelengthColor(R_WAVELENGTH);
    vec3 grbgValue = lookupWavelengthColor(G_WAVELENGTH);
    vec3 brbgValue = lookupWavelengthColor(B_WAVELENGTH);
    return rrbgValue * color.r + grbgValue * color.g + brbgValue * color.b;
}

float transformIntensity(float intensity) {
    return intensity * pow(abberationFactor, 3. - SPECTRAL_INDEX);
}

void main(void) {
    // Light direction.
    vec3 light = normalize(mat3(view) * light_dir);
    // Surface normal.
    vec3 n = computeNormal();
    // Let's just assume a diffuse surface.
    float intensity = clamp(dot(light, n), 0.1, 1.);
    // Apply relativistic beaming to the light intensity.
    if (relativisticBeaming == 1) {
        intensity = transformIntensity(intensity);
    }

    vec4 rawAlbedoColor = gammaCorrect(texture2D(textureSampler, vUV));
    vec3 albedoColor = abs(rawAlbedoColor.w) != 0.0
        ? rawAlbedoColor.xyz
        : white;

    vec3 base = intensity * albedoColor;
    // Apply Doppler effect to color.
    if (dopplerEffect == 1) {
        base = transformColor(base);
    }
    vec4 color = vec4(base, 1.0);
    color = unGammaCorrect(color);
    gl_FragColor = color;
}
