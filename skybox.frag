#extension GL_OES_standard_derivatives : require
precision highp float;
precision highp int;

/**
    A lot of this code is shared with `main.frag`. If you update here
    it's likely you will need to update there too.

    A lot of the code below is pretty hacky in terms of computing the
    colors from Doppler shifting. There's no particular reason for the
    choices that have been made here and there's certainly better ways
    to do it.
*/

// Hack used as part of computing the light intensity.
// Larger values will cause the beaming light to saturate
// the screen more quickly.
#define INTENSITY_SCALE 0.3

// See https://en.wikipedia.org/wiki/Relativistic_beaming
// Spectral index normally between 0 and 2. Depends on material.
#define SPECTRAL_INDEX 1.

// These are defined based on where the solid R, G, B colors are in the
// RGB map sampler. i.e. the (626 - 380)th pixl will be solid red.
#define R_WAVELENGTH 626.
#define G_WAVELENGTH 534.
#define B_WAVELENGTH 465.

uniform mat4 view;
uniform vec3 velocity;
uniform int useGalilean;
uniform int relativisticBeaming;
uniform int dopplerEffect;

varying vec4 vPosition;

uniform samplerCube skyboxSampler;
uniform sampler2D rgbMapSampler;

float computeAbberationFromXV(vec3 x, vec3 v) {
    float vSq = dot(v, v);
    if (vSq < 1e-6) {
        return 1.;
    }
    float invGamma = useGalilean == 1 ? 1. : sqrt(1. - vSq);
    float vx = dot(v, x);
    float vxn = vx / length(x);
    float ctr = (vxn - vSq) / (1. - vxn);
    return useGalilean == 1 ? 1. + vxn : invGamma / (1. - ctr);
}

float computeAbberation() {
    vec3 x = normalize(vPosition.xyz);
    vec3 v = mat3(view) * velocity;
    return computeAbberationFromXV(x, v);
}

vec3 white = vec3(0.0);

vec4 gammaCorrect(vec4 color) {
    return vec4(pow(color.rgb, vec3(2.2)), color.a);
}

vec4 unGammaCorrect(vec4 color) {
    return vec4(pow(color.rgb, vec3(1.0/2.2)), color.a);
}

float transformWavelength(float lambda, float abberationFactor) {
    return clamp(1. / abberationFactor * lambda, 0., 1.);
}

vec3 lookupWavelengthColor(float lambda, float abberationFactor) {
    float x = (lambda - 380.)/(780. - 380. + 1.);
    vec2 coord = vec2(transformWavelength(x, abberationFactor), 0.5);
    vec3 color = gammaCorrect(texture2D(rgbMapSampler, coord)).rgb;
    return color;
}

vec3 transformColor(vec3 color, float abberationFactor) {
    vec3 rrbgValue = lookupWavelengthColor(R_WAVELENGTH, abberationFactor);
    vec3 grbgValue = lookupWavelengthColor(G_WAVELENGTH, abberationFactor);
    vec3 brbgValue = lookupWavelengthColor(B_WAVELENGTH, abberationFactor);
    return rrbgValue * color.r + grbgValue * color.g + brbgValue * color.b;
}

float transformIntensity(float intensity, float abberationFactor) {
    return intensity * pow(abberationFactor, 3. - SPECTRAL_INDEX);
}

void main(void) {
    float intensity = 1.;
    vec4 rawAlbedoColor = gammaCorrect(textureCube(skyboxSampler, vPosition.xyz));

    float abberationFactor = computeAbberation();

    // Compute relativistic light intensity.
    if (relativisticBeaming == 1) {
        intensity = transformIntensity(intensity, abberationFactor);
    }

    vec3 albedoColor = abs(rawAlbedoColor.w) != 0.0
        ? rawAlbedoColor.xyz
        : white;

    vec3 base = albedoColor;
    // Apply Doppler effect to color.
    if (dopplerEffect == 1) {
        base = transformColor(base, abberationFactor);
    }
    // Apply relativistic beaming.
    base = intensity * base;
    // Hack to make it look better in RGB.
    if (intensity > 1.) {
        base = clamp(base + vec3(INTENSITY_SCALE * log(intensity)), 0., 1.);
    }
    vec4 color = vec4(base, 1.0);
    color = unGammaCorrect(color);
    gl_FragColor = color;
}
