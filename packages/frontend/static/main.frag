#extension GL_OES_standard_derivatives : require
precision highp float;
precision highp int;

/**
    A lot of the code below is pretty hacky in terms of computing the
    colors from Doppler shifting. There's no particular reason for the
    choices that have been made here and there's certainly better ways
    to do it.
*/

#define EPS 1e-5

// Hack used as part of computing the light intensity.
// Larger values will cause the beaming light to saturate
// the screen more quickly.
#define INTENSITY_SCALE 0.3

// See https://en.wikipedia.org/wiki/Relativistic_beaming
// Spectral index normally between 0 and 2. Depends on material.
#define SPECTRAL_INDEX 1.

// These are defined based on where the solid R, G, B colors are in the
// RGB map sampler. i.e. the (626 - 380)th pixl will be solid red.
#define MIN_WAVELENGTH 380.
#define MAX_WAVELENGTH 780.
#define R_WAVELENGTH 626.
#define G_WAVELENGTH 534.
#define B_WAVELENGTH 465.

uniform mat4 view;
uniform vec3 velocity;
uniform int useGalilean;
uniform int relativisticBeaming;
uniform int dopplerEffect;

varying vec4 vPosition;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec2 vUV;

uniform sampler2D albedoSampler;
uniform sampler2D bumpSampler;
uniform sampler2D rgbMapSampler;

#ifdef SKYBOX
uniform samplerCube skyboxSampler;
#endif

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
    vec3 normal = normalize(vNormal);
#ifdef TANGENT
    // Perform normal mapping.
    vec3 bNormal = 2.*texture2D(bumpSampler, vUV).xyz - 1.;
    if (!gl_FrontFacing) {
        bNormal.xy = -bNormal.xy;
    }
    vec3 tangent = normalize(vTangent);
    tangent = normalize(tangent - dot(tangent, normal) * normal);
    vec3 bitangent = cross(normal, tangent);
    mat3 TBN = mat3(tangent, bitangent, normal);
    normal = TBN * bNormal;
#endif
    return normal;
}

float computeAbberationFromXV(vec3 x, vec3 v) {
    float vSq = dot(v, v);
    if (vSq < EPS) {
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

float transformWavelength(float lambda, float abberationFactor) {
    return clamp(1. / abberationFactor * lambda, 0., 1.);
}

vec3 lookupWavelengthColor(float lambda, float abberationFactor) {
    float wavelengthRange = (MAX_WAVELENGTH - MIN_WAVELENGTH + 1.);
    float x = (lambda - MIN_WAVELENGTH) / wavelengthRange;
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

/** Performs relativistic beaming calculation. */
float transformIntensity(float intensity, float abberationFactor) {
    return intensity * pow(abberationFactor, 3. - SPECTRAL_INDEX);
}

void main(void) {
#ifdef SKYBOX
    // Used for rendering the skybox environment around the whole scene.
    float intensity = 1.;
    vec4 rawAlbedoColor = gammaCorrect(textureCube(skyboxSampler, vPosition.xyz));
#else
    // Light direction.
    vec3 light = normalize(mat3(view) * light_dir);
    // Surface normal.
    vec3 n = computeNormal();
    // Let's just assume a diffuse surface.
    float intensity = clamp(dot(light, n), 0.1, 1.);
    vec4 rawAlbedoColor = gammaCorrect(texture2D(albedoSampler, vUV));
#endif

    float abberationFactor = computeAbberation();

    // Compute relativistic light intensity.
    if (relativisticBeaming == 1) {
        intensity = transformIntensity(intensity, abberationFactor);
    }

    vec4 albedoColor = abs(rawAlbedoColor.a) != 0.0
        ? rawAlbedoColor
        : vec4(white, 1.0);

    vec3 base = albedoColor.rgb;
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
    if (rawAlbedoColor.a < 0.01) {
        discard;
    }
    vec4 color = vec4(base, 1.0);
    color = unGammaCorrect(color);
    gl_FragColor = color;
}
